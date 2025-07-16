import React from 'react';
import { useCacheData } from '../contexts/CacheDataContext';
import { useOutlet } from '../contexts/OutletContext';

/**
 * A test component that provides controls to test cache functionality
 */
const TestCacheButton = () => {
  const { fetchData, clearCache, dataSource } = useCacheData();
  const { outletId } = useOutlet();

  const handleForceFetch = async () => {
    try {
      // Get auth data
      const authData = localStorage.getItem('auth');
      const userData = authData ? JSON.parse(authData) : null;
      
      if (!userData?.accessToken || !outletId) {
        alert('Authentication or outlet ID required');
        return;
      }

      console.log('Forcing a fresh fetch from API...');
      
      // Force refresh with forceRefresh: true
      const response = await fetchData('get_category_list', {
        outlet_id: outletId,
        app_source: "user_app"
      }, { forceRefresh: true });
      
      console.log('Fresh data fetched:', response);
      
      // Reload the page to see the updated data
      window.location.reload();
    } catch (error) {
      console.error('Error fetching fresh data:', error);
      alert('Error fetching fresh data');
    }
  };

  const handleClearCache = () => {
    clearCache();
    alert('Cache cleared. The next request will fetch fresh data.');
  };

  return (
    <div className="d-flex flex-column align-items-center my-3">
      {/* Data source indicator */}
      <div className="mb-2">
        <span className="badge rounded-pill px-3 py-2 me-2" style={{
          background: dataSource === 'cache' 
            ? 'linear-gradient(135deg, #26A69A 0%, #00796B 100%)' 
            : dataSource === 'fresh' 
              ? 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)'
              : 'linear-gradient(135deg, #9E9E9E 0%, #616161 100%)',
          color: 'white'
        }}>
          <i className={`fas me-1 ${
            dataSource === 'cache' 
              ? 'fa-database' 
              : dataSource === 'fresh' 
                ? 'fa-cloud-download-alt'
                : 'fa-question-circle'
          }`}></i>
          Data Source: {dataSource === 'cache' ? 'Cache' : dataSource === 'fresh' ? 'Fresh API' : 'Unknown'}
        </span>
      </div>
      
      <div className="btn-group">
        <button 
          onClick={handleForceFetch}
          className="btn btn-sm btn-primary me-2"
          style={{
            background: 'linear-gradient(135deg, #FF7043 0%, #F4511E 100%)',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 16px'
          }}
        >
          <i className="fas fa-sync-alt me-2"></i>
          Force Refresh Data
        </button>
        <button 
          onClick={handleClearCache}
          className="btn btn-sm btn-outline-secondary"
          style={{
            borderRadius: '20px',
            padding: '8px 16px'
          }}
        >
          <i className="fas fa-trash-alt me-2"></i>
          Clear Cache
        </button>
      </div>
    </div>
  );
};

export default TestCacheButton; 