import React from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from './Timer';

const OrderAccordionItem = ({
  orderId,
  itemCount,
  status,
  iconColor = '#FFA902', // default color
  iconBgClass = '', // for bg-primary, bg-danger etc
  // orderSteps,
  isExpanded = false,
  parentId = 'accordionExample',
  showTimer = false,
  remainingSeconds = 0
}) => {
  const navigate = useNavigate();

  // Generate unique IDs for accessibility
  const headingId = `heading${orderId}`;
  const collapseId = `collapse${orderId}`;

  // SVG for the box icon in header
  const BoxIcon = ({ color }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20.929 1.628C20.8546 1.44247 20.7264 1.28347 20.5608 1.17153C20.3952 1.05959 20.1999 0.999847 20 1H4C3.80012 0.999847 3.60479 1.05959 3.43919 1.17153C3.2736 1.28347 3.14535 1.44247 3.071 1.628L1.071 6.628C1.02414 6.74643 1.00005 6.87264 1 7V22C1 22.2652 1.10536 22.5196 1.29289 22.7071C1.48043 22.8946 1.73478 23 2 23H22C22.2652 23 22.5196 22.8946 22.7071 22.7071C22.8946 22.5196 23 22.2652 23 22V7C23 6.87264 22.9759 6.74643 22.929 6.628L20.929 1.628ZM4.677 3H19.323L20.523 6H3.477L4.677 3ZM3 21V8H21V21H3Z"
        fill={color}
      />
      <path
        d="M10 17H6C5.73478 17 5.48043 17.1054 5.29289 17.2929C5.10536 17.4804 5 17.7348 5 18C5 18.2652 5.10536 18.5196 5.29289 18.7071C5.48043 18.8947 5.73478 19 6 19H10C10.2652 19 10.5196 18.8947 10.7071 18.7071C10.8946 18.5196 11 18.2652 11 18C11 17.7348 10.8946 17.4804 10.7071 17.2929C10.5196 17.1054 10.2652 17 10 17Z"
        fill={color}
      />
    </svg>
  );

  // SVG for the status circles in timeline
  const StatusCircle = ({ color = '#027335' }) => (
    <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width={14} height={14} rx={7} fill={color} />
    </svg>
  );

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent accordion toggle
    navigate(`/order-detail/${orderId}`);
  };

  const handleAccordionToggle = (e) => {
    e.preventDefault();
    // Let Bootstrap handle the accordion toggle
  };

  return (
    <div className="accordion-item">
      <div className="accordion-header" id={headingId}>
        <button
          className={`accordion-button ${isExpanded ? '' : 'collapsed'}`}
          type="button"
          onClick={handleViewDetails}
        >
          <div className="d-flex align-items-center w-100" style={{ backgroundImage: 'none' }}>
            <div className="me-3">
              {showTimer ? (
                <Timer initialSeconds={remainingSeconds} />
              ) : (
                <div className={`icon-box ${iconBgClass}`}>
                  <BoxIcon color={iconColor} />
                </div>
              )}
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-0">Order ID #{orderId}</h6>
              <span className="text-soft">{itemCount} Items {status}</span>
            </div>
          </div>
        </button>
      </div>
      {/* <div
        id={collapseId}
        className={`accordion-collapse collapse ${isExpanded ? 'show' : ''}`}
        aria-labelledby={headingId}
        data-bs-parent={`#${parentId}`}
      >
        <div className="accordion-body pb-0">
          <ul className="p-2">
            {orderSteps.map((step, index) => (
              <li key={index} className={`d-flex align-items-start ${index !== orderSteps.length - 1 ? 'mb-3' : ''}`}>
                <div className="me-3">
                  <StatusCircle color={step.completed ? '#027335' : '#7D8FAB'} />
                </div>
                <div>
                  <h6 className={`sub-title mb-1 ${!step.completed ? 'text-soft' : ''}`}>
                    {step.title}
                  </h6>
                  <span className="text-soft">{step.timestamp}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div> */}
    </div>
  );
};

export default OrderAccordionItem;
