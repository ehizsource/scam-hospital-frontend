import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import LandingPage from "./LandingPage.jsx";

function Root() {
  const [page, setPage] = useState("home");

  return page === "home" ? (
    <LandingPage onGetStarted={() => setPage("booking")} />
  ) : (
    <App onBack={() => setPage("home")} />
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
