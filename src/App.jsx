import { useEffect, useState } from "react"
import "./App.css"

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bangladesh", "Belgium", "Brazil", "Canada", "Chile", "China", "Colombia",
  "Croatia", "Czech Republic", "Denmark", "Egypt", "Ethiopia", "Finland",
  "France", "Germany", "Ghana", "Greece", "Hungary", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kenya", "Kuwait", "Lebanon", "Libya", "Malaysia", "Mexico", "Morocco",
  "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Philippines",
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia",
  "Senegal", "Singapore", "South Africa", "South Korea", "Spain", "Sudan",
  "Sweden", "Switzerland", "Tanzania", "Thailand", "Tunisia", "Turkey",
  "UAE", "Uganda", "Ukraine", "United Kingdom", "United States", "Venezuela",
  "Vietnam", "Zimbabwe"
]

const SCAM_TYPES = [
  "Romance Scam",
  "Crypto Fraud",
  "Phishing",
  "Fake Job Offer",
  "Business Email Compromise",
  "Investment Scam",
  "Lottery Scam",
  "Impersonation Scam",
  "Other"
]

const CURRENCY_RATES = {
  USD: { symbol: "$", rate: 1, label: "US Dollar (USD)" },
  GBP: { symbol: "£", rate: 0.79, label: "British Pound (GBP)" },
  EUR: { symbol: "€", rate: 0.92, label: "Euro (EUR)" },
  AUD: { symbol: "$", rate: 1.53, label: "Australian Dollar (AUD)" },
  CAD: { symbol: "$", rate: 1.36, label: "Canadian Dollar (CAD)" }
}

const DEFAULT_CURRENCY = "USD"

const COUNTRY_CURRENCY = {
  Australia: "AUD",
  Austria: "EUR",
  Belgium: "EUR",
  Canada: "CAD",
  Croatia: "EUR",
  "Czech Republic": "EUR",
  Denmark: "EUR",
  Finland: "EUR",
  France: "EUR",
  Germany: "EUR",
  Greece: "EUR",
  Ireland: "EUR",
  Italy: "EUR",
  Netherlands: "EUR",
  Portugal: "EUR",
  Spain: "EUR",
  "United Kingdom": "GBP",
  "United States": "USD"
}

const COUNTRY_TIMEZONE = {
  Afghanistan: "Asia/Kabul",
  Albania: "Europe/Tirane",
  Algeria: "Africa/Algiers",
  Argentina: "America/Argentina/Buenos_Aires",
  Australia: "Australia/Sydney",
  Austria: "Europe/Vienna",
  Bangladesh: "Asia/Dhaka",
  Belgium: "Europe/Brussels",
  Brazil: "America/Sao_Paulo",
  Canada: "America/Toronto",
  Chile: "America/Santiago",
  China: "Asia/Shanghai",
  Colombia: "America/Bogota",
  Croatia: "Europe/Zagreb",
  "Czech Republic": "Europe/Prague",
  Denmark: "Europe/Copenhagen",
  Egypt: "Africa/Cairo",
  Ethiopia: "Africa/Addis_Ababa",
  Finland: "Europe/Helsinki",
  France: "Europe/Paris",
  Germany: "Europe/Berlin",
  Ghana: "Africa/Accra",
  Greece: "Europe/Athens",
  Hungary: "Europe/Budapest",
  India: "Asia/Kolkata",
  Indonesia: "Asia/Jakarta",
  Iran: "Asia/Tehran",
  Iraq: "Asia/Baghdad",
  Ireland: "Europe/Dublin",
  Israel: "Asia/Jerusalem",
  Italy: "Europe/Rome",
  Jamaica: "America/Jamaica",
  Japan: "Asia/Tokyo",
  Jordan: "Asia/Amman",
  Kenya: "Africa/Nairobi",
  Kuwait: "Asia/Kuwait",
  Lebanon: "Asia/Beirut",
  Libya: "Africa/Tripoli",
  Malaysia: "Asia/Kuala_Lumpur",
  Mexico: "America/Mexico_City",
  Morocco: "Africa/Casablanca",
  Netherlands: "Europe/Amsterdam",
  "New Zealand": "Pacific/Auckland",
  Nigeria: "Africa/Lagos",
  Norway: "Europe/Oslo",
  Pakistan: "Asia/Karachi",
  Philippines: "Asia/Manila",
  Poland: "Europe/Warsaw",
  Portugal: "Europe/Lisbon",
  Qatar: "Asia/Qatar",
  Romania: "Europe/Bucharest",
  Russia: "Europe/Moscow",
  "Saudi Arabia": "Asia/Riyadh",
  Senegal: "Africa/Dakar",
  Singapore: "Asia/Singapore",
  "South Africa": "Africa/Johannesburg",
  "South Korea": "Asia/Seoul",
  Spain: "Europe/Madrid",
  Sudan: "Africa/Khartoum",
  Sweden: "Europe/Stockholm",
  Switzerland: "Europe/Zurich",
  Tanzania: "Africa/Dar_es_Salaam",
  Thailand: "Asia/Bangkok",
  Tunisia: "Africa/Tunis",
  Turkey: "Europe/Istanbul",
  UAE: "Asia/Dubai",
  Uganda: "Africa/Kampala",
  Ukraine: "Europe/Kyiv",
  "United Kingdom": "Europe/London",
  "United States": "America/New_York",
  Venezuela: "America/Caracas",
  Vietnam: "Asia/Ho_Chi_Minh",
  Zimbabwe: "Africa/Harare"
}

