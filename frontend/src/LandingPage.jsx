import { useEffect, useState } from "react"

const RED_FLAGS = [
  "They say they love you quickly but avoid video calls",
  "They ask you to move the chat to WhatsApp or Telegram",
  "They claim to be military, a doctor, or working overseas",
  "They ask for gift cards, crypto, transport fees, or emergency money",
  "They promise guaranteed investment returns",
  "They pressure you to act before you can think clearly"
]

const SCAM_TYPES = [
  ["Romance Scam", "Fake affection, emotional pressure, and money requests.", "#ff6b9d"],
  ["Crypto Fraud", "Fake platforms, false profits, and withdrawal fees.", "#f59e0b"],
  ["Fake Job Offer", "Remote jobs that ask for payment or private documents.", "#a78bfa"],
  ["Phishing", "Links and messages built to steal passwords or bank details.", "#38bdf8"],
  ["Impersonation", "Someone pretending to be a bank, official, celebrity, or family member.", "#34d399"],
  ["Business Email", "Fake invoices, payment changes, and executive impersonation.", "#fb7185"]
]

const STEPS = [
  ["Paste or describe it", "Share the message, story, profile, link, or situation that feels suspicious."],
  ["Get a risk score", "ScameHospital checks for pressure tactics, identity tricks, payment requests, and language patterns."],
  ["Understand the evidence", "See the red flags clearly so you can decide what to do next with confidence."],
  ["Book deeper support", "If you need more help, choose a package and speak with ScameHospital."]
]

const SUPPORT_EMAIL = "contact@scamehospital.com"

