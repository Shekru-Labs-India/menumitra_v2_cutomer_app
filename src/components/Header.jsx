import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";
import TestEnvironmentBanner from "./TestEnvironmentBanner";
import OutletInfoBanner from "./OutletInfoBanner";
import { useLocation } from "react-router-dom";

function Header() {
  const mainBarRef = useRef(null);
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { isAuthenticated, user, setShowAuthOffcanvas, getUserName } =
    useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [userName, setUserName] = useState("");

  // Function to check if current route is profile related
  const isProfileRoute = () => {
    const pathname = location.pathname;
    return (
      pathname === "/profile" ||
      pathname.startsWith("/profile/") ||
      pathname === "/edit-profile"
    );
  };

  // Function to check if banner should be hidden
  const shouldHideBanner = () => {
    return (
      location.pathname.includes("/all-outlets") ||
      location.pathname.includes("/outlet-details") ||
      isProfileRoute()
    );
  };

  // Move username initialization to a separate useEffect with empty dependency array
  useEffect(() => {
    setUserName(getUserName());
  }, []); // This will run only once when component mounts

  // Keep scroll handler in separate useEffect
  useEffect(() => {
    const handleScroll = () => {
      if (!mainBarRef.current) return;

      if (window.scrollY > 50) {
        mainBarRef.current.classList.add("sticky-header");
      } else {
        mainBarRef.current.classList.remove("sticky-header");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array since it doesn't depend on any props or state

  return (
    <>
      <TestEnvironmentBanner />
      {/* Overlay always rendered, class toggled by isOpen */}
      <div
        className={`dark-overlay${isOpen ? " active" : ""}`}
        onClick={closeSidebar}
      ></div>
      {/* <Sidebar /> */}
      {/* Sidebar always rendered, class toggled by isOpen for smooth animation */}
      <header className="header">
        <div className="main-bar" ref={mainBarRef}>
          <div className="container">
            <div className="header-content">
              <div className="left-content">
                <a
                  href="#"
                  className="menu-toggler me-2"
                  onClick={toggleSidebar}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3.5 7C3.5 6.44772 3.94772 6 4.5 6H19.5C20.0523 6 20.5 6.44772 20.5 7C20.5 7.55228 20.0523 8 19.5 8H4.5C3.94772 8 3.5 7.55228 3.5 7ZM3.5 12C3.5 11.4477 3.94772 11 4.5 11H19.5C20.0523 11 20.5 11.4477 20.5 12C20.5 12.5523 20.0523 13 19.5 13H4.5C3.94772 13 3.5 12.5523 3.5 12ZM3.5 17C3.5 16.4477 3.94772 16 4.5 16H19.5C20.0523 16 20.5 16.4477 20.5 17C20.5 17.5523 20.0523 18 19.5 18H4.5C3.94772 18 3.5 17.5523 3.5 17Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
                <h5 className="title mb-0 text-nowrap">MenuMitra</h5>
              </div>
              <div className="mid-content" />
              <div className="right-content">{userName}</div>
            </div>
          </div>
        </div>
      </header>
      {!shouldHideBanner() && <OutletInfoBanner />}
    </>
  );
}

export default Header;
