import React, { useState, useEffect } from 'react'
import Header from "../components/Header";
import Footer from "../components/Footer";

function CustomerSavings() {
  const [savingsData, setSavingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSavingsData = async () => {
      try {
        // Get auth data from localStorage
        const auth = JSON.parse(localStorage.getItem("auth")) || {};
        const accessToken = auth.accessToken;
        const userId = auth.userId || "73";

        if (!accessToken) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch('https://men4u.xyz/v2/user/get_user_count', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ 
            user_id: parseInt(userId),
            app_source: "user_app",
          })
        });

        if (!response.ok) {
          throw new Error("Failed to fetch savings data");
        }

        const data = await response.json();
        
        if (data.detail) {
          setSavingsData(data.detail);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error('Error fetching savings data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavingsData();
  }, []);

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

  if (!savingsData) {
    return (
      <>
        <Header />
        <div className="page-content bottom-content">
          <div className="container">No savings data available</div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-content bottom-content">
        <div className="container px-3">
          {/* Total Savings Card */}
          <div className="card border-0 mb-4" style={{ backgroundColor: '#027335' }}>
            <div className="card-body text-white py-3">
              <h6 className="mb-3 fw-normal text-center text-white">Total Savings</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-light">Regular Discount</span>
                <span className="fs-5">₹{savingsData.regular_discount}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-light">Special Discount</span>
                <span className="fs-5">₹{savingsData.special_discount}</span>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="row g-3 mb-4">
            <div className="col-6">
              <div className="card h-100" style={{ 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center">
                  <div className="fs-3 fw-bold text-dark mb-1">
                    {savingsData.user_count}
                  </div>
                  <div className="text-muted small" style={{ color: '#6B7280' }}>Total Orders</div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div className="card h-100" style={{ 
                border: '1px solid #E5E7EB', 
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center">
                  <div className="fs-3 fw-bold text-dark mb-1">
                    ₹{savingsData.total_amount_spent}
                  </div>
                  <div className="text-muted small" style={{ color: '#6B7280' }}>Amount Spent</div>
                </div>
              </div>
            </div>
          </div>

          {/* Outlet Details */}
          {Object.entries(savingsData.outlet_wise_data).map(([key, outlet]) => (
            <div key={key} className="card mb-4" style={{ 
              border: '1px solid #E5E7EB', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              backgroundColor: '#FFFFFF'
            }}>
              <div className="card-body p-3">
                <h6 className="mb-4 fw-semibold">{outlet.outlet_name}</h6>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: '#A1A5B7' }}>Orders</span>
                  <span className="badge bg-success rounded-pill px-3">{outlet.order_count}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: '#A1A5B7' }}>Amount Spent</span>
                  <span className="text-dark">₹{outlet.total_amount_spent}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: '#A1A5B7' }}>Regular Discount</span>
                  <span style={{ color: '#027335' }}>₹{outlet.regular_discount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: '#A1A5B7' }}>Special Discount</span>
                  <span style={{ color: '#027335' }}>₹{outlet.special_discount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: '#A1A5B7' }}>Complementary Items</span>
                  <span className="badge rounded-pill px-3" style={{ 
                    backgroundColor: '#E8F3FF',
                    color: '#3699FF'
                  }}>{outlet.complementary_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default CustomerSavings;