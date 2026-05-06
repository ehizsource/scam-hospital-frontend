from typing import Optional


def send_received_email(name: str, email: str, scam_type: str):
    print(f"Received registration from {name} <{email}> for {scam_type}")


def send_confirmation_email(
    name: str,
    email: str,
    package: str,
    date: str,
    time: str,
    meet_link: str,
    client_time: Optional[str] = None,
    client_timezone: Optional[str] = None,
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
