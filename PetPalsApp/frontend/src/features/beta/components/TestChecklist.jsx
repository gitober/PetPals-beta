import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../user-context/hooks/UserContext";
import { API_CHANGE_EVENT } from "../apiChangeEvents";
import "../../../style/beta.css";

// Beta: list of things to try, ticked off automatically from what the tester has done.
const TASKS = [
  { key: "loggedIn", label: "Try the demo" },
  { key: "posted", label: "Share a post with a photo" },
  { key: "liked", label: "Like a post" },
  { key: "commented", label: "Leave a comment" },
  { key: "followed", label: "Follow another pet owner" },
  { key: "editedProfile", label: "Add a bio or profile picture" },
];

const HIDDEN_ON = ["/", "/login", "/signup", "/thank-you", "/privacy"];
// The checklist starts open after logging in, on every screen size, so no
// tester misses it. If they fold it down, that choice is remembered for the
// rest of the visit (cleared again on the next login, see useLogin.js).
export const CHECKLIST_OPEN_KEY = "demoChecklistOpen";
// How long the folded bar pulses after a new tick
const PULSE_MS = 1600;

const startsOpen = () => {
  try {
    const saved = sessionStorage.getItem(CHECKLIST_OPEN_KEY);
    if (saved !== null) return saved === "true";
  } catch {
    // Storage not available, just start open
  }
  return true;
};
// Backup check while nothing happens. Changes the tester makes trigger
// an instant refresh through API_CHANGE_EVENT instead.
const REFRESH_MS = 30000;
// Short pause after a change, so the server has saved it before we ask
const AFTER_CHANGE_MS = 300;

const TestChecklist = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "/api";
  const location = useLocation();
  const { handleLogout } = useContext(UserContext);
  const [progress, setProgress] = useState(null);
  const [open, setOpenState] = useState(startsOpen);
  const [pulse, setPulse] = useState(false);
  const previousDone = useRef(null);

  const setOpen = (next) => {
    setOpenState(next);
    try {
      sessionStorage.setItem(CHECKLIST_OPEN_KEY, String(next));
    } catch {
      // Storage not available, the choice just won't be remembered
    }
  };

  const hidden = HIDDEN_ON.includes(location.pathname);

  const fetchProgress = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const response = await fetch(`${apiUrl}/users/me/progress`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        setProgress(await response.json());
      }
    } catch (error) {
      console.error("Could not load test checklist:", error);
    }
  }, [apiUrl]);

  // Refresh on every page change, right after the tester changes something,
  // when the tab comes back into view, and every 30 seconds as a backup
  useEffect(() => {
    if (hidden) return undefined;

    let changeTimer;
    const onChange = () => {
      clearTimeout(changeTimer);
      changeTimer = setTimeout(fetchProgress, AFTER_CHANGE_MS);
    };

    fetchProgress();
    const timer = setInterval(fetchProgress, REFRESH_MS);
    window.addEventListener("focus", fetchProgress);
    window.addEventListener(API_CHANGE_EVENT, onChange);

    return () => {
      clearInterval(timer);
      clearTimeout(changeTimer);
      window.removeEventListener("focus", fetchProgress);
      window.removeEventListener(API_CHANGE_EVENT, onChange);
    };
  }, [hidden, location.pathname, fetchProgress]);

  const doneCount = progress ? TASKS.filter((task) => progress[task.key]).length : 0;

  // A new tick while the list is folded: make the bar pulse so it's noticed
  useEffect(() => {
    if (!progress) return undefined;
    const before = previousDone.current;
    previousDone.current = doneCount;
    if (before === null || doneCount <= before || open) return undefined;

    setPulse(true);
    const timer = setTimeout(() => setPulse(false), PULSE_MS);
    return () => clearTimeout(timer);
  }, [doneCount, progress, open]);

  if (hidden || !progress) return null;

  const allDone = doneCount === TASKS.length;

  return (
    <aside
      className={`test-checklist${open ? "" : " test-checklist--closed"}${
        pulse ? " test-checklist--pulse" : ""
      }`}
    >
      <button
        type="button"
        className="test-checklist__header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title={open ? "Hide the checklist" : "Show the checklist"}
      >
        <span>Demo checklist</span>
        <span className="test-checklist__header-right">
          <span className="test-checklist__count">
            {doneCount}/{TASKS.length}
          </span>
          <span className="test-checklist__arrow" aria-hidden="true">
            {open ? "▾" : "▴"}
          </span>
        </span>
      </button>

      {open && (
        <div className="test-checklist__body">
          <ul>
            {TASKS.map((task) => (
              <li key={task.key} className={progress[task.key] ? "done" : ""}>
                <span className="test-checklist__box" aria-hidden="true">
                  {progress[task.key] ? "✓" : ""}
                </span>
                {task.label}
              </li>
            ))}
          </ul>

          {allDone ? (
            <div className="test-checklist__finish">
              <p>All done, thank you! Log out to finish and delete your test account.</p>
              <button type="button" onClick={handleLogout}>
                Finish and log out
              </button>
            </div>
          ) : (
            <>
              <p className="test-checklist__hint">Ticks update on their own as you go.</p>
              <p className="test-checklist__hint test-checklist__hint--fold">
                Tap the bar to hide or show this list.
              </p>
              <p className="test-checklist__hint">
                <a href="/privacy" className="test-checklist__privacy">Privacy notice</a>
              </p>
            </>
          )}
        </div>
      )}
    </aside>
  );
};

export default TestChecklist;
