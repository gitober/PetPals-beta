import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../user-context/hooks/UserContext";
import { API_CHANGE_EVENT } from "../apiChangeEvents";
import "../../../style/beta.css";

// Beta: list of things to try, ticked off automatically from what the tester has done.
const TASKS = [
  { key: "loggedIn", label: "Sign up or try the demo" },
  { key: "posted", label: "Share a post with a photo" },
  { key: "liked", label: "Like a post" },
  { key: "commented", label: "Leave a comment" },
  { key: "followed", label: "Follow another pet owner" },
  { key: "editedProfile", label: "Add a bio or profile picture" },
];

const HIDDEN_ON = ["/", "/login", "/signup", "/thank-you"];
// Backup check while nothing happens. Changes the tester makes trigger
// an instant refresh through API_CHANGE_EVENT instead.
const REFRESH_MS = 30000;
// Short pause after a change, so the server has saved it before we ask
const AFTER_CHANGE_MS = 300;

const TestChecklist = () => {
  const apiUrl = process.env.REACT_APP_API_URL || "/api";
  const location = useLocation();
  const { handleLogout } = useContext(UserContext);
  const [progress, setProgress] = useState(null);
  const [open, setOpen] = useState(true);

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

  if (hidden || !progress) return null;

  const doneCount = TASKS.filter((task) => progress[task.key]).length;
  const allDone = doneCount === TASKS.length;

  return (
    <aside className={`test-checklist${open ? "" : " test-checklist--closed"}`}>
      <button
        type="button"
        className="test-checklist__header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>Beta checklist</span>
        <span className="test-checklist__count">
          {doneCount}/{TASKS.length}
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
            <p className="test-checklist__hint">Ticks update on their own as you go.</p>
          )}
        </div>
      )}
    </aside>
  );
};

export default TestChecklist;
