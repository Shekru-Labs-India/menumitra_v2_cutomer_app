import { useState, useEffect } from 'react';
import { useOutlet } from '../contexts/OutletContext';
import { useCacheData } from '../contexts/CacheDataContext';
import { useAuth } from '../contexts/AuthContext'; // Add this import

export const useMenuItems = () => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { outletId } = useOutlet();
  const { fetchData } = useCacheData();
  const { getUserId } = useAuth(); // Add this line to get the getUserId function

  const fetchMenusByCategory = async () => {
    if (!outletId) {
      console.log('No outlet ID available, skipping menu fetch');
      return;
    }

    console.log('🔄 Fetching menu items for outlet:', outletId);
    try {
      // Get user ID from AuthContext
      const userId = getUserId() || null;
      
      // Use caching system instead of direct fetch
      const data = await fetchData('get_all_menu_list_by_category', {
        outlet_id: outletId,
        user_id: userId, // Add the user_id parameter
        app_source: "user_app",
      });
      
      console.log('✅ Menu API Response:', data);

      if (data.detail) {
        // Update categories
        const categories = data.detail.category?.map(category => ({
          menuCatId: category.menu_cat_id,
          categoryName: category.category_name,
          menuCount: category.menu_count
        })) || [];

        // Update menu items
        const menus = data.detail.menus?.map(menu => ({
          menuId: menu.menu_id,
          menuName: menu.menu_name,
          menuFoodType: menu.menu_food_type,
          outletId: 1,
          menuCatId: menu.menu_cat_id,
          categoryName: menu.category_name,
          spicyIndex: menu.spicy_index,
          portions: menu.portions,
          price: menu.price,
          rating: menu.rating,
          offer: menu.offer,
          isSpecial: menu.is_special,
          isFavourite: menu.is_favourite === 1, // Ensure boolean conversion
          isActive: menu.is_active,
          image: menu.image
        })) || [];

        setMenuCategories(categories);
        setMenuItems(menus);
      }
    } catch (error) {
      console.error('❌ Error fetching menu data:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (outletId) {
      console.log('🏁 OutletId changed, fetching menu data...');
      fetchMenusByCategory();
    }
  }, [outletId, getUserId]); // Added getUserId as dependency

  return {
    menuCategories,
    menuItems,
    isLoading,
    error,
    refetch: fetchMenusByCategory
  };
};
