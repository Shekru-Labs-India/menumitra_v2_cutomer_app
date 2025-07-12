import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutlet } from '../contexts/OutletContext';
import apiService from '../api/apiService';

export const useMenuItems = () => {
  const { outletId } = useOutlet();
  const queryClient = useQueryClient();

  // Main query for menu items
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
          portions: menu.portions?.map(portion => ({
            portion_id: portion.portion_id || Math.random().toString(36).substr(2, 9),
            portion_name: portion.portion_name,
            price: portion.price,
            unit_value: portion.unit_value,
            unit_type: portion.unit_type
          })),
          price: menu.portions?.[0]?.price ?? 0,
          rating: menu.rating,
          offer: menu.offer,
          isSpecial: menu.is_special,
          is_favourite: menu.is_favourite,
          isFavourite: menu.is_favourite === 1,
          isActive: menu.is_active,
          image: menu.images?.[0]?.image
        })) || []
      };
    },
    enabled: !!outletId
  });

  // Add mutation for favorite toggle
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ menuId, isFavorite, userId }) => {
      if (isFavorite) {
        return await apiService.favorites.remove({ outletId, userId, menuId });
      } else {
        return await apiService.favorites.add({ outletId, userId, menuId });
      }
    },
    onMutate: async ({ menuId, isFavorite }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['menuItems', outletId] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(['menuItems', outletId]);

      // Optimistically update the menu item
      queryClient.setQueryData(['menuItems', outletId], (old) => {
        if (!old) return old;
        return {
          ...old,
          menus: old.menus.map(menu => 
            menu.menuId === menuId 
              ? {
                  ...menu,
                  is_favourite: !isFavorite ? 1 : 0,
                  isFavourite: !isFavorite
                }
              : menu
          )
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['menuItems', outletId], context.previousData);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries(['menuItems', outletId]);
    }
  });

  return {
    menuCategories: data?.categories || [],
    menuItems: data?.menus || [],
    isLoading,
    error,
    refetch,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isFavoriteLoading: toggleFavoriteMutation.isLoading
  };
};
