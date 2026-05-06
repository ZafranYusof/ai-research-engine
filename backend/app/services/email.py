import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS)


def send_verification_email(to_email: str, token: str):
    """Send verification email. If SMTP not configured, log token to console."""
    verify_url = f"{settings.FRONTEND_URL}/verify?token={token}"

    if not _smtp_configured():
        logger.info(f"[DEV] Verification token for {to_email}: {token}")
        logger.info(f"[DEV] Verify URL: {verify_url}")
        return

    subject = "Verify your email - ResearchAI"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a1a;">Verify your email</h2>
        <p style="color: #555;">Click the button below to verify your email address:</p>
        <a href="{verify_url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
            Verify Email
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Or copy this link: {verify_url}
        </p>
    </div>
    """
    _send_email(to_email, subject, html)


def send_reset_email(to_email: str, token: str):
    """Send password reset email. If SMTP not configured, log token to console."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    if not _smtp_configured():
        logger.info(f"[DEV] Reset token for {to_email}: {token}")
        logger.info(f"[DEV] Reset URL: {reset_url}")
        return

    subject = "Reset your password - ResearchAI"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #1a1a1a;">Reset your password</h2>
        <p style="color: #555;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="{reset_url}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
            Reset Password
        </a>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
            Or copy this link: {reset_url}
        </p>
        <p style="color: #888; font-size: 12px;">If you didn't request this, ignore this email.</p>
    </div>
    """
    _send_email(to_email, subject, html)


def _send_email(to_email: str, subject: str, html_body: str):
    """Send email via SMTP."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(msg["From"], to_email, msg.as_string())
        logger.info(f"Email sent to {to_email}: {subject}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        raise
