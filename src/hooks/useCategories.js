// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { useOutlet } from '../contexts/OutletContext';
import { useCacheData } from '../contexts/CacheDataContext';
import { useAuth } from '../contexts/AuthContext'; // Add this import

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { outletId } = useOutlet();
  const { fetchData } = useCacheData();
  const { getUserId } = useAuth(); // Add this line to get the getUserId function

  useEffect(() => {
    const fetchCategories = async () => {
      console.log('🔄 Fetching categories...');
      try {
        setLoading(true);
        console.log('📦 Using outlet ID:', outletId);
        
        // Get user ID from AuthContext
        const userId = getUserId() || null;

        // Use caching system instead of direct fetch
        const response = await fetchData('get_all_menu_list_by_category', {
          outlet_id: outletId,
          user_id: userId, // Add the user_id parameter
          app_source: "user_app",
        });
        
        console.log('✅ Categories API Response:', response);
        
        if (response.detail?.category) {
          const formattedCategories = response.detail.category.map(category => ({
            menuCatId: category.menu_cat_id,
            categoryName: category.category_name,
            menuCount: category.menu_count
          }));
          console.log('✨ Formatted categories:', formattedCategories);
          setCategories(formattedCategories);
        }
      } catch (err) {
        console.error('❌ Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (outletId) {
      fetchCategories();
    }
  }, [outletId, fetchData, getUserId]); // Added getUserId as dependency

  return { categories, loading, error };
};