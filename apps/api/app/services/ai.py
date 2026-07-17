import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.ai_config import AIModelConfig, AIPromptTemplate


async def get_model_config(db: AsyncSession, use_case: str) -> dict:
    result = await db.execute(
        select(AIModelConfig).where(AIModelConfig.use_case == use_case, AIModelConfig.is_active == True)
    )
    config = result.scalar_one_or_none()
    if not config:
        return {
            "model": "meta-llama/llama-3.2-3b-instruct:free",
            "temperature": 0.7,
            "max_tokens": 1024,
        }
    return {
        "model": config.model_id,
        "temperature": config.temperature,
        "max_tokens": config.max_tokens,
        **(config.extra_params or {}),
    }


async def get_system_prompt(db: AsyncSession, use_case: str, persona: str | None = None) -> str:
    query = select(AIPromptTemplate).where(
        AIPromptTemplate.use_case == use_case,
        AIPromptTemplate.is_active == True,
    )
    if persona:
        query = query.where(AIPromptTemplate.persona == persona)
    query = query.order_by(AIPromptTemplate.version.desc()).limit(1)

    result = await db.execute(query)
    template = result.scalar_one_or_none()
    if template:
        return template.system_prompt

    return (
        "You are Aawiz, a warm and thoughtful companion focused on emotional wellbeing. "
        "You help users reflect on their feelings, notice patterns, and develop self-awareness. "
        "You are not a therapist and do not provide medical advice. "
        "Keep responses concise, empathetic, and grounded."
    )


async def chat_completion(
    messages: list[dict],
    db: AsyncSession,
    use_case: str = "chat",
    persona: str | None = None,
) -> dict:
    config = await get_model_config(db, use_case)
    system_prompt = await get_system_prompt(db, use_case, persona)

    full_messages = [{"role": "system", "content": system_prompt}] + messages

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "HTTP-Referer": "https://aawiz.com",
                "X-Title": "Aawiz",
            },
            json={
                "model": config["model"],
                "messages": full_messages,
                "temperature": config["temperature"],
                "max_tokens": config["max_tokens"],
            },
        )
        response.raise_for_status()
        data = response.json()

    return {
        "content": data["choices"][0]["message"]["content"],
        "model": data.get("model", config["model"]),
        "tokens": data.get("usage", {}).get("total_tokens", 0),
    }


async def analyze_sentiment(text: str, db: AsyncSession) -> dict:
    messages = [
        {
            "role": "user",
            "content": (
                f"Analyze the emotional sentiment of this text and respond with ONLY a JSON object:\n"
                f"{{\"score\": <float -1 to 1>, \"emotion\": \"<primary emotion>\", "
                f"\"tags\": [\"<relevant tag>\", ...]}}\n\nText: {text}"
            ),
        }
    ]
    result = await chat_completion(messages, db, use_case="sentiment")
    try:
        import json
        return json.loads(result["content"])
    except (json.JSONDecodeError, KeyError):
        return {"score": 0.0, "emotion": "neutral", "tags": []}
