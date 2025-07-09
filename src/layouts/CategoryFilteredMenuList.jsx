import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import VerticalMenuCard from '../components/VerticalMenuCard';
import { useOutlet } from '../contexts/OutletContext';
import { useCacheData } from '../contexts/CacheDataContext';
import { useAuth } from '../contexts/AuthContext'; // Add this import

const DEFAULT_IMAGE = 'https://as2.ftcdn.net/jpg/02/79/12/03/1000_F_279120368_WzIoR2LV2Cgy33oxy6eEKQYSkaWr8AFU.jpg';

function CategoryFilteredMenuList() {
  const { categoryId } = useParams();
  const location = useLocation();
  const categoryName = location.state?.categoryName;
  const menuCount = location.state?.menuCount;
  const { outletId } = useOutlet();
  const { fetchData } = useCacheData();
  const { getUserId } = useAuth(); // Add this line to get the getUserId function

  const [categoryData, setCategoryData] = useState({
    category: null,
    menus: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenusByCategory = async () => {
      if (!categoryId) {
        console.log('⚠️ No category ID available');
        return;
      }

      console.log('🔄 Fetching menus for category:', categoryId);
      try {
        console.log('📦 Using outlet ID:', outletId);
        
        // Get user ID from AuthContext
        const userId = getUserId() || null;

        // Use caching system instead of direct fetch
        const data = await fetchData('get_all_menu_list_by_category', {
          outlet_id: outletId,
          user_id: userId, // Add the user_id parameter
          app_source: "user_app"
        });

        console.log('✅ API Response:', data);
        
        if (data.detail) {
          const filteredMenus = data.detail.menus.filter(
            menu => menu.menu_cat_id.toString() === categoryId
          );

          console.log('✨ Filtered menus:', filteredMenus);

          setCategoryData({
            category: {
              menu_cat_id: categoryId,
              category_name: categoryName || data.detail.category.find(cat => 
                cat.menu_cat_id.toString() === categoryId
              )?.category_name,
              menu_count: menuCount
            },
            menus: filteredMenus
          });
        }
      } catch (err) {
        console.error('❌ Error fetching menu data:', err);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    if (outletId && categoryId) {
      fetchMenusByCategory();
    }
  }, [categoryId, categoryName, menuCount, outletId, fetchData, getUserId]); // Added getUserId as dependency

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

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="container p-b80">
          {categoryData.category && (
            <div className="category-header mb-4">
              <h4 className="title mb-1">{categoryData.category.category_name}</h4>
              {categoryData.category.menu_count && (
                <small className="text-muted">
                  {categoryData.category.menu_count} Items Available
                </small>
              )}
            </div>
          )}
          
          <div className="row g-3">
            {categoryData.menus.map((menu) => (
              <div key={menu.menu_id} className="col-12">
                <VerticalMenuCard
                  image={menu.image || DEFAULT_IMAGE}
                  title={menu.menu_name}
                  currentPrice={menu.portions?.[0]?.price || 0}
                  reviewCount={menu.rating || 0}
                  isFavorite={menu.is_favourite === 1}
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
                    isFavourite: menu.is_favourite === 1,
                    isActive: menu.is_active,
                    image: menu.image || DEFAULT_IMAGE
                  }}
                  onFavoriteClick={(isFavorite, menuId) => {
                    setCategoryData(prevData => ({
                      ...prevData,
                      menus: prevData.menus.map(m => 
                        m.menu_id === menuId 
                          ? { ...m, is_favourite: isFavorite ? 1 : 0 }
                          : m
                      )
                    }));
                  }}
                />
              </div>
            ))}
            
            {categoryData.menus.length === 0 && (
              <div className="col-12">
                <div className="alert alert-info">
                  No menu items found in this category.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CategoryFilteredMenuList;