from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.middleware.auth import require_super_admin
from app.models.user import User
from app.models.ai_config import AIPromptTemplate, AIModelConfig

router = APIRouter()


class PromptCreate(BaseModel):
    name: str
    use_case: str
    persona: str | None = None
    system_prompt: str
    template_vars: dict | None = None


class ModelConfigUpdate(BaseModel):
    use_case: str
    model_id: str
    temperature: float = 0.7
    max_tokens: int = 1024
    extra_params: dict | None = None


@router.get("/prompts")
async def list_prompts(
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIPromptTemplate).order_by(AIPromptTemplate.use_case, AIPromptTemplate.version.desc())
    )
    return result.scalars().all()


@router.post("/prompts", status_code=201)
async def create_prompt(
    body: PromptCreate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    latest = await db.execute(
        select(AIPromptTemplate)
        .where(AIPromptTemplate.use_case == body.use_case, AIPromptTemplate.persona == body.persona)
        .order_by(AIPromptTemplate.version.desc())
        .limit(1)
    )
    prev = latest.scalar_one_or_none()
    version = (prev.version + 1) if prev else 1

    if prev:
        prev.is_active = False

    template = AIPromptTemplate(
        name=body.name, use_case=body.use_case, persona=body.persona,
        version=version, system_prompt=body.system_prompt,
        template_vars=body.template_vars, created_by=str(user.id),
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.post("/prompts/{prompt_id}/rollback")
async def rollback_prompt(
    prompt_id: UUID,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AIPromptTemplate).where(AIPromptTemplate.id == prompt_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status_code=404, detail="Prompt not found")

    current = await db.execute(
        select(AIPromptTemplate).where(
            AIPromptTemplate.use_case == target.use_case,
            AIPromptTemplate.persona == target.persona,
            AIPromptTemplate.is_active == True,
        )
    )
    for p in current.scalars().all():
        p.is_active = False

    target.is_active = True
    await db.commit()
    return {"message": f"Rolled back to version {target.version}"}


@router.get("/models")
async def list_models(
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(AIModelConfig).order_by(AIModelConfig.use_case))
    return result.scalars().all()


@router.put("/models")
async def upsert_model_config(
    body: ModelConfigUpdate,
    user: User = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(AIModelConfig).where(AIModelConfig.use_case == body.use_case)
    )
    config = result.scalar_one_or_none()

    if config:
        config.model_id = body.model_id
        config.temperature = body.temperature
        config.max_tokens = body.max_tokens
        config.extra_params = body.extra_params
    else:
        config = AIModelConfig(**body.model_dump())
        db.add(config)

    await db.commit()
    await db.refresh(config)
    return config
