import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthOffcanvas from "../components/Auth/AuthOffcanvas";
import { useAuth } from "../contexts/AuthContext";
import apiService from '../api/apiService';

function CustomerSavings() {
  const [savingsData, setSavingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, showAuthOffcanvas, setShowAuthOffcanvas } = useAuth();

  useEffect(() => {
    const fetchSavingsData = async () => {
      try {
        // Get userId from localStorage auth
        const auth = JSON.parse(localStorage.getItem('auth')) || {};
        const userId = auth.userId;
        
        if (!userId) {
          throw new Error("User ID not found");
        }

        const data = await apiService.customer.getSavings({ userId });
        setSavingsData(data);
      } catch (error) {
        console.error("Error fetching savings data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavingsData();
  }, []); // Remove user from dependency since we're using localStorage

  // Handler to open AuthOffcanvas
  const handleLogin = () => setShowAuthOffcanvas(true);

  if (!user) {
    return (
      <>
        <Header />
        <AuthOffcanvas
          isOpen={showAuthOffcanvas}
          onClose={() => setShowAuthOffcanvas(false)}
        />
        <div className="page-content bottom-content">
          <div
            className="container d-flex flex-column justify-content-center align-items-center"
            style={{ minHeight: "60vh" }}
          >
            <div className="text-center">
              <h5>Please login to view your savings.</h5>
              <br />
              <button className="btn btn-primary mt-3" onClick={handleLogin}>
                Login Now
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

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
          <div
            className="card border-0 mb-4"
            style={{ backgroundColor: "#027335" }}
          >
            <div className="card-body text-white py-3">
              <h6 className="mb-3 fw-normal text-center text-white">
                Total Savings
              </h6>
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
              <div
                className="card h-100"
                style={{
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center">
                  <div className="fs-3 fw-bold text-dark mb-1">
                    {savingsData.user_count}
                  </div>
                  <div
                    className="text-muted small"
                    style={{ color: "#6B7280" }}
                  >
                    Total Orders
                  </div>
                </div>
              </div>
            </div>
            <div className="col-6">
              <div
                className="card h-100"
                style={{
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div className="card-body p-3 d-flex flex-column justify-content-center align-items-center">
                  <div className="fs-3 fw-bold text-dark mb-1">
                    ₹{savingsData.total_amount_spent}
                  </div>
                  <div
                    className="text-muted small"
                    style={{ color: "#6B7280" }}
                  >
                    Amount Spent
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outlet Details */}
          {Object.entries(savingsData.outlet_wise_data).map(([key, outlet]) => (
            <div
              key={key}
              className="card mb-4"
              style={{
                border: "1px solid #E5E7EB",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                backgroundColor: "#FFFFFF",
              }}
            >
              <div className="card-body p-3">
                <h6 className="mb-4 fw-semibold">{outlet.outlet_name}</h6>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: "#A1A5B7" }}>Orders</span>
                  <span className="badge bg-success rounded-pill px-3">
                    {outlet.order_count}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: "#A1A5B7" }}>Amount Spent</span>
                  <span className="text-dark">
                    ₹{outlet.total_amount_spent}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: "#A1A5B7" }}>Regular Discount</span>
                  <span style={{ color: "#027335" }}>
                    ₹{outlet.regular_discount}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span style={{ color: "#A1A5B7" }}>Special Discount</span>
                  <span style={{ color: "#027335" }}>
                    ₹{outlet.special_discount}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span style={{ color: "#A1A5B7" }}>Complementary Items</span>
                  <span
                    className="badge rounded-pill px-3"
                    style={{
                      backgroundColor: "#E8F3FF",
                      color: "#3699FF",
                    }}
                  >
                    {outlet.complementary_count}
                  </span>
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
