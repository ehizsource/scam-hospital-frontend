import json
import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from zoneinfo import ZoneInfo


CALENDAR_ID = os.getenv("GOOGLE_CALENDAR_ID", "primary")
CLINIC_TIMEZONE = os.getenv("CLINIC_TIMEZONE", "Africa/Lagos")


def _appointment_start(date: str, time: str) -> datetime:
    appointment_utc = datetime.strptime(f"{date} {time}", "%Y-%m-%d %I:%M %p")
    return appointment_utc.replace(tzinfo=timezone.utc)


def _load_google_credentials():
    credentials_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    credentials_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if not credentials_json and not credentials_file:
        return None

    from google.oauth2 import service_account

    scopes = ["https://www.googleapis.com/auth/calendar"]
    if credentials_json:
        info = json.loads(credentials_json)
        return service_account.Credentials.from_service_account_info(info, scopes=scopes)

    return service_account.Credentials.from_service_account_file(credentials_file, scopes=scopes)


def create_meet_link(
    name: str,
    email: str,
    date: str,
    time: str,
    package: str = "Package",
    duration_minutes: int = 30,
    description: str | None = None,
) -> str:
    print(f"Creating meeting for {name} <{email}> on {date} at {time}")
    credentials = _load_google_credentials()

    if not credentials:
        print("Google Calendar credentials are not configured. Returning placeholder Meet link.")
        return "Google Meet will be created after Calendar credentials are configured."

    from googleapiclient.discovery import build

    start_utc = _appointment_start(date, time)
    end_utc = start_utc + timedelta(minutes=duration_minutes)
    local_start = start_utc.astimezone(ZoneInfo(CLINIC_TIMEZONE))

    event = {
        "summary": f"ScameHospital {package} session - {name}",
        "description": description or f"{package} consultation for {name} <{email}>.",
        "start": {"dateTime": start_utc.isoformat(), "timeZone": "UTC"},
        "end": {"dateTime": end_utc.isoformat(), "timeZone": "UTC"},
        "attendees": [{"email": email}],
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 30},
                {"method": "popup", "minutes": 30},
            ],
        },
        "conferenceData": {
            "createRequest": {
                "requestId": f"scamehospital-{uuid4()}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    service = build("calendar", "v3", credentials=credentials, cache_discovery=False)
    created = (
        service.events()
        .insert(
            calendarId=CALENDAR_ID,
            body=event,
            conferenceDataVersion=1,
            sendUpdates="all",
        )
        .execute()
    )

    meet_link = created.get("hangoutLink")
    if not meet_link:
        entry_points = created.get("conferenceData", {}).get("entryPoints", [])
        meet_link = next((entry.get("uri") for entry in entry_points if entry.get("entryPointType") == "video"), "")

    print(f"Created Google Meet for {local_start.isoformat()} ({CLINIC_TIMEZONE}): {meet_link}")
    return meet_link or "Google Meet link was not returned by Google Calendar."