const BASE_TIME_ZONE = "Etc/UTC"

const INITIAL_BOOKED_SLOTS = {
  "2026-05-10": ["9:00 AM", "2:00 PM"],
  "2026-05-12": ["11:00 AM", "3:00 PM", "5:00 PM"]
}

const BOOKED_SLOT_STORAGE_KEY = "scamehospital-booked-slots"

const PACKAGES = [
  {
    name: "Free",
    tagline: "A gentle first check",
    priceUSD: 0,
    icon: "Free",
    border: "#e0e0e0",
    dark: false,
    popular: false,
    features: ["Submit scam message", "Basic case review", "Scam category match"]
  },
  {
    name: "Basic",
    tagline: "Clear answers in writing",
    priceUSD: 53,
    icon: "Basic",
    border: "#90caf9",
    dark: false,
    popular: false,
    features: ["Detailed case report", "Risk score assessment", "Safety action plan", "Written report"]
  },
  {
    name: "Standard",
    tagline: "Support with a live session",
    priceUSD: 107,
    icon: "Standard",
    border: "#00d4ff",
    dark: true,
    popular: true,
    features: ["Everything in Basic", "45min Google Meet session", "Trauma informed counseling", "Emotional recovery guide"]
  },
  {
    name: "Premium",
    tagline: "Priority help and investigation",
    priceUSD: 214,
    icon: "Premium",
    border: "#ffb74d",
    dark: false,
    popular: false,
    features: ["Everything in Standard", "Full scam investigation", "Official proof document", "Priority 24hr support", "Follow up session"]
  }
]

const PACKAGE_DUTIES = {
  Basic: {
    title: "Basic package duties",
    afterPayment: "Payment confirmed. The Basic written review is now queued for delivery.",
    timeline: "Written report prepared within 24 hours",
    duties: [
      "Review the case summary and classify the scam pattern.",
      "Prepare a written risk score assessment.",
      "Send a practical safety action plan for what to stop, save, and verify.",
      "Deliver the written report to the email used for booking."
    ]
  },
  Standard: {
    title: "Standard package duties",
    afterPayment: "Payment confirmed. Your written review and live support session are now queued.",
    timeline: "Written report plus 45-minute session at the booked time",
    duties: [
      "Complete everything included in Basic.",
      "Reserve the selected 45-minute Google Meet support session.",
      "Prepare trauma-informed counselling guidance for the session.",
      "Send the emotional recovery guide and appointment details by email."
    ]
  },
  Premium: {
    title: "Premium package duties",
    afterPayment: "Payment confirmed. Your priority investigation package is now queued.",
    timeline: "Priority handling within 24 hours plus follow-up support",
    duties: [
      "Complete everything included in Standard.",
      "Begin the full scam investigation and evidence review.",
      "Prepare an official proof document from the submitted case details.",
      "Provide priority 24-hour support and schedule the follow-up session."
    ]
  }
}

const TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM"
]

function getDateTimeFromSlot(date, time) {
  const [, month, day] = date.split("-").map(Number)
  const year = Number(date.slice(0, 4))
  const [clock, modifier] = time.split(" ")
  let [hours, minutes] = clock.split(":").map(Number)

  if (modifier === "PM" && hours !== 12) hours += 12
  if (modifier === "AM" && hours === 12) hours = 0

  return new Date(Date.UTC(year, month - 1, day, hours, minutes))
}

