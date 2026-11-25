import React, { useEffect, useState } from "react";
import "../../../style/slide-menu.css";

// On screen sizes where the sidebar sits at the top of the page and scrolls
// away, a menu button appears at the top right once the sidebar is out of
// view. It slides the menu in from the right, with a "Back to top" link.
// On wide screens the sidebar stays in place, so the button never shows.
const SlideMenu = ({ sidebarRef, openPopupPost, handleLogout }) => {
  const [sidebarOutOfView, setSidebarOutOfView] = useState(false);
  const [sidebarFixed, setSidebarFixed] = useState(true);
  const [open, setOpen] = useState(false);

  // Is the sidebar fixed in place on this screen size?
  useEffect(() => {
    const checkLayout = () => {
      const sidebar = sidebarRef.current;
      if (!sidebar) return;
      setSidebarFixed(window.getComputedStyle(sidebar).position === "fixed");
    };
    checkLayout();
    window.addEventListener("resize", checkLayout);
    return () => window.removeEventListener("resize", checkLayout);
  }, [sidebarRef]);

  // Has the sidebar scrolled out of view?
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setSidebarOutOfView(!entry.isIntersecting);
    });
    observer.observe(sidebar);
    return () => observer.disconnect();
  }, [sidebarRef]);

  const showButton = !sidebarFixed && sidebarOutOfView;

  // Close with Escape, and close if the button goes away (scrolled back up)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!showButton) setOpen(false);
  }, [showButton]);

  const close = () => setOpen(false);

  const backToTop = () => {
    close();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!showButton && !open) return null;

  return (
    <>
      <button
        type="button"
        className="slide-menu-button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
      >
        <i className="fas fa-bars" aria-hidden="true"></i>
      </button>

      <div
        className={`slide-menu-overlay${open ? " slide-menu-overlay--open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      <nav
        className={`slide-menu-panel${open ? " slide-menu-panel--open" : ""}`}
        aria-label="Menu"
        aria-hidden={!open}
      >
        <button type="button" className="slide-menu-close" onClick={close} aria-label="Close menu">
          ×
        </button>
        <ul>
          <li><a href="/home" tabIndex={open ? 0 : -1}>HOME</a></li>
          <li><a href="/profile" tabIndex={open ? 0 : -1}>PROFILE</a></li>
          <li>
            <button
              type="button"
              className="slide-menu-link"
              tabIndex={open ? 0 : -1}
              onClick={() => {
                close();
                openPopupPost();
              }}
            >
              POST
            </button>
          </li>
          <li><a href="/settings" tabIndex={open ? 0 : -1}>SETTINGS</a></li>
        </ul>
        <button type="button" className="slide-menu-top" onClick={backToTop} tabIndex={open ? 0 : -1}>
          ↑ Back to top
        </button>
        <button
          type="button"
          className="slide-menu-logout"
          tabIndex={open ? 0 : -1}
          onClick={() => {
            close();
            handleLogout();
          }}
        >
          Log Out
        </button>
      </nav>
    </>
  );
};

export default SlideMenu;
