import os
import hmac
import hashlib
import json
import requests
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from email_service import send_received_email, send_confirmation_email, send_admin_notification
from meet_service import create_meet_link

app = FastAPI()

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "scamehospital@gmail.com")
FLW_SECRET_KEY = os.getenv("FLWSECK_TEST", "")

ALLOWED_ORIGINS = [
    origin.strip() if "://" in origin else f"https://{origin.strip()}"
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,https://scamehospital-api-production-8102.up.railway.app"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):\d+",
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

@app.get("/")
def root():
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

@app.post("/register")
def register(data: RegistrationRequest, background_tasks: BackgroundTasks):
    booked_for_day = BOOKED_APPOINTMENTS.setdefault(data.date, set())
    if data.time in booked_for_day:
        raise HTTPException(
            status_code=409,
            detail="This appointment time has just been booked. Please choose another time.",
        )
    booked_for_day.add(data.time)
    background_tasks.add_task(send_received_email, data.name, data.email, data.scam_type)
    background_tasks.add_task(send_admin_notification, ADMIN_EMAIL, data.name, data.email, data.scam_type, data.package, data.date, data.time)
    return {"status": "ok"}

@app.post("/flutterwave-webhook")
async def flutterwave_webhook(request: Request):
    raw_body = await request.body()
    signature = request.headers.get("verif-hash", "")

    if signature and FLW_SECRET_KEY:
        if not hmac.compare_digest(signature, FLW_SECRET_KEY):
            print("Flutterwave signature mismatch - processing anyway for test mode")

    try:
        payload = json.loads(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    if payload.get("event") == "charge.success":
        data = payload.get("data", {})
        meta = data.get("metadata", {})

        name = meta.get("name", "Customer")
        email = meta.get("email", "")
        scam_type = meta.get("scam_type", "Unknown")
        package = meta.get("package", "Unknown")
        date = meta.get("date", "")
        time = meta.get("time", "")
        local_time = meta.get("local_time", time)
        timezone = meta.get("timezone", "")
        tx_ref = data.get("tx_ref", "")

        print(f"Payment received: {tx_ref} for {name} <{email}> - {package}")

        duration_minutes = PACKAGE_DURATIONS.get(package, 30)

        meet_link = create_meet_link(
            name, email, date, time,
            package=package,
            duration_minutes=duration_minutes,
        )

        send_confirmation_email(name, email, package, date, time, meet_link, local_time, timezone)
        send_admin_notification(ADMIN_EMAIL, name, email, scam_type, package, date, time)

        print(f"Emails sent. Meet: {meet_link}")

    return {"status": "ok"}
