import React, { useState, useEffect } from 'react';
import { useCacheData } from '../contexts/CacheDataContext';

/**
 * A component that displays cache status and debugging information
 */
const CacheStatus = () => {
  const { dataSource } = useCacheData();
  const [timestamp, setTimestamp] = useState(new Date());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Update timestamp whenever data source changes
    if (dataSource === 'fresh' || dataSource === 'cache') {
      setTimestamp(new Date());
    }
  }, [dataSource]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  if (!dataSource || dataSource === 'unknown') {
    return null;
  }

  return (
    <div 
      className="position-fixed bottom-0 end-0 m-3 z-index-999"
      style={{ zIndex: 1050 }}
    >
      <div 
        className="card border-0 shadow-sm"
        style={{ 
          maxWidth: expanded ? '300px' : '180px',
          borderRadius: '12px',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        <div 
          className="card-header py-2 px-3 d-flex justify-content-between align-items-center"
          onClick={toggleExpanded}
          style={{ 
            cursor: 'pointer',
            background: dataSource === 'cache' 
              ? 'linear-gradient(135deg, #26A69A 0%, #00796B 100%)' 
              : 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)',
            color: 'white',
            fontSize: '0.8rem'
          }}
        >
          <div className="d-flex align-items-center">
            <i className={`fas ${dataSource === 'cache' ? 'fa-database' : 'fa-cloud-download-alt'} me-2`}></i>
            <span>{dataSource === 'cache' ? 'Cached Data' : 'Fresh Data'}</span>
          </div>
          <i className={`fas ${expanded ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
        </div>
        
        {expanded && (
          <div className="card-body p-2" style={{ fontSize: '0.8rem' }}>
            <div className="mb-2">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Last Updated:</span>
                <span>{formatTime(timestamp)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Cache Duration:</span>
                <span>5 minutes</span>
              </div>
            </div>
            
            <div className="d-grid">
              <button 
                className="btn btn-sm btn-outline-secondary w-100"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.reload();
                }}
              >
                <i className="fas fa-sync-alt me-1"></i> Manual Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CacheStatus; 