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

  // Modify the useEffect to get first name
  useEffect(() => {
    const fullName = getUserName();
    const firstName = fullName?.split(" ")[0];
    setUserName(firstName);
  }, []);

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
                  <i className="fas fa-bars"></i>
                </a>
                <h5 className="title mb-0 text-nowrap">MenuMitra</h5>
              </div>
              <div className="mid-content" />
              <div className="right-content">
                <Link to="/search" className="header-icon">
                  <i className="fas fa-search"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      {!shouldHideBanner() && <OutletInfoBanner />}
    </>
  );
}

export default Header;
