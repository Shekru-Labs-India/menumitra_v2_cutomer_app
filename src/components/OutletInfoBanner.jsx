import React from "react";
import { useModal } from '../contexts/ModalContext';
import { useCart } from '../contexts/CartContext';
import { useOutlet } from '../contexts/OutletContext';
import { useNavigate } from 'react-router-dom';

function OutletInfoBanner() {
  const { openModal } = useModal();
  const { orderSettings } = useCart();
  const { 
    outletName,
    address,
    outletCode,
    fetchOutletDetailsByCode,
    isOutletOnlyUrl
  } = useOutlet();
  const navigate = useNavigate();

  // Map of order types to their icons
  const orderTypeIcons = {
    'counter': '🏪',
    'drive-through': '🚗',
    'delivery': '🛵',
    'parcel': '📦'
  };

  // Map of order types to their display names
  const orderTypeNames = {
    'counter': 'Counter',
    'drive-through': 'Drive Through',
    'delivery': 'Delivery',
    'parcel': 'Parcel'
  };

  const handleOrderTypeClick = () => {
    openModal('orderType');
  };

  const handleOutletClick = () => {
    navigate('/outlet-details');
  };

  // If we have an outlet code but no outlet details, fetch them
  React.useEffect(() => {
    if (outletCode && !outletName) {
      fetchOutletDetailsByCode(outletCode);
    }
  }, [outletCode, outletName, fetchOutletDetailsByCode]);

  return (
    <div className="container py-2">
      <div className="d-flex align-items-center">
        {/* Left side - Store Icon and Name */}
        <div className="d-flex align-items-center flex-grow-1">
          <div className="me-2 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="32"
              height="32"
            >
              <path d="M21 13.2422V20H22V22H2V20H3V13.2422C1.79401 12.435 1 11.0602 1 9.5C1 8.67286 1.22443 7.87621 1.63322 7.19746L4.3453 2.5C4.52393 2.1906 4.85406 2 5.21132 2H18.7887C19.1459 2 19.4761 2.1906 19.6547 2.5L22.3575 7.18172C22.7756 7.87621 23 8.67286 23 9.5C23 11.0602 22.206 12.435 21 13.2422ZM19 13.9725C18.8358 13.9907 18.669 14 18.5 14C17.2409 14 16.0789 13.478 15.25 12.6132C14.4211 13.478 13.2591 14 12 14C10.7409 14 9.5789 13.478 8.75 12.6132C7.9211 13.478 6.75911 14 5.5 14C5.331 14 5.16417 13.9907 5 13.9725V20H19V13.9725ZM5.78865 4L3.35598 8.21321C3.12409 8.59843 3 9.0389 3 9.5C3 10.8807 4.11929 12 5.5 12C6.53096 12 7.44467 11.3703 7.82179 10.4295C8.1574 9.59223 9.3426 9.59223 9.67821 10.4295C10.0553 11.3703 10.969 12 12 12C13.031 12 13.9447 11.3703 14.3218 10.4295C14.6574 9.59223 15.8426 9.59223 16.1782 10.4295C16.5553 11.3703 17.469 12 18.5 12C19.8807 12 21 10.8807 21 9.5C21 9.0389 20.8759 8.59843 20.6347 8.19746L18.2113 4H5.78865Z"></path>
            </svg>
          </div>
          <div 
            onClick={handleOutletClick}
            style={{ cursor: 'pointer' }}
            role="button"
            className="outlet-info"
          >
            <h6 className="mb-0 text-dark fw-bold">
              {outletName || '-'}
            </h6>
            <small className="text-muted">
              {address 
                ? address
                    .split(',')
                    .map(part => part.trim().charAt(0).toUpperCase() + part.trim().slice(1).toLowerCase())
                    .join(', ') 
                : 'No address available'}
            </small>
          </div>
        </div>

        {/* Right side - Order Type Selection */}
        <div>
          {isOutletOnlyUrl && (
            <button
              className="btn btn-link p-0 d-flex align-items-center"
              onClick={handleOrderTypeClick}
              style={{ textDecoration: 'none' }}
            >
              <div className="text-primary">
                {orderSettings.order_type ? (
                  <span style={{ fontSize: '24px' }}>
                    {orderTypeIcons[orderSettings.order_type]}
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 15 24"
                    fill="currentColor"
                    className="me-2"
                  >
                    <path d="M12 2C8.1 2 5 5.1 5 9c0 4 7 13 7 13s7-9 7-13c0-3.9-3.1-7-7-7zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3z" />
                  </svg>
                )}
              </div>
              <div className="d-flex flex-column align-items-start ms-2">
                <span className="fw-bold text-dark">
                  {orderSettings.order_type 
                    ? orderTypeNames[orderSettings.order_type]
                    : 'Select Order Type'
                  }
                </span>
                <small className="text-muted">
                  {orderSettings.order_type 
                    ? 'Tap to change'
                    : 'Click to select'
                  }
                </small>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OutletInfoBanner;
