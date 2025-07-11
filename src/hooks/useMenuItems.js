import { useState, useEffect } from 'react';
import { useOutlet } from '../contexts/OutletContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../api/apiService';

export const useMenuItems = () => {
  const [menuCategories, setMenuCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { outletId } = useOutlet();
  const { getUserId } = useAuth();

  const fetchMenusByCategory = async () => {
    if (!outletId) {
      console.log('No outlet ID available, skipping menu fetch');
      return;
    }

    console.log('🔄 Fetching menu items for outlet:', outletId);
    try {
      const data = await apiService.common.getAllMenuListByCategory({ outletId });
      
      console.log('✅ Menu API Response:', data);

      if (data) {
        // Update categories
        const categories = data.category?.map(category => ({
          menuCatId: category.menu_cat_id,
          categoryName: category.category_name,
          menuCount: category.menu_count
        })) || [];

        // Update menu items
        const menus = data.menus?.map(menu => ({
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
          isFavourite: menu.is_favourite === 1,
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
  }, [outletId]);

  return {
    menuCategories,
    menuItems,
    isLoading,
    error,
    refetch: fetchMenusByCategory
  };
};
