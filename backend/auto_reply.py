import imaplib
import os
import smtplib
import time
from getpass import getpass
from email.header import decode_header, make_header
from email.message import EmailMessage
from email.parser import BytesParser
from email.policy import default
from email.utils import getaddresses, make_msgid, parseaddr


WRAPPING_QUOTES = "'\"‘’“”"


def clean_setting(value):
    return value.strip().strip(WRAPPING_QUOTES)


IMAP_HOST = clean_setting(os.getenv("AUTO_REPLY_IMAP_HOST", ""))
IMAP_PORT = int(os.getenv("AUTO_REPLY_IMAP_PORT", "993"))
SMTP_HOST = clean_setting(os.getenv("AUTO_REPLY_SMTP_HOST", ""))
SMTP_PORT = int(os.getenv("AUTO_REPLY_SMTP_PORT", "587"))
MAILBOX = clean_setting(os.getenv("AUTO_REPLY_MAILBOX", "INBOX"))
EMAIL_ADDRESS = clean_setting(os.getenv("AUTO_REPLY_EMAIL", ""))
EMAIL_PASSWORD = clean_setting(os.getenv("AUTO_REPLY_PASSWORD", ""))
CHECK_INTERVAL_SECONDS = int(os.getenv("AUTO_REPLY_CHECK_INTERVAL_SECONDS", "60"))
SUBJECT_PREFIX = os.getenv("AUTO_REPLY_SUBJECT_PREFIX", "We received your message")
FROM_NAME = clean_setting(os.getenv("AUTO_REPLY_FROM_NAME", "ScameHospital Support"))

DEFAULT_REPLY_BODY = """Hello,

Thank you for contacting ScameHospital. We have received your message and our support team will review it as soon as possible.

If this is urgent, please do not send passwords, banking codes, card numbers, private documents, or any sensitive medical details by email. Save screenshots and evidence safely while you wait for support.

Regards,
ScameHospital Support
"""

REPLY_BODY = os.getenv("AUTO_REPLY_BODY", DEFAULT_REPLY_BODY)
AUTO_SUBMITTED_HEADERS = {"auto-replied", "auto-generated"}


def require_settings():
    global EMAIL_PASSWORD

    if not EMAIL_PASSWORD:
        EMAIL_PASSWORD = clean_setting(getpass("AUTO_REPLY_PASSWORD: "))

    try:
        EMAIL_PASSWORD.encode("ascii")
    except UnicodeEncodeError as exc:
        raise RuntimeError(
            "AUTO_REPLY_PASSWORD contains a non-standard character. "
            "Type the Gmail app password manually using normal letters/numbers, without curly quotes."
        ) from exc

    missing = [
        name
        for name, value in {
            "AUTO_REPLY_IMAP_HOST": IMAP_HOST,
            "AUTO_REPLY_SMTP_HOST": SMTP_HOST,
            "AUTO_REPLY_EMAIL": EMAIL_ADDRESS,
            "AUTO_REPLY_PASSWORD": EMAIL_PASSWORD,
        }.items()
        if not value
    ]

    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")


def decode_subject(raw_subject):
    if not raw_subject:
        return ""

    return str(make_header(decode_header(raw_subject)))


def is_auto_message(message):
    auto_submitted = message.get("Auto-Submitted", "").lower()
    precedence = message.get("Precedence", "").lower()
    submitted_by_auto = auto_submitted in AUTO_SUBMITTED_HEADERS
    bulk_message = precedence in {"bulk", "junk", "list"}
    mailing_list = bool(message.get("List-Id") or message.get("List-Unsubscribe"))

    return submitted_by_auto or bulk_message or mailing_list


def get_reply_recipient(message):
    reply_to = message.get("Reply-To")
    from_header = message.get("From", "")
    candidates = getaddresses([reply_to or from_header])
    _, sender_email = candidates[0] if candidates else ("", "")

    if sender_email.lower() == EMAIL_ADDRESS.lower():
        return ""

    return sender_email


def build_reply(message, recipient):
    original_subject = decode_subject(message.get("Subject"))
    subject = SUBJECT_PREFIX

    if original_subject:
        subject = f"{SUBJECT_PREFIX}: {original_subject}"

    reply = EmailMessage()
    reply["From"] = f"{FROM_NAME} <{EMAIL_ADDRESS}>"
    reply["To"] = recipient
    reply["Subject"] = subject
    reply["Auto-Submitted"] = "auto-replied"
    reply["X-Auto-Response-Suppress"] = "All"

    message_id = message.get("Message-ID")
    if message_id:
        reply["In-Reply-To"] = message_id
        reply["References"] = message_id

    reply["Message-ID"] = make_msgid()
    reply.set_content(REPLY_BODY)
    return reply


def send_reply(reply):
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(reply)


def process_unread_messages():
    handled = 0

    with imaplib.IMAP4_SSL(IMAP_HOST, IMAP_PORT) as imap:
        imap.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        imap.select(MAILBOX)

        status, data = imap.search(None, "UNSEEN")
        if status != "OK":
            raise RuntimeError("Could not search mailbox for unread messages.")

        for message_id in data[0].split():
            status, payload = imap.fetch(message_id, "(RFC822)")
            if status != "OK" or not payload or not payload[0]:
                continue

            message = BytesParser(policy=default).parsebytes(payload[0][1])
            recipient = get_reply_recipient(message)

            if recipient and not is_auto_message(message):
                send_reply(build_reply(message, recipient))
                handled += 1

            imap.store(message_id, "+FLAGS", "\\Seen")

        imap.close()
        imap.logout()

    return handled


def main():
    require_settings()
    print(f"Auto-reply watcher started for {EMAIL_ADDRESS}. Checking {MAILBOX} every {CHECK_INTERVAL_SECONDS}s.")

    while True:
        try:
            handled = process_unread_messages()
            if handled:
                print(f"Sent {handled} auto-reply email(s).")
        except Exception as exc:
            print(f"Auto-reply check failed: {exc}")

        time.sleep(CHECK_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
