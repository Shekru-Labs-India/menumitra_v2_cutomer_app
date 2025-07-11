import axiosInstance from './axios';

// API version constant
const API_VERSION = 'v2';

export const apiService = {
  // Categories
  categories: {
    getList: async ({ outletId }) => {
      const response = await axiosInstance.post(`/${API_VERSION}/common/get_all_menu_list_by_category`, {
        outlet_id: outletId,
        app_source: "customer_app"
      });
      
      // Return only the categories array from the response
      return response?.data?.detail?.category || [];
    },
  },

  // Menu Items
  menus: {
    getByCategory: async ({ outletId, userId }) => {
      const response = await axiosInstance.post('get_all_menu_list_by_category', {
        outlet_id: outletId,
        user_id: userId,
        app_source: "user_app"
      });
      return response?.data?.detail || {};
    },
    getSpecialMenus: async ({ outletId, userId }) => {
      const response = await axiosInstance.post('get_special_menu_list', {
        outlet_id: outletId,
        user_id: userId,
        app_source: "user_app"
      });
      return response?.data?.detail || {};
    },
  },

  // Favorites
  favorites: {
    getList: async ({ outletId, userId }) => {
      const response = await axiosInstance.post('get_favourite_list', {
        outlet_id: outletId,
        user_id: userId,
        app_source: "user_app"
      });
      return response?.data?.detail?.lists || {};
    },
    add: async ({ outletId, userId, menuId }) => {
      const response = await axiosInstance.post('user/save_favourite_menu', {
        outlet_id: outletId,
        user_id: userId,
        menu_id: menuId,
        app_source: "user_app"
      });
      return response.data;
    },
    remove: async ({ outletId, userId, menuId }) => {
      const response = await axiosInstance.post('user/remove_favourite_menu', {
        outlet_id: outletId,
        user_id: userId,
        menu_id: menuId,
        app_source: "user_app"
      });
      return response.data;
    },
  },

  // ... other API endpoints grouped by feature
};

// Error handling wrapper
const withErrorHandling = (apiCall) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      return response;
    } catch (error) {
      // Standardize error format
      const standardError = {
        message: error.response?.data?.message || 'An error occurred',
        status: error.response?.status,
        originalError: error
      };
      throw standardError;
    }
  };
};

// Wrap all API calls with error handling
Object.keys(apiService).forEach(feature => {
  Object.keys(apiService[feature]).forEach(method => {
    apiService[feature][method] = withErrorHandling(apiService[feature][method]);
  });
});

export default apiService;
