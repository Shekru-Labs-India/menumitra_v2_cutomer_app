// src/hooks/useCategories.js
import { useState, useEffect } from 'react';
import { getApiUrl } from '../constants/config';
import { useOutlet } from '../contexts/OutletContext';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { outletId } = useOutlet();
  useEffect(() => {
    const fetchCategories = async () => {
      console.log('🔄 Fetching categories...');
      try {
        setLoading(true);
        const authData = localStorage.getItem('auth');
        const userData = authData ? JSON.parse(authData) : null;

        console.log('📦 Using outlet ID:', outletId);

        const response = await fetch(getApiUrl('get_all_menu_list_by_category'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userData?.accessToken}`
          },
          body: JSON.stringify({
            outlet_id: outletId,
            user_id: userData?.userId || null,
            app_source: "user_app",
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        console.log('✅ Categories API Response:', data);
        
        if (data.detail?.category) {
          const formattedCategories = data.detail.category.map(category => ({
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

    fetchCategories();
  }, []); // Only run once on mount

  return { categories, loading, error };
};