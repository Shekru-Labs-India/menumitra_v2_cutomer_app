import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOutlet } from '../../contexts/OutletContext';

const API_BASE_URL = 'https://men4u.xyz/v2';

export const useFavorite = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getUserId } = useAuth();
  const { outletId } = useOutlet();

  // Helper function to get auth data
  const getAuthData = () => {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      return null;
    }
  };

  const getFavorites = async () => {
    setLoading(true);
    setError(null);
    try {
      const authData = getAuthData();
      const accessToken = authData?.accessToken;
      const userId = authData?.userId;

      if (!accessToken || !userId) {
        throw new Error('Please login to view favorites');
      }

      const response = await fetch(`${API_BASE_URL}/user/get_favourite_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          outlet_id: outletId,
          user_id: userId,
          app_source: "user_app",
        })
      });

      const data = await response.json();

      if (data.detail && data.detail.lists) {
        return Object.values(data.detail.lists).flat();
      }
      return [];
    } catch (err) {
      setError(err.message || 'Failed to load favorite items');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (menuId, isFavorite) => {
    setLoading(true);
    setError(null);
    try {
      const authData = getAuthData();
      const accessToken = authData?.accessToken;
      const userId = authData?.userId;

      if (!accessToken || !userId) {
        throw new Error('Please login to manage favorites');
      }

      const endpoint = isFavorite 
        ? `${API_BASE_URL}/user/remove_favourite`
        : `${API_BASE_URL}/user/add_favourite`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          outlet_id: outletId,
          user_id: userId,
          menu_id: menuId,
          app_source: "user_app",
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isFavorite ? 'remove from' : 'add to'} favorites`);
      }

      return data;
    } catch (err) {
      setError(err.message || 'Failed to update favorite status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getFavorites,
    toggleFavorite,
    loading,
    error
  };
}; 