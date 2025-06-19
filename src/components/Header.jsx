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
    if (path.startsWith("/checkout")) return "Checkout";
    if (path.startsWith("/profile")) return "Profile";
    if (path.startsWith("/orders")) return "Orders";
    if (path.startsWith("/favourites")) return "Favourite";
    if (path.startsWith("/order-detail")) return "Order Details";
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
              <div className="left-content d-flex align-items-center gap-2">
                {/* Logo removed as per user request */}
                {location.pathname !== "/" && (
                  <button
                    className="btn btn-link p-0 me-2"
                    style={{ fontSize: 22, color: "#222" }}
                    onClick={() => navigate(-1)}
                  >
                    <i className="fas fa-arrow-left"></i>
                  </button>
                )}
              </div>
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
              {/* Header title: left on home, center on others */}
              {getHeaderTitle() &&
                (location.pathname === "/" ? (
                  <h5
                    className="title mb-0 text-nowrap"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                    }}
                  >
                    {getHeaderTitle()}
                  </h5>
                ) : (
                  <h5
                    className="title mb-0 text-nowrap position-absolute w-100 text-center"
                    style={{
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      zIndex: 1,
                    }}
                  >
                    {getHeaderTitle()}
                  </h5>
                ))}
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
