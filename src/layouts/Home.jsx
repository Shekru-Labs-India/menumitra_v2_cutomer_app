import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import CategorySwiper from "../components/CategorySwiper/CategorySwiper";

import BannerSwiper from "../components/BannerSwiper/BannerSwiper";
import apiClient from "../services/apiService";
import VerticalMenuCard from "../components/VerticalMenuCard";
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useCategories } from '../hooks/useCategories';
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import { Autoplay } from 'swiper/modules';
import { useMenuItems } from '../hooks/useMenuItems';
import { useOutlet } from '../contexts/OutletContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { OrderTypeModal } from '../components/Modal/variants/OrderTypeModal';
import { useModal } from '../contexts/ModalContext';
import OutletInfoBanner from "../components/OutletInfoBanner";


const API_BASE_URL = 'https://men4u.xyz/v2';

// Helper to extract outlet params from the path
function extractOutletParamsFromPath(pathname) {
  const segments = pathname.split('/').filter(Boolean);
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
  const { menuCategories, menuItems, isLoading } = useMenuItems();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const { cartItems, updateQuantity, addToCart, orderSettings } = useCart();
  const [specialMenuItems, setSpecialMenuItems] = useState([]);
  const navigate = useNavigate();
  const [favoriteMenuIds, setFavoriteMenuIds] = useState(new Set());
  const location = useLocation();

  const { outletId, isOutletOnlyUrl } = useOutlet();
  const { openModal, closeModal } = useModal();

  const handleCategoryClick = (category) => {
    // Navigate to category-menu with the category ID
    navigate(`/category-menu/${category.menuCatId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good Evening';
    } else {
      return 'Good Night';
    }
  };

  // Update greeting when component mounts and every minute
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
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
    console.log('Adding to cart:', menuId);
    // Will implement cart functionality later
  };

  const handleFavoriteClick = (menuId) => {
    console.log('Toggle favorite:', menuId);
    // Will implement favorite functionality later
  };

  const handleQuantityChange = (menuId, newQuantity) => {
    console.log('Quantity changed:', menuId, newQuantity);
    // Will implement quantity change functionality later
  };

  // Helper function to check if item is in cart and get its quantity
  const getCartItemQuantity = (menuId) => {
    const cartItem = cartItems.find(item => item.menuId === menuId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Add this function to fetch special menu items
  const fetchSpecialMenuItems = async () => {
    console.log('🔄 Fetching special menu items...');
    try {
      const authData = localStorage.getItem('auth');
      const userData = authData ? JSON.parse(authData) : null;
      const userId = userData?.userId || null;
      console.log('📦 Using outlet ID:', outletId);

      // Add a guard clause
      if (!outletId) {
        console.log('❌ No outletId available, skipping special menu fetch');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/user/get_special_menu_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userData?.accessToken}`
        },
        body: JSON.stringify({
          user_id: userId,
          outlet_id: outletId
        })
      });

      const data = await response.json();

      if (data.detail && data.detail.special_menu_list) {
        console.log('✨ Setting special menu items:', data.detail.special_menu_list);
        setSpecialMenuItems(data.detail.special_menu_list);
      }
    } catch (error) {
      console.error('❌ Error fetching special menu items:', error);
    }
  };

  // Instead, only use the effect that depends on outletId
  useEffect(() => {
    if (outletId) {  // Only fetch if we have an outletId
      console.log('🏁 OutletId available, fetching special menu items...');
      fetchSpecialMenuItems();
    } else {
      console.log('⏳ Waiting for outletId before fetching special menu items...');
    }
  }, [outletId]); // Depend on outletId

  // Add this function to handle favorite updates
  const handleFavoriteUpdate = (menuId, isFavorite) => {
    setFavoriteMenuIds(prevIds => {
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
      openModal('orderType');
    }
  }, [isOutletOnlyUrl, orderSettings.order_type]);

  return (
    <>
      <div className="page-wraper">
        <Header />
        {/* <div className="author-notification">
          <div className="container inner-wrapper">
            <div className="dz-info">
              <span className="text-dark d-block">{greeting}</span>
              <h2 className="name mb-0 title">
                {user?.name ? `${user.name} 👋` : 'Guest 👋'}
              </h2>
            </div>
            <a href="notification.html" className="notify-cart">
              <span className="font-18 font-w600 text-dark">6</span>
              <div className="badge">
                <svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21.8574 17.4858C20.0734 14.5109 19 13.212 19 9.99997C18.9982 8.31756 18.3909 6.692 17.2892 5.42046C16.1876 4.14893 14.665 3.31636 13 3.07497V2.99997C13 2.73475 12.8947 2.4804 12.7071 2.29286C12.5196 2.10533 12.2653 1.99997 12 1.99997C11.7348 1.99997 11.4805 2.10533 11.2929 2.29286C11.1054 2.4804 11 2.73475 11 2.99997V3.07917C9.32471 3.39641 7.81116 4.28459 6.71715 5.59244C5.62313 6.9003 5.01632 8.54695 5.00004 10.252C5.00004 13.212 3.73804 14.826 2.14264 17.4859C2.05169 17.6376 2.00263 17.8107 2.00044 17.9876C1.99826 18.1645 2.04303 18.3388 2.1302 18.4927C2.21737 18.6467 2.3438 18.7747 2.49661 18.8638C2.64943 18.9529 2.82314 18.9999 3.00004 19H21C21.1769 18.9999 21.3507 18.9529 21.5035 18.8638C21.6563 18.7747 21.7828 18.6466 21.8699 18.4927C21.9571 18.3388 22.0019 18.1644 21.9997 17.9875C21.9975 17.8106 21.9484 17.6375 21.8574 17.4858Z"
                    fill="white"
                  />
                  <path
                    d="M14 20H10C9.73478 20 9.48043 20.1054 9.29289 20.2929C9.10536 20.4804 9 20.7348 9 21C9 21.2652 9.10536 21.5196 9.29289 21.7071C9.48043 21.8947 9.73478 22 10 22H14C14.2652 22 14.5196 21.8947 14.7071 21.7071C14.8946 21.5196 15 21.2652 15 21C15 20.7348 14.8946 20.4804 14.7071 20.2929C14.5196 20.1054 14.2652 20 14 20Z"
                    fill="white"
                  />
                </svg>
              </div>
            </a>
          </div>
        </div> */}
        {/* Banner End */}
        {/* Page Content */}
        <div className="page-content">
          <div className=" pt-0">
            <div className="container p-b40 p-t0">
              {/* Search */}
              <div className="search-box mb-4">
                <div className="mb-3 input-group input-radius">
                  <span className="input-group-text">
                    <svg
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.9395 1.9313C5.98074 1.9313 1.94141 5.97063 1.94141 10.9294C1.94141 15.8881 5.98074 19.9353 10.9395 19.9353C13.0575 19.9353 15.0054 19.193 16.5449 17.9606L20.293 21.7067C20.4821 21.888 20.7347 21.988 20.9967 21.9854C21.2587 21.9827 21.5093 21.8775 21.6947 21.6924C21.8801 21.5073 21.9856 21.2569 21.9886 20.9949C21.9917 20.7329 21.892 20.4802 21.7109 20.2908L17.9629 16.5427C19.1963 15.0008 19.9395 13.0498 19.9395 10.9294C19.9395 5.97063 15.8982 1.9313 10.9395 1.9313ZM10.9395 3.93134C14.8173 3.93134 17.9375 7.05153 17.9375 10.9294C17.9375 14.8072 14.8173 17.9352 10.9395 17.9352C7.06162 17.9352 3.94141 14.8072 3.94141 10.9294C3.94141 7.05153 7.06162 3.93134 10.9395 3.93134Z"
                        fill="#7D8FAB"
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search beverages or foods"
                    className="form-control main-in ps-0 bs-0"
                  />
                </div>
              </div>
              {/* Search */}
              {/* Dashboard Area */}
              <div className="dashboard-area">
                <CategorySwiper
                  categories={menuCategories}
                  onCategoryClick={handleCategoryClick}
                  isLoading={isLoading}
                  ui={{
                    card: {
                      width: "100%",
                      height: "160px",
                      borderRadius: "16px",
                      padding: "25px 15px",
                      margin: "8px",
                      shadow: "0 4px 12px rgba(0,0,0,0.15)",
                      overlay: "rgba(0,0,0,0.6)",
                      transition: "all 0.3s ease",
                      hoverTransform: "translateY(-5px) scale(1.02)",
                      backgroundColor: "#ffffff",
                    },
                    container: {
                      width: "100%",
                      padding: "20px",
                      margin: "30px 0",
                      backgroundColor: "#f5f5f5",
                    },
                    icon: {
                      size: "3x",
                      color: "#ffffff",
                      marginBottom: "12px",
                    },
                    text: {
                      titleSize: "16px",
                      titleColor: "#ffffff",
                      titleWeight: "600",
                      countSize: "14px",
                      countColor: "rgba(255,255,255,0.8)",
                      countWeight: "400",
                    },
                  }}
                  breakpoints={{
                    320: { slidesPerView: 1.5 },
                    480: { slidesPerView: 2.5 },
                    768: { slidesPerView: 3.5 },
                    1024: { slidesPerView: 4.5 },
                  }}
                />
                
                <div className="title-bar">
                  <span className="title mb-0 font-18">Menus</span>
                </div>
                <div className="row g-3 mb-3">
                  {isLoading ? (
                    // Skeleton for VerticalMenuCards
                    [...Array(6)].map((_, index) => (
                      <div className="col-6" key={`skeleton-${index}`}>
                        <div 
                          style={{ 
                            borderRadius: '16px',
                            overflow: 'hidden',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}
                        >
                          {/* Image Skeleton */}
                          <div style={{ position: 'relative', paddingTop: '75%' }}>
                            <Skeleton
                              height="100%"
                              width="100%"
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                borderRadius: '16px 16px 0 0'
                              }}
                            />
                            {/* Discount Badge Skeleton */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: '10px',
                                left: '10px',
                                zIndex: 1
                              }}
                            >
                              <Skeleton
                                height={24}
                                width={45}
                                baseColor="#C8C8C8"
                                highlightColor="#E0E0E0"
                                style={{ borderRadius: '12px' }}
                              />
                            </div>
                            {/* Favorite Button Skeleton */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                zIndex: 1
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
                          <div style={{ padding: '12px' }}>
                            {/* Title Skeleton */}
                            <Skeleton
                              height={20}
                              width="80%"
                              baseColor="#C8C8C8"
                              highlightColor="#E0E0E0"
                              style={{ marginBottom: '8px' }}
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
                  ) : (
                    // Actual VerticalMenuCards
                    menuItems.map((menuItem) => (
                      <div className="col-6" key={menuItem.menuId}>
                        <VerticalMenuCard
                          image={menuItem.image || "https://cdn.vox-cdn.com/thumbor/aNM9cSJCkTc4-RK1avHURrKBOjU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/20059022/shutterstock_1435374326.jpg"}
                          title={menuItem.menuName}
                          currentPrice={menuItem.portions?.[0]?.price ?? 0}
                          reviewCount={menuItem.rating ? parseInt(menuItem.rating) : null}
                          isFavorite={favoriteMenuIds.has(menuItem.menuId) || menuItem.isFavourite === 1}
                          discount={menuItem.offer > 0 ? `${menuItem.offer}%` : null}
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
                
                {/* Recomended Start */}
              </div>
             
                {/* Special Menus Section */}
                <div className="title-bar mt-4">
                  <span className="title mb-0 font-18">Special Menus</span>
                </div>
                <div className="categories-box p-0 m-0">
                  {specialMenuItems && specialMenuItems.length > 0 ? (
                    <div className="swiper-btn-center-lr">
                      <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        className="special-menu-swiper"
                        breakpoints={{
                          320: { 
                            slidesPerView: 1.2,
                            slidesOffsetAfter: 0
                          },
                          576: { 
                            slidesPerView: 2.2,
                            slidesOffsetAfter: 0
                          },
                          768: { 
                            slidesPerView: 2.5,
                            slidesOffsetAfter: 0
                          }
                        }}
                        loop={true}
                        autoplay={{
                          delay: 3000,
                          disableOnInteraction: false,
                          pauseOnMouseEnter: true
                        }}
                        watchSlidesProgress={true}
                        watchslidesvisibility={1}
                        centeredSlidesBounds={true}
                        resistanceRatio={0}
                        touchRatio={1}
                        touchAngle={45}
                        grabCursor={true}
                        momentumbounce={1}
                        momentumbounceratio={1}
                        momentumratio={1}
                        touchEventsTarget="wrapper"
                        touchStartPreventDefault={false}
                        touchMoveStopPropagation={true}
                        cssMode={true}
                        modules={[Autoplay]}
                      >
                        {specialMenuItems.map((menuItem) => (
                          <SwiperSlide 
                            key={menuItem.menu_id}
                            style={{
                              width: 'auto',
                              height: 'auto'
                            }}
                          >
                            <div className="px-2">
                              <HorizontalMenuCard
                                image={menuItem.image || null}
                                title={menuItem.menu_name}
                                currentPrice={menuItem.portions && menuItem.portions[0] ? menuItem.portions[0].price : 0}
                                originalPrice={menuItem.portions && menuItem.portions[0] ? menuItem.portions[0].price + (menuItem.portions[0].price * menuItem.offer / 100) : 0}
                                discount={menuItem.offer > 0 ? `${menuItem.offer}%` : null}
                                menuItem={{
                                  menuId: menuItem.menu_id,
                                  menuName: menuItem.menu_name,
                                  portions: menuItem.portions,
                                  // ... other menu item data
                                }}
                                onFavoriteClick={() => handleFavoriteClick(menuItem.menu_id)}
                                isFavorite={menuItem.is_favourite === 1}
                                productUrl="#"
                                isInCart={false}
                                quantity={getCartItemQuantity(menuItem.menu_id)}
                                onIncrement={() => handleQuantityChange(menuItem.menu_id, getCartItemQuantity(menuItem.menu_id) + 1)}
                                onDecrement={() => handleQuantityChange(menuItem.menu_id, getCartItemQuantity(menuItem.menu_id) - 1)}
                              />
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  ) : isLoading ? (
                    // Skeleton for Special Menu Swiper
                    <div className="swiper-btn-center-lr">
                      <Swiper
                        spaceBetween={10}
                        slidesPerView={1}
                        className="special-menu-swiper"
                        breakpoints={{
                          320: { slidesPerView: 1.2 },
                          576: { slidesPerView: 2.2 },
                          768: { slidesPerView: 2.5 }
                        }}
                      >
                        {[...Array(4)].map((_, index) => (
                          <SwiperSlide key={`skeleton-${index}`}>
                            <div className="px-2">
                              <div 
                                style={{ 
                                  borderRadius: '16px',
                                  overflow: 'hidden',
                                  backgroundColor: '#fff',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                  display: 'flex',
                                  height: '120px'
                                }}
                              >
                                {/* Image Section */}
                                <div style={{ 
                                  width: '120px', 
                                  position: 'relative',
                                  flexShrink: 0
                                }}>
                                  <Skeleton
                                    height="100%"
                                    width="100%"
                                    baseColor="#C8C8C8"
                                    highlightColor="#E0E0E0"
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      borderRadius: '16px 0 0 16px'
                                    }}
                                  />
                                  {/* Discount Badge */}
                                  <div 
                                    style={{
                                      position: 'absolute',
                                      top: '8px',
                                      left: '8px',
                                      zIndex: 1
                                    }}
                                  >
                                    <Skeleton
                                      height={20}
                                      width={40}
                                      baseColor="#C8C8C8"
                                      highlightColor="#E0E0E0"
                                      style={{ borderRadius: '10px' }}
                                    />
                                  </div>
                                </div>

                                {/* Content Section */}
                                <div style={{ 
                                  flex: 1, 
                                  padding: '12px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between'
                                }}>
                                  {/* Top Section */}
                                  <div>
                                    {/* Title */}
                                    <Skeleton
                                      height={20}
                                      width="80%"
                                      baseColor="#C8C8C8"
                                      highlightColor="#E0E0E0"
                                      style={{ marginBottom: '8px' }}
                                    />
                                    
                                    {/* Price */}
                                    <div className="d-flex align-items-center" style={{ gap: '8px' }}>
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
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <Skeleton
                                        height={32}
                                        width={80}
                                        baseColor="#C8C8C8"
                                        highlightColor="#E0E0E0"
                                        style={{ borderRadius: '8px' }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
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
