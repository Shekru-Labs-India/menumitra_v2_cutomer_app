import React, { useEffect, useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOutlet } from "../contexts/OutletContext";
import OutletInfoBanner from "../components/OutletInfoBanner";

function OutletDetails() {
  const { outletInfo, outletId } = useOutlet();
  const [restaurantDetails, setRestaurantDetails] = useState(() => {
    // Always initialize from cache if available
    const cached = localStorage.getItem(
      `restaurant_details_${outletInfo?.outletId}`
    );
    return cached
      ? JSON.parse(cached)
      : {
          outlet_details: {
            name: outletInfo?.outletName,
            address: outletInfo?.outletAddress,
            mobile: outletInfo?.outletMobile,
            veg_nonveg: outletInfo?.vegNonveg,
            upi_id: "",
            image: null,
          },
          count: {
            total_menu: 0,
            total_special_menu: 0,
            total_offer_menu: 0,
            total_category: 0,
            total_tables: 0,
          },
        };
  });
  const [isProcessingUPI, setIsProcessingUPI] = useState(false);
  const [isProcessingPhonePe, setIsProcessingPhonePe] = useState(false);
  const [isProcessingGPay, setIsProcessingGPay] = useState(false);
  const lastFetchRef = useRef(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  const fetchRestaurantDetails = async () => {
    try {
      // Get the token from your auth context or localStorage
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const accessToken = auth.accessToken;

      const response = await fetch(
        "https://men4u.xyz/v2/user/get_restaurant_details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            outlet_id: outletId,
            app_source: "user_app",
          }),
        }
      );
      const data = await response.json();

      setRestaurantDetails(data.detail);
      lastFetchRef.current = Date.now();
    } catch (error) {
      console.error("Error fetching restaurant details:", error);
    }
  };

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!outletInfo?.outletId) return;

    // Always fetch on mount
    fetchRestaurantDetails();

    // Set up periodic refresh
    const intervalId = setInterval(fetchRestaurantDetails, CACHE_DURATION);

    return () => {
      clearInterval(intervalId);
      lastFetchRef.current = 0;
    };
  }, [outletInfo?.outletId]);

  const handleGenericUPI = () => {
    if (isProcessingUPI) return;
    try {
      setIsProcessingUPI(true);
      const upiUrl = `upi://pay?pa=${
        restaurantDetails?.outlet_details?.upi_id
      }&pn=${encodeURIComponent(
        restaurantDetails?.outlet_details?.name
      )}&mc=1234&tid=TEST123&tr=TEST123&tn=Test payment&am=1&cu=INR`;
      window.location.href = upiUrl;
    } catch (error) {
      console.clear();
      setIsProcessingUPI(false);
    }
  };

  const handlePhonePe = () => {
    if (isProcessingPhonePe) return;
    try {
      setIsProcessingPhonePe(true);
      const phonePeUrl = `phonepe://upi/pay?pa=${
        restaurantDetails?.outlet_details?.upi_id
      }&pn=${encodeURIComponent(
        restaurantDetails?.outlet_details?.name
      )}&mc=1234&tid=TEST123&tr=TEST123&tn=Test payment&am=1&cu=INR`;
      window.location.href = phonePeUrl;
    } catch (error) {
      console.clear();
    } finally {
      setIsProcessingPhonePe(false);
    }
  };

  const handleGooglePay = () => {
    if (isProcessingGPay) return;
    try {
      setIsProcessingGPay(true);
      const googlePayUrl = `gpay://upi/pay?pa=${
        restaurantDetails?.outlet_details?.upi_id
      }&pn=${encodeURIComponent(
        restaurantDetails?.outlet_details?.name
      )}&mc=1234&tid=TEST123&tr=TEST123&tn=Test payment&am=1&cu=INR`;
      window.location.href = googlePayUrl;
    } catch (error) {
      console.clear();
    } finally {
      setIsProcessingGPay(false);
    }
  };

  const VegIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        stroke="#008000"
        strokeWidth="2"
      />
      <circle cx="8" cy="8" r="4" fill="#008000" />
    </svg>
  );

  const NonVegIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        rx="2"
        stroke="#FF0000"
        strokeWidth="2"
      />
      <circle cx="8" cy="8" r="4" fill="#FF0000" />
    </svg>
  );

  return (
    <>
      <Header />
      <OutletInfoBanner />
      <div className="container py-4">
        {/* Restaurant Details Card */}
        <div className="card mb-4">
          <div
            className="card-body rounded-3"
            style={{
              border: "1px solid #E5E7EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div className="d-flex align-items-center mb-4">
              <div
                className="rounded-3 bg-light me-3 d-flex align-items-center justify-content-center"
                style={{ width: "64px", height: "64px" }}
              >
                {restaurantDetails?.outlet_details?.image ? (
                  <img
                    src={restaurantDetails.outlet_details.image}
                    alt="Restaurant"
                    className="rounded-3 w-100 h-100"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <i
                    className="fas fa-store text-primary"
                    style={{ fontSize: "24px" }}
                  ></i>
                )}
              </div>
              <div>
                <div className="d-flex align-items-center mb-1">
                  <h5 className="mb-0 fw-semibold me-2">
                    {restaurantDetails?.outlet_details?.name}
                  </h5>
                  <div className="d-flex align-items-center">
                    {restaurantDetails?.outlet_details?.veg_nonveg?.toLowerCase() ===
                    "veg" ? (
                      <VegIcon />
                    ) : restaurantDetails?.outlet_details?.veg_nonveg?.toLowerCase() ===
                      "nonveg" ? (
                      <NonVegIcon />
                    ) : (
                      <div className="d-flex">
                        <VegIcon />
                        <NonVegIcon className="ms-1" />
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-muted mb-1">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  {restaurantDetails?.outlet_details?.address}
                </p>
                <div className="d-flex align-items-center">
                  <span className="text-muted small">
                    <i className="fas fa-phone me-1"></i>
                    {restaurantDetails?.outlet_details?.mobile}
                  </span>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="row g-3 mb-4">
              <div className="col-4 d-flex flex-column align-items-center justify-content-center py-3">
                <h3 className="mb-1 fw-semibold">
                  {restaurantDetails?.count?.total_menu}
                </h3>
                <small className="text-muted">Menu Items</small>
              </div>
              <div className="col-4 d-flex flex-column align-items-center justify-content-center py-3">
                <h3 className="mb-1 fw-semibold">
                  {restaurantDetails?.count?.total_special_menu}
                </h3>
                <small className="text-muted">Special Items</small>
              </div>
              <div className="col-4 d-flex flex-column align-items-center justify-content-center py-3">
                <h3 className="mb-1 fw-semibold">
                  {restaurantDetails?.count?.total_offer_menu}
                </h3>
                <small className="text-muted">Offer Items</small>
              </div>
              <div className="col-6 d-flex flex-column align-items-center justify-content-center py-3">
                <h3 className="mb-1 fw-semibold">
                  {restaurantDetails?.count?.total_category}
                </h3>
                <small className="text-muted">Categories</small>
              </div>
              <div className="col-6 d-flex flex-column align-items-center justify-content-center py-3">
                <h3 className="mb-1 fw-semibold">
                  {restaurantDetails?.count?.total_tables}
                </h3>
                <small className="text-muted">Total Tables</small>
              </div>
            </div>

            {/* UPI Payment Section */}
            <div className="text-center mb-3">
              <h6 className="mb-2">Quick Payment</h6>
              <div className="d-flex align-items-center justify-content-center">
                <i className="fas fa-qrcode text-primary me-2"></i>
                <span className="font-monospace">
                  {restaurantDetails?.outlet_details?.upi_id}
                </span>
              </div>
            </div>

            <div className="row g-2">
              <div className="col-6">
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: "#5F259F",
                    color: "white",
                  }}
                  onClick={handlePhonePe}
                  disabled={isProcessingPhonePe}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-mobile-alt me-2"></i>
                    <span>
                      {isProcessingPhonePe ? "Opening..." : "PhonePe"}
                    </span>
                  </div>
                </button>
              </div>
              <div className="col-6">
                <button
                  className="btn w-100"
                  style={{
                    backgroundColor: "#1a73e8",
                    color: "white",
                  }}
                  onClick={handleGooglePay}
                  disabled={isProcessingGPay}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fab fa-google me-2"></i>
                    <span>{isProcessingGPay ? "Opening..." : "GPay"}</span>
                  </div>
                </button>
              </div>
              <div className="col-12">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleGenericUPI}
                  disabled={isProcessingUPI}
                >
                  <div className="d-flex align-items-center justify-content-center">
                    <i className="fas fa-wallet me-2"></i>
                    <span>
                      {isProcessingUPI ? "Opening..." : "Other UPI Apps"}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OutletDetails;
