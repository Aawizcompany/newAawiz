from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.middleware.auth import get_current_user, require_org_role
from app.models.user import User
from app.models.mood import MoodEntry
from app.models.organization import OrganizationMember, OrgRole, Team, TeamMember

router = APIRouter()


@router.get("/personal/weekly")
async def personal_weekly(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == user.id, MoodEntry.created_at >= since)
        .order_by(MoodEntry.created_at)
    )
    entries = result.scalars().all()

    daily: dict[str, list] = {}
    for e in entries:
        day = e.created_at.strftime("%a")
        daily.setdefault(day, []).append(e.level)

    return {
        "days": {d: round(sum(v) / len(v), 1) for d, v in daily.items()},
        "total_entries": len(entries),
        "average": round(sum(e.level for e in entries) / len(entries), 1) if entries else None,
        "streak": user.streak_days,
    }


@router.get("/org/{org_id}/overview")
async def org_overview(
    org_id: UUID,
    days: int = Query(30, ge=7, le=90),
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR)),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    total_members = await db.execute(
        select(func.count()).where(OrganizationMember.organization_id == org_id, OrganizationMember.status == "active")
    )
    total = total_members.scalar() or 0

    active_users = await db.execute(
        select(func.count(func.distinct(MoodEntry.user_id))).join(
            OrganizationMember, OrganizationMember.user_id == MoodEntry.user_id
        ).where(
            OrganizationMember.organization_id == org_id,
            MoodEntry.created_at >= since,
        )
    )
    active = active_users.scalar() or 0

    avg_mood = await db.execute(
        select(func.avg(MoodEntry.level)).join(
            OrganizationMember, OrganizationMember.user_id == MoodEntry.user_id
        ).where(
            OrganizationMember.organization_id == org_id,
            MoodEntry.created_at >= since,
        )
    )
    avg = avg_mood.scalar()

    teams_result = await db.execute(select(func.count()).where(Team.organization_id == org_id))

    participation = round((active / total) * 100) if total > 0 else 0

    return {
        "total_members": total,
        "active_members": active,
        "participation_rate": participation,
        "average_mood": round(float(avg), 1) if avg else None,
        "total_teams": teams_result.scalar() or 0,
        "period_days": days,
    }


@router.get("/org/{org_id}/teams")
async def org_team_health(
    org_id: UUID,
    days: int = Query(30, ge=7, le=90),
    member: OrganizationMember = Depends(require_org_role(OrgRole.ADMIN, OrgRole.HR)),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    teams_result = await db.execute(select(Team).where(Team.organization_id == org_id))
    teams = teams_result.scalars().all()

    team_data = []
    for team in teams:
        members_result = await db.execute(
            select(TeamMember.member_id).where(TeamMember.team_id == team.id)
        )
        member_ids = [m for m in members_result.scalars().all()]

        if len(member_ids) < settings.MIN_AGGREGATION_THRESHOLD:
            team_data.append({"name": team.name, "participation": None, "reason": "Below minimum threshold"})
            continue

        user_ids_result = await db.execute(
            select(OrganizationMember.user_id).where(OrganizationMember.id.in_(member_ids))
        )
        user_ids = [u for u in user_ids_result.scalars().all() if u]

        if not user_ids:
            continue

        active_count = await db.execute(
            select(func.count(func.distinct(MoodEntry.user_id))).where(
                MoodEntry.user_id.in_(user_ids), MoodEntry.created_at >= since,
            )
        )
        active = active_count.scalar() or 0
        participation = round((active / len(user_ids)) * 100) if user_ids else 0

        team_data.append({"name": team.name, "member_count": len(member_ids), "participation": participation})

    return team_data
