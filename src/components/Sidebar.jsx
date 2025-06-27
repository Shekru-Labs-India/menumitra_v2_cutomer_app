import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import { useThemeColor } from "../contexts/ThemeColorContext";
import "../assets/css/style.css";
import ThemeColorOffcanvas from "./ThemeColorOffcanvas";
import MenuMitra from "./MenuMitra";
import axios from "axios";
import FeedbackButton from "./FeedbackButton";

function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar();
  const { user, isAuthenticated, handleLogout } = useAuth();
  const { getCartCount, clearCart } = useCart();
  const { isDarkMode, toggleTheme } = useTheme();
  const { showThemeColorOffcanvas, toggleThemeColorOffcanvas } =
    useThemeColor();
  const cartCount = getCartCount();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLinkClick = () => {
    closeSidebar();
  };

  const isOrderRoute = () => {
    const pathname = location.pathname;
    return (
      pathname === "/orders" ||
      pathname.startsWith("/orders/") ||
      pathname.startsWith("/order-detail/")
    );
  };

  const isProfileRoute = () => {
    const pathname = location.pathname;
    return (
      pathname === "/profile" ||
      pathname.startsWith("/profile/") ||
      pathname === "/edit-profile"
    );
  };

  const onLogoutClick = (e) => {
    e.preventDefault();
    clearCart();
    handleLogout();
    console.log("Logout successful, attempting navigation to /");
    setTimeout(() => {
      navigate("/");
    }, 0);
  };

  return (
    <div className={`sidebar style-2 right${isOpen ? " show" : ""}`}>
      {isAuthenticated && (
        <div className="user-info p-3 border-bottom">
          <div className="d-flex align-items-center mb-2">
            <div className="avatar-lg me-3">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="rounded-circle"
                  style={{ width: 60, height: 60, objectFit: "cover" }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                  style={{ width: 60, height: 60, fontSize: "24px" }}
                >
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h6 className="mb-1 text-dark">{user?.name}</h6>
              <small className="text-muted">{user?.mobile}</small>
            </div>
          </div>
        </div>
      )}
      {/* <a href="index.html" className="side-menu-logo">
          <img src="assets/images/logo-sidebar.svg" alt="logo" />
        </a> */}
      <ul className="nav navbar-nav">
        {/* <li className="nav-label">Main Menu</li> */}
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive
                  ? "active bg-success text-white fw-bold px-2 rounded-5"
                  : ""
              }`
            }
            onClick={handleLinkClick}
            end
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-utensils"></i>
            </span>
            <span>Menu</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive
                  ? "active bg-success text-white fw-bold px-2 rounded-5"
                  : ""
              }`
            }
            onClick={handleLinkClick}
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-list"></i>
            </span>
            <span>Category</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/search"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive
                  ? "active bg-success text-white fw-bold px-2 rounded-5"
                  : ""
              }`
            }
            onClick={handleLinkClick}
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-magnifying-glass"></i>
            </span>
            <span>Search</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/favourites"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive
                  ? "active bg-success text-white fw-bold px-2 rounded-5"
                  : ""
              }`
            }
            onClick={handleLinkClick}
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-heart"></i>
            </span>
            <span>Favourites</span>
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/checkout"
            className="sidebar-link d-flex align-items-center"
            onClick={handleLinkClick}
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-shopping-cart"></i>
            </span>
            <span>Cart</span>
            {cartCount > 0 && (
              <span
                className="badge rounded-circle ms-auto"
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  minWidth: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.75rem",
                  marginLeft: "auto",
                }}
              >
                {cartCount}
              </span>
            )}
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isOrderRoute()
                  ? "active bg-success text-white fw-bold px-2 rounded-5"
                  : ""
              }`
            }
            onClick={handleLinkClick}
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-clock-rotate-left"></i>
            </span>
            <span>Orders</span>
          </NavLink>
        </li>

        {isAuthenticated && (
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `nav-link d-flex align-items-center ${
                  isProfileRoute()
                    ? "active bg-success text-white fw-bold px-2 rounded-5"
                    : ""
                }`
              }
              onClick={handleLinkClick}
            >
              <span className="dz-icon d-flex align-items-center justify-content-center me-2">
                <i className="fa-solid fa-user"></i>
              </span>
              <span>Profile</span>
            </NavLink>
          </li>
        )}

        <li>
          <NavLink
            to="/logout"
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${
                isActive
                  ? "active bg-success text-white fw-bold px-2 rounded-5"
                  : ""
              }`
            }
            onClick={onLogoutClick}
          >
            <span className="dz-icon d-flex align-items-center justify-content-center me-2">
              <i className="fa-solid fa-power-off font_sie_14"></i>
            </span>
            <span>Logout</span>
          </NavLink>
        </li>
        <li className="mt-2 mb-2 d-flex justify-content-center">
          <FeedbackButton />
        </li>
        <li className="nav-label">Settings</li>

        <li>
          <div className="mode">
            <div className="nav-link d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <span className="dz-icon me-2">
                  {isDarkMode ? (
                    <i class="fa-solid fa-sun"></i>
                  ) : (
                    <i class="fa-solid fa-moon"></i>
                  )}
                </span>
              </div>
              <div className="custom-switch">
                <input
                  type="checkbox"
                  className="switch-input theme-btn"
                  id="toggle-dark-menu"
                  checked={isDarkMode}
                  onChange={toggleTheme}
                />
                <label
                  className="custom-switch-label"
                  htmlFor="toggle-dark-menu"
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
      {/* <a
      href="javascript:void(0);"
      onClick={() => alert('Delete Cookie clicked!')}
      className="btn btn-primary btn-sm cookie-btn"
    >
      Delete Cookie
    </a> */}
      <MenuMitra />
      <ThemeColorOffcanvas
        show={showThemeColorOffcanvas}
        onClose={() => toggleThemeColorOffcanvas(false)}
      />
    </div>
  );
}

export default Sidebar;
