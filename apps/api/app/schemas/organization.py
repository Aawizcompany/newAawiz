from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class OrgResponse(BaseModel):
    id: UUID
    name: str
    logo_url: str | None
    industry: str | None
    country: str | None
    timezone: str
    language: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class OrgUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    industry: str | None = None
    country: str | None = None
    timezone: str | None = None
    language: str | None = None


class MemberInvite(BaseModel):
    email: EmailStr
    role: str = "viewer"


class MemberResponse(BaseModel):
    id: UUID
    email: str
    role: str
    status: str
    user_id: UUID | None
    display_name: str | None = None
    invited_at: datetime
    joined_at: datetime | None

    model_config = {"from_attributes": True}


class TeamCreate(BaseModel):
    name: str
    description: str | None = None


class TeamResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    lead_member_id: UUID | None
    member_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    lead_member_id: UUID | None = None
