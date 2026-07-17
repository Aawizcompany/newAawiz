import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_otp_email(email: str, code: str) -> None:
    if settings.DEBUG:
        logger.info(f"OTP for {email}: {code}")
        return

    # TODO: integrate with SendGrid or AWS SES
    logger.info(f"Sending OTP to {email}")


async def send_invitation_email(email: str, org_name: str, invite_link: str) -> None:
    if settings.DEBUG:
        logger.info(f"Invitation for {email} to {org_name}: {invite_link}")
        return

    logger.info(f"Sending invitation to {email}")
