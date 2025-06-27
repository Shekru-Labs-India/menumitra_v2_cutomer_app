import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import TestEnvironmentBanner from "./TestEnvironmentBanner";
import OutletInfoBanner from "./OutletInfoBanner";
import { useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

function Header() {
  const mainBarRef = useRef(null);
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { isAuthenticated, user, setShowAuthOffcanvas, getUserName } =
    useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path === "/") return "MenuMitra";
    if (path.startsWith("/checkout")) return "Cart";
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/search")) return "Search";
    if (path.startsWith("/orders")) return "Orders";
    if (path.startsWith("/favourites")) return "Favourite";
    if (path.startsWith("/order-detail")) return "Order Details";
    if (path.startsWith("/all-outlets")) return "All Outlets" ;
    if (path.startsWith("/savings")) return "Savings" ;
    if (path.startsWith("/product/") || path.startsWith("/product-detail"))
 
      return "Product Details";
    return "";
  };

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
            <div className="header-content position-relative">
              {/* Left content: back arrow for non-home pages, logo+title for home */}
              <div className="left-content d-flex align-items-center gap-2">
                {location.pathname !== "/" && (
                  <button
                    className="btn btn-link p-0 me-2"
                    style={{ fontSize: 22, color: "#222" }}
                    onClick={() => navigate(-1)}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                )}
                {/* Logo and title for home page, left-aligned */}
                {location.pathname === "/" && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <img
                      src={logo}
                      alt="MenuMitra Logo"
                      style={{ height: 50, width: 50, marginRight: 0 }}
                    />
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#222",
                        letterSpacing: 0,
                        lineHeight: 1,
                      }}
                    >
                      MenuMitra
                    </span>
                  </div>
                )}
              </div>
              {/* Centered header title for all non-home pages */}
              {location.pathname !== "/" && getHeaderTitle() && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                  }}
                >
                  <h5 className="title mb-0 text-nowrap" style={{ margin: 0 }}>
                    {getHeaderTitle()}
                  </h5>
                </div>
              )}
              <div className="mid-content" />
              <div className="right-content d-flex align-items-center gap-2">
                <Link to="/search" className="header-icon">
                  <i className="fas fa-search"></i>
                </Link>
                <a
                  href="#"
                  className="menu-toggler ms-2"
                  onClick={toggleSidebar}
                >
                  <i className="fas fa-bars"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Sidebar isOpen={isOpen} onClose={closeSidebar} />
      {!shouldHideBanner() && <OutletInfoBanner />}
    </>
  );
}

export default Header;