export default function LandingPage({ onGetStarted }) {
  const [activeFlag, setActiveFlag] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const flagTimer = window.setInterval(() => {
      setActiveFlag((index) => (index + 1) % RED_FLAGS.length)
    }, 2600)

    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll)

    return () => {
      window.clearInterval(flagTimer)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <div className="landing-page">
      <style>{`
        .landing-page {
          --bg: #020810;
          --panel: rgba(255, 255, 255, 0.055);
          --panel-strong: rgba(255, 255, 255, 0.09);
          --line: rgba(125, 211, 252, 0.18);
          --text: #ffffff;
          --muted: rgba(255, 255, 255, 0.62);
          --blue: #00d4ff;
          --deep-blue: #0066cc;
          width: 100dvw;
          min-height: 100dvh;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 16% 10%, rgba(0, 212, 255, 0.16), transparent 26rem),
            radial-gradient(circle at 86% 22%, rgba(99, 102, 241, 0.16), transparent 24rem),
            linear-gradient(180deg, #020810 0%, #07111f 52%, #020810 100%);
          color: var(--text);
          font-family: "Segoe UI", Arial, sans-serif;
        }

        .landing-page * {
          box-sizing: border-box;
        }

        .landing-page button,
        .landing-page a {
          position: relative;
          overflow: hidden;
        }

        .landing-page button::after,
        .landing-page .landing-button::after,
        .landing-page .landing-outline::after {
          content: "";
          position: absolute;
          inset: 50% auto auto 50%;
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: rgba(0, 212, 255, 0.35);
          opacity: 0;
          pointer-events: none;
          transform: translate(-50%, -50%) scale(1);
        }

        .landing-page button:active::after,
        .landing-page .landing-button:active::after,
        .landing-page .landing-outline:active::after {
          animation: landingTapBurst 0.42s ease-out;
        }

        .landing-bg-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(125, 211, 252, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(125, 211, 252, 0.045) 1px, transparent 1px);
          background-size: 54px 54px;
          mask-image: linear-gradient(to bottom, black, transparent 82%);
        }

        .landing-nav {
          position: fixed;
          z-index: 20;
          inset: 0 0 auto;
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 18px clamp(18px, 5vw, 68px);
          background: transparent;
          border-bottom: 1px solid transparent;
          transition: background 0.25s ease, border-color 0.25s ease;
        }

        .landing-nav.scrolled {
          background: rgba(2, 8, 16, 0.88);
          border-color: rgba(125, 211, 252, 0.14);
          backdrop-filter: blur(18px);
        }

        .landing-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: clamp(18px, 2vw, 22px);
          font-weight: 900;
          letter-spacing: 0;
          text-decoration: none;
          white-space: nowrap;
        }

        .landing-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: linear-gradient(135deg, var(--blue), var(--deep-blue));
          color: #02101d;
          font-size: 13px;
          font-weight: 950;
          box-shadow: 0 10px 34px rgba(0, 212, 255, 0.28);
        }

        .landing-brand span {
          color: var(--blue);
        }

        .landing-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .landing-links a {
          color: rgba(255, 255, 255, 0.64);
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
        }

        .landing-links a:hover {
          color: white;
        }

        .landing-button,
        .landing-outline {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0 24px;
          border: 0;
          font-weight: 850;
          font-size: 14px;
          text-decoration: none;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .landing-button {
          background: linear-gradient(135deg, var(--blue), var(--deep-blue));
          color: #02101d;
          box-shadow: 0 14px 38px rgba(0, 212, 255, 0.28);
        }

        .landing-button:hover,
        .landing-outline:hover {
          transform: translateY(-2px);
        }

        .landing-outline {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.035);
          color: white;
        }

        .landing-outline:hover {
          border-color: rgba(0, 212, 255, 0.55);
        }

        .landing-mail-link {
          min-height: 42px;
          padding-inline: 18px;
          font-size: 13px;
        }

        .landing-hero {
          position: relative;
          z-index: 1;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: 1fr;
          gap: 36px;
          align-items: center;
          justify-items: center;
          padding: 124px clamp(18px, 6vw, 82px) 42px;
          text-align: center;
        }

        .landing-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          margin-bottom: 22px;
          padding: 8px 15px;
          border: 1px solid rgba(0, 212, 255, 0.25);
          border-radius: 999px;
          background: rgba(0, 212, 255, 0.075);
          color: var(--blue);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--blue);
          box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.6);
          animation: landingPulse 1.8s infinite;
        }

        .landing-hero h1 {
          max-width: 980px;
          margin: 0;
          color: white;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(44px, 7vw, 92px);
          line-height: 0.98;
          letter-spacing: 0;
        }

        .landing-gradient-text {
          display: inline-block;
          color: transparent;
          background: linear-gradient(135deg, var(--blue), #93c5fd 52%, #ffffff);
          -webkit-background-clip: text;
          background-clip: text;
          font-style: italic;
        }

        .landing-hero-copy {
          max-width: 780px;
          margin: 26px auto 0;
          color: var(--muted);
          font-size: clamp(16px, 1.6vw, 19px);
          line-height: 1.72;
        }

        .landing-hero-actions {
          display: flex;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 34px;
        }

        .landing-trust {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
          width: min(100%, 920px);
          margin: 58px auto 0;
        }

        .landing-trust div {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.04);
        }

        .landing-trust strong {
          display: block;
          color: white;
          font-size: 20px;
        }

        .landing-trust span {
          display: block;
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.48);
          font-size: 12px;
          font-weight: 700;
        }

        .scanner-card {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 24px;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.085), rgba(255, 255, 255, 0.035)),
            rgba(2, 8, 16, 0.8);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.35);
        }

        .scanner-card::before {
          content: "";
          position: absolute;
          inset: -70% 0 auto;
          height: 50%;
          background: linear-gradient(180deg, transparent, rgba(0, 212, 255, 0.16), transparent);
          animation: scanLine 4.2s linear infinite;
        }

        .scanner-top {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(125, 211, 252, 0.12);
        }

        .window-dots {
          display: flex;
          gap: 7px;
        }

        .window-dots span {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }

        .scanner-body {
          position: relative;
          z-index: 1;
          padding: 22px;
        }

        .chat-row {
          display: flex;
          margin-bottom: 12px;
        }

        .chat-row.right {
          justify-content: flex-end;
        }

        .bubble {
          max-width: 82%;
          padding: 12px 13px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.065);
          color: rgba(255, 255, 255, 0.78);
          font-size: 13px;
          line-height: 1.45;
        }

        .chat-row.right .bubble {
          background: rgba(0, 102, 204, 0.24);
          border-color: rgba(0, 212, 255, 0.22);
        }

        .flag-label {
          display: block;
          margin-bottom: 5px;
          color: #ff7373;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.08em;
        }

        .risk-panel {
          margin-top: 20px;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 18px;
          align-items: center;
          padding: 18px;
          border: 1px solid rgba(255, 92, 92, 0.24);
          border-radius: 18px;
          background: rgba(255, 72, 72, 0.08);
        }

        .risk-score {
          width: 92px;
          height: 92px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 8px solid rgba(255, 255, 255, 0.08);
          outline: 8px solid rgba(255, 72, 72, 0.14);
          color: #ff6b6b;
          font-size: 28px;
          font-weight: 950;
        }

        .risk-panel h3 {
          margin: 0 0 6px;
          color: #ff8b8b;
          font-size: 16px;
        }

        .risk-panel p {
          margin: 0;
          color: rgba(255, 255, 255, 0.64);
          font-size: 13px;
          line-height: 1.5;
        }

        .red-flag-strip {
          position: relative;
          z-index: 1;
          margin: 0 clamp(18px, 6vw, 82px);
          padding: 18px 20px;
          border: 1px solid rgba(255, 99, 99, 0.22);
          border-radius: 16px;
          background: rgba(255, 45, 45, 0.065);
          color: rgba(255, 255, 255, 0.82);
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .red-flag-strip strong {
          flex: 0 0 auto;
          color: #ff8b8b;
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .red-flag-strip span {
          min-width: 0;
          font-size: 15px;
          line-height: 1.4;
        }

        .landing-section {
          position: relative;
          z-index: 1;
          padding: 96px clamp(18px, 6vw, 82px);
        }

        .section-inner {
          max-width: 1120px;
          margin: 0 auto;
        }

        .section-center {
          max-width: 720px;
          margin: 0 auto 46px;
          text-align: center;
        }

        .section-label {
          color: var(--blue);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .landing-section h2 {
          margin: 12px 0 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 4.4vw, 56px);
          line-height: 1.08;
          letter-spacing: 0;
        }

        .section-center p {
          margin: 18px auto 0;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.7;
        }

        .steps-grid,
        .types-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .types-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .info-card {
          min-height: 210px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 24px;
          background: var(--panel);
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .info-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 212, 255, 0.42);
          background: var(--panel-strong);
        }

        .step-number {
          display: block;
          margin-bottom: 22px;
          color: rgba(0, 212, 255, 0.32);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 46px;
          font-weight: 950;
          line-height: 0.9;
        }

        .info-card h3 {
          margin: 0 0 10px;
          color: white;
          font-size: 18px;
        }

        .info-card p {
          margin: 0;
          color: rgba(255, 255, 255, 0.56);
          font-size: 14px;
          line-height: 1.62;
        }

        .type-color {
          width: 42px;
          height: 5px;
          margin-bottom: 22px;
          border-radius: 999px;
        }

        .evidence-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(320px, 1.08fr);
          gap: 38px;
          align-items: center;
        }

        .check-list {
          display: grid;
          gap: 14px;
        }

        .check-item {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr);
          gap: 14px;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.045);
        }

        .check-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: rgba(0, 212, 255, 0.12);
          color: var(--blue);
          font-weight: 950;
        }

        .check-item strong {
          display: block;
          margin-bottom: 5px;
          color: white;
        }

        .check-item span {
          color: rgba(255, 255, 255, 0.56);
          font-size: 14px;
          line-height: 1.55;
        }

        .report-preview {
          border: 1px solid var(--line);
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.04));
          padding: 26px;
          box-shadow: 0 28px 80px rgba(0, 0, 0, 0.28);
        }

        .report-preview h3 {
          margin: 0 0 16px;
          font-size: 18px;
        }

        .report-row {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.62);
          font-size: 14px;
        }

        .report-row strong {
          color: white;
          text-align: right;
        }

        .cta-band {
          position: relative;
          z-index: 1;
          margin: 24px clamp(18px, 6vw, 82px) 82px;
          overflow: hidden;
          border: 1px solid rgba(0, 212, 255, 0.24);
          border-radius: 28px;
          background:
            radial-gradient(circle at 82% 18%, rgba(0, 212, 255, 0.18), transparent 22rem),
            linear-gradient(135deg, rgba(0, 102, 204, 0.18), rgba(255, 255, 255, 0.055));
          padding: clamp(34px, 6vw, 70px);
          text-align: center;
        }

        .cta-band h2 {
          max-width: 720px;
          margin: 0 auto 18px;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 5vw, 62px);
          line-height: 1.08;
        }

        .cta-band p {
          max-width: 620px;
          margin: 0 auto 32px;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.7;
        }

        .landing-footer {
          position: relative;
          z-index: 1;
          padding: 36px clamp(18px, 6vw, 82px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.42);
          font-size: 13px;
        }

        .footer-inner {
          max-width: 1120px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .footer-inner a {
          color: rgba(255, 255, 255, 0.68);
          text-decoration: none;
          font-weight: 800;
        }

        .footer-inner a:hover {
          color: white;
        }

        @keyframes landingPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.6); }
          70% { box-shadow: 0 0 0 9px rgba(0, 212, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
        }

        @keyframes scanLine {
          0% { transform: translateY(0); }
          100% { transform: translateY(360%); }
        }

        @keyframes landingTapBurst {
          0% {
            opacity: 0.62;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(34);
          }
        }

        @media (max-width: 980px) {
          .landing-hero,
          .evidence-layout {
            grid-template-columns: 1fr;
          }

          .landing-hero {
            padding-top: 112px;
          }

          .scanner-card {
            max-width: 620px;
          }

          .steps-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .landing-links a {
            display: none;
          }

          .landing-links {
            gap: 0;
          }

          .landing-links .landing-button {
            min-height: 42px;
            padding: 0 16px;
            font-size: 13px;
          }

          .landing-mail-link {
            display: none;
          }

          .landing-hero {
            min-height: auto;
            padding-bottom: 42px;
          }

          .landing-hero-actions,
          .red-flag-strip,
          .risk-panel {
            align-items: stretch;
            flex-direction: column;
          }

          .landing-hero-actions button {
            width: 100%;
          }

          .landing-trust,
          .types-grid {
            grid-template-columns: 1fr;
          }

          .steps-grid {
            grid-template-columns: 1fr;
          }

          .red-flag-strip {
            margin-top: 20px;
          }

          .landing-section {
            padding-block: 68px;
          }
        }

        @media (max-width: 520px) {
          .landing-nav {
            padding-inline: 14px;
          }

          .landing-mark {
            width: 34px;
            height: 34px;
          }

          .landing-brand {
            font-size: 17px;
          }

          .landing-links .landing-button {
            padding-inline: 12px;
          }

          .landing-hero {
            padding-inline: 16px;
          }

          .scanner-body {
            padding: 16px;
          }

          .bubble {
            max-width: 92%;
          }
        }
      `}</style>

      <div className="landing-bg-grid" />

      <nav className={`landing-nav ${scrolled ? "scrolled" : ""}`}>
        <a className="landing-brand" href="#top" aria-label="ScameHospital home">
          <span className="landing-mark">SH</span>
          Scame<span>Hospital</span>
        </a>
        <div className="landing-links">
          <a href="#types">Services</a>
          <a href="#how">How It Works</a>
          <a href="#evidence">Evidence</a>
          <a className="landing-outline landing-mail-link" href={`mailto:${SUPPORT_EMAIL}`}>
            Contact
          </a>
          <button type="button" className="landing-button" onClick={onGetStarted}>
            Get Help Now
          </button>
        </div>
      </nav>

      <main id="top">
        <section className="landing-hero">
          <div className="landing-hero-content">
            <div className="landing-kicker">
              <span className="pulse-dot" />
              The online support hospital for scam victims
            </div>
            <h1>
              Been scammed? <span className="landing-gradient-text">We're here to help.</span>
            </h1>
            <p className="landing-hero-copy">
              ScameHospital helps scam victims review suspicious messages, organise evidence, understand warning signs, and book confidential support entirely online.
            </p>
            <div className="landing-hero-actions">
              <button type="button" className="landing-button" onClick={onGetStarted}>
                Book a Session
              </button>
              <button
                type="button"
                className="landing-outline"
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
              >
                Check My Message
              </button>
            </div>
            <div className="landing-trust" aria-label="Service highlights">
              <div>
                <strong>500+</strong>
                <span>Cases reviewed</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Review clarity</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>Submit anytime</span>
              </div>
              <div>
                <strong>100%</strong>
                <span>Confidential</span>
              </div>
            </div>
          </div>
        </section>

        <div className="red-flag-strip" aria-live="polite">
          <strong>Red flag</strong>
          <span>{RED_FLAGS[activeFlag]}</span>
        </div>

        <section id="how" className="landing-section">
          <div className="section-inner">
            <div className="section-center">
              <span className="section-label">Simple process</span>
              <h2>Know the truth before you send money.</h2>
              <p>
                You do not need to be technical. Tell us what is happening, and we turn confusing signs into a clear risk report.
              </p>
            </div>
            <div className="steps-grid">
              {STEPS.map(([title, text], index) => (
                <article className="info-card" key={title}>
                  <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="types" className="landing-section">
          <div className="section-inner">
            <div className="section-center">
              <span className="section-label">Services</span>
              <h2>Built for the scams people actually face.</h2>
              <p>
                From romance messages to fake investment platforms, ScameHospital looks for the signals scammers use to gain trust.
              </p>
            </div>
            <div className="types-grid">
              {SCAM_TYPES.map(([title, text, color]) => (
                <article className="info-card" key={title}>
                  <div className="type-color" style={{ background: color }} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="evidence" className="landing-section">
          <div className="section-inner evidence-layout">
            <div>
              <span className="section-label">Evidence first</span>
              <h2>We show you why it looks suspicious.</h2>
              <p className="landing-hero-copy">
                The goal is not to scare you. The goal is to help you see the pattern clearly, protect yourself, and decide your next step.
              </p>
              <div className="check-list" style={{ marginTop: 28 }}>
                {[
                  ["Pattern review", "We compare the situation against common scam scripts and pressure tactics."],
                  ["Risk scoring", "You get a clear low, medium, or high risk assessment."],
                  ["Action guidance", "We explain what to stop, what to save, and what to avoid sharing."]
                ].map(([title, text]) => (
                  <div className="check-item" key={title}>
                    <span className="check-icon">✓</span>
                    <div>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="report-preview">
              <h3>Sample case report</h3>
              {[
                ["Risk level", "High"],
                ["Likely scam type", "Romance / crypto fraud"],
                ["Main warning", "Urgent money request"],
                ["Identity concern", "Avoids live verification"],
                ["Recommended step", "Do not send payment"]
              ].map(([label, value]) => (
                <div className="report-row" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <h2>If something feels off, check it before it costs you.</h2>
          <p>
            Start with a free case check. If the situation is serious, you can book a deeper consultation from the next page.
          </p>
          <button type="button" className="landing-button" onClick={onGetStarted}>
            Start Free Scam Check
          </button>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-inner">
          <span>© 2026 ScameHospital. Confidential scam review and support.</span>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
      </footer>
    </div>
  )
}
