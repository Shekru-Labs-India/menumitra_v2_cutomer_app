import { useState, useEffect } from 'react';
import { useOutlet } from '../contexts/OutletContext';

const API_BASE_URL = 'https://men4u.xyz/v2';

export const useMenuItems = () => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { outletId } = useOutlet();

  const fetchMenusByCategory = async () => {
    console.log('🔄 Fetching menu items...');
    try {
      const authData = localStorage.getItem('auth');
      const userData = authData ? JSON.parse(authData) : null;
      console.log('📦 Using outlet ID:', outletId);

      const response = await fetch(`${API_BASE_URL}/user/get_all_menu_list_by_category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userData?.accessToken}`
        },
        body: JSON.stringify({
          outlet_id: 1,
          user_id: userData?.userId || null
        })
      });

      const data = await response.json();
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
          rating: menu.rating,
          offer: menu.offer,
          isSpecial: menu.is_special,
          isFavourite: menu.is_favourite,
          isActive: menu.is_active,
          image: menu.image
        })) || [];

        // console.log('✨ Formatted categories:', categories);
        // console.log('✨ Formatted menu items:', menus);

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
    console.log('🏁 useMenuItems mounted, fetching data...');
    fetchMenusByCategory();
  }, []); // Only run once on mount

  return {
    menuCategories,
    menuItems,
    isLoading,
    error,
    refetch: fetchMenusByCategory
  };
};
