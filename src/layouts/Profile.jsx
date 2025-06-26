import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { useCart } from "../contexts/CartContext";
import { useTheme } from "../contexts/ThemeContext";
import MenuMitra from "../components/MenuMitra";
import defaultAvatar from "../assets/images/avatar/avatar-default.png";

function Profile() {
  const { handleLogout, user, isAuthenticated, setShowAuthOffcanvas } =
    useAuth();
  const { clearCart } = useCart();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const iconStyle = {
    color: "#000",
    opacity: "0.7",
    minWidth: "20px",
  };

  const onLogoutClick = (e) => {
    e.preventDefault();
    clearCart();
    handleLogout();
    navigate("/");
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    setShowAuthOffcanvas(true);
  };

  return (
    <>
      <Header />
      <div className="page-content bottom-content ">
        <div className="container profile-area">
          <div
            className="profile"
            onClick={!isAuthenticated ? handleLoginClick : undefined}
            style={!isAuthenticated ? { cursor: "pointer" } : {}}
          >
            <div className="d-flex align-items-center mb-0">
              {/* <div className="media media-70 me-3">
                <img src={defaultAvatar} alt="Profile" />
              </div> */}
              <div className="about-profile">
                <h5 className="sub-title mb-0">
                  {isAuthenticated ? `Hello, ${user?.name}` : "Hello User"}
                </h5>
                {/* {isAuthenticated && (
                  <h6 className="sub-title fade-text mb-0 font-w500">
                    {isAuthenticated
                      ? `+91 ${user?.mobile}`
                      : "Login to view your details"}
                  </h6>
                )} */}
              </div>
            </div>
            {/* <div className="location-box">
              <i className="location fa-solid fa-location-dot" />
              <div className="flex-1">
                <h6 className="text-white font-w400 mb-0">324002</h6>
                <h6 className="text-white font-w400 mb-0">UK - 324002</h6>
              </div>
              <a href="javascript:void(0);" className="change-btn">
                Change
              </a>
            </div> */}
          </div>
          <div className="profile-content border-0">
            <div className="row g-2">
              <div className="col-6">
                <Link
                  to="/orders"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-clock-rotate-left me-2 text-dark" />
                  My Orders
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/search"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-magnifying-glass me-2 text-dark" />
                  Search
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/savings"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-piggy-bank me-2 text-dark" />
                  Savings
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/all-outlets"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-store me-2 text-dark" />
                  All Outlets
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/menu"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-utensils me-2 text-dark" />
                  Menu
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/categories"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-list me-2 text-dark" />
                  Category
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/favourites"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-heart me-2 text-dark" />
                  Favourites
                </Link>
              </div>
              <div className="col-6">
                <Link
                  to="/checkout"
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                >
                  <i className="fa-solid fa-shopping-cart me-2 text-dark" />
                  Cart
                </Link>
              </div>
              {/* <div className="col-6">
                {isAuthenticated ? (
                  <button
                    onClick={onLogoutClick}
                    className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                  >
                    <i className="fa-solid fa-power-off me-2 text-dark" />
                    LogOut
                  </button>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="btn btn-light w-100 d-flex align-items-center justify-content-center py-3"
                  >
                    <i className="fa-solid fa-right-to-bracket me-2 text-dark" />
                    Login
                  </button>
                )}
              </div> */}
            </div>
          </div>
          <div className="account-section mt-4">
            <h5 className="mb-3">Account</h5>
            <ul>
              <li>
                <Link to="/edit-profile">
                  <i className="fa-solid fa-user me-2" style={iconStyle} />
                  Edit Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-center my-4">
      <a
    href="#"
    onClick={onLogoutClick}
    style={{
      color: "#000",
      fontWeight: 500,
      fontSize: 17,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    }}
  >
    <i className="fa-solid fa-power-off" style={{ fontSize: 16 }} />
    Logout
  </a>
        <MenuMitra />
      </div>
      <Footer />
    </>
  );
}

export default Profile;
