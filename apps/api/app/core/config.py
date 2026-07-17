from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Aawiz API"
    DEBUG: bool = False
    VERSION: str = "0.1.0"

    DATABASE_URL: str = "sqlite+aiosqlite:///./aawiz.db"
    DATABASE_URL_SYNC: str = "sqlite:///./aawiz.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    OTP_EXPIRE_MINUTES: int = 10

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    APPLE_CLIENT_ID: str = ""
    APPLE_TEAM_ID: str = ""
    APPLE_KEY_ID: str = ""

    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
    ]

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    FROM_EMAIL: str = "noreply@aawiz.com"

    MIN_AGGREGATION_THRESHOLD: int = 5

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
