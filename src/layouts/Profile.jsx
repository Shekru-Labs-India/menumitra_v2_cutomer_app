import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from '../contexts/ModalContext';
import { useCart } from "../contexts/CartContext";
import MenuMitra from "../components/MenuMitra";
import defaultAvatar from "../assets/images/avatar/avatar-default.png"

function Profile() {
  const { handleLogout, user, isAuthenticated, setShowAuthOffcanvas } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const { openModal } = useModal();

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
          <div className="profile">
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
                  <i className="fa-solid fa-pencil" />
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
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      minWidth: '20px',
                      color: 'var(--primary)',
                      opacity: '0.7'
                    }}
                  >
                    <path
                      d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                      fill="currentColor"
                    />
                    <path
                      d="M7 8H17M7 12H17M7 16H13"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/search">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="me-2"
                    style={{
                      minWidth: "20px",
                      color: "var(--primary)",
                      opacity: "0.7",
                    }}
                  >
                    {/* Main circle of magnifier */}
                    <path
                      d="M10.9395 3.9313C7.08074 3.9313 3.94141 7.07063 3.94141 10.9294C3.94141 14.7881 7.08074 17.9353 10.9395 17.9353C14.7982 17.9353 17.9395 14.7881 17.9395 10.9294C17.9395 7.07063 14.7982 3.9313 10.9395 3.9313Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* Handle of magnifier */}
                    <path
                      d="M16.5449 16.9606L20.293 20.7067C20.4821 20.888 20.7347 20.988 20.9967 20.9854C21.2587 20.9827 21.5093 20.8775 21.6947 20.6924C21.8801 20.5073 21.9856 20.2569 21.9886 19.9949C21.9917 19.7329 21.892 19.4802 21.7109 19.2908L17.9629 15.5427"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                  Search Menu
                </Link>
              </li>
              <li>
                <Link to="/savings">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="me-2"
                    style={{
                      minWidth: "20px",
                      color: "var(--primary)",
                      opacity: "0.7",
                    }}
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
                      fill="currentColor"
                    />
                    <path
                      d="M14.5 8.5H9.5C8.67 8.5 8 9.17 8 10V14C8 14.83 8.67 15.5 9.5 15.5H14.5C15.33 15.5 16 14.83 16 14V10C16 9.17 15.33 8.5 14.5 8.5ZM14 14H10V10H14V14Z"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                  <i className="fa-brands fa-microblog me-2" />
                  All Outlets
                </Link>
              </li>
              <li className="border-0">
                {isAuthenticated ? (
                  <a href="#" onClick={onLogoutClick}>
                    <i className="fa-solid fa-power-off" />
                    LogOut
                  </a>
                ) : (
                  <a href="#" onClick={handleLoginClick}>
                    <i className="fa-solid fa-sign-in-alt" />
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
