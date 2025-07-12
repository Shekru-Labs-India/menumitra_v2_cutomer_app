import React, { useState, useEffect, useMemo } from "react";
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
import apiService from '../api/apiService';
import OfferBanner from "./OfferBanner";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Helper function to get auth data
const getAuthData = () => {
  const authData = localStorage.getItem("auth");
  return authData ? JSON.parse(authData) : null;
};

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
  // Keep core hooks and context values
  const { menuItems, menuCategories, isLoading } = useMenuItems();
  const { cartItems } = useCart();
  const { orderSettings, isOutletOnlyUrl, outletId } = useOutlet();
  const { getUserId } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  // Essential state that can't be derived
  const [favoriteMenuIds, setFavoriteMenuIds] = useState(new Set());
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [visibleMenuCount, setVisibleMenuCount] = useState(10);
  const [activeMenuFilter, setActiveMenuFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // New: track search query
  const [isSearching, setIsSearching] = useState(false);

  // Add QueryClient
  const queryClient = useQueryClient();
  const userId = getUserId();

  // Add favorite mutations with optimistic updates
  const toggleFavorite = useMutation({
    mutationFn: async ({ menuId, isFavorite }) => {
      if (isFavorite) {
        return apiService.favorites.add({ outletId, userId, menuId });
      } else {
        return apiService.favorites.remove({ outletId, userId, menuId });
      }
    },
    onMutate: async ({ menuId, isFavorite }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['specialMenus', outletId, userId]);
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['specialMenus', outletId, userId]);
      
      // Optimistically update the UI
      queryClient.setQueryData(['specialMenus', outletId, userId], old => {
        if (!old) return old;
        return old.map(menu => 
          menu.menu_id === menuId 
            ? { ...menu, is_favourite: isFavorite ? 1 : 0 }
            : menu
        );
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['specialMenus', outletId, userId], context.previousData);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries(['specialMenus', outletId, userId]);
    }
  });

  // IMPROVEMENT: Use useMemo for categoriesData instead of useState + useEffect
  // This prevents unnecessary recalculations and removes a source of render loops
  const categoriesData = useMemo(() => {
    if (!menuItems || !menuCategories) {
      return { categories: [], menusByCategory: {} };
    }

    const menusByCategory = {};
    let totalMenuCount = 0;

    menuItems.forEach((menu) => {
      if (!menusByCategory[menu.menuCatId]) {
        menusByCategory[menu.menuCatId] = [];
      }
      menusByCategory[menu.menuCatId].push(menu);
      totalMenuCount++;
    });

    const allCategory = {
      menuCatId: "all",
      categoryName: "All",
      menuCount: totalMenuCount,
    };

    return {
      categories: [allCategory, ...menuCategories],
      menusByCategory,
    };
  }, [menuItems, menuCategories]); // Only recompute when menu data changes

  // IMPROVEMENT: Use useMemo for filtered menus instead of useState + useEffect
  // This eliminates the need for filteredMenuItems state and its update effects
  const filteredMenus = useMemo(() => {
    if (!menuItems) return [];

    // First apply category filter
    let filtered = selectedCategoryId === "all" || !selectedCategoryId
      ? menuItems
      : (categoriesData.menusByCategory[selectedCategoryId] || []);

    // Then apply search if active
    if (isSearching && searchQuery) {
      filtered = filtered.filter(item => 
        item.menuName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Finally apply special/offer filter
    if (activeMenuFilter === "special") {
      filtered = filtered.filter(item => item.isSpecial === true || item.isSpecial === 1);
    } else if (activeMenuFilter === "offer") {
      filtered = filtered.filter(item => Number(item.offer) > 0);
    }

    return filtered;
  }, [
    menuItems,
    selectedCategoryId,
    searchQuery,
    isSearching,
    activeMenuFilter,
    categoriesData.menusByCategory
  ]);

  // IMPROVEMENT: Use useMemo for visible menus to prevent recalculation on every render
  const visibleMenus = useMemo(() => {
    return filteredMenus.slice(0, visibleMenuCount);
  }, [filteredMenus, visibleMenuCount]);

  // One-time effect to set default category
  useEffect(() => {
    if (categoriesData.categories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId("all");
    }
  }, [categoriesData.categories.length]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleMenuCount(10);
  }, [selectedCategoryId, activeMenuFilter, searchQuery]);

  // Helper for lazy loading
  const getVisibleMenus = () => {
    return filteredMenus.slice(0, visibleMenuCount);
  };

  const handleLoadMoreMenus = () => {
    setVisibleMenuCount((prev) => prev + 10);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategoryId(category.menuCatId);
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

  // Update the handleFavoriteClick function
  const handleFavoriteClick = async (menuId, isFavorite) => {
    if (!userId) {
      // Handle unauthenticated users - maybe show login modal
      return;
    }
    
    try {
      await toggleFavorite.mutateAsync({ menuId, isFavorite });
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
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

  // Special menus query remains unchanged
  const {
    data: specialMenuItems = [],
    isLoading: isSpecialMenusLoading,
    error: specialMenusError,
  } = useQuery({
    queryKey: ['specialMenus', outletId, userId],
    queryFn: async () => {
      if (!outletId) return [];
      const data = await apiService.menus.getSpecialMenus({ outletId, userId });
      return data?.special_menu_list || [];
    },
    enabled: !!outletId,
  });

  // Only show modal on outlet-only URL if no order type is set
  useEffect(() => {
    if (isOutletOnlyUrl && !orderSettings.order_type) {
      openModal("orderType");
    }
  }, [isOutletOnlyUrl, orderSettings.order_type]);

  // Handler functions remain the same but are simplified
  const handleSearch = (searchResults) => {
    setSearchQuery(searchResults.query || ""); // Store the query
    setIsSearching(!!searchResults.length);
  };

  return (
    <>
      <div className="page-wraper">
        <Header />
        <div className="page-content">
          <div className=" pt-0">
            <div className="container p-b40 p-t0">
              {/* <SearchBar onSearch={handleSearch} menuItems={menuItems || []} /> */}

              {/* Outlet Info Banner (Hotel Name, etc.) */}
              {/* <OutletInfoBanner /> */}

              {/* Offer Banner Swiper - Inserted here */}
              <OfferBanner />

              <div
                className="title-bar d-flex justify-content-between align-items-center"
                onClick={() => navigate("/categories")}
                style={{ cursor: "pointer" }}
              >
                <span className="title mb-0 font-18">
                  {isSearching ? "Search Results" : "Categories"}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  See all{" "}
                  <i
                    className="fas fa-chevron-right"
                    style={{ fontSize: "12px" }}
                  ></i>
                </span>
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
                  filteredMenus.length > 0 ? (
                    visibleMenus.map((menuItem) => (
                      <div className="col-6" key={menuItem.menuId}>
                        <VerticalMenuCard
                          image={
                            menuItem.image ? (
                              menuItem.image
                            ) : (
                              <i className="fa-solid fa-utensils font-55"></i>
                            )
                          }
                          title={menuItem.menuName}
                          currentPrice={menuItem.portions?.[0]?.price ?? 0}
                          reviewCount={
                            menuItem.rating ? parseInt(menuItem.rating) : null
                          }
                          isFavorite={menuItem.is_favourite === 1}
                          discount={
                            menuItem.offer > 0 ? `${menuItem.offer}%` : null
                          }
                          menuItem={menuItem}
                          onFavoriteUpdate={handleFavoriteClick}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-12 text-center py-4">
                      <p className="text-muted">No results found</p>
                    </div>
                  )
                ) : (
                  visibleMenus.map((menuItem) => (
                    <div className="col-6" key={menuItem.menuId}>
                      <VerticalMenuCard
                        image={
                          menuItem.image ? (
                            menuItem.image
                          ) : (
                            <i className="fa-solid fa-utensils font-55 opacity-50 text-muted"></i>
                          )
                        }
                        title={menuItem.menuName}
                        currentPrice={menuItem.portions?.[0]?.price ?? 0}
                        reviewCount={
                          menuItem.rating ? parseInt(menuItem.rating) : null
                        }
                        isFavorite={
                          favoriteMenuIds.has(menuItem.menuId) ||
                          menuItem.is_favourite === 1
                        }
                        discount={
                          menuItem.offer > 0 ? `${menuItem.offer}%` : null
                        }
                        menuItem={menuItem}
                        onFavoriteUpdate={handleFavoriteClick}
                      />
                    </div>
                  ))
                )}
              </div>
              {/* Lazy Load Button */}
              {filteredMenus.length > visibleMenuCount && (
                <div className="text-center mb-4">
                  <button
                    className="btn btn-outline-primary px-4 py-2"
                    onClick={handleLoadMoreMenus}
                  >
                    Load More
                  </button>
                </div>
              )}

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
              {(specialMenuItems && specialMenuItems.length > 0) ||
              isSpecialMenusLoading ? (
                <>
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
                              image={
                                menuItem.image ? (
                                  menuItem.image
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
                              title={menuItem.menu_name}
                              currentPrice={
                                menuItem.portions && menuItem.portions[0]
                                  ? menuItem.portions[0].price
                                  : 0
                              }
                              reviewCount={
                                menuItem.rating
                                  ? parseFloat(menuItem.rating)
                                  : null
                              }
                              isFavorite={menuItem.is_favourite === 1}
                              discount={
                                menuItem.offer > 0 ? `${menuItem.offer}%` : null
                              }
                              menuItem={{
                                menuId: menuItem.menu_id,
                                menuCatId: menuItem.menu_cat_id,
                                menuName: menuItem.menu_name,
                                menuFoodType: menuItem.menu_food_type,
                                categoryName: menuItem.category_name,
                                spicyIndex: menuItem.spicy_index,
                                portions: menuItem.portions,
                                rating: menuItem.rating,
                                offer: menuItem.offer,
                                isSpecial: menuItem.is_special,
                                is_favourite: menuItem.is_favourite,
                                isActive: true,
                                image: menuItem.image,
                                outletName: menuItem.outlet_name,
                                outletId: menuItem.outlet_id,
                              }}
                              onFavoriteUpdate={handleFavoriteClick}
                            />
                          </div>
                        ))}
                      </div>
                    ) : isSpecialMenusLoading ? (
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
                    ) : null}
                  </div>
                </>
              ) : null}
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
