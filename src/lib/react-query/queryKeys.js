// Define query keys as constants to maintain consistency
export const queryKeys = {
  categories: (outletId) => ['categories', outletId],
  menuItems: (outletId, categoryId) => ['menuItems', outletId, categoryId],
  favorites: (userId, outletId) => ['favorites', userId, outletId],
  // Add more keys as needed
};

// Define reusable query configurations
export const queries = {
  categories: (outletId) => ({
    queryKey: queryKeys.categories(outletId),
    // We'll implement these query functions later
    queryFn: () => fetchCategories(outletId),
  }),
  menuItems: (outletId, categoryId) => ({
    queryKey: queryKeys.menuItems(outletId, categoryId),
    queryFn: () => fetchMenuItems(outletId, categoryId),
  }),
  // Add more queries as needed
};
