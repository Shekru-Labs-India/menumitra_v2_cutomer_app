import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOutlet } from "../contexts/OutletContext"

const OrderRating = ({ orderId, initialRating }) => {
  const { outletId } = useOutlet();
  const [rating, setRating] = useState(initialRating || 0);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!initialRating);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const accessToken = auth.accessToken;
      const userId = auth.userId || "73";

      const response = await fetch('https://men4u.xyz/v2/user/rating_to_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          outlet_id: outletId.toString(),
          user_id: userId,
          order_id: orderId,
          rating: rating.toString()
        })
      });

      const data = await response.json();

      if (response.ok && data.detail === "rating updated") {
        setIsSubmitted(true);
      } else {
        throw new Error(data.detail || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rating-section bg-light rounded-4 p-3 mb-4">
        <div className="text-center">
          <h6 className="title font-w600 mb-3">Your Rating</h6>
          <div className="d-flex justify-content-center mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={star <= rating ? "#FFA902" : "#D1D1D1"}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
              </svg>
            ))}
          </div>
          <p className="text-soft mt-2 mb-0">You've already rated this order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-section bg-light rounded-4 p-3 mb-4">
      <div className="text-center">
        <h6 className="title font-w600 mb-3">How was your order?</h6>
        <div className="stars d-flex justify-content-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`btn btn-link p-0 m-0`}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={star <= (hover || rating) ? "#FFA902" : "#D1D1D1"}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z"/>
              </svg>
            </button>
          ))}
        </div>
        {error && (
          <div className="alert alert-danger py-2 mb-3">{error}</div>
        )}
        <button
          className="btn btn-primary px-4"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Submitting...
            </>
          ) : (
            'Submit Rating'
          )}
        </button>
      </div>
    </div>
  );
};

