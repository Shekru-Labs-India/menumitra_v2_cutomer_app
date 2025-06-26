import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VerticalMenuCard from "../components/VerticalMenuCard";
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import { useAuth } from "../contexts/AuthContext";
import { useModal } from "../contexts/ModalContext";
import { useOutlet } from "../contexts/OutletContext";
import axios from "axios";

const API_BASE_URL = "https://men4u.xyz/v2";

function Favourite() {
  const navigate = useNavigate();
  const [favoriteMenus, setFavoriteMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, setShowAuthOffcanvas } = useAuth();
  const { openModal } = useModal();
  const { outletId } = useOutlet();
  const [expanded, setExpanded] = useState({});
  const [expandedOutlet, setExpandedOutlet] = useState({});

  const loadFavorites = async () => {
    try {
      setLoading(true);

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
        Object.entries(response.data.detail.lists).forEach(
          ([outletName, menus]) => {
            menus.forEach((menu) => {
              allMenus.push({
                ...menu,
                outlet_name: outletName,
              });
            });
          }
        );
      }
      setFavoriteMenus(allMenus);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setFavoriteMenus([]);
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
    navigate("/");
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
        Object.entries(response.data.detail.lists).forEach(
          ([outletName, menus]) => {
            menus.forEach((menu) => {
              allMenus.push({
                ...menu,
                outlet_name: outletName,
              });
            });
          }
        );
      }
      setFavoriteMenus(allMenus);
    } catch (err) {
      console.error("Error in silent refresh:", err);
    }
  };

  // Handle favorite update
  const handleFavoriteUpdate = async (menuId, isFavorite) => {
    if (!isFavorite) {
      // If item was removed
      // Remove item optimistically from UI first
      setFavoriteMenus((prev) =>
        prev.filter((menu) => menu.menu_id !== menuId)
      );
      // Then refresh the list silently
      await silentRefresh();
    }
  };

  const groupByOutlet = (menus) => {
    return menus.reduce((acc, menu) => {
      if (!acc[menu.outlet_name]) acc[menu.outlet_name] = [];
      acc[menu.outlet_name].push(menu);
      return acc;
    }, {});
  };

  const groupByCategory = (menus) => {
    return menus.reduce((acc, menu) => {
      if (!acc[menu.categoryName]) acc[menu.categoryName] = [];
      acc[menu.categoryName].push(menu);
      return acc;
    }, {});
  };

  const groupedMenus = groupByOutlet(favoriteMenus);

  const toggleCategory = (outlet, category) => {
    setExpanded((prev) => ({
      ...prev,
      [`${outlet}_${category}`]: !prev[`${outlet}_${category}`],
    }));
  };

  // Check if user is not logged in
  if (!user) {
    return (
      <>
        <Header />
        <div className="page-content">
          <div className="content-inner pt-0">
            <div className="container p-b20">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "calc(100vh - 300px)" }}
              >
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
                      style={{ opacity: "0.5" }}
                      className="text-muted"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h5 className="mb-3">Please Login First</h5>
                  <p className="text-muted mb-4">
                    Login to view and manage your favorite menus
                  </p>
                  <button className="btn btn-primary" onClick={navigateToLogin}>
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

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="content-inner pt-0">
          <div className="container p-b20">
            <div className="dashboard-area">
              {Object.entries(groupedMenus)
                .filter(
                  ([outletName]) => outletName && outletName !== "undefined"
                )
                .map(([outletName, menus]) => (
                  <div key={outletName} className="mb-4">
                    <div
                      className="fw-bold text-uppercase mb-2 d-flex align-items-center justify-content-between"
                      style={{ fontSize: 16, cursor: "pointer" }}
                      onClick={() =>
                        setExpandedOutlet((prev) => ({
                          ...prev,
                          [outletName]: !prev[outletName],
                        }))
                      }
                    >
                      <span>
                        <i className="fa-solid fa-store me-2"></i>
                        {outletName}
                      </span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "#f5f5f5",
                        }}
                      >
                        <i
                          className={`fa-solid fa-chevron-${
                            expandedOutlet[outletName] ? "up" : "down"
                          }`}
                          style={{ fontSize: 18, color: "#888" }}
                        ></i>
                      </span>
                    </div>
                    {expandedOutlet[outletName] && (
                      <div className="mt-2">
                        {menus.map((menu) => (
                          <div className="mb-2" key={menu.menu_id}>
                            <HorizontalMenuCard
                              image={
                                menu.image ? (
                                  menu.image
                                ) : (
                                  <i
                                    className="fa-solid fa-utensils"
                                    style={{
                                      fontSize: 56,
                                      opacity: 0.15,
                                      color: "#888",
                                    }}
                                  ></i>
                                )
                              }
                              title={menu.menu_name}
                              currentPrice={menu.portions?.[0]?.price || 0}
                              reviewCount={
                                menu.rating ? parseFloat(menu.rating) : null
                              }
                              isFavorite={true}
                              discount={
                                menu.offer > 0 ? `${menu.offer}%` : null
                              }
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
                                outletId: menu.outlet_id,
                              }}
                              onFavoriteUpdate={handleFavoriteUpdate}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Favourite;
