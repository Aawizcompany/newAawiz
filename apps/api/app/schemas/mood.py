from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MoodCreate(BaseModel):
    level: int
    tags: list[str] | None = None
    note: str | None = None


class MoodResponse(BaseModel):
    id: UUID
    level: int
    tags: list[str] | None
    note: str | None
    sentiment_score: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


class MoodWeekSummary(BaseModel):
    entries: list[MoodResponse]
    average_level: float | None
    top_tags: list[str]
    streak_days: int
