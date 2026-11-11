import React, { useState } from "react";
import "../../../style/beta.css";

// Beta: small badge on every page, reminding testers this is a test version.
// Bottom left (inside the sidebar) on wide screens, top left elsewhere.
// Tapping it folds it down to just "BETA" or opens it (remembered for this browser tab).
const STORAGE_KEY = "betaBannerCollapsed";

// Wide landscape screens have the sidebar on the left, with room for the
// full badge at its bottom. Elsewhere the badge starts as just "BETA".
const WIDE_LAYOUT = "(min-width: 933px) and (orientation: landscape)";

const readCollapsed = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === "true";
  } catch {
    // Storage not available, fall back to the screen size
  }
  try {
    return !window.matchMedia(WIDE_LAYOUT).matches;
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
