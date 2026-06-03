import os
import smtplib
from email.message import EmailMessage
from typing import Iterable, Optional

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "scamehospital@gmail.com")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USERNAME)
SENDER_NAME = os.getenv("SENDER_NAME", "ScameHospital")

def _send_email(to, subject: str, body: str) -> bool:
    recipients = [to] if isinstance(to, str) else list(to)
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    message["To"] = ", ".join(recipients)
    message.set_content(body)
    if not SMTP_PASSWORD:
        print(f"[EMAIL] No password. Would send to {message['To']}: {subject}")
        return False
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
            smtp.starttls()
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
            smtp.send_message(message)
        print(f"[EMAIL] Sent to {message['To']}: {subject}")
        return True
    except (OSError, smtplib.SMTPException) as error:
        print(f"[EMAIL] Failed: {error}")
        return False

def send_received_email(name: str, email: str, scam_type: str) -> bool:
    body = "\n".join([
        f"Hello {name},",
        "",
        "Your booking has been received at ScameHospital.",
        f"Scam type: {scam_type}",
        "",
        "We will review your case and follow up shortly.",
        "",
        "ScameHospital",
    ])
    return _send_email(email, "Your ScameHospital booking was received", body)

def send_confirmation_email(
    name: str, email: str, package: str, date: str, time: str,
    meet_link: str, local_time: Optional[str] = None, timezone: Optional[str] = None,
) -> bool:
    appointment_line = f"{date} at {local_time or time}"
    if timezone:
        appointment_line += f" ({timezone})"
    body = "\n".join([
        f"Hello {name},",
        "",
        f"Your {package} payment is confirmed. Your ScameHospital session is scheduled.",
        "",
        f"Appointment: {appointment_line}",
        f"Package: {package}",
        f"Google Meet: {meet_link}",
        "",
        "Please join the meeting at the scheduled time using the link above.",
        "You will receive a reminder 30 minutes before the session.",
        "",
        "ScameHospital",
    ])
    return _send_email(email, f"Your {package} ScameHospital session is confirmed", body)

def send_admin_notification(
    admin_email: str, name: str, email: str, scam_type: str,
    package: str, date: str, time: str,
) -> bool:
    body = "\n".join([
        "New booking notification from ScameHospital.",
        "",
        f"Name: {name}",
        f"Email: {email}",
        f"Package: {package}",
        f"Scam type: {scam_type}",
        f"Appointment: {date} at {time}",
    ])
    return _send_email(admin_email, f"New booking - {package} - {name}", body)
