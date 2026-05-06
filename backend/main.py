import os
from datetime import datetime, timezone
from typing import Optional
from zoneinfo import ZoneInfo

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from email_service import send_confirmation_email, send_received_email
from meet_service import create_meet_link


app = FastAPI()

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]
CLINIC_TIMEZONE = os.getenv("CLINIC_TIMEZONE", "Africa/Lagos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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


def format_clinic_time(date: str, time: str) -> str:
    appointment_utc = datetime.strptime(f"{date} {time}", "%Y-%m-%d %I:%M %p")
    appointment_utc = appointment_utc.replace(tzinfo=timezone.utc)
    appointment_local = appointment_utc.astimezone(ZoneInfo(CLINIC_TIMEZONE))
    return appointment_local.strftime("%Y-%m-%d at %I:%M %p").lstrip("0") + f" ({CLINIC_TIMEZONE})"


@app.post("/analyze")
def analyze(data: dict):
    message = data.get("message", "")

    return {
        "risk_score": 80,
        "category": "Phishing",
        "message": message,
    }


@app.post("/register")
def register(data: RegistrationRequest):
    send_received_email(data.name, data.email, data.scam_type)
    return {"status": "ok"}


@app.post("/initialize-payment")
def initialize_payment(data: dict):
    return {
        "payment_url": "https://paystack.com/pay/test-payment-link"
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
