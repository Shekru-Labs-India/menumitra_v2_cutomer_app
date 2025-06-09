import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import VerticalMenuCard from "../components/VerticalMenuCard";
import { useAuth } from '../contexts/AuthContext';
import { useFavorite } from '../hooks/api/useFavorite';

const API_BASE_URL = 'https://men4u.xyz/v2';

function Favourite() {
  const navigate = useNavigate();
  const [favoriteMenus, setFavoriteMenus] = useState([]);
  const { getFavorites, toggleFavorite, loading, error } = useFavorite();
  const { user, setShowAuthOffcanvas } = useAuth();

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favorites = await getFavorites();
        setFavoriteMenus(favorites);
      } catch (err) {
        // Error handling is managed by the hook
      }
    };

    loadFavorites();
  }, []);

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-content">
          <div className="container">
            <div className="text-center p-5">Loading...</div>
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
          <div className="container">
            <div className="alert alert-danger">{error}</div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const handleFavoriteToggle = async (menuId) => {
    try {
      await toggleFavorite(menuId, true);
      // Refresh the favorites list
      const updatedFavorites = await getFavorites();
      setFavoriteMenus(updatedFavorites);
    } catch (err) {
      // Error handling is managed by the hook
    }
  };

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
                        reviewCount={menu.rating ? parseInt(menu.rating) : null}
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
                          image: menu.image
                        }}
                        onFavoriteToggle={() => handleFavoriteToggle(menu.menu_id)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-12">
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
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </div>
                        <h5 className="mb-3">No Favourite Menus</h5>
                        <p className="text-muted mb-4">You haven't added any menus to your favorites yet</p>
                        <button 
                          className="btn btn-primary" 
                          onClick={navigateToMenus}
                        >
                          See Menus
                        </button>
                      </div>
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
