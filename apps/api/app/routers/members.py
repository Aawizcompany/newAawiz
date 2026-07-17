from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_current_user, require_org_role
from app.models.user import User
from app.models.organization import OrganizationMember, OrgRole, MemberStatus
from app.schemas.organization import MemberInvite, MemberResponse
from app.services.email import send_invitation_email

router = APIRouter()


@router.get("/{org_id}", response_model=list[MemberResponse])
async def list_members(
    org_id: UUID,
    status: str | None = None,
    search: str | None = None,
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR, OrgRole.TEAM_LEAD, OrgRole.VIEWER)),
    db: AsyncSession = Depends(get_db),
):
    query = select(OrganizationMember).where(OrganizationMember.organization_id == org_id)
    if status:
        query = query.where(OrganizationMember.status == status)
    if search:
        query = query.where(OrganizationMember.email.ilike(f"%{search}%"))
    query = query.order_by(OrganizationMember.invited_at.desc())

    result = await db.execute(query)
    members = result.scalars().all()

    responses = []
    for m in members:
        name = None
        if m.user:
            name = m.user.display_name
        responses.append(MemberResponse(
            id=m.id, email=m.email, role=m.role.value, status=m.status.value,
            user_id=m.user_id, display_name=name,
            invited_at=m.invited_at, joined_at=m.joined_at,
        ))
    return responses


@router.post("/{org_id}/invite", response_model=MemberResponse, status_code=201)
async def invite_member(
    org_id: UUID,
    body: MemberInvite,
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR)),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == org_id,
            OrganizationMember.email == body.email,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Member already exists")

    new_member = OrganizationMember(
        organization_id=org_id,
        email=body.email,
        role=OrgRole(body.role),
        status=MemberStatus.INVITED,
    )
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)

    await send_invitation_email(body.email, "Organization", f"https://app.aawiz.com/invite/{new_member.id}")

    return MemberResponse(
        id=new_member.id, email=new_member.email, role=new_member.role.value,
        status=new_member.status.value, user_id=new_member.user_id,
        invited_at=new_member.invited_at, joined_at=new_member.joined_at,
    )


@router.patch("/{org_id}/{member_id}/role")
async def change_role(
    org_id: UUID,
    member_id: UUID,
    role: str,
    admin: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.id == member_id,
            OrganizationMember.organization_id == org_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.role = OrgRole(role)
    await db.commit()
    return {"message": "Role updated"}


@router.patch("/{org_id}/{member_id}/suspend")
async def suspend_member(
    org_id: UUID,
    member_id: UUID,
    admin: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.id == member_id,
            OrganizationMember.organization_id == org_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.status = MemberStatus.SUSPENDED
    await db.commit()
    return {"message": "Member suspended"}


@router.delete("/{org_id}/{member_id}")
async def remove_member(
    org_id: UUID,
    member_id: UUID,
    admin: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(OrganizationMember).where(
            OrganizationMember.id == member_id,
            OrganizationMember.organization_id == org_id,
        )
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    await db.delete(member)
    await db.commit()
    return {"message": "Member removed"}
