import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from '../contexts/ModalContext';
import { useCart } from "../contexts/CartContext";
import { useTheme } from '../contexts/ThemeContext';
import MenuMitra from "../components/MenuMitra";
import defaultAvatar from "../assets/images/avatar/avatar-default.png"

function Profile() {
  const { handleLogout, user, isAuthenticated, setShowAuthOffcanvas } = useAuth();
  const { clearCart } = useCart();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const iconStyle = {
    color: isDarkMode ? '#fff' : 'var(--primary)',
    opacity: '0.7',
    minWidth: '20px'
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
          <div className="profile" onClick={!isAuthenticated ? handleLoginClick : undefined} style={!isAuthenticated ? { cursor: 'pointer' } : {}}>
            <div className="d-flex align-items-center mb-3">
              <div className="media media-70 me-3">
                <img src={defaultAvatar} alt="Profile" />
              </div>
              <div className="about-profile">
                <h5 className="sub-title mb-0">
                  {isAuthenticated ? user?.name : "Please login to continue"}
                </h5>
                <h6 className="sub-title fade-text mb-0 font-w500">
                  {isAuthenticated ? `+91 ${user?.mobile}` : "Login to view your details"}
                </h6>
              </div>
              {isAuthenticated && (
                <Link to="/edit-profile" className="edit-profile">
                  <i className="fa-solid fa-pencil" style={iconStyle} />
                </Link>
              )}
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
            <ul>
              <li>
                <Link to="/orders">
                  <i className="fa-solid fa-clock-rotate-left me-2" style={iconStyle} />
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/search">
                  <i className="fa-solid fa-magnifying-glass me-2" style={iconStyle} />
                  Search Menu
                </Link>
              </li>
              <li>
                <Link to="/savings">
                  <i className="fa-solid fa-piggy-bank me-2" style={iconStyle} />
                  Savings
                </Link>
              </li>
              {/* <li>
                <a href="review.html">
                  <i className="fa-solid fa-star" />
                  Ratings &amp; Review
                </a>
              </li> */}
              {/* <li>
                <a href="notification.html">
                  <i className="fa-solid fa-bell" />
                  Notification
                  <span className="badge badge-circle align-items-center badge-danger ms-auto me-3">
                    1
                  </span>
                </a>
              </li> */}
              {/* <li>
                <a
                  href="javascript:void(0);"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModalCenter"
                >
                  <i className="fa-solid fa-location-dot" />
                  Delivery Address
                </a>
              </li> */}
              {/* <li>
                <a href="blog.html">
                  <i className="fa-brands fa-microblog" />
                  Blog &amp; Blog Detail
                </a>
              </li> */}
              <li>
                <Link to="/all-outlets">
                  <i className="fa-solid fa-store me-2" style={iconStyle} />
                  All Outlets
                </Link>
              </li>
              <li className="border-0">
                {isAuthenticated ? (
                  <a href="#" onClick={onLogoutClick}>
                    <i className="fa-solid fa-power-off me-2" style={iconStyle} />
                    LogOut
                  </a>
                ) : (
                  <a href="#" onClick={handleLoginClick}>
                    <i className="fa-solid fa-right-to-bracket me-2" style={iconStyle} />
                    Login
                  </a>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <MenuMitra />
      </div>
      <Footer />
    </>
  );
}

export default Profile;
