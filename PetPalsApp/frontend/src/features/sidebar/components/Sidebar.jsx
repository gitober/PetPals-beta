import React, { useContext, useEffect, useRef } from "react";
import { UserContext } from "../../user-context/hooks/UserContext";
import "../../../style/search-bar.css";
import SlideMenu from "./SlideMenu";

const Sidebar = ({ openPopupPost }) => {
  const { handleLogout } = useContext(UserContext);
  const sidebarRef = useRef(null);
  const menuRef = useRef(null);

  // Size and place the paws between the links from the links' own size and
  // spacing, so they stay lined up on every screen size (the menu runs top to
  // bottom on wide screens and side by side on smaller ones)
  useEffect(() => {
    const fitPaws = () => {
      const menu = menuRef.current;
      const link = menu && menu.querySelector("li:not(.sidebar-paw) a");
      if (!link) return;
      const linkStyle = window.getComputedStyle(link);
      const fontSize = parseFloat(linkStyle.fontSize) || 20;
      const marginTop = parseFloat(linkStyle.marginTop) || 0;
      menu.style.setProperty("--paw-size", `${Math.round(fontSize * 0.55)}px`);
      menu.style.setProperty("--paw-shift", `${marginTop / 2}px`);
    };
    fitPaws();
    window.addEventListener("resize", fitPaws);
    return () => window.removeEventListener("resize", fitPaws);
  }, []);

  const paw = (
    <li className="sidebar-paw" aria-hidden="true">
      <i className="fas fa-paw"></i>
    </li>
  );

  return (
    <>
    <SlideMenu sidebarRef={sidebarRef} openPopupPost={openPopupPost} handleLogout={handleLogout} />
    <div className="sidebar" ref={sidebarRef} style={{ padding: 0, margin: 0 }}>
      <img srcSet="/img/navbar.png" alt="logo" />
      <ul ref={menuRef}>
        <li>
          <a href="/home">HOME</a>
        </li>
        {paw}
        <li>
          <a href="/profile">PROFILE</a>
        </li>
        {paw}
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openPopupPost();
            }}
          >
            POST
          </a>
        </li>
        {paw}
        <li>
          <a href="/settings">SETTINGS</a>
        </li>
      </ul>
      <div className="logout">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          Log Out
        </a>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
