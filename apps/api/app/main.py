from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.models import *  # noqa: F401,F403
from app.routers import auth, users, organizations, teams, members, moods, chat, reports, ai_config, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(teams.router, prefix="/api/v1/teams", tags=["teams"])
app.include_router(members.router, prefix="/api/v1/members", tags=["members"])
app.include_router(moods.router, prefix="/api/v1/moods", tags=["moods"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])
app.include_router(ai_config.router, prefix="/api/v1/admin/ai", tags=["ai-config"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])


@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}
