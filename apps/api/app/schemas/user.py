from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserProfile(BaseModel):
    id: UUID
    email: str
    display_name: str | None
    avatar_url: str | None
    bio: str | None
    role: str
    persona: str
    language: str
    timezone: str
    streak_days: int
    last_check_in: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    display_name: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    persona: str | None = None
    language: str | None = None
    timezone: str | None = None