function formatSlotForCountry(date, time, timeZone) {
  if (!date) return time

  const formatter = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
    timeZoneName: "short"
  })

  const formatted = formatter.format(getDateTimeFromSlot(date, time))

  return timeZone === BASE_TIME_ZONE ? formatted.replace("UTC", "GMT") : formatted
}

const SUPPORT_EMAIL = "contact@scamehospital.com"
const backendEnvUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001"
const BACKEND_URL = /^https?:\/\//i.test(backendEnvUrl)
  ? backendEnvUrl
  : `https://${backendEnvUrl}`

function buildMailtoLink(to, subject, lines = []) {
  const body = lines.filter(Boolean).join("\n")
  const params = new URLSearchParams({ subject, body })

  return `mailto:${to}?${params.toString()}`
}

function createLocalPaymentReference(packageName) {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14)
  return `SH-${packageName.toUpperCase()}-${stamp}`.replace(/\s+/g, "-")
}

function mergeBookedSlots(...slotGroups) {
  const merged = {}

  slotGroups.forEach((group) => {
    Object.entries(group || {}).forEach(([date, times]) => {
      merged[date] = Array.from(new Set([...(merged[date] || []), ...times]))
    })
  })

  return merged
}

function getStoredBookedSlots() {
  try {
    return JSON.parse(window.localStorage.getItem(BOOKED_SLOT_STORAGE_KEY) || "{}")
  } catch {
    return {}
  }
}

function detectScamType(description) {
  const text = description.toLowerCase()

  if (text.includes("love") || text.includes("relationship") || text.includes("boyfriend") || text.includes("girlfriend") || text.includes("dating") || text.includes("romance")) return "Romance Scam"
  if (text.includes("crypto") || text.includes("bitcoin") || text.includes("ethereum") || text.includes("blockchain") || text.includes("wallet")) return "Crypto Fraud"
  if (text.includes("job") || text.includes("work from home") || text.includes("employment") || text.includes("salary") || text.includes("hiring")) return "Fake Job Offer"
  if (text.includes("invest") || text.includes("profit") || text.includes("return") || text.includes("trading") || text.includes("forex")) return "Investment Scam"
  if (text.includes("bank") || text.includes("account") || text.includes("password") || text.includes("login") || text.includes("click") || text.includes("link")) return "Phishing"
  if (text.includes("ceo") || text.includes("boss") || text.includes("company") || text.includes("transfer") || text.includes("invoice") || text.includes("business")) return "Business Email Compromise"
  if (text.includes("won") || text.includes("winner") || text.includes("lottery") || text.includes("prize") || text.includes("congratulations")) return "Lottery Scam"
  if (text.includes("police") || text.includes("government") || text.includes("irs") || text.includes("efcc") || text.includes("impersonat")) return "Impersonation Scam"

  return ""
}

const RISK_SIGNALS = [
  {
    label: "Urgency or pressure",
    points: 16,
    words: ["urgent", "immediately", "right now", "today", "limited time", "deadline", "act fast", "pressure", "quickly"],
    detail: "The message appears to push for fast action before there is time to verify."
  },
  {
    label: "Payment request",
    points: 20,
    words: ["pay", "payment", "fee", "gift card", "apple card", "steam card", "wire", "western union", "moneygram", "transfer", "deposit", "tax", "clearance"],
    detail: "There are signs of a money request, fee, transfer, or hard-to-reverse payment method."
  },
  {
    label: "Crypto or investment hook",
    points: 18,
    words: ["crypto", "bitcoin", "wallet", "blockchain", "forex", "trading", "profit", "return", "investment", "withdraw", "platform"],
    detail: "The story includes investment language or crypto movement, which is common in pig-butchering and fake platform scams."
  },
  {
    label: "Identity or account access",
    points: 18,
    words: ["password", "login", "otp", "verification code", "bank account", "account number", "ssn", "social security", "pin", "seed phrase"],
    detail: "The other party may be trying to collect credentials, codes, or sensitive identity information."
  },
  {
    label: "Off-platform contact",
    points: 12,
    words: ["whatsapp", "telegram", "signal", "hangouts", "google chat", "private chat", "move to", "off platform"],
    detail: "Moving away from the original platform can reduce moderation, reporting, and traceability."
  },
  {
    label: "Romance trust-building",
    points: 14,
    words: ["love", "relationship", "marry", "soulmate", "military", "widow", "widower", "dating", "fiance", "fiancee"],
    detail: "The situation has relationship-building language often used before a financial request."
  },
  {
    label: "Link or attachment",
    points: 12,
    words: ["http://", "https://", "link", "click", "attachment", "download", "form", "portal"],
    detail: "Links and files can be used for phishing, fake portals, or malware delivery."
  },
  {
    label: "Authority impersonation",
    points: 15,
    words: ["police", "government", "irs", "efcc", "fbi", "court", "customs", "bank officer", "support agent"],
    detail: "Authority language can be used to scare victims into compliance."
  },
  {
    label: "Prize or unexpected money",
    points: 15,
    words: ["won", "winner", "lottery", "prize", "grant", "inheritance", "donation", "beneficiary"],
    detail: "Unexpected winnings or funds often lead to advance-fee requests."
  }
]

