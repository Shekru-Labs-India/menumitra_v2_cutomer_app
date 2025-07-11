import { useQuery } from '@tanstack/react-query';
import { useOutlet } from '../contexts/OutletContext';
import apiService from '../api/apiService';

export const useMenuItems = () => {
  const { outletId } = useOutlet();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['menuItems', outletId],
    queryFn: async () => {
      if (!outletId) return null;
      const data = await apiService.common.getAllMenuListByCategory({ outletId });
      
      if (!data) return null;

      return {
        categories: data.category?.map(category => ({
          menuCatId: category.menu_cat_id,
          categoryName: category.category_name,
          menuCount: category.menu_count
        })) || [],
        menus: data.menus?.map(menu => ({
          menuId: menu.menu_id,
          menuName: menu.menu_name,
          menuFoodType: menu.menu_food_type,
          outletId: menu.outlet_id,
          menuCatId: menu.menu_cat_id,
          categoryName: menu.category_name,
          spicyIndex: menu.spicy_index,
          portions: menu.portion_data?.map(portion => ({
            portion_id: portion.portion_id || Math.random().toString(36).substr(2, 9),
            portion_name: portion.portion_name,
            price: portion.price,
            unit_value: portion.unit_value,
            unit_type: portion.unit_type
          })),
          price: menu.portion_data?.[0]?.price ?? 0,
          rating: menu.rating,
          offer: menu.offer,
          isSpecial: menu.is_special,
          isFavourite: menu.is_favourite === 1,
          isActive: menu.is_active,
          image: menu.images?.[0]?.image
        })) || []
      };
    },
    enabled: !!outletId
  });

  return {
    menuCategories: data?.categories || [],
    menuItems: data?.menus || [],
    isLoading,
    error,
    refetch
  };
};
