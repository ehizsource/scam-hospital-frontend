import os
import smtplib
from email.message import EmailMessage
from typing import Iterable, Optional


ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "scamehospital@gmail.com")
SUPPORT_EMAIL = os.getenv("SUPPORT_EMAIL", ADMIN_EMAIL)
SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USERNAME or ADMIN_EMAIL)
SENDER_NAME = os.getenv("SENDER_NAME", "ScameHospital")


def _send_email(to: str | Iterable[str], subject: str, body: str, html_body: Optional[str] = None) -> bool:
    recipients = [to] if isinstance(to, str) else list(to)
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
    message["To"] = ", ".join(recipients)
    message.set_content(body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

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


def _escape_html(value: Optional[str]) -> str:
    text = "" if value is None else str(value)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#x27;")
    )


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


def _detail_rows(rows: list[tuple[str, Optional[str]]]) -> str:
    return "".join(
        f"""
        <tr>
          <td style="padding:10px 0;color:#64748b;font-size:14px;border-bottom:1px solid #e5e7eb;">{_escape_html(label)}</td>
          <td style="padding:10px 0;color:#0f172a;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid #e5e7eb;">{_escape_html(value or 'Not provided')}</td>
        </tr>
        """
        for label, value in rows
    )


def _confirmation_html(
    name: str,
    package: str,
    scam_type: str,
    appointment: str,
    meet_link: str,
    duration_line: str,
    payment_reference: Optional[str] = None,
    payment_provider: Optional[str] = None,
    amount: Optional[str] = None,
    currency: Optional[str] = None,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
    country: Optional[str] = None,
    admin_copy: bool = False,
) -> str:
    local_appointment = ""
    if client_time:
        local_appointment = client_time
        if client_timezone:
            local_appointment += f" ({client_timezone})"

    amount_label = ""
    if amount:
        amount_label = f"{currency or ''} {amount}".strip()

    rows = [
        ("Package", package),
        ("Scam type", scam_type),
        ("Appointment", appointment),
        ("Client local time", local_appointment),
        ("Session length", duration_line.replace("Session length: ", "")),
        ("Google Meet", meet_link),
        ("Payment reference", payment_reference),
        ("Payment provider", payment_provider),
        ("Amount paid", amount_label),
        ("Country", country),
    ]
    headline = "Paid booking confirmed" if admin_copy else "Thank you. Your booking is confirmed."
    intro = (
        "A paid ScameHospital booking has been confirmed. The receipt, booking details, and Google Meet link are below."
        if admin_copy
        else "Thank you for trusting ScameHospital. We have received your payment and confirmed your support session."
    )

    return f"""<!doctype html>
<html>
  <body style="margin:0;background:#f3f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <div style="max-width:680px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border:1px solid #dbeafe;border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(15,23,42,0.08);">
        <div style="background:#10202f;padding:28px 30px;">
          <div style="font-size:30px;font-weight:800;color:#eaf2ff;letter-spacing:0;">Scame<span style="color:#67e8f9;">Hospital</span></div>
          <div style="margin-top:18px;display:inline-block;background:#dcfce7;color:#166534;border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800;">Payment received</div>
          <h1 style="margin:18px 0 0;color:#ffffff;font-size:30px;line-height:1.2;">{_escape_html(headline)}</h1>
        </div>
        <div style="padding:30px;">
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#334155;">Hi <strong>{_escape_html(name)}</strong>,</p>
          <p style="margin:0 0 22px;font-size:16px;line-height:1.7;color:#334155;">{_escape_html(intro)}</p>
          <div style="background:#ecfeff;border-left:5px solid #06b6d4;border-radius:14px;padding:18px 20px;margin:0 0 22px;">
            <div style="font-size:13px;text-transform:uppercase;font-weight:800;color:#0e7490;letter-spacing:.04em;">Google Meet session</div>
            <a href="{_escape_html(meet_link)}" style="display:block;margin-top:8px;color:#0369a1;font-size:16px;font-weight:800;word-break:break-word;">{_escape_html(meet_link)}</a>
          </div>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin:0 0 24px;">
            {_detail_rows(rows)}
          </table>
          <p style="margin:0 0 10px;font-size:15px;line-height:1.7;color:#334155;">Please join the meeting at your booked time. Keep screenshots, payment proof, account names, links, and chat history ready so the session can begin quickly.</p>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#334155;">Questions? Contact us at <a href="mailto:{_escape_html(SUPPORT_EMAIL)}" style="color:#0369a1;font-weight:700;">{_escape_html(SUPPORT_EMAIL)}</a>.</p>
        </div>
        <div style="padding:18px 30px;background:#f8fafc;color:#64748b;font-size:13px;text-align:center;border-top:1px solid #e5e7eb;">This is an automated confirmation from ScameHospital.</div>
      </div>
    </div>
  </body>
</html>"""


def send_received_email(
    name: str,
    email: str,
    scam_type: str,
    package: str = "Unknown",
    date: str = "",
    time: str = "",
    country: Optional[str] = None,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
    description: Optional[str] = None,
) -> bool:
    lines = [
        f"Hello {name},",
        "",
        "Your booking has been received at ScameHospital.",
        f"Scam type: {scam_type}",
    ]
    if date or time:
        lines.extend(
            [
                "",
                "Booking information:",
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
    lines.extend(["", "We will review your case and follow up shortly.", "", "ScameHospital"])
    return _send_email(email, "Your ScameHospital booking was received", "\n".join(lines))


def send_admin_notification(
    admin_email: str,
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
) -> bool:
    body = "\n".join(
        [
            "New booking notification from ScameHospital.",
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
    return _send_email(admin_email, f"New booking - {package} - {name}", body)


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
    payment_reference: Optional[str] = None,
    payment_provider: Optional[str] = None,
    amount: Optional[str] = None,
    currency: Optional[str] = None,
) -> dict:
    duration_line = f"Session length: {duration_minutes} minutes" if duration_minutes else "Session length: Package duration"
    payment_lines = [
        f"Payment provider: {payment_provider}" if payment_provider else "",
        f"Payment reference: {payment_reference}" if payment_reference else "",
        f"Amount paid: {currency or ''} {amount}".strip() if amount else "",
    ]

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
            *[line for line in payment_lines if line],
            f"Google Meet: {meet_link}",
        ]
    )
    user_body = "\n".join(
        [
            f"Hello {name},",
            "",
            "Thank you for trusting ScameHospital.",
            f"Your {package} payment is confirmed and your support session is scheduled.",
            duration_line,
            *[line for line in payment_lines if line],
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

    user_html = _confirmation_html(
        name,
        package,
        scam_type or "Not provided",
        time,
        meet_link,
        duration_line,
        payment_reference=payment_reference,
        payment_provider=payment_provider,
        amount=amount,
        currency=currency,
        client_time=client_time,
        client_timezone=client_timezone,
        country=country,
    )
    admin_html = _confirmation_html(
        name,
        package,
        scam_type or "Not provided",
        time,
        meet_link,
        duration_line,
        payment_reference=payment_reference,
        payment_provider=payment_provider,
        amount=amount,
        currency=currency,
        client_time=client_time,
        client_timezone=client_timezone,
        country=country,
        admin_copy=True,
    )

    return {
        "admin_email_sent": _send_email(
            ADMIN_EMAIL,
            f"Paid booking confirmed - {package} - {name}",
            admin_body,
            admin_html,
        ),
        "user_email_sent": _send_email(
            email,
            f"Receipt and booking confirmation - {package} ScameHospital session",
            user_body,
            user_html,
        ),
    }
