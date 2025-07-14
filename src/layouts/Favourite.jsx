import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import { useAuth } from "../contexts/AuthContext";
import { useOutlet } from "../contexts/OutletContext";
import apiService from "../api/apiService";

function Favourite() {
  const navigate = useNavigate();
  const [expandedOutlet, setExpandedOutlet] = useState({});
  const { user, getUserId, setShowAuthOffcanvas } = useAuth();
  const { outletId } = useOutlet();
  const queryClient = useQueryClient();
  const userId = getUserId();

  // Update the query to transform the data properly
  const { data: favoriteMenus = [], isLoading } = useQuery({
    queryKey: ['favorites', outletId, userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const response = await apiService.favorites.getList({ 
        outletId, 
        userId 
      });

      // Transform the response into the format we need
      const allMenus = [];
      if (response) {
        // response is an object with outlet names as keys
        Object.entries(response).forEach(([outletName, menus]) => {
          if (Array.isArray(menus)) {
            menus.forEach((menu) => {
              allMenus.push({
                ...menu,
                outlet_name: outletName,
              });
            });
          }
        });
      }
      return allMenus;
    },
    enabled: !!userId && !!outletId,
  });

  const removeFavorite = useMutation({
    mutationFn: async ({ menuId }) => {
      console.log('📡 Making API Request:', {
        menuId,
        timestamp: new Date().toISOString()
      });
      try {
        const result = await apiService.favorites.remove({ outletId, userId, menuId });
        console.log('📥 API Response Received:', {
          menuId,
          status: 'success',
          timestamp: new Date().toISOString()
        });
        return result;
      } catch (error) {
        // Don't throw the error - this will prevent the optimistic update from being rolled back
        console.log('⚠️ API Error (Ignoring):', {
          menuId,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        return null; // Return null instead of throwing
      }
    },
    onMutate: async ({ menuId }) => {
      console.log('🔄 Starting Optimistic Update:', menuId);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', outletId, userId] });
      
      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['favorites', outletId, userId]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['favorites', outletId, userId], old => 
        old?.filter(menu => menu.menu_id !== menuId) || []
      );
      
      console.log('✨ Optimistic Update Complete:', menuId);
      return { previousFavorites };
    },
    // Remove onError handler since we're handling errors in mutationFn
    // This prevents the optimistic update from being rolled back
});

const handleFavoriteUpdate = async (menuId, isFavorite) => {
  console.log('🔍 Favorite Update Triggered:', {
    menuId,
    isFavorite,
    isLoading: removeFavorite.isLoading,
    timestamp: new Date().toISOString()
  });

  if (!isFavorite && !removeFavorite.isLoading) {
    try {
      const currentFavorites = queryClient.getQueryData(['favorites', outletId, userId]);
      const menuExists = currentFavorites?.some(menu => menu.menu_id === menuId);
      
      console.log('📊 Current State:', {
        currentFavorites: currentFavorites?.length,
        menuExists,
        menuId,
        outletId,
        userId
      });
      
      if (menuExists) {
        console.log('🚀 Initiating Remove Favorite API Call:', menuId);
        await removeFavorite.mutateAsync({ menuId });
        // Force a refetch to ensure we're in sync with server
        queryClient.invalidateQueries({ queryKey: ['favorites', outletId, userId] });
      } else {
        console.log('⚠️ Menu already removed:', menuId);
      }
    } catch (error) {
      // Even if there's an error, we want to keep the item removed from the UI
      console.error('❌ Error in handleFavoriteUpdate:', {
        menuId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      // Don't roll back the optimistic update
    }
  } else {
    console.log('⏭️ Skipping Update:', {
      reason: isFavorite ? 'Menu is still favorite' : 'Remove mutation is in progress',
      isFavorite,
      isLoading: removeFavorite.isLoading
    });
  }
};

  const groupByOutlet = (menus) => {
    // Add safety check for menus array
    if (!Array.isArray(menus)) return {};
    
    return menus.reduce((acc, menu) => {
      if (!acc[menu.outlet_name]) {
        acc[menu.outlet_name] = [];
      }
      acc[menu.outlet_name].push(menu);
      return acc;
    }, {});
  };

  const navigateToLogin = () => {
    if (!user) {
      setShowAuthOffcanvas(true);
      return;
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

  const groupedMenus = groupByOutlet(favoriteMenus);

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="content-inner pt-0">
          <div className="container p-b20">
            <div className="dashboard-area">
              {isLoading ? (
                <div className="text-center p-5">Loading...</div>
              ) : (
                (() => {
                  const entries = Object.entries(groupedMenus)
                    .filter(([outletName]) => outletName && outletName !== "undefined")
                    .sort(([, aMenus], [, bMenus]) => {
                      const aOutletId = aMenus[0]?.outlet_id;
                      const bOutletId = bMenus[0]?.outlet_id;
                      if (String(aOutletId) === String(outletId)) return -1;
                      if (String(bOutletId) === String(outletId)) return 1;
                      return 0;
                    });

                  return entries.length > 0 ? (
                    entries.map(([outletName, menus]) => (
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
                                  image={menu.image && Array.isArray(menu.image) && menu.image.length > 0 ? menu.image[0].image : null}
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
                                    image: menu.image && Array.isArray(menu.image) && menu.image.length > 0 
                                      ? menu.image[0].image 
                                      : null,
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
                    ))
                  ) : (
                    <div className="text-center p-5">
                      <p className="text-muted">No favorite items found</p>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Favourite;
