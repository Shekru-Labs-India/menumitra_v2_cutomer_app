import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import CategorySwiper from "../components/CategorySwiper/CategorySwiper";
import BannerSwiper from "../components/BannerSwiper/BannerSwiper";
import VerticalMenuCard from "../components/VerticalMenuCard";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import { useMenuItems } from "../hooks/useMenuItems";
import { useOutlet } from "../contexts/OutletContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { OrderTypeModal } from "../components/Modal/variants/OrderTypeModal";
import { useModal } from "../contexts/ModalContext";
import OutletInfoBanner from "../components/OutletInfoBanner";
import SearchBar from "../components/SearchBar";

const API_BASE_URL = "https://men4u.xyz/v2";

// Helper to extract outlet params from the path
function extractOutletParamsFromPath(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 3) return null;
  const [o, s, t] = segments.slice(-3);
  const oMatch = o.match(/^o(\d+)$/);
  const sMatch = s.match(/^s(\d+)$/);
  const tMatch = t.match(/^t(\d+)$/);
  if (oMatch && sMatch && tMatch) {
    return {
      outletCode: oMatch[1],
      sectionId: sMatch[1],
      tableId: tMatch[1],
    };
  }
  return null;
}

function Home() {
  const { menuItems, isLoading } = useMenuItems();
  const { cartItems } = useCart();
  const { orderSettings, isOutletOnlyUrl } = useOutlet();
  const [specialMenuItems, setSpecialMenuItems] = useState([]);
  const navigate = useNavigate();
  const [favoriteMenuIds, setFavoriteMenuIds] = useState(new Set());
  const location = useLocation();

  const { outletId } = useOutlet();
  const { openModal } = useModal();

  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const [categoriesData, setCategoriesData] = useState({
    categories: [],
    menusByCategory: {},
  });

  const handleCategoryClick = (category) => {
    // Navigate to category-menu with the category ID
    navigate(`/category-menu/${category.menuCatId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // Update greeting when component mounts and every minute
  useEffect(() => {
    const updateGreeting = () => {
      // setGreeting(getGreeting());
    };

    // Set initial greeting
    updateGreeting();

    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Add these handler functions in Home.jsx
  const handleAddToCart = (menuId) => {
    console.log("Adding to cart:", menuId);
    // Will implement cart functionality later
  };

  const handleFavoriteClick = (menuId) => {
    console.log("Toggle favorite:", menuId);
    // Will implement favorite functionality later
  };

  const handleQuantityChange = (menuId, newQuantity) => {
    console.log("Quantity changed:", menuId, newQuantity);
    // Will implement quantity change functionality later
  };

  // Helper function to check if item is in cart and get its quantity
  const getCartItemQuantity = (menuId) => {
    const cartItem = cartItems.find((item) => item.menuId === menuId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Add this function to fetch special menu items
  const fetchSpecialMenuItems = async () => {
    console.log("🔄 Fetching special menu items...");
    try {
      const authData = localStorage.getItem("auth");
      const userData = authData ? JSON.parse(authData) : null;
      const userId = userData?.userId || null;
      console.log("📦 Using outlet ID:", outletId);

      // Add a guard clause
      if (!outletId) {
        console.log("❌ No outletId available, skipping special menu fetch");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/user/get_special_menu_list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userData?.accessToken}`,
          },
          body: JSON.stringify({
            user_id: userId,
            outlet_id: outletId,
          }),
        }
      );

      const data = await response.json();

      if (data.detail && data.detail.special_menu_list) {
        console.log(
          "✨ Setting special menu items:",
          data.detail.special_menu_list
        );
        setSpecialMenuItems(data.detail.special_menu_list);
      }
    } catch (error) {
      console.error("❌ Error fetching special menu items:", error);
    }
  };

  // Instead, only use the effect that depends on outletId
  useEffect(() => {
    if (outletId) {
      // Only fetch if we have an outletId
      console.log("🏁 OutletId available, fetching special menu items...");
      fetchSpecialMenuItems();
    } else {
      console.log(
        "⏳ Waiting for outletId before fetching special menu items..."
      );
    }
  }, [outletId]); // Depend on outletId

  // Add this function to handle favorite updates
  const handleFavoriteUpdate = (menuId, isFavorite) => {
    setFavoriteMenuIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (isFavorite) {
        newIds.add(menuId);
      } else {
        newIds.delete(menuId);
      }
      return newIds;
    });
  };

  const outletParams = extractOutletParamsFromPath(location.pathname);

  useEffect(() => {
    if (outletParams) {
      console.log("Extracted outlet params:", outletParams);
      // You can use outletParams.outletCode, etc. for your API calls here
      // Optionally, update context or localStorage if needed
    } else {
      console.log("No outlet params found in path:", location.pathname);
    }
  }, [location.pathname]);

  // Only show modal on outlet-only URL if no order type is set
  useEffect(() => {
    if (isOutletOnlyUrl && !orderSettings.order_type) {
      openModal("orderType");
    }
  }, [isOutletOnlyUrl, orderSettings.order_type]);

  // Add this handler function
  const handleSearch = (searchResults) => {
    setIsSearching(searchResults.length > 0);
    setFilteredMenuItems(searchResults);
  };

  // Add this new function to fetch menu list by category
  const fetchMenuListByCategory = async () => {
    try {
      const authData = localStorage.getItem("auth");
      const userData = authData ? JSON.parse(authData) : null;

      const response = await fetch(
        `${API_BASE_URL}/user/get_all_menu_list_by_category`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userData?.accessToken}`,
          },
          body: JSON.stringify({
            outlet_id: outletId,
          }),
        }
      );

      const data = await response.json();

      if (data.detail) {
        // Transform the data into a more usable format
        const menusByCategory = {};
        if (data.detail.menus) {
          data.detail.menus.forEach((menu) => {
            if (!menusByCategory[menu.menu_cat_id]) {
              menusByCategory[menu.menu_cat_id] = [];
            }
            menusByCategory[menu.menu_cat_id].push({
              menuId: menu.menu_id,
              menuName: menu.menu_name,
              menuFoodType: menu.menu_food_type,
              menuCatId: menu.menu_cat_id,
              categoryName: menu.category_name,
              spicyIndex: menu.spicy_index,
              portions: menu.portions,
              rating: menu.rating,
              offer: menu.offer,
              isSpecial: menu.is_special,
              isFavourite: menu.is_favourite,
              isActive: menu.is_active,
              image: menu.image,
            });
          });
        }

        // Transform categories data
        const categories = data.detail.category.map((cat) => ({
          menuCatId: cat.menu_cat_id,
          categoryName: cat.category_name,
          menuCount: cat.menu_count,
        }));

        setCategoriesData({
          categories,
          menusByCategory,
        });
      }
    } catch (error) {
      console.error("Error fetching menu list by category:", error);
    }
  };

  // Add this effect to fetch menu list when outletId changes
  useEffect(() => {
    if (outletId) {
      fetchMenuListByCategory();
    }
  }, [outletId]);

  return (
    <>
      <div className="page-wraper">
        <Header />
        <div className="page-content">
          <div className=" pt-0">
            <div className="container p-b40 p-t0">
              <SearchBar onSearch={handleSearch} menuItems={menuItems || []} />

              <div className="title-bar d-flex justify-content-between align-items-center" onClick={() => navigate('/categories')} style={{cursor: 'pointer'}}>
                <span className="title mb-0 font-18">
                  {isSearching ? "Search Results" : "Categories"}
                </span>
                <i className="fas fa-chevron-right"></i>
              </div>

              {/* Update CategorySwiper with new data */}
              <CategorySwiper
                categories={categoriesData.categories}
                isLoading={isLoading}
                onCategoryClick={handleCategoryClick}
              />
              <div class="title-bar mt-0">
                <span class="title mb-0 font-18">Menus</span>
              </div>
              <div className="row g-3 mb-3">
                {isLoading ? (
                  // Skeleton for VerticalMenuCards
                  [...Array(6)].map((_, index) => (
                    <div className="col-6" key={`skeleton-${index}`}>
                      <div
                        style={{
                          borderRadius: "16px",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      >
                        {/* Image Skeleton */}
                        <div
                          style={{
                            position: "relative",
                            paddingTop: "75%",
                          }}
                        >
                          <Skeleton
                            height="100%"
                            width="100%"
                            baseColor="#C8C8C8"
                            highlightColor="#E0E0E0"
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              borderRadius: "16px 16px 0 0",
                            }}
                          />
                          {/* Discount Badge Skeleton */}
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              zIndex: 1,
                            }}
                          >
                            <Skeleton
                              height={24}
                              width={45}
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                              style={{ borderRadius: "12px" }}
                            />
                          </div>
                          {/* Favorite Button Skeleton */}
                          <div
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              zIndex: 1,
                            }}
                          >
                            <Skeleton
                              circle
                              height={32}
                              width={32}
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                            />
                          </div>
                        </div>

                        {/* Content Section */}
                        <div style={{ padding: "12px" }}>
                          {/* Title Skeleton */}
                          <Skeleton
                            height={20}
                            width="80%"
                            baseColor="#C8C8C8"
                            highlightColor="#E0E0E0"
                            style={{ marginBottom: "8px" }}
                          />

                          {/* Price and Rating Row */}
                          <div className="d-flex justify-content-between align-items-center">
                            <Skeleton
                              height={18}
                              width={60}
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                            />
                            <Skeleton
                              height={18}
                              width={40}
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : isSearching ? (
                  filteredMenuItems.length > 0 ? (
                    filteredMenuItems.map((menuItem) => (
                      <div className="col-6" key={menuItem.menuId}>
                        <VerticalMenuCard
                          image={
                            menuItem.image ||
                            "https://cdn.vox-cdn.com/thumbor/aNM9cSJCkTc4-RK1avHURrKBOjU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/20059022/shutterstock_1435374326.jpg"
                          }
                          title={menuItem.menuName}
                          currentPrice={menuItem.portions?.[0]?.price ?? 0}
                          reviewCount={
                            menuItem.rating ? parseInt(menuItem.rating) : null
                          }
                          isFavorite={
                            favoriteMenuIds.has(menuItem.menuId) ||
                            menuItem.isFavourite === 1
                          }
                          discount={
                            menuItem.offer > 0 ? `${menuItem.offer}%` : null
                          }
                          menuItem={menuItem}
                          onFavoriteUpdate={handleFavoriteUpdate}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center py-4">
                      <p className="text-muted">No results found</p>
                    </div>
                  )
                ) : (
                  menuItems.map((menuItem) => (
                    <div className="col-6" key={menuItem.menuId}>
                      <VerticalMenuCard
                        image={
                          menuItem.image ||
                          "https://cdn.vox-cdn.com/thumbor/aNM9cSJCkTc4-RK1avHURrKBOjU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/20059022/shutterstock_1435374326.jpg"
                        }
                        title={menuItem.menuName}
                        currentPrice={menuItem.portions?.[0]?.price ?? 0}
                        reviewCount={
                          menuItem.rating ? parseInt(menuItem.rating) : null
                        }
                        isFavorite={
                          favoriteMenuIds.has(menuItem.menuId) ||
                          menuItem.isFavourite === 1
                        }
                        discount={
                          menuItem.offer > 0 ? `${menuItem.offer}%` : null
                        }
                        menuItem={menuItem}
                        onFavoriteUpdate={handleFavoriteUpdate}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Show loading skeleton only when no cached data is available */}
              {isLoading && menuItems.length === 0 && (
                <div className="row g-3 mb-3">
                  {[...Array(6)].map((_, index) => (
                    <div className="col-6" key={`skeleton-${index}`}>
                      <div className="card-item style-1 skeleton">
                        <div className="dz-media skeleton-image"></div>
                        <div className="dz-content">
                          <div className="skeleton-text"></div>
                          <div className="skeleton-text"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Special Menus Section */}
              <div className="title-bar mt-4">
                <span className="title mb-0 font-18">Special Menus</span>
              </div>
              <div className="categories-box p-0 m-0">
                {specialMenuItems && specialMenuItems.length > 0 ? (
                  <div className="horizontal-menu-container">
                    {specialMenuItems.map((menuItem) => (
                      <div
                        key={menuItem.menu_id}
                        className="horizontal-menu-card"
                      >
                        <HorizontalMenuCard
                          image={menuItem.image || null}
                          title={menuItem.menu_name}
                          currentPrice={
                            menuItem.portions && menuItem.portions[0]
                              ? menuItem.portions[0].price
                              : 0
                          }
                          originalPrice={
                            menuItem.portions && menuItem.portions[0]
                              ? menuItem.portions[0].price +
                                (menuItem.portions[0].price * menuItem.offer) /
                                  100
                              : 0
                          }
                          discount={
                            menuItem.offer > 0 ? `${menuItem.offer}%` : null
                          }
                          menuItem={{
                            menuId: menuItem.menu_id,
                            menuCatId: menuItem.menu_cat_id,
                            menuName: menuItem.menu_name,
                            portions: menuItem.portions,
                            image: menuItem.image,
                            offer: menuItem.offer,
                            rating: menuItem.rating,
                            description: menuItem.description,
                          }}
                          onFavoriteClick={() =>
                            handleFavoriteClick(menuItem.menu_id)
                          }
                          isFavorite={menuItem.is_favourite === 1}
                        />
                      </div>
                    ))}
                  </div>
                ) : isLoading ? (
                  // Skeleton loader with horizontal scrolling
                  <div className="horizontal-menu-container">
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={`skeleton-${index}`}
                        className="horizontal-menu-card"
                      >
                        <div
                          style={{
                            borderRadius: "16px",
                            overflow: "hidden",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            display: "flex",
                            height: "120px",
                          }}
                        >
                          {/* Image Section */}
                          <div
                            style={{
                              width: "120px",
                              position: "relative",
                              flexShrink: 0,
                            }}
                          >
                            <Skeleton
                              height="100%"
                              width="100%"
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                borderRadius: "16px 0 0 16px",
                              }}
                            />
                            {/* Discount Badge */}
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                left: "8px",
                                zIndex: 1,
                              }}
                            >
                              <Skeleton
                                height={20}
                                width={40}
                                baseColor="#C8C8C8"
                                highlightColor="#E0E0E0"
                                style={{ borderRadius: "10px" }}
                              />
                            </div>
                          </div>

                          {/* Content Section */}
                          <div
                            style={{
                              flex: 1,
                              padding: "12px",
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* Top Section */}
                            <div>
                              {/* Title */}
                              <Skeleton
                                height={20}
                                width="80%"
                                baseColor="#C8C8C8"
                                highlightColor="#E0E0E0"
                                style={{ marginBottom: "8px" }}
                              />

                              {/* Price */}
                              <div
                                className="d-flex align-items-center"
                                style={{ gap: "8px" }}
                              >
                                <Skeleton
                                  height={16}
                                  width={60}
                                  baseColor="#C8C8C8"
                                  highlightColor="#E0E0E0"
                                />
                                <Skeleton
                                  height={16}
                                  width={40}
                                  baseColor="#C8C8C8"
                                  highlightColor="#E0E0E0"
                                  style={{ opacity: 0.5 }}
                                />
                              </div>
                            </div>

                            {/* Bottom Section */}
                            <div className="d-flex justify-content-between align-items-center">
                              {/* Favorite Button */}
                              <Skeleton
                                circle
                                height={32}
                                width={32}
                                baseColor="#C8C8C8"
                                highlightColor="#E0E0E0"
                              />

                              {/* Add/Remove Buttons */}
                              <div style={{ display: "flex", gap: "8px" }}>
                                <Skeleton
                                  height={32}
                                  width={80}
                                  baseColor="#C8C8C8"
                                  highlightColor="#E0E0E0"
                                  style={{ borderRadius: "8px" }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted">
                    <p>No special menus available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Page Content End*/}
        {/* Menubar */}
        <Footer />

        <div
          className="offcanvas offcanvas-bottom pwa-offcanvas"
          style={{ display: "none" }}
        >
          <div className="container">
            <div className="offcanvas-body small">
              <img className="logo" src="assets/images/icon.png" alt="" />
              <h6 className="title font-w600">W3Grocery on Your Home Screen</h6>
              <p>
                Install W3Grocery Pre-Build Grocery Mobile App Template to your
                home screen for easy access, just like any other app
              </p>
              <button type="button" className="btn btn-sm btn-primary pwa-btn">
                Add to Home Screen
              </button>
              <button
                type="button"
                className="btn btn-sm pwa-close btn-secondary ms-2 text-white"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
        <div className="offcanvas-backdrop pwa-backdrop fade" />
        {/* PWA Offcanvas End */}
        {/* Show OrderTypeModal if outletOnly */}
        {isOutletOnlyUrl && <OrderTypeModal />}
      </div>
    </>
  );
}

export default Home;
