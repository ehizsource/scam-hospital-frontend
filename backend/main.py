import os
import hmac
import hashlib
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from .email_service import send_confirmation_email, send_free_review_emails, send_received_email
    from .meet_service import create_meet_link
except ImportError:
    from email_service import send_confirmation_email, send_free_review_emails, send_received_email
    from meet_service import create_meet_link


app = FastAPI()

allowed_origins = [
    origin.strip() if "://" in origin else f"https://{origin.strip()}"
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
allowed_origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX", r"https?://(localhost|127\.0\.0\.1):\d+")
CLINIC_TIMEZONE = os.getenv("CLINIC_TIMEZONE", "Africa/Lagos")
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY", "")
PAYSTACK_CALLBACK_URL = os.getenv("PAYSTACK_CALLBACK_URL", "")
BOOKED_APPOINTMENTS = {
    "2026-05-10": {"9:00 AM", "2:00 PM"},
    "2026-05-12": {"11:00 AM", "3:00 PM", "5:00 PM"},
}
PACKAGE_DURATIONS = {
    "Basic": 30,
    "Standard": 45,
    "Premium": 60,
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
    description: Optional[str] = None


class FreeReviewRequest(BaseModel):
    name: str
    email: str
    scam_type: str
    date: str
    time: str
    country: Optional[str] = None
    timezone: Optional[str] = None
    local_time: Optional[str] = None
    description: Optional[str] = None


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
    admin_email_sent = send_received_email(
        data.name,
        data.email,
        data.scam_type,
        data.package,
        data.date,
        format_clinic_time(data.date, data.time),
        country=data.country,
        client_time=data.local_time,
        client_timezone=data.timezone,
        description=data.description,
    )
    return {"status": "ok", "admin_email_sent": admin_email_sent}


@app.post("/submit-free-review")
def submit_free_review(data: FreeReviewRequest):
    clinic_time = format_clinic_time(data.date, data.time)
    email_status = send_free_review_emails(
        data.name,
        data.email,
        data.scam_type,
        data.date,
        clinic_time,
        country=data.country,
        client_time=data.local_time,
        client_timezone=data.timezone,
        description=data.description,
    )

    return {"status": "ok", **email_status}


@app.post("/initialize-payment")
def initialize_payment(data: dict):
    package = data.get("package", "package")
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    reference = f"SH-{package.upper()}-{timestamp}".replace(" ", "-")
    metadata = {
        "name": data.get("name"),
        "email": data.get("email"),
        "package": package,
        "date": data.get("date"),
        "time": data.get("time"),
        "local_time": data.get("local_time"),
        "timezone": data.get("timezone"),
        "scam_type": data.get("scam_type"),
        "description": data.get("description"),
        "country": data.get("country"),
    }

    if PAYSTACK_SECRET_KEY:
        try:
            amount_cents = int(round(float(data.get("amount", 0)) * 100))
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid payment amount.")

        if amount_cents <= 0:
            raise HTTPException(status_code=400, detail="Payment amount must be greater than zero.")

        payload = {
            "email": data.get("email"),
            "amount": amount_cents,
            "reference": reference,
            "metadata": metadata,
        }
        if PAYSTACK_CALLBACK_URL:
            payload["callback_url"] = PAYSTACK_CALLBACK_URL
        if data.get("currency"):
            payload["currency"] = data.get("currency")

        response = requests.post(
            "https://api.paystack.co/transaction/initialize",
            headers={
                "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=20,
        )

        if not response.ok:
            raise HTTPException(status_code=502, detail="Payment provider could not initialize the transaction.")

        body = response.json()
        if not body.get("status"):
            raise HTTPException(status_code=502, detail=body.get("message", "Payment initialization failed."))

        auth_url = body.get("data", {}).get("authorization_url")
        if not auth_url:
            raise HTTPException(status_code=502, detail="Payment provider did not return a payment link.")

        return {
            "status": "payment_ready",
            "reference": reference,
            "payment_url": auth_url,
        }

    return {
        "status": "payment_ready",
        "reference": reference,
        "payment_url": "https://paystack.com/pay/test-payment-link",
    }


@app.post("/paystack-webhook")
async def paystack_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("x-paystack-signature")

    if PAYSTACK_SECRET_KEY and signature:
        expected = hmac.new(PAYSTACK_SECRET_KEY.encode(), raw_body, hashlib.sha512).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=401, detail="Invalid Paystack signature.")

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

        scam_type = meta.get("scam_type")
        country = meta.get("country")
        description = meta.get("description")
        duration_minutes = PACKAGE_DURATIONS.get(package, 30)

        meet_link = create_meet_link(
            name,
            email,
            date,
            time,
            package=package,
            duration_minutes=duration_minutes,
            description=description,
        )
        send_confirmation_email(
            name,
            email,
            package,
            date,
            clinic_time,
            meet_link,
            client_time=client_time,
            client_timezone=client_timezone,
            scam_type=scam_type,
            country=country,
            description=description,
            duration_minutes=duration_minutes,
        )

    return {"status": "ok"}