function buildRiskAnalysis(description, scamType) {
  const text = description.toLowerCase()
  const matchedSignals = RISK_SIGNALS.filter((signal) =>
    signal.words.some((word) => text.includes(word))
  )
  const baseScore = description.trim().length > 140 ? 18 : description.trim().length > 40 ? 10 : 4
  const typeBoost = scamType && scamType !== "Other" ? 8 : 0
  const score = Math.min(98, baseScore + typeBoost + matchedSignals.reduce((sum, signal) => sum + signal.points, 0))
  const level = score >= 75 ? "High" : score >= 45 ? "Elevated" : score >= 25 ? "Moderate" : "Low"
  const confidence = Math.min(96, 48 + matchedSignals.length * 8 + (description.length > 180 ? 10 : 0))
  const topSignals = matchedSignals.slice(0, 4)

  return {
    score,
    level,
    confidence,
    category: scamType || detectScamType(description) || "Needs manual review",
    summary: topSignals.length
      ? `${topSignals.map((signal) => signal.label.toLowerCase()).join(", ")} found in the case summary.`
      : "No strong scam markers were detected from the summary alone.",
    signals: topSignals.length ? topSignals : [
      {
        label: "Limited evidence",
        detail: "The summary is short or does not include enough specific claims, payment details, links, or contact behavior."
      }
    ],
    actions: score >= 75
      ? ["Do not send money or codes.", "Pause contact and save screenshots.", "Verify identity through a separate trusted channel."]
      : score >= 45
        ? ["Ask for time to verify.", "Check links and payment requests carefully.", "Avoid sharing private documents or account access."]
        : ["Keep records of the conversation.", "Verify unusual claims before taking action.", "Escalate if money, login codes, or pressure appear."]
  }
}

