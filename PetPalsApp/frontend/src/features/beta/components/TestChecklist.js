import React, { useCallback, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../user-context/hooks/UserContext";
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
const REFRESH_MS = 8000;

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

  // Refresh on every page change, every few seconds, and when the tab comes back into view
  useEffect(() => {
    if (hidden) return undefined;

    fetchProgress();
    const timer = setInterval(fetchProgress, REFRESH_MS);
    window.addEventListener("focus", fetchProgress);

    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", fetchProgress);
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
