import React from "react";
import { Link } from "react-router-dom";
import "../style/beta.css";

// Beta: shown after a tester logs out and their test account has been removed
function ThankYou() {
  return (
    <div className="thank-you-page">
      <div className="thank-you-card">
        <img src="/img/navbar.png" alt="PetPals logo" className="thank-you-logo" />
        <h1>Thank you for visiting the PetPals beta 🐾</h1>
        <p>
          It was great having you here. Your test account and everything you posted have now
          been deleted, so nothing is left behind.
        </p>
        <Link to="/login" className="thank-you-button">
          Back to the start
        </Link>
      </div>
    </div>
  );
}

export default ThankYou;
