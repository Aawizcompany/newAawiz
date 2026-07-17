from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.mood import MoodEntry
from app.schemas.mood import MoodCreate, MoodResponse, MoodWeekSummary

router = APIRouter()


@router.post("", response_model=MoodResponse, status_code=201)
async def create_mood(
    body: MoodCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    entry = MoodEntry(user_id=user.id, level=body.level, tags=body.tags, note=body.note)
    db.add(entry)

    now = datetime.now(timezone.utc)
    if user.last_check_in:
        days_diff = (now.date() - user.last_check_in.date()).days
        if days_diff == 1:
            user.streak_days += 1
        elif days_diff > 1:
            user.streak_days = 1
    else:
        user.streak_days = 1
    user.last_check_in = now

    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("", response_model=list[MoodResponse])
async def list_moods(
    days: int = Query(7, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    result = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == user.id, MoodEntry.created_at >= since)
        .order_by(MoodEntry.created_at.desc())
    )
    return result.scalars().all()


@router.get("/summary", response_model=MoodWeekSummary)
async def week_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=7)
    result = await db.execute(
        select(MoodEntry)
        .where(MoodEntry.user_id == user.id, MoodEntry.created_at >= since)
        .order_by(MoodEntry.created_at.desc())
    )
    entries = result.scalars().all()

    avg = sum(e.level for e in entries) / len(entries) if entries else None

    tag_count: dict[str, int] = {}
    for e in entries:
        for t in (e.tags or []):
            tag_count[t] = tag_count.get(t, 0) + 1
    top_tags = sorted(tag_count, key=tag_count.get, reverse=True)[:5]

    return MoodWeekSummary(
        entries=entries,
        average_level=round(avg, 1) if avg else None,
        top_tags=top_tags,
        streak_days=user.streak_days,
    )
