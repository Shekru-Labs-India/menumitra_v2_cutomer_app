import { createContext, useState, useContext, useCallback, useEffect } from 'react';
import axiosInstance, { API_VERSION, APP_PREFIX } from '../api/axios';

// Create context
const CacheDataContext = createContext();

// Cache expiration time (in milliseconds)
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes

// Provider component
export const CacheDataProvider = ({ children }) => {
  // Local in-memory cache
  const [cache, setCache] = useState({});
  // Track current data source (cache vs fresh)
  const [dataSource, setDataSource] = useState('unknown');
  
  // Listen for cache:clear event
  useEffect(() => {
    const handleCacheClear = () => {
      console.log('Clearing cache data due to logout');
      setCache({});
    };
    
    window.addEventListener('cache:clear', handleCacheClear);
    
    return () => {
      window.removeEventListener('cache:clear', handleCacheClear);
    };
  }, []);
  
  // Save data to cache with timestamp
  const saveToCache = useCallback((key, data) => {
    setCache(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);
  
  // Get cached data if it exists and is not expired
  const getCachedData = useCallback((key) => {
    const cachedItem = cache[key];
    if (!cachedItem) return null;
    
    // Check if cache is expired
    if (Date.now() - cachedItem.timestamp > CACHE_EXPIRATION) {
      // Cache expired, but still return the data and schedule a cleanup
      setTimeout(() => {
        setCache(prevCache => {
          const newCache = { ...prevCache };
          delete newCache[key];
          return newCache;
        });
      }, 0);
      return cachedItem.data;
    }
    
    return cachedItem.data;
  }, [cache]);
  
  // Clear specific cache item
  const clearCacheItem = useCallback((key) => {
    setCache(prevCache => {
      const newCache = { ...prevCache };
      delete newCache[key];
      return newCache;
    });
  }, []);
  
  // Clear entire cache
  const clearCache = useCallback(() => {
    setCache({});
  }, []);
  
  // Helper function to format the endpoint correctly with version and app prefix
  const formatEndpoint = (endpoint) => {
    // If the endpoint already has the version and prefix, return as is
    if (endpoint.startsWith(API_VERSION)) {
      return endpoint;
    }
    
    // If the endpoint already has the app prefix but not the version
    if (endpoint.startsWith(APP_PREFIX)) {
      return `${API_VERSION}${endpoint}`;
    }
    
    // If the endpoint starts with a slash but has neither version nor app prefix
    if (endpoint.startsWith('/')) {
      return `${API_VERSION}${APP_PREFIX}${endpoint}`;
    }
    
    // If the endpoint doesn't start with a slash and has neither version nor app prefix
    return `${API_VERSION}${APP_PREFIX}/${endpoint}`;
  };

  // Generate a stable cache key from endpoint and body
  const generateCacheKey = useCallback((endpoint, body) => {
    // Extract relevant fields for the key to make it more stable
    const keyData = {};
    
    // Include common fields used in API requests
    if (body.outlet_id) keyData.outlet_id = body.outlet_id;
    if (body.user_id) keyData.user_id = body.user_id;
    if (body.owner_id) keyData.owner_id = body.owner_id;
    
    // Use the formatted endpoint for consistency in cache keys
    const fullEndpoint = formatEndpoint(endpoint);
    
    return `${fullEndpoint}_${JSON.stringify(keyData)}`;
  }, []);
  
  // Fetch data with caching
  const fetchData = useCallback(async (endpoint, body = {}, options = {}) => {
    const {
      forceRefresh = false,
      transformResponse = (data) => data,
      method = 'post'
    } = options;
    
    // Generate a stable cache key
    const cacheKey = generateCacheKey(endpoint, body);
    
    // Store the current request in progress for this key
    const requestInProgress = fetchData.requests?.[cacheKey];
    
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log(`Using cached data for ${endpoint}`);
        setDataSource('cache');
        return cachedData;
      }
    }
    
    // If there's already a request in progress for this key, return the promise
    if (requestInProgress) {
      console.log(`Request already in progress for ${endpoint}, reusing promise`);
      return requestInProgress;
    }
    
    try {
      // Create a new fetch promise
      const fetchPromise = (async () => {
        try {
          console.log(`Fetching fresh data from ${endpoint}`);
          setDataSource('fresh');
          // Make the API request
          let response;
          
          // Ensure the endpoint has the correct format
          const fullEndpoint = formatEndpoint(endpoint);
          
          if (method.toLowerCase() === 'get') {
            response = await axiosInstance.get(fullEndpoint, { params: body });
          } else {
            response = await axiosInstance.post(fullEndpoint, body);
          }
          
          // Transform the response data
          const transformedData = transformResponse(response.data);
          
          // Save to cache
          saveToCache(cacheKey, transformedData);
          
          // Remove from in-progress requests
          if (fetchData.requests) {
            delete fetchData.requests[cacheKey];
          }
          
          return transformedData;
        } catch (error) {
          // Remove from in-progress requests on error
          if (fetchData.requests) {
            delete fetchData.requests[cacheKey];
          }
          throw error;
        }
      })();
      
      // Store the promise to prevent duplicate requests
      if (!fetchData.requests) fetchData.requests = {};
      fetchData.requests[cacheKey] = fetchPromise;
      
      return fetchPromise;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw error;
    }
  }, [getCachedData, saveToCache, generateCacheKey]);
  
  // Initialize the requests tracking object
  fetchData.requests = {};
  
  const contextValue = {
    fetchData,
    getCachedData,
    clearCacheItem,
    clearCache,
    generateCacheKey,
    dataSource
  };
  
  return (
    <CacheDataContext.Provider value={contextValue}>
      {children}
    </CacheDataContext.Provider>
  );
};

// Custom hook for using the cache data context
export const useCacheData = () => {
  const context = useContext(CacheDataContext);
  if (!context) {
    throw new Error('useCacheData must be used within a CacheDataProvider');
  }
  return context;
}; 