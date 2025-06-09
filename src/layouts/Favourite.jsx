import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VerticalMenuCard from "../components/VerticalMenuCard";
import { useAuth } from '../contexts/AuthContext';
import { useModal } from "../contexts/ModalContext";
import { useOutlet } from "../contexts/OutletContext";
import axios from "axios";

const API_BASE_URL = 'https://men4u.xyz/v2';

function Favourite() {
  const navigate = useNavigate();
  const [favoriteMenus, setFavoriteMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, setShowAuthOffcanvas } = useAuth();
  const { openModal } = useModal();
  const { outletId } = useOutlet();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const authData = localStorage.getItem("auth");
      const auth = authData ? JSON.parse(authData) : null;

      if (!auth || !auth.userId || !auth.accessToken) {
        setShowAuthOffcanvas(true);
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/user/get_favourite_list`,
        {
          outlet_id: outletId,
          user_id: auth.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const allMenus = [];
      if (response.data.detail?.lists) {
        Object.entries(response.data.detail.lists).forEach(([outletName, menus]) => {
          menus.forEach(menu => {
            allMenus.push({
              ...menu,
              outlet_name: outletName
            });
          });
        });
      }
      setFavoriteMenus(allMenus);

    } catch (err) {
      console.error("Error fetching favorites:", err);
      const errorMessage = err.response?.data?.detail || "Failed to connect to the server";
      setError(errorMessage);
      openModal("ERROR", {
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const navigateToMenus = () => {
    navigate('/');
  };

  // Add navigation handler for login
  const navigateToLogin = () => {
    if (!user) {
      setShowAuthOffcanvas(true);
      return;
    }
  };

  // Silent refresh function - no loading state
  const silentRefresh = async () => {
    try {
      const authData = localStorage.getItem("auth");
      const auth = authData ? JSON.parse(authData) : null;

      if (!auth || !auth.userId || !auth.accessToken) {
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/user/get_favourite_list`,
        {
          outlet_id: outletId,
          user_id: auth.userId,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const allMenus = [];
      if (response.data.detail?.lists) {
        Object.entries(response.data.detail.lists).forEach(([outletName, menus]) => {
          menus.forEach(menu => {
            allMenus.push({
              ...menu,
              outlet_name: outletName
            });
          });
        });
      }
      setFavoriteMenus(allMenus);
    } catch (err) {
      console.error("Error in silent refresh:", err);
    }
  };

  // Handle favorite update
  const handleFavoriteUpdate = async (menuId, isFavorite) => {
    if (!isFavorite) { // If item was removed
      // Remove item optimistically from UI first
      setFavoriteMenus(prev => prev.filter(menu => menu.menu_id !== menuId));
      // Then refresh the list silently
      await silentRefresh();
    }
  };

  // Check if user is not logged in
  if (!user) {
    return (
      <>
        <Header />
        <div className="page-content">
          <div className="content-inner pt-0">
            <div className="container p-b20">
              <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
                <div className="text-center">
                  <div className="mb-4">
                    <svg 
                      width="80" 
                      height="80" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      style={{ opacity: '0.5' }}
                      className="text-muted"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h5 className="mb-3">Please Login First</h5>
                  <p className="text-muted mb-4">Login to view and manage your favorite menus</p>
                  <button 
                    className="btn btn-primary" 
                    onClick={navigateToLogin}
                  >
                    Login Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="page-content">
          <div className="content-inner pt-0">
            <div className="container p-b20">
              <div
                className="d-flex flex-column justify-content-center align-items-center"
                style={{
                  minHeight: "60vh",
                  width: "100%",
                }}
              >
                {/* Error SVG Icon */}
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="12" fill="#f8f9fa" />
                  <path
                    d="M12 8v5M12 16h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    stroke="#adb5bd"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span
                  className="text-muted fs-5 mt-3 mb-2"
                  style={{ color: "#b0b3b8" }}
                >
                  Oops! Something went wrong
                </span>
                <p className="text-muted mb-4">Unable to fetch your favourite items</p>
                <button
                  className="btn btn-outline-success px-4 py-3"
                  style={{ borderRadius: 12, fontWeight: 500 }}
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="content-inner pt-0">
          <div className="container p-b20">
            <div className="dashboard-area">
              {/* <div className="title-bar">
                <span className="title mb-0 font-18">Favorite Items</span>
              </div> */}
              <div className="row g-3 mb-3">
                {favoriteMenus.length > 0 ? (
                  favoriteMenus.map((menu) => (
                    <div className="col-6" key={menu.menu_id}>
                      <VerticalMenuCard
                        image={
                          menu.image ? menu.image : <i className="fa-solid fa-utensils font-55 opacity-50 text-muted"></i>
                        }
                        title={menu.menu_name}
                        currentPrice={menu.portions?.[0]?.price || 0}
                        reviewCount={menu.rating ? parseFloat(menu.rating) : null}
                        isFavorite={true}
                        discount={menu.offer > 0 ? `${menu.offer}%` : null}
                        menuItem={{
                          menuId: menu.menu_id,
                          menuCatId: menu.menu_cat_id,
                          menuName: menu.menu_name,
                          menuFoodType: menu.menu_food_type,
                          categoryName: menu.category_name,
                          spicyIndex: menu.spicy_index,
                          portions: menu.portions,
                          rating: menu.rating,
                          offer: menu.offer,
                          isSpecial: menu.is_special,
                          isFavourite: true,
                          isActive: true,
                          image: menu.image,
                          outletName: menu.outlet_name,
                          outletId: menu.outlet_id
                        }}
                        onFavoriteUpdate={handleFavoriteUpdate}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
                    <div
                      className="d-flex flex-column justify-content-center align-items-center"
                      style={{
                        minHeight: "calc(100vh - 300px)",
                        width: "100%",
                      }}
                    >
                      {/* Heart SVG Icon */}
                      <svg 
                        width="80" 
                        height="80" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        style={{ opacity: '0.5' }}
                        className="text-muted"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <h5 className="mb-3">No Favourite Items</h5>
                      <p className="text-muted mb-4">You haven't added any menus to your favorites yet</p>
                      <button 
                        className="btn btn-primary" 
                        onClick={navigateToMenus}
                      >
                        Browse Menu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Favourite;
