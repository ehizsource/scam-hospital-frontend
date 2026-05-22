import os
import smtplib
from email.message import EmailMessage
from typing import Iterable, Optional


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "scamehospital@gmail.com")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", ADMIN_EMAIL)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USERNAME)
SENDER_NAME = os.getenv("SENDER_NAME", "ScameHospital")


def _send_email(to: str | Iterable[str], subject: str, body: str) -> bool:
    recipients = [to] if isinstance(to, str) else list(to)
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    message["To"] = ", ".join(recipients)
    message.set_content(body)

    if not SMTP_PASSWORD:
        print(
            "Email not sent because SMTP_PASSWORD is not configured. "
            f"Would send to {message['To']}: {subject}\n{body}"
        )
        return False

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)

    return True


def _booking_lines(
    name: str,
    email: str,
    package: str,
    scam_type: str,
    date: str,
    time: str,
    country: Optional[str] = None,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
    description: Optional[str] = None,
) -> list[str]:
    appointment = time if date in time else f"{date} at {time}"
    lines = [
        f"Name: {name}",
        f"Email: {email}",
        f"Package: {package}",
        f"Scam type: {scam_type}",
        f"Appointment: {appointment}",
    ]

    if country:
        lines.append(f"Country: {country}")
    if client_time:
        local_line = f"Client local time: {date} at {client_time}"
        if client_timezone:
            local_line += f" ({client_timezone})"
        lines.append(local_line)
    if description:
        lines.extend(["", "Case summary:", description])

    return lines


def send_received_email(
    name: str,
    email: str,
    scam_type: str,
    package: str,
    date: str,
    time: str,
    country: Optional[str] = None,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
    description: Optional[str] = None,
):
    body = "\n".join(
        [
            "A booking was started in ScameHospital.",
            "",
            *_booking_lines(
                name,
                email,
                package,
                scam_type,
                date,
                time,
                country=country,
                client_time=client_time,
                client_timezone=client_timezone,
                description=description,
            ),
        ]
    )
    sent = _send_email(ADMIN_EMAIL, f"Booking started - {package} - {name}", body)
    print(f"Received registration from {name} <{email}> for {scam_type}. Admin email sent: {sent}")
    return sent


def send_free_review_emails(
    name: str,
    email: str,
    scam_type: str,
    date: str,
    time: str,
    country: Optional[str] = None,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
    description: Optional[str] = None,
):
    admin_body = "\n".join(
        [
            "Admin approval: automatic free review authorization.",
            "The free package has been submitted and the user should receive the free review confirmation.",
            "",
            *_booking_lines(
                name,
                email,
                "Free",
                scam_type,
                date,
                time,
                country=country,
                client_time=client_time,
                client_timezone=client_timezone,
                description=description,
            ),
        ]
    )
    user_body = "\n".join(
        [
            f"Hello {name},",
            "",
            "Your free ScameHospital review has been received and approved for processing.",
            "Please keep screenshots, payment details, account names, links, and chat history safe.",
            "",
            "Booking information:",
            *_booking_lines(
                name,
                email,
                "Free",
                scam_type,
                date,
                time,
                country=country,
                client_time=client_time,
                client_timezone=client_timezone,
            ),
            "",
            "ScameHospital",
        ]
    )

    admin_sent = _send_email(ADMIN_EMAIL, f"Free review submitted - {name}", admin_body)
    user_sent = _send_email(email, "Your ScameHospital free review was received", user_body)
    return {"admin_email_sent": admin_sent, "user_email_sent": user_sent}


def send_confirmation_email(
    name: str,
    email: str,
    package: str,
    date: str,
    time: str,
    meet_link: str,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
    scam_type: Optional[str] = None,
    country: Optional[str] = None,
    description: Optional[str] = None,
    duration_minutes: Optional[int] = None,
):
    client_time_note = ""
    if client_time:
        client_time_note = f" Client sees: {date} at {client_time}"
        if client_timezone:
            client_time_note += f" ({client_timezone})"
        client_time_note += "."

    print(
        "Payment confirmed for "
        f"{name} <{email}>. Package: {package}. "
        f"Appointment: {time}.{client_time_note} Meet: {meet_link}"
    )

    duration_line = f"Session length: {duration_minutes} minutes" if duration_minutes else "Session length: Package duration"
    admin_body = "\n".join(
        [
            "Payment confirmed. Paid package is approved automatically.",
            "Google Meet session has been scheduled if Calendar credentials are configured.",
            "",
            *_booking_lines(
                name,
                email,
                package,
                scam_type or "Not provided",
                date,
                time,
                country=country,
                client_time=client_time,
                client_timezone=client_timezone,
                description=description,
            ),
            duration_line,
            f"Google Meet: {meet_link}",
        ]
    )
    user_body = "\n".join(
        [
            f"Hello {name},",
            "",
            f"Your {package} payment is confirmed and your ScameHospital session is scheduled.",
            duration_line,
            f"Google Meet: {meet_link}",
            "",
            "Appointment information:",
            *_booking_lines(
                name,
                email,
                package,
                scam_type or "Not provided",
                date,
                time,
                country=country,
                client_time=client_time,
                client_timezone=client_timezone,
            ),
            "",
            "You will receive a 30-minute reminder before the scheduled session when Calendar credentials are configured.",
            "",
            "ScameHospital",
        ]
    )

    return {
        "admin_email_sent": _send_email(ADMIN_EMAIL, f"Paid booking confirmed - {package} - {name}", admin_body),
        "user_email_sent": _send_email(email, f"Your {package} ScameHospital session is confirmed", user_body),
    }