export default function App({ onBack = () => {} }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(null)
  const [hoveredPkg, setHoveredPkg] = useState(null)
  const [currency, setCurrency] = useState("USD")
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryList, setShowCountryList] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [freeBookingSubmitted, setFreeBookingSubmitted] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [paymentPending, setPaymentPending] = useState(false)
  const [paymentReference, setPaymentReference] = useState("")
  const [autoDetectedScamType, setAutoDetectedScamType] = useState("")
  const [bookedSlots, setBookedSlots] = useState(() =>
    mergeBookedSlots(INITIAL_BOOKED_SLOTS, getStoredBookedSlots())
  )
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    date: "",
    time: "",
    scamType: "",
    description: ""
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  useEffect(() => {
    let isCurrent = true

    fetch(`${BACKEND_URL}/booked-slots`)
      .then((response) => response.ok ? response.json() : null)
      .then((serverBookedSlots) => {
        if (!isCurrent || !serverBookedSlots) return

        setBookedSlots((current) => mergeBookedSlots(INITIAL_BOOKED_SLOTS, current, serverBookedSlots))
      })
      .catch(() => {})

    return () => {
      isCurrent = false
    }
  }, [])

  const filteredCountries = COUNTRIES.filter((country) =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const getPrice = (priceUSD = 0) => {
    const curr = CURRENCY_RATES[currency]
    return curr.symbol + (priceUSD * curr.rate).toFixed(2)
  }

  const selectedTimeZone = COUNTRY_TIMEZONE[form.country] || BASE_TIME_ZONE
  const timezoneLabel = form.country ? selectedTimeZone.replaceAll("_", " ") : "GMT"
  const selectedLocalTime = form.date && form.time
    ? formatSlotForCountry(form.date, form.time, selectedTimeZone)
    : ""
  const selectedDateLabel = form.date
    ? new Date(`${form.date}T00:00:00`).toLocaleDateString("en", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    })
    : "Choose a date"
  const riskAnalysis = buildRiskAnalysis(form.description, form.scamType)
  const isFreePackage = selected?.priceUSD === 0
  const packageDuties = selected ? PACKAGE_DUTIES[selected.name] : null
  const paidSupportHref = buildMailtoLink(
    SUPPORT_EMAIL,
    `Paid support request - ${selected?.name || "Package"} package`,
    [
      "Hello ScameHospital Support,",
      "",
      "I am a paid user and I need help with my case.",
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Package: ${selected?.name || ""}`,
      paymentReference ? `Service reference: ${paymentReference}` : "",
      `Appointment: ${form.date} at ${selectedLocalTime || form.time}`,
      `Scam type: ${form.scamType}`,
      "",
      "My message:",
      ""
    ]
  )

  const updateCountry = (country) => {
    setForm((prev) => ({ ...prev, country, time: "" }))
    setCurrency(COUNTRY_CURRENCY[country] || DEFAULT_CURRENCY)
    setCountrySearch("")
    setShowCountryList(false)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((prev) => {
      const updated = { ...prev, [name]: value }

      if (name === "description" && value.length > 20) {
        const detected = detectScamType(value)
        if (detected) {
          updated.scamType = detected
          setAutoDetectedScamType(detected)
        }
      }

      if (name === "description" && value.length <= 20) {
        setAutoDetectedScamType("")
      }

      if (name === "scamType") {
        setAutoDetectedScamType("")
      }

      return updated
    })
  }

  const isTimeBooked = (date, time) => {
    return bookedSlots[date] && bookedSlots[date].includes(time)
  }

  const reserveSlotLocally = (date, time) => {
    setBookedSlots((current) => {
      const next = mergeBookedSlots(current, { [date]: [time] })
      window.localStorage.setItem(BOOKED_SLOT_STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day)
      const isPast = new Date(year, month, day) < today
      const isSelected = form.date === dateStr
      const fullyBooked = (bookedSlots[dateStr] || []).length >= TIMES.length
      const isDisabled = isPast || fullyBooked

      days.push(
        <button
          type="button"
          key={dateStr}
          className={`calendar-day ${isSelected ? "selected" : ""} ${fullyBooked ? "booked" : ""}`}
          disabled={isDisabled}
          onClick={() => setForm((prev) => ({ ...prev, date: dateStr, time: "" }))}
          title={fullyBooked ? "Fully booked" : isPast ? "Past date" : ""}
        >
          {day}
        </button>
      )
    }

    return days
  }

  const handleProceedToPayment = async () => {
    if (!selected) {
      alert("Please select a package.")
      return
    }

    const requiredFields = [
      ["Full name", form.name],
      ["Email address", form.email],
      ["Country", form.country],
      ["Scam type", form.scamType],
      ["Case summary", form.description],
      ["Appointment date", form.date],
      ["Appointment time", form.time]
    ]
    const missingFields = requiredFields
      .filter(([, value]) => !String(value || "").trim())
      .map(([label]) => label)

    if (missingFields.length > 0) {
      alert(`Please complete: ${missingFields.join(", ")}.`)
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          scam_type: form.scamType,
          package: selected.name,
          date: form.date,
          time: form.time,
          local_time: selectedLocalTime,
          timezone: selectedTimeZone,
          country: form.country
        })
      })

      if (response.status === 409) {
        alert("That appointment time has just been booked. Please choose another time.")
        setForm((prev) => ({ ...prev, time: "" }))
        return
      }

      if (!response.ok) throw new Error("Registration failed")

      reserveSlotLocally(form.date, form.time)
      setStep(3)
    } catch (error) {
      console.warn("Booking registration could not reach the backend yet.", error)
      reserveSlotLocally(form.date, form.time)
      setStep(3)
    }
  }

  const handlePay = async () => {
    if (!selected) return
    if (isFreePackage) {
      setFreeBookingSubmitted(true)
      return
    }

    setLoading(true)
    setPaymentPending(false)

    try {
      const response = await fetch(`${BACKEND_URL}/initialize-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          amount: selected.priceUSD,
          name: form.name,
          package: selected.name,
          date: form.date,
          time: form.time,
          local_time: selectedLocalTime,
          timezone: selectedTimeZone,
          scam_type: form.scamType,
          description: form.description,
          country: form.country,
          currency
        })
      })

      if (!response.ok) throw new Error("Payment initialization failed")

      const data = await response.json()

      if (data.reference) {
        setPaymentReference(data.reference)
      }

      if (data.payment_url && !data.payment_url.includes("test-payment-link")) {
        setPaymentPending(true)
        window.location.href = data.payment_url
      } else if (data.payment_url || data.status === "payment_ready") {
        setPaymentPending(true)
        alert("Your payment link is ready. Payment is not marked as received until Paystack confirms a successful charge.")
      } else {
        alert("We could not create the payment link. Please try again.")
      }
    } catch (error) {
      console.warn("Payment service could not be reached.", error)
      setPaymentReference(createLocalPaymentReference(selected.name))
      setPaymentPending(true)
      alert("Payment could not be confirmed yet. Please try again or contact support with the reference shown.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`app-shell app-step-${step}`}>
      <nav className="nav">
        <div className="brand-wrap">
          <span className="brand-mark">SH</span>
          <span className="brand">
            Scame<span>Hospital</span>
          </span>
        </div>
        <div className="nav-actions">
          <a className="support-link" href={`mailto:${SUPPORT_EMAIL}`}>
            Email Support
          </a>
          <button type="button" className="nav-button" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </nav>

      <div className="progress">
        {["Choose Package", "Your Details", isFreePackage ? "Review" : "Payment"].map((label, index) => (
          <div key={label} className="progress-item">
            <div className={`progress-number ${step >= index + 1 ? "active" : ""}`}>
              {step > index + 1 ? "OK" : index + 1}
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <main className={`content content-step-${step}`}>
        {step === 1 && (
          <section>
            <div className="booking-hero">
              <div>
                <span className="eyebrow">Secure portal</span>
                <h1>Consultation Booking</h1>
              </div>
              <div className="hero-metrics" aria-label="Booking highlights">
                <div>
                  <strong>100%</strong>
                  <span>Confidential</span>
                </div>
                <div>
                  <strong>24h</strong>
                  <span>Priority option</span>
                </div>
                <div>
                  <strong>GMT</strong>
                  <span>Base schedule</span>
                </div>
              </div>
            </div>

            <div className="currency-panel">
              <p>Select your currency</p>
              <div className="button-row">
                {Object.entries(CURRENCY_RATES).map(([code, info]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setCurrency(code)}
                    className={`pill-button ${currency === code ? "active" : ""}`}
                  >
                    {info.symbol} {code}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-heading">
              <span>Consultation packages</span>
              <h2>Select a package</h2>
            </div>

            <div className="package-grid">
              {PACKAGES.map((pkg, index) => (
                <button
                  type="button"
                  key={pkg.name}
                  onClick={() => {
                    setSelected(pkg)
                    setFreeBookingSubmitted(false)
                    setPaymentConfirmed(false)
                    setPaymentPending(false)
                    setPaymentReference("")
                  }}
                  onMouseEnter={() => setHoveredPkg(index)}
                  onMouseLeave={() => setHoveredPkg(null)}
                  className={`package-card ${pkg.dark ? "dark" : ""} ${selected?.name === pkg.name ? "selected" : ""}`}
                  style={{ borderColor: selected?.name === pkg.name || hoveredPkg === index ? pkg.border : "#eee" }}
                >
                  {pkg.popular && <strong className="popular">MOST POPULAR</strong>}
                  <span className="package-kicker">{pkg.icon}</span>
                  <h3>{pkg.name}</h3>
                  <p className="package-tagline">{pkg.tagline}</p>
                  <div className="price">{getPrice(pkg.priceUSD)}</div>
                  {pkg.features.map((feature) => (
                    <p className="feature-line" key={feature}>
                      <span>✓</span>
                      {feature}
                    </p>
                  ))}
                </button>
              ))}
            </div>

            <div className="center-block">
              <button
                type="button"
                onClick={() => selected && setStep(2)}
                disabled={!selected}
                className="primary-button"
              >
                Continue with {selected ? selected.name : "a Package"}
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="panel booking-details-panel">
            <div className="panel-header">
              <span className="eyebrow">Client intake</span>
              <h1>Appointment details</h1>
              <p>Complete the intake form and choose an available appointment slot.</p>
            </div>

            <div className="booking-detail-grid">
              <div className="intake-surface">
                <div className="form-grid">
                  <label>
                    <span className="field-title">Full Name</span>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                  </label>
                  <label>
                    <span className="field-title">Email Address</span>
                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                  </label>

                  <div className="country-field">
                    <span className="field-title">Country</span>
                    <input
                      value={countrySearch || form.country}
                      onChange={(event) => {
                        setCountrySearch(event.target.value)
                        setShowCountryList(true)
                        setForm((prev) => ({ ...prev, country: "" }))
                      }}
                      onFocus={() => setShowCountryList(true)}
                      placeholder="Search your country"
                    />

                    {showCountryList && (
                      <div className="country-list">
                        {filteredCountries.map((country) => (
                          <button
                            type="button"
                            key={country}
                            onClick={() => updateCountry(country)}
                          >
                            {country}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="field-label">
                      <span>Type of Scam</span>
                      {autoDetectedScamType && (
                        <span className="detect-badge">Suggested category: {autoDetectedScamType}</span>
                      )}
                    </div>
                    <select name="scamType" value={form.scamType} onChange={handleChange}>
                      <option value="">Select scam type</option>
                      {SCAM_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <label className="field-label" htmlFor="description">
                  <span>Case Summary</span>
                  <span className="field-hint">Category match enabled</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Briefly describe what happened"
                  rows={4}
                />
              </div>

              <div className="schedule-surface">
                <div className="calendar">
                  <div className="calendar-header">
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>Previous</button>
                    <strong>{currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}</strong>
                    <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>Next</button>
                  </div>

                  <div className="calendar-grid">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <strong key={day}>{day}</strong>
                    ))}
                    {renderCalendar()}
                  </div>
                </div>

                <div className={`time-slots ${form.date ? "" : "is-disabled"}`}>
                <div className="local-time-banner">
                  <div>
                  <span className="local-time-kicker">Local appointment time</span>
                    <h2>Choose date and time</h2>
                  </div>
                  <p>
                    {form.country
                      ? `Your preferred timezone is picked from ${form.country}. Booked times are blocked so appointments do not overlap.`
                      : "Choose your country first so the appointment times match your location."}
                  </p>
                  <strong>{form.country ? timezoneLabel : selectedDateLabel}</strong>
                </div>
                <div className="button-row">
                  {TIMES.map((time) => {
                    const booked = form.date && isTimeBooked(form.date, time)
                    const localTime = form.date
                      ? formatSlotForCountry(form.date, time, selectedTimeZone)
                      : `${time} GMT`
                    return (
                      <button
                        type="button"
                        key={time}
                        onClick={() => !booked && setForm((prev) => ({ ...prev, time }))}
                        disabled={!form.date || booked}
                        className={form.time === time ? "active" : ""}
                      >
                        {localTime} {booked ? "Booked" : ""}
                      </button>
                    )
                  })}
                </div>
                </div>
              </div>
            </div>

            <div className="actions">
              <button type="button" onClick={() => setStep(1)}>Back</button>
              <button type="button" onClick={handleProceedToPayment} className="primary-button">
                {isFreePackage ? "Review Free Package" : "Proceed to Payment"}
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="panel">
            <div className="panel-header">
              <span className="eyebrow">
                {paymentConfirmed ? "Payment received" : paymentPending ? "Payment pending" : "Package review"}
              </span>
              <h1>{paymentConfirmed ? "Package duties started" : paymentPending ? "Awaiting payment confirmation" : "Confirm booking"}</h1>
              <p>
                {paymentConfirmed
                  ? "The payment is confirmed for this package, so the service duties below are now active."
                  : paymentPending
                    ? "Your booking details are saved, but payment has not been confirmed yet. Package duties unlock only after successful payment confirmation."
                  : isFreePackage
                    ? "Review the free package before submitting the risk review."
                    : "Review the appointment information and package duties before payment."}
              </p>
            </div>

            <div className="summary-card">
              {[
                ["Package", selected?.name],
                ["Price", getPrice(selected?.priceUSD)],
                ["Name", form.name],
                ["Email", form.email],
                ["Country", form.country],
                ["Timezone", timezoneLabel],
                ["Scam Type", form.scamType],
                ["Date", form.date],
                ["Time", selectedLocalTime]
              ].map(([label, value]) => (
                <div key={label} className="summary-row">
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className={`risk-scanner risk-${riskAnalysis.level.toLowerCase()}`}>
              <div className="scanner-main">
                <div>
                  <span className="eyebrow">Case risk review</span>
                  <h2>{riskAnalysis.level} risk pattern detected</h2>
                  <p>{riskAnalysis.summary}</p>
                </div>
                <div className="score-meter" aria-label={`Risk score ${riskAnalysis.score} out of 100`}>
                  <svg viewBox="0 0 120 120" role="img">
                    <circle cx="60" cy="60" r="48" className="meter-track" />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      className="meter-value"
                      pathLength="100"
                      style={{ strokeDasharray: `${riskAnalysis.score} 100` }}
                    />
                  </svg>
                  <strong>{riskAnalysis.score}</strong>
                  <span>/100</span>
                </div>
              </div>

              <div className="scanner-meta">
                <div>
                  <span>Likely category</span>
                  <strong>{riskAnalysis.category}</strong>
                </div>
                <div>
                  <span>Review confidence</span>
                  <strong>{riskAnalysis.confidence}%</strong>
                </div>
                <div>
                  <span>Booked package</span>
                  <strong>{selected?.name}</strong>
                </div>
              </div>

              <div className="scanner-grid">
                <div>
                  <h3>Matched warning signs</h3>
                  {riskAnalysis.signals.map((signal) => (
                    <article key={signal.label} className="signal-card">
                      <strong>{signal.label}</strong>
                      <p>{signal.detail}</p>
                    </article>
                  ))}
                </div>
                <div>
                  <h3>Recommended next steps</h3>
                  <ol className="action-list">
                    {riskAnalysis.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {isFreePackage && (
              <div className={`next-steps-panel ${freeBookingSubmitted ? "submitted" : ""}`}>
                <div>
                  <span className="eyebrow">Free package next step</span>
                  <h2>{freeBookingSubmitted ? "Free review submitted" : "Submit this free review"}</h2>
                  <p>
                    {freeBookingSubmitted
                      ? "Your free risk review is recorded. Keep the evidence safe and use the guidance below before sending money, codes, documents, or account access."
                      : "Submit the free package to lock in this risk review and receive clear safety guidance from ScameHospital."}
                  </p>
                </div>
                <div className="next-step-list">
                  <span>1. Save screenshots and payment details.</span>
                  <span>2. Stop sharing codes, passwords, or documents.</span>
                  <span>3. Upgrade to Basic, Standard, or Premium if you need a written report or live support.</span>
                </div>
              </div>
            )}

            {!isFreePackage && packageDuties && (
              <div className={`fulfillment-panel ${paymentConfirmed ? "confirmed" : ""}`}>
                <div className="fulfillment-heading">
                  <div>
                    <span className="eyebrow">{paymentConfirmed ? "After payment" : "Package duty checklist"}</span>
                    <h2>{paymentConfirmed ? packageDuties.afterPayment : packageDuties.title}</h2>
                    <p>{packageDuties.timeline}</p>
                  </div>
                  <strong>{paymentConfirmed ? "Active" : paymentPending ? "Awaiting payment" : "Pending payment"}</strong>
                </div>

                {paymentReference && (
                  <div className="payment-reference">
                    <span>{paymentConfirmed ? "Service reference" : "Payment reference"}</span>
                    <strong>{paymentReference}</strong>
                  </div>
                )}

                <div className="duty-list">
                  {packageDuties.duties.map((duty) => (
                    <div key={duty} className={paymentConfirmed ? "done" : ""}>
                      <span>{paymentConfirmed ? "OK" : "•"}</span>
                      <p>{duty}</p>
                    </div>
                  ))}
                </div>

                <div className="paid-support-panel">
                  <div>
                    <span className="eyebrow">Paid user direct mail</span>
                    <h3>{paymentConfirmed ? "Contact the support inbox" : "Support email unlocks after payment"}</h3>
                    <p>
                      {paymentConfirmed
                        ? `Send your case message directly to ${SUPPORT_EMAIL} with your package details already included.`
                        : "Complete payment first, then this button will open a prefilled email for your paid support request."}
                    </p>
                  </div>
                  {paymentConfirmed ? (
                    <a className="paid-mail-button" href={paidSupportHref}>
                      Email {SUPPORT_EMAIL}
                    </a>
                  ) : (
                    <button type="button" className="paid-mail-button locked" disabled>
                      Paid users only
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="actions">
              <button type="button" onClick={() => setStep(2)}>Back</button>
              <button type="button" onClick={handlePay} disabled={loading || freeBookingSubmitted || paymentConfirmed} className="primary-button">
                {isFreePackage
                  ? freeBookingSubmitted
                    ? "Free review submitted"
                    : "Submit free review"
                  : paymentConfirmed
                    ? "Payment received, duties started"
                  : paymentPending
                    ? "Try payment again"
                  : loading
                    ? "Processing..."
                    : `Pay ${getPrice(selected?.priceUSD)} securely`}
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
