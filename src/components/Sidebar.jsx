import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useTheme } from '../contexts/ThemeContext'
import { useThemeColor } from '../contexts/ThemeColorContext'
import '../assets/css/style.css'
import ThemeColorOffcanvas from './ThemeColorOffcanvas'

function Sidebar() {
    const { isOpen, closeSidebar } = useSidebar();
    const { user, isAuthenticated } = useAuth();
    const { getCartCount } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const { showThemeColorOffcanvas, toggleThemeColorOffcanvas } = useThemeColor();
    const cartCount = getCartCount();
    const location = useLocation();

    const handleLinkClick = () => {
        closeSidebar();
    };

    const isOrderRoute = () => {
        const pathname = location.pathname;
        return pathname === '/orders' || 
               pathname.startsWith('/orders/') || 
               pathname.startsWith('/order-detail/');
    };

    const isProfileRoute = () => {
        const pathname = location.pathname;
        return pathname === '/profile' || 
               pathname.startsWith('/profile/') || 
               pathname === '/edit-profile';
    };

    return (
      <div className={`sidebar style-2${isOpen ? ' show' : ''}`} >
        {isAuthenticated && (
          <div className="user-info p-3 border-bottom">
            <div className="d-flex align-items-center mb-2">
              <div className="avatar-lg me-3">
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="rounded-circle"
                    style={{ width: 60, height: 60, objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                    style={{ width: 60, height: 60, fontSize: '24px' }}
                  >
                    {user?.name?.charAt(0) || 'U'}
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
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
          end
        >
          {({ isActive }) => (
            <>
              <span className="dz-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill={isActive ? '#ffffff' : 'currentColor'}
                >
                  <path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z" />
                </svg>
              </span>
              <span>Home</span>
            </>
          )}
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/favourites"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              enableBackground="new 0 0 512.001 512.001"
              height="24px"
              viewBox="0 0 512.001 512.001"
              width="24px"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m256.001 477.407c-2.59 0-5.179-.669-7.499-2.009-2.52-1.454-62.391-36.216-123.121-88.594-35.994-31.043-64.726-61.833-85.396-91.513-26.748-38.406-40.199-75.348-39.982-109.801.254-40.09 14.613-77.792 40.435-106.162 26.258-28.848 61.3-44.734 98.673-44.734 47.897 0 91.688 26.83 116.891 69.332 25.203-42.501 68.994-69.332 116.891-69.332 35.308 0 68.995 14.334 94.859 40.362 28.384 28.563 44.511 68.921 44.247 110.724-.218 34.393-13.921 71.279-40.728 109.632-20.734 29.665-49.426 60.441-85.279 91.475-60.508 52.373-119.949 87.134-122.45 88.588-2.331 1.354-4.937 2.032-7.541 2.032z" />
            </svg>
          </span>
          <span>Favourites</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/checkout"
          className={({ isActive }) => 
            `nav-link position-relative ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 456.569 456.569"
              width="24px"
            >
              <path d="M345.805 339.465c-29.323-.028-53.117 23.72-53.146 53.043s23.72 53.117 53.043 53.146 53.117-23.72 53.146-53.043v-.051c-.028-29.292-23.752-53.038-53.043-53.095zm94.171-254.244a20.44 20.44 0 0 0-3.855-.373H112.845l-5.12-34.253c-3.19-22.748-22.648-39.673-45.619-39.68H20.48C9.169 10.915 0 20.084 0 31.395s9.169 20.48 20.48 20.48h41.677a5.12 5.12 0 0 1 5.12 4.506l31.539 216.166c4.324 27.468 27.951 47.732 55.757 47.821h213.043c26.771.035 49.866-18.78 55.245-45.005l33.331-166.144c2.149-11.105-5.111-21.849-16.216-23.998zM215.737 390.286c-1.247-28.463-24.737-50.869-53.228-50.77h0c-29.299 1.184-52.091 25.896-50.907 55.195 1.136 28.113 24.005 50.458 52.136 50.943h1.28c29.295-1.284 52.002-26.073 50.719-55.368z" />
            </svg>
          </span>
          <span>Cart</span>
          {cartCount > 0 && (
            <span
              className="position-absolute badge rounded-pill"
              style={{
                top: "0",
                right: "0",
                fontSize: "0.6rem",
                backgroundColor: "#dc3545",
                color: "white",
                padding: "0.25rem 0.5rem",
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
            `nav-link ${isOrderRoute() ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                fill="#130F26"
              />
              <path
                d="M7 8H17M7 12H17M7 16H13"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span>Orders</span>
        </NavLink>
      </li>
      {/* <li>
        <NavLink
          to="/package"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <path d="M12.6 18.06c-.36.28-.87.28-1.23 0l-6.15-4.78c-.36-.28-.86-.28-1.22 0-.51.4-.51 1.17 0 1.57l6.76 5.26c.72.56 1.73.56 2.46 0l6.76-5.26c.51-.4.51-1.17 0-1.57l-.01-.01c-.36-.28-.86-.28-1.22 0l-6.15 4.79zm.63-3.02l6.76-5.26c.51-.4.51-1.18 0-1.58l-6.76-5.26c-.72-.56-1.73-.56-2.46 0L4.01 8.21c-.51.4-.51 1.18 0 1.58l6.76 5.26c.72.56 1.74.56 2.46-.01z" />
            </svg>
          </span>
          <span>Package</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/pages"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <path d="M12.6 18.06c-.36.28-.87.28-1.23 0l-6.15-4.78c-.36-.28-.86-.28-1.22 0-.51.4-.51 1.17 0 1.57l6.76 5.26c.72.56 1.73.56 2.46 0l6.76-5.26c.51-.4.51-1.17 0-1.57l-.01-.01c-.36-.28-.86-.28-1.22 0l-6.15 4.79zm.63-3.02l6.76-5.26c.51-.4.51-1.18 0-1.58l-6.76-5.26c-.72-.56-1.73-.56-2.46 0L4.01 8.21c-.51.4-.51 1.18 0 1.58l6.76 5.26c.72.56 1.74.56 2.46-.01z" />
            </svg>
          </span>
          <span>Pages</span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/ui-components"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
            </svg>
          </span>
          <span>Components</span>
        </NavLink>
      </li> */}
      {isAuthenticated && (
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) => 
              `nav-link ${isProfileRoute() ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
            }
            onClick={handleLinkClick}
          >
            <span className="dz-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 0 24 24"
                width="24px"
                fill="#000000"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <span>Profile</span>
          </NavLink>
        </li>
      )}
      {/* <li>
        <NavLink
          to="/chat"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM7 9h10c.55 0 1 .45 1 1s-.45 1-1 1H7c-.55 0-1-.45-1-1s.45-1 1-1zm6 5H7c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1zm4-6H7c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z" />
            </svg>
          </span>
          <span>Chat</span>
          <span className="badge badge-circle badge-info">5</span>
        </NavLink>
      </li> */}
      <li>
        <NavLink
          to="/logout"
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active bg-success text-white fw-bold px-2 rounded-5' : ''}`
          }
          onClick={handleLinkClick}
        >
          <span className="dz-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              enableBackground="new 0 0 24 24"
              height="24px"
              viewBox="0 0 24 24"
              width="24px"
              fill="#000000"
            >
              <g />
              <g>
                <g>
                  <path d="M5,5h6c0.55,0,1-0.45,1-1v0c0-0.55-0.45-1-1-1H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h6c0.55,0,1-0.45,1-1v0 c0-0.55-0.45-1-1-1H5V5z" />
                  <path d="M20.65,11.65l-2.79-2.79C17.54,8.54,17,8.76,17,9.21V11h-7c-0.55,0-1,0.45-1,1v0c0,0.55,0.45,1,1,1h7v1.79 c0,0.45,0.54,0.67,0.85,0.35l2.79-2.79C20.84,12.16,20.84,11.84,20.65,11.65z" />
                </g>
              </g>
            </svg>
          </span>
          <span>Logout</span>
        </NavLink>
      </li>
      <li className="nav-label">Settings</li>
  
      <li>
        <div className="mode">
          <div className="nav-link d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span className="dz-icon me-2">
                {isDarkMode ? (
                  <svg
                    className="light"
                    xmlns="http://www.w3.org/2000/svg"
                    enableBackground="new 0 0 24 24"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="#ffffff"
                  >
                    <rect fill="none" height={24} width={24} />
                    <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0 c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2 c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1 C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06 c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41 l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41 c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36 c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z" />
                  </svg>
                ) : (
                  <svg
                    className="dark"
                    xmlns="http://www.w3.org/2000/svg"
                    enableBackground="new 0 0 24 24"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="#000000"
                  >
                    <g />
                    <g>
                      <g>
                        <g>
                          <path d="M11.57,2.3c2.38-0.59,4.68-0.27,6.63,0.64c0.35,0.16,0.41,0.64,0.1,0.86C15.7,5.6,14,8.6,14,12s1.7,6.4,4.3,8.2 c0.32,0.22,0.26,0.7-0.09,0.86C16.93,21.66,15.5,22,14,22c-6.05,0-10.85-5.38-9.87-11.6C4.74,6.48,7.72,3.24,11.57,2.3z" />
                        </g>
                      </g>
                    </g>
                  </svg>
                )}
              </span>
              {/* <span className={isDarkMode ? "text-white" : "text-dark"}>Dark Mode</span> */}
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
    <div className="sidebar-bottom">
      <h6 className="name">MenuMitra</h6>
      <span className="ver-info">App Version 1.0</span>
    </div>
    <ThemeColorOffcanvas 
      show={showThemeColorOffcanvas} 
      onClose={() => toggleThemeColorOffcanvas(false)} 
    />
  </div>
    )
}

export default Sidebar