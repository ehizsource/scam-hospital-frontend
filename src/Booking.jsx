import { useState } from "react"

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
  "Romance Scam", "Crypto Fraud", "Phishing", "Fake Job Offer",
  "Business Email Compromise", "Investment Scam", "Lottery Scam",
  "Impersonation Scam", "Other"
]

const CURRENCY_RATES = {
  USD: { symbol: "$", rate: 1, label: "US Dollar (USD)" },
  GBP: { symbol: "£", rate: 0.79, label: "British Pound (GBP)" },
  EUR: { symbol: "€", rate: 0.92, label: "Euro (EUR)" },
  AUD: { symbol: "$", rate: 1.53, label: "Australian Dollar (AUD)" },
  CAD: { symbol: "$", rate: 1.36, label: "Canadian Dollar (CAD)" }
}

const PACKAGES = [
  {
    name: "Free", priceUSD: 0, icon: "🆓", border: "#e0e0e0",
    btnColor: "#666", dark: false, popular: false,
    features: ["Submit scam message", "Basic AI risk score", "Scam category detection"],
    btn: "Try For Free"
  },
  {
    name: "Basic", priceUSD: 53, icon: "🥉", border: "#90caf9",
    btnColor: "#1976d2", dark: false, popular: false,
    features: ["Full AI analysis report", "Risk score assessment", "Safety action plan", "Written report"],
    btn: "Get Basic"
  },
  {
    name: "Standard", priceUSD: 107, icon: "🥈", border: "#00d4ff",
    btnColor: "#00d4ff", dark: true, popular: true,
    features: ["Everything in Basic", "45min Google Meet session", "Trauma informed counseling", "Emotional recovery guide"],
    btn: "Get Standard"
  },
  {
    name: "Premium", priceUSD: 214, icon: "🥇", border: "#ffb74d",
    btnColor: "#f57c00", dark: false, popular: false,
    features: ["Everything in Standard", "Full scam investigation", "Official proof document", "Priority 24hr support", "Follow up session"],
    btn: "Get Premium"
  }
]

const TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