function OrderDetail() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const VegIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="white" stroke="#00B67A" strokeWidth="2"/>
      <circle cx="8" cy="8" r="3" fill="#00B67A"/>
    </svg>
  );

  const NonVegIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="2" fill="white" stroke="#E74C3C" strokeWidth="2"/>
      <circle cx="8" cy="8" r="3" fill="#E74C3C"/>
    </svg>
  );

  // Move getStatusClass outside of getStatusBadgeStyle
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'placed': return 'status-placed';
      case 'cooking': return 'status-cooking';
      case 'served': return 'status-served';
      case 'cancelled': return 'status-cancelled';
      case 'paid': return 'status-paid';
      default: return 'status-default';
    }
  };

  // Enhanced status badge style with better color coding
  const getStatusBadgeStyle = (status) => {
    const statusColors = {
      'placed': { 
        backgroundColor: '#FFF8E1', 
        color: '#FFA000',
        border: '1px solid #FFE082',
        padding: '6px 15px',
        fontSize: '12px',
        fontWeight: '500'
      },
      'cooking': { 
        backgroundColor: '#E8F5E9', 
        color: '#027335',
        border: '1px solid #A5D6A7',
        padding: '6px 15px',
        fontSize: '12px',
        fontWeight: '500'
      },
      'served': { 
        backgroundColor: '#E3F2FD', 
        color: '#1565C0',
        border: '1px solid #90CAF9',
        padding: '6px 15px',
        fontSize: '12px',
        fontWeight: '500'
      },
      'cancelled': { 
        backgroundColor: '#FFEBEE', 
        color: '#C62828',
        border: '1px solid #FFCDD2',
        padding: '6px 15px',
        fontSize: '12px',
        fontWeight: '500'
      },
      'paid': { 
        backgroundColor: '#E0F2F1', 
        color: '#00796B',
        border: '1px solid #80CBC4',
        padding: '6px 15px',
        fontSize: '12px',
        fontWeight: '500'
      }
    };

    return statusColors[status.toLowerCase()] || {
      backgroundColor: '#FAFAFA',
      color: '#616161',
      border: '1px solid #E0E0E0',
      padding: '6px 15px',
      fontSize: '12px',
      fontWeight: '500'
    };
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Get auth data from localStorage
        const auth = JSON.parse(localStorage.getItem("auth")) || {};
        const accessToken = auth.accessToken;
        const userId = auth.userId || "73"; // Get userId from localStorage

        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch('https://men4u.xyz/v2/user/get_order_details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ 
            order_id: orderId,
            user_id: parseInt(userId) // Add user_id to payload
          })
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        
        if (data.detail) {
          setOrderDetails(data.detail);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="page-content bottom-content">
          <div className="container">Loading...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="page-content bottom-content">
          <div className="container">Error: {error}</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-content bottom-content" style={{ backgroundColor: 'var(--bs-gray-100)' }}>
        <div className="container pb-4">
          {/* Order Header Card */}
          <div className="card dz-card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <span className="text-soft mb-2 d-block">Order ID</span>
                  <h5 className="mb-0">#{orderDetails.order_details.order_number}</h5>
                </div>
                <span 
                  className={`badge rounded-pill ${getStatusClass(orderDetails.order_details.order_status)}`}
                  style={getStatusBadgeStyle(orderDetails.order_details.order_status)}
                >
                  {orderDetails.order_details.order_status}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-soft">
                  <i className="fa-regular fa-clock me-2"></i>
                  {`${orderDetails.order_details.date} ${orderDetails.order_details.time}`}
                </span>
                <span className="text-soft">
                  <i className="fa-solid fa-location-dot me-2"></i>
                  {orderDetails.order_details.order_type}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card dz-card mt-3">
            <div className="card-header border-0 pb-0">
              <h5 className="card-title">Order Items</h5>
            </div>
            <div className="card-body pt-3">
              {orderDetails.menu_details.map((menu, index) => (
                <div key={index} className="dz-order-item d-flex align-items-center justify-content-between py-3" 
                     style={{ borderBottom: index !== orderDetails.menu_details.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div className="d-flex align-items-center">
                    <div className="food-type-icon me-3">
                      {menu.menu_food_type.toLowerCase() === "veg" ? <VegIcon /> : <NonVegIcon />}
                    </div>
                    <div>
                      <h6 className="mb-1">{menu.menu_name}</h6>
                      <p className="mb-0 text-soft">Qty: {menu.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Details */}
          <div className="card dz-card mt-3">
            <div className="card-header border-0 pb-0">
              <h5 className="card-title">Payment Details</h5>
            </div>
            <div className="card-body pt-3">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Bill Amount</span>
                  <strong>₹{orderDetails.order_details.total_bill_amount}</strong>
                </li>
                {orderDetails.order_details.service_charges_amount > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Service Charge ({orderDetails.order_details.service_charges_percent}%)</span>
                    <strong>₹{orderDetails.order_details.service_charges_amount}</strong>
                  </li>
                )}
                {orderDetails.order_details.gst_amount > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>GST ({orderDetails.order_details.gst_percent}%)</span>
                    <strong>₹{orderDetails.order_details.gst_amount}</strong>
                  </li>
                )}
                {orderDetails.order_details.charges > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Additional Charges</span>
                    <strong>₹{orderDetails.order_details.charges}</strong>
                  </li>
                )}
                {orderDetails.order_details.tip > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Tip</span>
                    <strong>₹{orderDetails.order_details.tip}</strong>
                  </li>
                )}
                {orderDetails.order_details.discount_amount > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0 text-success">
                    <span>Discount ({orderDetails.order_details.discount_percent}%)</span>
                    <strong>-₹{orderDetails.order_details.discount_amount}</strong>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between px-0 border-0">
                  <h6 className="mb-0">Total Amount</h6>
                  <h6 className="mb-0 text-primary">₹{orderDetails.order_details.final_grand_total}</h6>
                </li>
              </ul>
            </div>
          </div>

          {/* Table Information */}
          {orderDetails.order_details.table_number && 
           orderDetails.order_details.table_number.length > 0 && 
           !['counter', 'drive-through', 'delivery', 'parcel'].includes(orderDetails.order_details.order_type.toLowerCase()) && (
            <div className="card dz-card mt-3">
              <div className="card-header border-0 pb-0">
                <h5 className="card-title">Table Information</h5>
              </div>
              <div className="card-body pt-3">
                <div className="d-flex align-items-center">
                  <i className="fa-solid fa-table me-3 text-primary"></i>
                  <div>
                    <h6 className="mb-1">Table {orderDetails.order_details.table_number.join(", ")}</h6>
                    <p className="mb-0 text-soft">{orderDetails.order_details.section_name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer & Restaurant Info */}
          <div className="card dz-card mt-3">
            <div className="card-header border-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Contact Information</h5>
            </div>
            <div className="card-body pt-3">
              <div className="d-flex align-items-center mb-3">
                <div>
                  <h6 className="mb-1">{orderDetails.order_details.user_name}</h6>
                  <p className="mb-0 text-soft">{orderDetails.order_details.user_mobile}</p>
                </div>
              </div>
              <div className="border-top pt-3">
                <h6 className="mb-2">Restaurant</h6>
                <p className="mb-0">{orderDetails.order_details.outlet_name}</p>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="mt-3">
            {orderDetails.order_details.order_status.toLowerCase() === 'paid' && (
              <OrderRating 
                orderId={orderDetails.order_details.order_id}
                initialRating={orderDetails.order_details.rating ? 
                  parseInt(orderDetails.order_details.rating) : 
                  undefined
                }
              />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderDetail;
