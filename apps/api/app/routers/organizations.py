from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_current_user, require_org_role
from app.models.user import User
from app.models.organization import Organization, OrganizationMember, OrgRole
from app.schemas.organization import OrgResponse, OrgUpdate

router = APIRouter()


@router.get("/{org_id}", response_model=OrgResponse)
async def get_org(
    org_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.patch("/{org_id}", response_model=OrgResponse)
async def update_org(
    org_id: UUID,
    body: OrgUpdate,
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    org = result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    await db.commit()
    await db.refresh(org)
    return org
