from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token, create_refresh_token, decode_token,
    generate_otp, hash_password, verify_password,
)
from app.models.user import User, AuthProvider, AuthProviderType, UserRole
from app.models.organization import Organization, OrganizationMember, OrgRole, MemberStatus
from app.schemas.auth import (
    OTPRequest, OTPVerify, GoogleAuthRequest, AppleAuthRequest,
    TokenResponse, RefreshRequest, OrgLoginRequest, OrgRegisterRequest,
)
from app.services.email import send_otp_email

router = APIRouter()

_otp_store: dict[str, tuple[str, datetime]] = {}


@router.post("/otp/request")
async def request_otp(body: OTPRequest, db: AsyncSession = Depends(get_db)):
    code = generate_otp()
    _otp_store[body.email] = (code, datetime.now(timezone.utc))
    await send_otp_email(body.email, code)
    return {"message": "OTP sent", "debug_code": code if settings.DEBUG else None}


@router.post("/otp/verify", response_model=TokenResponse)
async def verify_otp(body: OTPVerify, db: AsyncSession = Depends(get_db)):
    stored = _otp_store.get(body.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")

    code, created = stored
    elapsed = (datetime.now(timezone.utc) - created).total_seconds()
    if elapsed > settings.OTP_EXPIRE_MINUTES * 60:
        _otp_store.pop(body.email, None)
        raise HTTPException(status_code=400, detail="OTP expired")

    if code != body.code:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    _otp_store.pop(body.email, None)

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(email=body.email, is_verified=True)
        db.add(user)
        provider = AuthProvider(user=user, provider=AuthProviderType.EMAIL)
        db.add(provider)
        await db.commit()
        await db.refresh(user)
    elif not user.is_verified:
        user.is_verified = True
        await db.commit()

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/google", response_model=TokenResponse)
async def google_auth(body: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={body.id_token}")
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    info = resp.json()
    email = info["email"]
    google_id = info["sub"]

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            email=email,
            display_name=info.get("name"),
            avatar_url=info.get("picture"),
            is_verified=True,
        )
        db.add(user)

    provider_result = await db.execute(
        select(AuthProvider).where(
            AuthProvider.user_id == user.id,
            AuthProvider.provider == AuthProviderType.GOOGLE,
        )
    )
    if not provider_result.scalar_one_or_none():
        db.add(AuthProvider(user=user, provider=AuthProviderType.GOOGLE, provider_user_id=google_id))

    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/apple", response_model=TokenResponse)
async def apple_auth(body: AppleAuthRequest, db: AsyncSession = Depends(get_db)):
    # Apple token verification would use PyJWT with Apple's public keys
    # Simplified for MVP — full implementation requires Apple developer setup
    raise HTTPException(status_code=501, detail="Apple Sign-in not yet configured")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = payload["sub"]
    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=401, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/org/register", response_model=TokenResponse)
async def org_register(body: OrgRegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.ORG_ADMIN,
        is_verified=False,
    )
    db.add(user)

    org = Organization(name=body.org_name, industry=body.industry, country=body.country)
    db.add(org)
    await db.flush()

    member = OrganizationMember(
        organization_id=org.id, user_id=user.id, email=body.email,
        role=OrgRole.ADMIN, status=MemberStatus.ACTIVE,
        joined_at=datetime.now(timezone.utc),
    )
    db.add(member)
    db.add(AuthProvider(user=user, provider=AuthProviderType.EMAIL))

    await db.commit()
    await db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(str(user.id), extra={"org_id": str(org.id)}),
        refresh_token=create_refresh_token(str(user.id)),
    )


@router.post("/org/login", response_model=TokenResponse)
async def org_login(body: OrgLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    member_result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.user_id == user.id,
            OrganizationMember.status == MemberStatus.ACTIVE,
        )
    )
    member = member_result.scalar_one_or_none()
    extra = {"org_id": str(member.organization_id)} if member else {}

    return TokenResponse(
        access_token=create_access_token(str(user.id), extra=extra),
        refresh_token=create_refresh_token(str(user.id)),
    )
