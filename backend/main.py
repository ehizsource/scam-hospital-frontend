import os
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .email_service import send_confirmation_email, send_received_email
    from .meet_service import create_meet_link
except ImportError:
    from email_service import send_confirmation_email, send_received_email
    from meet_service import create_meet_link


app = FastAPI()

allowed_origins = [
    origin.strip() if "://" in origin else f"https://{origin.strip()}"
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
allowed_origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX")
CLINIC_TIMEZONE = os.getenv("CLINIC_TIMEZONE", "Africa/Lagos")
BOOKED_APPOINTMENTS = {
    "2026-05-10": {"9:00 AM", "2:00 PM"},
    "2026-05-12": {"11:00 AM", "3:00 PM", "5:00 PM"},
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegistrationRequest(BaseModel):
    name: str
    email: str
    scam_type: str
    package: str
    date: str
    time: str
    country: Optional[str] = None
    timezone: Optional[str] = None
    local_time: Optional[str] = None


@app.get("/")
def root():
    return {"message": "Scam Hospital API is running!"}


@app.get("/booked-slots")
def booked_slots():
    return {date: sorted(times) for date, times in BOOKED_APPOINTMENTS.items()}


def format_clinic_time(date: str, time: str) -> str:
    appointment_utc = datetime.strptime(f"{date} {time}", "%Y-%m-%d %I:%M %p")
    appointment_utc = appointment_utc.replace(tzinfo=timezone.utc)
    appointment_local = appointment_utc.astimezone(ZoneInfo(CLINIC_TIMEZONE))
    return appointment_local.strftime("%Y-%m-%d at %I:%M %p").lstrip("0") + f" ({CLINIC_TIMEZONE})"


@app.post("/analyze")
def analyze(data: dict):
    message = data.get("message", "")
    text = message.lower()
    signals = [
        (
            "Urgency or pressure",
            16,
            ["urgent", "immediately", "right now", "today", "limited time", "deadline", "act fast", "pressure", "quickly"],
        ),
        (
            "Payment request",
            20,
            ["pay", "payment", "fee", "gift card", "wire", "western union", "moneygram", "transfer", "deposit", "tax", "clearance"],
        ),
        (
            "Crypto or investment hook",
            18,
            ["crypto", "bitcoin", "wallet", "blockchain", "forex", "trading", "profit", "return", "investment", "withdraw", "platform"],
        ),
        (
            "Identity or account access",
            18,
            ["password", "login", "otp", "verification code", "bank account", "account number", "ssn", "social security", "pin", "seed phrase"],
        ),
        (
            "Off-platform contact",
            12,
            ["whatsapp", "telegram", "signal", "hangouts", "google chat", "private chat", "move to", "off platform"],
        ),
        (
            "Romance trust-building",
            14,
            ["love", "relationship", "marry", "soulmate", "military", "widow", "widower", "dating", "fiance", "fiancee"],
        ),
        (
            "Link or attachment",
            12,
            ["http://", "https://", "link", "click", "attachment", "download", "form", "portal"],
        ),
        (
            "Authority impersonation",
            15,
            ["police", "government", "irs", "efcc", "fbi", "court", "customs", "bank officer", "support agent"],
        ),
        (
            "Prize or unexpected money",
            15,
            ["won", "winner", "lottery", "prize", "grant", "inheritance", "donation", "beneficiary"],
        ),
    ]

    matched = [
        {"label": label, "points": points}
        for label, points, words in signals
        if any(word in text for word in words)
    ]
    base_score = 18 if len(message.strip()) > 140 else 10 if len(message.strip()) > 40 else 4
    risk_score = min(98, base_score + sum(item["points"] for item in matched))
    level = "High" if risk_score >= 75 else "Elevated" if risk_score >= 45 else "Moderate" if risk_score >= 25 else "Low"
    category = data.get("scam_type") or "Needs manual review"

    return {
        "risk_score": risk_score,
        "risk_level": level,
        "confidence": min(96, 48 + len(matched) * 8 + (10 if len(message) > 180 else 0)),
        "category": category,
        "signals": matched[:4],
        "message": message,
    }


@app.post("/register")
def register(data: RegistrationRequest):
    booked_for_day = BOOKED_APPOINTMENTS.setdefault(data.date, set())

    if data.time in booked_for_day:
        raise HTTPException(
            status_code=409,
            detail="This appointment time has just been booked. Please choose another time.",
        )

    booked_for_day.add(data.time)
    send_received_email(data.name, data.email, data.scam_type)
    return {"status": "ok"}


@app.post("/initialize-payment")
def initialize_payment(data: dict):
    package = data.get("package", "package")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")

    return {
        "status": "payment_ready",
        "reference": f"SH-{package.upper()}-{timestamp}".replace(" ", "-"),
        "payment_url": "https://paystack.com/pay/test-payment-link",
    }


@app.post("/paystack-webhook")
async def paystack_webhook(request: Request):
    payload = await request.json()

    if payload.get("event") == "charge.success":
        meta = payload["data"]["metadata"]
        name = meta["name"]
        email = meta["email"]
        package = meta["package"]
        date = meta["date"]
        time = meta["time"]
        client_time = meta.get("local_time")
        client_timezone = meta.get("timezone")
        clinic_time = format_clinic_time(date, time)

        meet_link = create_meet_link(name, email, date, time)
        send_confirmation_email(
            name,
            email,
            package,
            date,
            clinic_time,
            meet_link,
            client_time=client_time,
            client_timezone=client_timezone,
        )

    return {"status": "ok"}
