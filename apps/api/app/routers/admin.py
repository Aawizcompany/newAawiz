from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import require_super_admin
from app.models.user import User
from app.models.organization import Organization, OrganizationMember

router = APIRouter()


@router.get("/users")
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: str | None = None,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).order_by(User.created_at.desc())
    if search:
        query = query.where(User.email.ilike(f"%{search}%"))
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()

    total_result = await db.execute(select(func.count()).select_from(User))
    total = total_result.scalar() or 0

    return {
        "users": [
            {
                "id": str(u.id), "email": u.email, "display_name": u.display_name,
                "role": u.role.value, "is_active": u.is_active, "is_verified": u.is_verified,
                "persona": u.persona.value, "streak_days": u.streak_days,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": total,
    }


@router.get("/organizations")
async def list_orgs(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).order_by(Organization.created_at.desc()).offset(skip).limit(limit))
    orgs = result.scalars().all()

    org_data = []
    for o in orgs:
        count = await db.execute(
            select(func.count()).where(OrganizationMember.organization_id == o.id)
        )
        org_data.append({
            "id": str(o.id), "name": o.name, "industry": o.industry,
            "country": o.country, "is_active": o.is_active,
            "member_count": count.scalar() or 0,
            "created_at": o.created_at.isoformat(),
        })

    total_result = await db.execute(select(func.count()).select_from(Organization))
    return {"organizations": org_data, "total": total_result.scalar() or 0}


@router.get("/stats")
async def platform_stats(
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    users_count = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    orgs_count = (await db.execute(select(func.count()).select_from(Organization))).scalar() or 0
    active_users = (await db.execute(select(func.count()).where(User.is_active == True))).scalar() or 0

    return {
        "total_users": users_count,
        "total_organizations": orgs_count,
        "active_users": active_users,
    }
