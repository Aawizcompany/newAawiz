import json
import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, Enum, ForeignKey, Integer, Text, Float, TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.types import GUID


class JSONList(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)


class MoodLevel(int, PyEnum):
    AWFUL = 1
    BAD = 2
    OKAY = 3
    GOOD = 4
    GREAT = 5


class MoodEntry(Base):
    __tablename__ = "mood_entries"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    level: Mapped[int] = mapped_column(Integer)
    note: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str] | None] = mapped_column(JSONList())
    sentiment_score: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    user: Mapped["User"] = relationship(back_populates="mood_entries")


class MoodTag(Base):
    __tablename__ = "mood_tags"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    category: Mapped[str | None] = mapped_column(String(50))
    is_default: Mapped[bool] = mapped_column(default=True)
