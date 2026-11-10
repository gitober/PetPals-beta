import React, { useState } from "react";
import "../../../style/beta.css";

// Beta: small badge in the corner on every page, reminding testers this is a test version.
// Tapping it folds it down to just "BETA" (remembered for this browser tab).
const STORAGE_KEY = "betaBannerCollapsed";

const readCollapsed = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const BetaBanner = () => {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Storage not available, the badge just won't remember
    }
  };

  return (
    <button
      type="button"
      className={`beta-banner${collapsed ? " beta-banner--collapsed" : ""}`}
      onClick={toggle}
      aria-expanded={!collapsed}
      title={collapsed ? "Show beta info" : "Hide beta info"}
    >
      <span className="beta-banner__tag">BETA</span>
      {!collapsed && (
        <span className="beta-banner__text">
          Test version. Your account and posts are deleted when you log out.
        </span>
      )}
    </button>
  );
};

export default BetaBanner;
