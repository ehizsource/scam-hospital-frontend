import hmac
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

import requests
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    from .email_service import ADMIN_EMAIL, send_admin_notification, send_confirmation_email, send_received_email
    from .meet_service import create_meet_link
except ImportError:
    from email_service import ADMIN_EMAIL, send_admin_notification, send_confirmation_email, send_received_email
    from meet_service import create_meet_link


app = FastAPI()
BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "dist"

FLW_SECRET_KEY = os.getenv("FLW_SECRET_KEY") or os.getenv("FLWSECK_TEST") or os.getenv("FLUTTERWAVE_SECRET_KEY", "")
FLW_WEBHOOK_HASH = os.getenv("FLW_WEBHOOK_HASH", "")
CLINIC_TIMEZONE = os.getenv("CLINIC_TIMEZONE", "Africa/Lagos")

ALLOWED_ORIGINS = [
    origin.strip() if "://" in origin else f"https://{origin.strip()}"
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://scamehospital-api-production-8102.up.railway.app",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=os.getenv("ALLOWED_ORIGIN_REGEX", r"https?://(localhost|127\.0\.0\.1):\d+"),
    allow_methods=["*"],
    allow_headers=["*"],
)

BOOKED_APPOINTMENTS: dict = {
    "2026-05-10": {"9:00 AM", "2:00 PM"},
    "2026-05-12": {"11:00 AM", "3:00 PM", "5:00 PM"},
}

PACKAGE_DURATIONS = {
    "Basic": 30,
    "Standard": 45,
    "Premium": 60,
}


class RegistrationRequest(BaseModel):
    name: str
    email: str
    scam_type: str
    package: str
    date: str
    time: str
    local_time: Optional[str] = None
    timezone: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None


@app.get("/")
def root():
    index_file = DIST_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Scam Hospital API is running!"}


@app.get("/booked-slots")
def booked_slots():
    return {date: sorted(times) for date, times in BOOKED_APPOINTMENTS.items()}


@app.post("/analyze")
def analyze(data: dict):
    message = data.get("message", "")
    text = message.lower()
    signals = [
        ("Urgency or pressure", 16, ["urgent", "immediately", "right now", "today", "deadline", "act fast"]),
        ("Payment request", 20, ["pay", "payment", "fee", "gift card", "wire", "transfer", "deposit"]),
        ("Crypto or investment hook", 18, ["crypto", "bitcoin", "wallet", "forex", "trading", "profit", "investment"]),
        ("Identity or account access", 18, ["password", "login", "otp", "verification code", "bank account", "pin"]),
        ("Off-platform contact", 12, ["whatsapp", "telegram", "signal", "hangouts", "move to"]),
        ("Romance trust-building", 14, ["love", "relationship", "marry", "soulmate", "military", "widow"]),
        ("Link or attachment", 12, ["http://", "https://", "link", "click", "attachment", "download"]),
        ("Authority impersonation", 15, ["police", "government", "irs", "efcc", "fbi", "court"]),
        ("Prize or unexpected money", 15, ["won", "winner", "lottery", "prize", "inheritance"]),
    ]
    matched = [
        {"label": label, "points": points}
        for label, points, words in signals
        if any(word in text for word in words)
    ]
    base_score = 18 if len(message.strip()) > 140 else 10 if len(message.strip()) > 40 else 4
    risk_score = min(98, base_score + sum(item["points"] for item in matched))
    level = "High" if risk_score >= 75 else "Elevated" if risk_score >= 45 else "Moderate" if risk_score >= 25 else "Low"
    return {
        "risk_score": risk_score,
        "risk_level": level,
        "confidence": min(96, 48 + len(matched) * 8 + (10 if len(message) > 180 else 0)),
        "category": data.get("scam_type") or "Needs manual review",
        "signals": matched[:4],
        "message": message,
    }


def format_clinic_time(date: str, time: str) -> str:
    try:
        appointment_utc = datetime.strptime(f"{date} {time}", "%Y-%m-%d %I:%M %p").replace(tzinfo=timezone.utc)
        clinic_time = appointment_utc.astimezone(ZoneInfo(CLINIC_TIMEZONE))
        return f"{clinic_time.strftime('%Y-%m-%d at %-I:%M %p')} ({CLINIC_TIMEZONE})"
    except Exception:
        return f"{date} at {time}"


