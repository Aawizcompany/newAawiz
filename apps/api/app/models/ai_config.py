import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, DateTime, Text, Boolean, Integer, Float, TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.types import GUID


class JSONDict(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)


class AIPromptTemplate(Base):
    __tablename__ = "ai_prompt_templates"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), index=True)
    use_case: Mapped[str] = mapped_column(String(50), index=True)
    persona: Mapped[str | None] = mapped_column(String(50))
    version: Mapped[int] = mapped_column(Integer, default=1)
    system_prompt: Mapped[str] = mapped_column(Text)
    template_vars: Mapped[dict | None] = mapped_column(JSONDict())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by: Mapped[str | None] = mapped_column(String(255))


class AIModelConfig(Base):
    __tablename__ = "ai_model_configs"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    use_case: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    model_id: Mapped[str] = mapped_column(String(255))
    temperature: Mapped[float] = mapped_column(Float, default=0.7)
    max_tokens: Mapped[int] = mapped_column(Integer, default=1024)
    extra_params: Mapped[dict | None] = mapped_column(JSONDict())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
