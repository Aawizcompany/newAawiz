from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import require_org_role
from app.models.organization import Team, TeamMember, OrganizationMember, OrgRole
from app.schemas.organization import TeamCreate, TeamResponse, TeamUpdate

router = APIRouter()


@router.get("/{org_id}", response_model=list[TeamResponse])
async def list_teams(
    org_id: UUID,
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR, OrgRole.TEAM_LEAD, OrgRole.VIEWER)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Team).where(Team.organization_id == org_id).order_by(Team.name))
    teams = result.scalars().all()

    responses = []
    for t in teams:
        count_result = await db.execute(
            select(func.count()).where(TeamMember.team_id == t.id)
        )
        responses.append(TeamResponse(
            id=t.id, name=t.name, description=t.description,
            lead_member_id=t.lead_member_id,
            member_count=count_result.scalar() or 0,
            created_at=t.created_at,
        ))
    return responses


@router.post("/{org_id}", response_model=TeamResponse, status_code=201)
async def create_team(
    org_id: UUID,
    body: TeamCreate,
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR)),
    db: AsyncSession = Depends(get_db),
):
    team = Team(organization_id=org_id, name=body.name, description=body.description)
    db.add(team)
    await db.commit()
    await db.refresh(team)
    return TeamResponse(
        id=team.id, name=team.name, description=team.description,
        lead_member_id=team.lead_member_id, member_count=0, created_at=team.created_at,
    )


@router.patch("/{org_id}/{team_id}", response_model=TeamResponse)
async def update_team(
    org_id: UUID,
    team_id: UUID,
    body: TeamUpdate,
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Team).where(Team.id == team_id, Team.organization_id == org_id)
    )
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(team, field, value)
    await db.commit()
    await db.refresh(team)

    count_result = await db.execute(select(func.count()).where(TeamMember.team_id == team.id))
    return TeamResponse(
        id=team.id, name=team.name, description=team.description,
        lead_member_id=team.lead_member_id,
        member_count=count_result.scalar() or 0,
        created_at=team.created_at,
    )


@router.post("/{org_id}/{team_id}/members/{member_id}")
async def add_team_member(
    org_id: UUID,
    team_id: UUID,
    member_id: UUID,
    admin: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR, OrgRole.TEAM_LEAD)),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.member_id == member_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already a team member")

    db.add(TeamMember(team_id=team_id, member_id=member_id))
    await db.commit()
    return {"message": "Member added to team"}


@router.delete("/{org_id}/{team_id}/members/{member_id}")
async def remove_team_member(
    org_id: UUID,
    team_id: UUID,
    member_id: UUID,
    admin: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR, OrgRole.TEAM_LEAD)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TeamMember).where(TeamMember.team_id == team_id, TeamMember.member_id == member_id)
    )
    tm = result.scalar_one_or_none()
    if not tm:
        raise HTTPException(status_code=404, detail="Team member not found")

    await db.delete(tm)
    await db.commit()
    return {"message": "Member removed from team"}