const BOOKED_SLOTS = {
  "2026-05-10": ["9:00 AM", "2:00 PM"],
  "2026-05-12": ["11:00 AM", "3:00 PM", "5:00 PM"],
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

// Inject global responsive styles
const globalStyles = `
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; }

  .booking-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .packages-grid {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .package-card {
    width: 200px;
    flex-shrink: 0;
  }

  .currency-btns {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .progress-bar {
    display: flex;
    justify-content: center;
    gap: 12px;
    align-items: center;
    flex-wrap: nowrap;
  }

  .progress-label {
    font-size: 14px;
    display: inline;
  }

  .step-connector {
    width: 50px;
    height: 2px;
    flex-shrink: 0;
  }

  .nav-padding {
    padding: 18px 60px;
  }

  .content-padding {
    padding: 45px;
  }

  .time-slots {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .summary-row {
    flex-direction: row;
  }

  .summary-value {
    text-align: right;
    max-width: 300px;
  }

  .action-btns {
    display: flex;
    gap: 15px;
  }

  .calendar-day {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    .booking-grid-2 {
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .packages-grid {
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .package-card {
      width: 100%;
      max-width: 340px;
    }

    .currency-btns {
      gap: 6px;
    }

    .progress-bar {
      gap: 6px;
    }

    .progress-label {
      display: none;
    }

    .step-connector {
      width: 20px;
    }

    .nav-padding {
      padding: 14px 16px;
    }

    .content-padding {
      padding: 20px 16px;
    }

    .time-slots {
      gap: 8px;
    }

    .summary-row {
      flex-direction: column;
      gap: 2px;
    }

    .summary-value {
      text-align: left;
      max-width: 100%;
    }

    .action-btns {
      flex-direction: column;
      gap: 10px;
    }

    .calendar-day {
      width: 30px;
      height: 30px;
      font-size: 11px;
    }

    .cal-header-btn {
      padding: 4px 8px !important;
      font-size: 14px !important;
    }

    .cal-month-label {
      font-size: 14px !important;
    }

    .cal-grid {
      gap: 2px !important;
    }

    .booking-main {
      padding: 0 12px;
      margin: 20px auto;
    }

    .step3-summary {
      padding: 16px !important;
    }

    .what-happens {
      padding: 14px 16px !important;
    }
  }

  @media (max-width: 400px) {
    .progress-label { display: none; }
    .nav-brand-text { font-size: 18px !important; }
    .step-number { width: 32px !important; height: 32px !important; font-size: 12px !important; }
  }
`

export default function App({ onBack = () => {} }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(null)
  const [hoveredPkg, setHoveredPkg] = useState(null)
  const [currency, setCurrency] = useState("USD")
  const [countrySearch, setCountrySearch] = useState("")
  const [showCountryList, setShowCountryList] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [form, setForm] = useState({
    name: "", email: "", country: "", date: "", time: "",
    scamType: "", description: ""
  })

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const getPrice = (priceUSD) => {
    const curr = CURRENCY_RATES[currency]
    const converted = (priceUSD * curr.rate).toFixed(2)
    return curr.symbol + converted
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => {
      const updated = { ...prev, [name]: value }
      if (name === "description" && value.length > 20) {
        const detected = detectScamType(value)
        if (detected) updated.scamType = detected
      }
      return updated
    })
  }

  const isTimeBooked = (date, time) => BOOKED_SLOTS[date] && BOOKED_SLOTS[date].includes(time)

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  const formatDate = (year, month, day) =>
    year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const inputStyle = {
    width: "100%",
    padding: "13px 15px",
    borderRadius: "10px",
    border: "1.5px solid #e0e0e0",
    marginTop: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "Segoe UI, Arial, sans-serif"
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={"empty" + i} />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(year, month, day)
      const dateObj = new Date(year, month, day)
      const isPast = dateObj < today
      const isSelected = form.date === dateStr
      const isFullyBooked = BOOKED_SLOTS[dateStr] && BOOKED_SLOTS[dateStr].length >= TIMES.length
      const isDisabled = isPast || isFullyBooked

      days.push(
        <div
          key={day}
          onClick={() => !isDisabled && setForm(prev => ({ ...prev, date: dateStr, time: "" }))}
          className="calendar-day"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%",
            fontWeight: isSelected ? "700" : "400",
            cursor: isDisabled ? "not-allowed" : "pointer",
            background: isSelected
              ? "linear-gradient(135deg, #00d4ff, #0066cc)"
              : isFullyBooked ? "#ffe0e0" : "transparent",
            color: isSelected ? "white" : isDisabled ? "#ccc" : isFullyBooked ? "#e53935" : "#0a1628",
            border: isSelected ? "none" : "1px solid transparent",
            transition: "all 0.2s", position: "relative"
          }}
          title={isFullyBooked ? "Fully booked" : isPast ? "Past date" : ""}
        >
          {day}
          {isFullyBooked && (
            <span style={{
              position: "absolute", bottom: "2px", width: "4px", height: "4px",
              borderRadius: "50%", background: "#e53935"
            }} />
          )}
        </div>
      )
    }
    return days
  }

  return (
    <div style={{ fontFamily: "Segoe UI, Arial, sans-serif", backgroundColor: "#f0f4f8", minHeight: "100vh" }}>
      <style>{globalStyles}</style>

      {/* NAVBAR */}
      <nav className="nav-padding" style={{
        background: "rgba(10, 22, 40, 0.97)",
        backdropFilter: "blur(20px)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(0,212,255,0.15)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
            borderRadius: "10px", width: "36px", height: "36px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0
          }}>🏥</div>
          <span className="nav-brand-text" style={{ color: "white", fontSize: "20px", fontWeight: "800" }}>
            Scame<span style={{ color: "#00d4ff" }}>Hospital</span>
          </span>
        </div>
        <button
          onClick={onBack}
          style={{
            background: "transparent", border: "1.5px solid rgba(0,212,255,0.4)",
            color: "rgba(255,255,255,0.7)", padding: "8px 14px", borderRadius: "20px",
            cursor: "pointer", fontSize: "13px", fontWeight: "500", whiteSpace: "nowrap"
          }}
        >
          ← Back
        </button>
      </nav>

      {/* PROGRESS BAR */}
      <div style={{ backgroundColor: "white", padding: "18px 16px", boxShadow: "0 2px 15px rgba(0,0,0,0.06)" }}>
        <div className="progress-bar">
          {["Choose Package", "Your Details", "Payment"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div className="step-number" style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: step > i + 1
                  ? "linear-gradient(135deg, #00d4ff, #0066cc)"
                  : step === i + 1 ? "#0a1628" : "#f0f0f0",
                color: step >= i + 1 ? "white" : "#aaa",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700", fontSize: "13px", transition: "all 0.3s", flexShrink: 0
              }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className="progress-label" style={{
                fontWeight: step === i + 1 ? "700" : "400",
                color: step === i + 1 ? "#0a1628" : "#bbb",
                fontSize: "13px"
              }}>
                {label}
              </span>
              {i < 2 && (
                <div className="step-connector" style={{
                  height: "2px",
                  background: step > i + 1 ? "linear-gradient(135deg, #00d4ff, #0066cc)" : "#eee",
                  borderRadius: "2px"
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="booking-main" style={{ maxWidth: "950px", margin: "30px auto", padding: "0 16px" }}>

        {/* STEP 1 — CHOOSE PACKAGE */}
        {step === 1 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <p style={{ color: "#666", fontSize: "13px", marginBottom: "10px", fontWeight: "600" }}>
                Select your currency:
              </p>
              <div className="currency-btns">
                {Object.entries(CURRENCY_RATES).map(([code, info]) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    style={{
                      padding: "7px 14px", borderRadius: "20px",
                      border: "2px solid " + (currency === code ? "#00d4ff" : "#ddd"),
                      background: currency === code ? "linear-gradient(135deg, #00d4ff, #0066cc)" : "white",
                      color: currency === code ? "white" : "#666",
                      fontWeight: "600", cursor: "pointer", fontSize: "12px", transition: "all 0.3s"
                    }}
                  >
                    {info.symbol} {code}
                  </button>
                ))}
              </div>
              <p style={{ color: "#aaa", fontSize: "11px", marginTop: "8px" }}>
                All prices are equivalent to the standard USD rate
              </p>
            </div>

            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0a1628", marginBottom: "8px" }}>
                Choose Your Package
              </h2>
              <p style={{ color: "#888", fontSize: "14px" }}>
                All prices include VAT. Payment required to confirm booking.
              </p>
            </div>

            <div className="packages-grid">
              {PACKAGES.map((pkg, i) => (
                <div
                  key={i}
                  className="package-card"
                  onClick={() => setSelected(pkg)}
                  onMouseEnter={() => setHoveredPkg(i)}
                  onMouseLeave={() => setHoveredPkg(null)}
                  style={{
                    background: pkg.dark ? "linear-gradient(135deg, #0a1628, #1a2a4a)" : "white",
                    border: "2px solid " + (selected?.name === pkg.name ? "#00d4ff" : hoveredPkg === i ? pkg.border : "#eee"),
                    borderRadius: "18px", padding: "24px 20px",
                    cursor: "pointer", position: "relative",
                    boxShadow: selected?.name === pkg.name
                      ? "0 0 25px rgba(0,212,255,0.3)"
                      : "0 4px 15px rgba(0,0,0,0.06)",
                    transform: selected?.name === pkg.name ? "scale(1.02)" : "scale(1)",
                    transition: "all 0.3s"
                  }}
                >
                  {pkg.popular && (
                    <div style={{
                      position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                      background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                      color: "white", padding: "3px 14px", borderRadius: "20px",
                      fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap"
                    }}>MOST POPULAR</div>
                  )}
                  {selected?.name === pkg.name && (
                    <div style={{
                      position: "absolute", top: "12px", right: "12px",
                      background: "#00d4ff", borderRadius: "50%",
                      width: "22px", height: "22px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "12px", color: "white", fontWeight: "bold"
                    }}>✓</div>
                  )}
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{pkg.icon}</div>
                  <h3 style={{ fontSize: "17px", fontWeight: "700", color: pkg.dark ? "white" : "#0a1628", marginBottom: "4px" }}>
                    {pkg.name}
                  </h3>
                  <div style={{ fontSize: "26px", fontWeight: "800", color: pkg.dark ? "#00d4ff" : "#0a1628", marginBottom: "2px" }}>
                    {getPrice(pkg.priceUSD)}
                  </div>
                  <div style={{ fontSize: "11px", color: pkg.dark ? "rgba(255,255,255,0.4)" : "#bbb", marginBottom: "14px" }}>
                    VAT included
                  </div>
                  {pkg.features.map((f, j) => (
                    <div key={j} style={{
                      display: "flex", alignItems: "flex-start", gap: "7px",
                      marginBottom: "7px", fontSize: "12px",
                      color: pkg.dark ? "rgba(255,255,255,0.65)" : "#666", textAlign: "left"
                    }}>
                      <span style={{ color: pkg.btnColor, fontWeight: "bold", marginTop: "1px" }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: "32px", paddingBottom: "20px" }}>
              <button
                onClick={() => selected && setStep(2)}
                style={{
                  background: selected
                    ? "linear-gradient(135deg, #00d4ff, #0066cc)" : "#e0e0e0",
                  color: selected ? "white" : "#aaa",
                  border: "none", padding: "15px 45px", borderRadius: "35px",
                  fontWeight: "700", cursor: selected ? "pointer" : "not-allowed",
                  fontSize: "15px", width: "100%", maxWidth: "360px",
                  boxShadow: selected ? "0 8px 25px rgba(0,212,255,0.3)" : "none",
                  transition: "all 0.3s"
                }}
              >
                Continue with {selected ? selected.name : "a Package"} →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — YOUR DETAILS */}
        {step === 2 && (
          <div className="content-padding" style={{
            background: "white", borderRadius: "20px",
            boxShadow: "0 4px 25px rgba(0,0,0,0.08)"
          }}>
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0a1628", marginBottom: "8px" }}>
                Your Details
              </h2>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
                padding: "6px 14px", borderRadius: "20px", fontSize: "13px",
                color: "#0066cc", fontWeight: "600"
              }}>
                {selected?.icon} {selected?.name} — {getPrice(selected?.priceUSD)} (VAT included)
              </div>
            </div>

            <div className="booking-grid-2">
              <div>
                <label style={{ fontWeight: "600", fontSize: "13px", color: "#444" }}>Full Name *</label>
                <input name="name" value={form.name} onChange={handleChange}
                  placeholder="Your full name" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontWeight: "600", fontSize: "13px", color: "#444" }}>Email Address *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="your@email.com" style={inputStyle} />
              </div>
              <div style={{ position: "relative" }}>
                <label style={{ fontWeight: "600", fontSize: "13px", color: "#444" }}>Country *</label>
                <input
                  value={countrySearch || form.country}
                  onChange={(e) => {
                    setCountrySearch(e.target.value)
                    setShowCountryList(true)
                    setForm(prev => ({ ...prev, country: "" }))
                  }}
                  onFocus={() => setShowCountryList(true)}
                  placeholder="Search your country..."
                  style={inputStyle}
                />
                {showCountryList && (
                  <div style={{
                    position: "absolute", top: "75px", left: 0, right: 0,
                    background: "white", border: "1.5px solid #e0e0e0",
                    borderRadius: "10px", maxHeight: "200px", overflowY: "scroll",
                    zIndex: 100, boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
                  }}>
                    {filteredCountries.map((country, i) => (
                      <div key={i}
                        onClick={() => {
                          setForm(prev => ({ ...prev, country }))
                          setCountrySearch("")
                          setShowCountryList(false)
                        }}
                        style={{
                          padding: "10px 15px", cursor: "pointer", fontSize: "14px",
                          color: "#333", borderBottom: "1px solid #f5f5f5"
                        }}
                        onMouseEnter={e => e.target.style.background = "#f0f9ff"}
                        onMouseLeave={e => e.target.style.background = "white"}
                      >
                        {country}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontWeight: "600", fontSize: "13px", color: "#444" }}>
                  Type of Scam *
                  {form.scamType && (
                    <span style={{
                      marginLeft: "8px", background: "rgba(0,212,255,0.1)", color: "#0066cc",
                      padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: "600"
                    }}>Auto-detected</span>
                  )}
                </label>
                <select name="scamType" value={form.scamType} onChange={handleChange} style={inputStyle}>
                  <option value="">Select or describe below</option>
                  {SCAM_TYPES.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label style={{ fontWeight: "600", fontSize: "13px", color: "#444" }}>
                Brief Description *
                <span style={{ color: "#aaa", fontWeight: "400", marginLeft: "8px" }}>
                  (Scam type auto-detected)
                </span>
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe what happened..."
                rows={4} style={{ ...inputStyle, resize: "vertical" }}
              />
            </div>

            {/* CALENDAR */}
            <div style={{ marginTop: "25px" }}>
              <label style={{ fontWeight: "600", fontSize: "13px", color: "#444", display: "block", marginBottom: "12px" }}>
                Select Appointment Date *
              </label>
              <div style={{ border: "1.5px solid #e0e0e0", borderRadius: "15px", padding: "16px", background: "#fafafa" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <button className="cal-header-btn"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px", color: "#666" }}
                  >←</button>
                  <span className="cal-month-label" style={{ fontWeight: "700", fontSize: "15px", color: "#0a1628" }}>
                    {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                  </span>
                  <button className="cal-header-btn"
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    style={{ background: "none", border: "1px solid #ddd", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontSize: "16px", color: "#666" }}
                  >→</button>
                </div>

                <div className="cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "10px" }}>
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
                    <div key={day} style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", color: "#aaa" }}>{day}</div>
                  ))}
                </div>

                <div className="cal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", justifyItems: "center" }}>
                  {renderCalendar()}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "14px", fontSize: "11px", color: "#888", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "linear-gradient(135deg, #00d4ff, #0066cc)" }} /> Selected
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#ffe0e0" }} /> Fully Booked
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#eee" }} /> Unavailable
                  </div>
                </div>
              </div>
            </div>

            {/* TIME SLOTS */}
            {form.date && (
              <div style={{ marginTop: "20px" }}>
                <label style={{ fontWeight: "600", fontSize: "13px", color: "#444", display: "block", marginBottom: "12px" }}>
                  Select Time Slot (GMT) *
                </label>
                <div className="time-slots">
                  {TIMES.map((time, i) => {
                    const booked = isTimeBooked(form.date, time)
                    const isSelected = form.time === time
                    return (
                      <button key={i}
                        onClick={() => !booked && setForm(prev => ({ ...prev, time }))}
                        disabled={booked}
                        style={{
                          padding: "10px 16px", borderRadius: "10px",
                          border: "2px solid " + (isSelected ? "#00d4ff" : booked ? "#ffcdd2" : "#e0e0e0"),
                          background: isSelected ? "linear-gradient(135deg, #00d4ff, #0066cc)" : booked ? "#ffebee" : "white",
                          color: isSelected ? "white" : booked ? "#e53935" : "#333",
                          fontWeight: "600", fontSize: "13px",
                          cursor: booked ? "not-allowed" : "pointer", transition: "all 0.2s"
                        }}
                      >
                        {time}
                        {booked && <span style={{ display: "block", fontSize: "9px", color: "#e53935", fontWeight: "400" }}>Booked</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{
              background: "linear-gradient(135deg, #f0f9ff, #e8f4fd)",
              border: "1px solid rgba(0,212,255,0.2)", borderRadius: "12px",
              padding: "14px 18px", marginTop: "20px", fontSize: "13px", color: "#555"
            }}>
              🔒 Your information is 100% confidential and will never be shared with third parties.
            </div>

            <div className="action-btns" style={{ marginTop: "28px" }}>
              <button onClick={() => setStep(1)} style={{
                background: "transparent", border: "2px solid #e0e0e0", color: "#666",
                padding: "13px 28px", borderRadius: "30px", cursor: "pointer",
                fontSize: "14px", fontWeight: "600"
              }}>Back</button>
              <button
                onClick={() => {
                  if (form.name && form.email && form.country && form.date && form.time && form.scamType && form.description) {
                    setStep(3)
                  } else {
                    alert("Please fill in all fields and select a date and time.")
                  }
                }}
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                  color: "white", border: "none", padding: "13px 30px", borderRadius: "30px",
                  fontWeight: "700", cursor: "pointer", fontSize: "15px", flex: 1,
                  boxShadow: "0 6px 20px rgba(0,212,255,0.3)", transition: "all 0.3s"
                }}
              >Proceed to Payment →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — PAYMENT */}
        {step === 3 && (
          <div className="content-padding" style={{
            background: "white", borderRadius: "20px",
            boxShadow: "0 4px 25px rgba(0,0,0,0.08)"
          }}>
            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0a1628", marginBottom: "8px" }}>
              Confirm and Pay
            </h2>
            <p style={{ color: "#888", marginBottom: "24px", fontSize: "14px" }}>
              Review your booking details before payment
            </p>

            <div className="step3-summary" style={{
              background: "linear-gradient(135deg, #f8fafc, #f0f4f8)", borderRadius: "15px",
              padding: "20px", marginBottom: "20px", border: "1px solid #e8eef4"
            }}>
              <h3 style={{ marginBottom: "16px", fontSize: "14px", fontWeight: "700", color: "#0a1628" }}>
                Booking Summary
              </h3>
              {[
                { label: "Package", value: selected?.icon + " " + selected?.name },
                { label: "Price", value: getPrice(selected?.priceUSD) + " (VAT included)" },
                { label: "Currency", value: CURRENCY_RATES[currency].label },
                { label: "Full Name", value: form.name },
                { label: "Email", value: form.email },
                { label: "Country", value: form.country },
                { label: "Scam Type", value: form.scamType },
                { label: "Date", value: form.date },
                { label: "Time", value: form.time + " (GMT)" },
                { label: "Description", value: form.description }
              ].map((item, i) => (
                <div key={i} className="summary-row" style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  padding: "9px 0", borderBottom: i < 9 ? "1px solid #eee" : "none", fontSize: "13px"
                }}>
                  <span style={{ color: "#888", fontWeight: "500", minWidth: "90px", flexShrink: 0 }}>{item.label}</span>
                  <span className="summary-value" style={{ fontWeight: "600", color: "#0a1628" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="what-happens" style={{
              background: "linear-gradient(135deg, #e8f5e9, #f1f8e9)",
              border: "1px solid rgba(56,142,60,0.2)", borderRadius: "12px",
              padding: "18px 20px", marginBottom: "22px", fontSize: "13px", color: "#444"
            }}>
              <h4 style={{ marginBottom: "12px", color: "#2e7d32", fontWeight: "700", fontSize: "14px" }}>
                What happens after payment:
              </h4>
              {[
                "You receive a full booking confirmation email instantly",
                "Google Meet link sent to your email automatically",
                "Reminder sent 24 hours before your session",
                "Join the session at your chosen date and time"
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ color: "#388e3c", fontWeight: "bold", marginTop: "1px" }}>→</span>
                  {item}
                </div>
              ))}
            </div>

            <div className="action-btns">
              <button onClick={() => setStep(2)} style={{
                background: "transparent", border: "2px solid #e0e0e0", color: "#666",
                padding: "13px 28px", borderRadius: "30px", cursor: "pointer",
                fontSize: "14px", fontWeight: "600"
              }}>Back</button>
              <button
                onClick={() => alert("Paystack payment integration coming soon!")}
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0066cc)",
                  color: "white", border: "none", padding: "15px 30px", borderRadius: "30px",
                  fontWeight: "700", cursor: "pointer", fontSize: "15px", flex: 1,
                  boxShadow: "0 6px 20px rgba(0,212,255,0.3)", transition: "all 0.3s"
                }}
              >
                Pay {getPrice(selected?.priceUSD)} with Paystack
              </button>
            </div>

            <p style={{ textAlign: "center", color: "#bbb", fontSize: "12px", marginTop: "16px" }}>
              🔒 Secure payment powered by Paystack. Your card details are never stored.
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{
        backgroundColor: "#020810", color: "rgba(255,255,255,0.4)",
        textAlign: "center", padding: "28px 20px", fontSize: "12px",
        marginTop: "50px", borderTop: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #00d4ff, #0066cc)",
            borderRadius: "8px", width: "24px", height: "24px",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px"
          }}>🏥</div>
          <span style={{ color: "white", fontWeight: "700", fontSize: "14px" }}>
            Scame<span style={{ color: "#00d4ff" }}>Hospital</span>
          </span>
        </div>
        <p style={{ marginBottom: "5px" }}>2026 ScameHospital. All rights reserved. Confidential and Secure</p>
        <p style={{ marginBottom: "5px" }}>noreply@scamehospital.com</p>
        <p>Not a law enforcement or therapy platform. For informational and support purposes only.</p>
      </div>
    </div>
  )
}