def _payment_amount(value) -> Optional[str]:
    if value in (None, ""):
        return None
    try:
        return f"{float(value):,.2f}"
    except (TypeError, ValueError):
        return str(value)


def _paid_booking_from_metadata(meta: dict, payment: Optional[dict] = None, provider: str = "Payment"):
    payment = payment or {}
    name = meta["name"]
    email = meta["email"]
    package = meta["package"]
    date = meta["date"]
    time = meta["time"]
    client_time = meta.get("local_time")
    client_timezone = meta.get("timezone")
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
    return send_confirmation_email(
        name,
        email,
        package,
        date,
        format_clinic_time(date, time),
        meet_link,
        client_time=client_time,
        client_timezone=client_timezone,
        scam_type=scam_type,
        country=country,
        description=description,
        duration_minutes=duration_minutes,
        payment_reference=payment.get("reference"),
        payment_provider=provider,
        amount=_payment_amount(payment.get("amount")),
        currency=payment.get("currency"),
    )


@app.post("/register")
def register(data: RegistrationRequest, background_tasks: BackgroundTasks):
    booked_for_day = BOOKED_APPOINTMENTS.setdefault(data.date, set())
    if data.time in booked_for_day:
        raise HTTPException(
            status_code=409,
            detail="This appointment time has just been booked. Please choose another time.",
        )
    booked_for_day.add(data.time)
    clinic_time = format_clinic_time(data.date, data.time)
    background_tasks.add_task(
        send_received_email,
        data.name,
        data.email,
        data.scam_type,
        data.package,
        data.date,
        clinic_time,
        data.country,
        data.local_time,
        data.timezone,
        data.description,
    )
    background_tasks.add_task(
        send_admin_notification,
        ADMIN_EMAIL,
        data.name,
        data.email,
        data.scam_type,
        data.package,
        data.date,
        clinic_time,
        data.country,
        data.local_time,
        data.timezone,
        data.description,
    )
    return {"status": "ok"}


@app.post("/flutterwave-webhook")
async def flutterwave_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("verif-hash", "")

    if FLW_WEBHOOK_HASH and not hmac.compare_digest(signature, FLW_WEBHOOK_HASH):
        raise HTTPException(status_code=401, detail="Flutterwave signature mismatch.")

    try:
        payload = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    data = payload.get("data", {})
    status = data.get("status") or payload.get("status")
    event = payload.get("event")
    if status != "successful" and event not in {"charge.completed", "charge.success"}:
        return {"status": "ignored"}

    verified_data = data
    transaction_id = data.get("id") or data.get("transaction_id")
    if FLW_SECRET_KEY and transaction_id:
        response = requests.get(
            f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify",
            headers={"Authorization": f"Bearer {FLW_SECRET_KEY}"},
            timeout=20,
        )
        if not response.ok:
            raise HTTPException(status_code=502, detail="Flutterwave verification failed.")
        verification = response.json()
        if verification.get("status") != "success" or verification.get("data", {}).get("status") != "successful":
            raise HTTPException(status_code=400, detail="Flutterwave transaction is not successful.")
        verified_data = verification.get("data", data)

    meta = (
        data.get("metadata")
        or data.get("meta")
        or verified_data.get("metadata")
        or verified_data.get("meta")
        or {}
    )
    customer = data.get("customer") or verified_data.get("customer") or {}
    if customer.get("email"):
        meta.setdefault("email", customer.get("email"))
    if customer.get("name"):
        meta.setdefault("name", customer.get("name"))

    required = ["name", "email", "package", "date", "time"]
    missing = [field for field in required if not meta.get(field)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing booking metadata: {', '.join(missing)}.")

    email_status = _paid_booking_from_metadata(
        meta,
        {
            "reference": data.get("tx_ref") or verified_data.get("tx_ref") or data.get("flw_ref") or verified_data.get("flw_ref"),
            "amount": data.get("amount") or verified_data.get("amount"),
            "currency": data.get("currency") or verified_data.get("currency"),
        },
        provider="Flutterwave",
    )

    print(f"Flutterwave payment confirmed for {meta['name']} <{meta['email']}> - {meta['package']}")
    return {"status": "ok", **email_status}


if (DIST_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")


@app.get("/{full_path:path}")
def serve_frontend(full_path: str):
    requested_file = DIST_DIR / full_path
    index_file = DIST_DIR / "index.html"

    if requested_file.is_file():
        return FileResponse(requested_file)
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Scam Hospital API is running!"}
