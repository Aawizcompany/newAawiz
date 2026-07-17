from uuid import UUID

import logging

from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.chat import Conversation, Message, MessageRole
from app.schemas.chat import MessageCreate, MessageResponse, ConversationResponse, ConversationListItem
from app.services.ai import chat_completion, analyze_sentiment

router = APIRouter()


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = Conversation(user_id=user.id)
    db.add(conv)
    await db.commit()
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conv.id)
    )
    return result.scalar_one()


@router.get("/conversations", response_model=list[ConversationListItem])
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    convs = result.scalars().all()
    items = []
    for c in convs:
        msg_result = await db.execute(
            select(Message.content)
            .where(Message.conversation_id == c.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last = msg_result.scalar_one_or_none()
        items.append(ConversationListItem(
            id=c.id, title=c.title, updated_at=c.updated_at, last_message=last,
        ))
    return items


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: UUID,
    body: MessageCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == user.id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    user_msg = Message(conversation_id=conv.id, role=MessageRole.USER, content=body.content)
    db.add(user_msg)

    msg_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .limit(20)
    )
    history = [
        {"role": m.role.value, "content": m.content}
        for m in reversed(msg_result.scalars().all())
    ]
    history.append({"role": "user", "content": body.content})

    try:
        ai_result = await chat_completion(history, db, use_case="chat", persona=user.persona.value)
    except Exception as e:
        logger.error("AI chat_completion failed: %s", e)
        raise HTTPException(status_code=503, detail="AI service temporarily unavailable. Please try again.")

    ai_msg = Message(
        conversation_id=conv.id,
        role=MessageRole.ASSISTANT,
        content=ai_result["content"],
        model_used=ai_result["model"],
        tokens_used=ai_result["tokens"],
    )
    db.add(ai_msg)

    if not conv.title and len(history) <= 2:
        conv.title = body.content[:50]

    await db.commit()
    await db.refresh(ai_msg)
    return ai_msg
