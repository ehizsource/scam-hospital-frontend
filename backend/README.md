# ScameHospital Backend

FastAPI service for scam case review, booking registration, payment initialization, and Paystack webhook handling.

## Local development

From the `backend` folder:

```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

From the project root:

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```

## Render

Use the root `render.yaml` blueprint, or create a Python Web Service manually:

- Build command: `pip install -r backend/requirements.txt`
- Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

Set `ALLOWED_ORIGINS` to your frontend URL after the frontend is deployed if you want to lock CORS to one exact site. The included Render blueprint also allows `https://*.onrender.com` through `ALLOWED_ORIGIN_REGEX`.

## Booking emails and Google Meet

Free review submission sends an admin email to `scamehospital@gmail.com` by default and sends the user an automatic confirmation. Paid package confirmation happens from the Paystack webhook after a successful charge; it creates the Google Meet session, sends confirmation emails, and sets a 30-minute reminder on the calendar event.

Set these environment variables on the backend:

```bash
ADMIN_EMAIL=scamehospital@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=scamehospital@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SENDER_EMAIL=scamehospital@gmail.com
SENDER_NAME=ScameHospital
GOOGLE_CALENDAR_ID=primary
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
CLINIC_TIMEZONE=Africa/Lagos
PAYSTACK_SECRET_KEY=sk_live_or_test_key
PAYSTACK_CALLBACK_URL=https://your-frontend-success-page.example
```

You can use `GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json` instead of `GOOGLE_SERVICE_ACCOUNT_JSON`. Share the target Google Calendar with the service account email, or use a Google Workspace setup that allows the service account to write to the admin calendar. Without SMTP or Calendar credentials, the backend logs the intended email/meeting action so local development still works.

Configure your Paystack webhook URL to point to:

```text
https://your-backend-domain/paystack-webhook
```

## Email auto-reply watcher

The backend includes a standalone mailbox watcher that replies once to unread patient/client emails:

```bash
python backend/auto_reply.py
```

Set these environment variables before running it:

```bash
AUTO_REPLY_IMAP_HOST=imap.gmail.com
AUTO_REPLY_SMTP_HOST=smtp.gmail.com
AUTO_REPLY_EMAIL=contact@scamehospital.com
AUTO_REPLY_PASSWORD=your-app-password
AUTO_REPLY_FROM_NAME="ScameHospital Support"
AUTO_REPLY_CHECK_INTERVAL_SECONDS=60
```

Optional settings:

```bash
AUTO_REPLY_IMAP_PORT=993
AUTO_REPLY_SMTP_PORT=587
AUTO_REPLY_MAILBOX=INBOX
AUTO_REPLY_SUBJECT_PREFIX="We received your message"
AUTO_REPLY_BODY="Your approved auto-reply text"
```

Use an app password or provider-specific SMTP/IMAP credential. Do not use your normal mailbox password.
