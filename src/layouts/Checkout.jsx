import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import axios from "axios";
import { API_CONFIG } from "../constants/config";
import { useNavigate } from "react-router-dom";
import { useOutlet } from "../contexts/OutletContext";
import OrderExistsModal from "../components/Modal/variants/OrderExistsModal";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import LazyImage from "../components/Shared/LazyImage";

const FooterSummary = React.memo(function FooterSummary({ checkoutDetails }) {
  // Fallback to zeros if no data yet
  const details = checkoutDetails || {
    grand_total: "0.00",
    discount_percent: "0",
    discount_amount: "0.00",
    total_bill_amount: "0.00",
    service_charges_percent: "0",
    service_charges_amount: "0.00",
    gst_percent: "0",
    gst_amount: "0.00",
    final_grand_total: "0.00",
  };

  const totalBill = parseFloat(details.total_bill_amount || 0);
  const discount = parseFloat(details.discount_amount || 0);
  const subtotal = totalBill - discount;

  return (
    <div className="view-title mb-2">
      <ul>
        <li className="py-0">
          <h5>Total</h5>
          <h5>₹{details.total_bill_amount}</h5>
        </li>
        {Number(details.discount_amount) > 0 && (
          <li>
            <span className="text-soft">
              Discount ({details.discount_percent}%)
            </span>
            <span className="text-soft text-success">
              -₹{details.discount_amount}
            </span>
          </li>
        )}
        <li>
          <span className="text-soft">Subtotal</span>
          <span className="text-soft">₹{subtotal.toFixed(2)}</span>
        </li>

        <li>
          <span className="text-soft">
            Service Charge ({details.service_charges_percent}%)
          </span>
          <span className="text-soft">+₹{details.service_charges_amount}</span>
        </li>
        <li>
          <span className="text-soft">GST ({details.gst_percent}%)</span>
          <span className="text-soft">+₹{details.gst_amount}</span>
        </li>
        <li>
          <h5>Grand Total</h5>
          <h5>₹{details.final_grand_total}</h5>
        </li>
      </ul>
    </div>
  );
});

function Checkout() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
    clearCart,
  } = useCart();
  const { outletId, sectionId, outletDetails } = useOutlet();
  const { user, setShowAuthOffcanvas } = useAuth();
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [existingOrderModal, setExistingOrderModal] = useState({
    isOpen: false,
    orderDetails: null,
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleLogin = () => {
    setShowAuthOffcanvas(true);
  };

  // First check if user is not logged in (regardless of cart state)
  if (!user) {
    return (
      <>
        <Header />
        <div className="page-content">
          <div className="content-inner pt-0">
            <div className="container p-b20">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "calc(100vh - 300px)" }}
              >
                <div className="text-center">
                  <div className="mb-4">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: "0.5" }}
                      className="text-muted"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <h5 className="mb-3">Please Login to Cart</h5>
                  <p className="text-muted mb-4">
                    Login to your account to complete your order
                  </p>
                  <button
                    className="btn btn-primary px-4 py-3"
                    style={{ borderRadius: 12, fontWeight: 500 }}
                    onClick={handleLogin}
                  >
                    Login Now
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

  // Only show empty cart message if user is logged in and cart is empty
  if (user && cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="page-content">
          <div className="content-inner pt-0">
            <div className="container p-b20">
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "calc(100vh - 300px)" }}
              >
                <div className="text-center">
                  <div className="mb-4">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: "0.5" }}
                      className="text-muted"
                    >
                      <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.16 15l.94-2h7.45a2 2 0 0 0 1.92-1.45l2.13-7.11A1 1 0 0 0 18.64 3H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 5 17h12v-2H7.42a.25.25 0 0 1-.26-.19z" />
                    </svg>
                  </div>
                  <h5 className="mb-3">Your cart is empty</h5>
                  <p className="text-muted mb-4">
                    Add some items to your cart to get started
                  </p>
                  <button
                    className="btn btn-primary px-4 py-3"
                    style={{ borderRadius: 12, fontWeight: 500 }}
                    onClick={() => navigate("/")}
                  >
                    Go to Home
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

  // Calculate subtotal
  const subtotal = getCartTotal();

  // Calculate tax (2%)
  const taxRate = 0.02;
  const taxAmount = subtotal * taxRate;

  // Calculate final total
  const total = subtotal - taxAmount;

  const handleQuantityChange = (menuId, portionId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(menuId, portionId);
    } else {
      updateQuantity(menuId, portionId, newQuantity);
    }
  };

  const fetchCheckoutDetails = async () => {
    try {
      setLoading(true);

      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;

      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      // Transform cart items to required format
      const orderItems = cartItems.map((item) => ({
        menu_id: item.menuId,
        portion_id: item.portionId,
        quantity: item.quantity,
      }));

      const response = await axios.post(
        "https://men4u.xyz/v2/user/get_checkout_detail",
        {
          outlet_id: outletId,
          order_items: orderItems,
            app_source: "user_app",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      setCheckoutDetails((prev) => ({
        ...prev,
        ...response.data.detail,
      }));
    } catch (err) {
      console.error("Checkout details error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to fetch checkout details");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch checkout details when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchCheckoutDetails();
    } else {
      setCheckoutDetails(null);
    }
  }, [cartItems]);

  // Remove item handler
  const handleRemoveItem = (menuId, portionId) => {
    // Remove from context
    removeFromCart(menuId, portionId);

    // Remove from localStorage if you store cart there
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = cart.filter(
      (item) => !(item.menuId === menuId && item.portionId === portionId)
    );
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const checkExistingOrder = async (userId, outletId) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;

      const response = await axios.post(
        "https://men4u.xyz/v2/user/check_order_exist",
        {
          user_id: userId,
          outlet_id: outletId,
            app_source: "user_app",
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data?.detail) {
        console.log("Existing order found:", response.data.detail);
        return response.data.detail;
      }
      return null;
    } catch (error) {
      // If no order exists, API might return an error - this is expected
      console.log("No existing order found");
      return null;
    }
  };

  const handleCheckout = async () => {
    // Validate comments
    for (const item of cartItems) {
      if (
        item.comment &&
        (item.comment.length < 5 || item.comment.length > 50)
      ) {
        toast.error("Comment must be between 5 and 50 characters.");
        return;
      }
    }
    try {
      setLoading(true);

      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;
      const userId = auth?.userId;

      if (!accessToken || !userId) {
        toast.error("Authentication required");
        return;
      }

      // First check for existing order
      const existingOrder = await checkExistingOrder(userId, outletId);

      if (existingOrder) {
        setExistingOrderModal({
          isOpen: true,
          orderDetails: {
            ...existingOrder,
            order_id: existingOrder.order_id, // Ensure order_id is set correctly
          },
        });
        return;
      }

      // Proceed with creating new order
      await createOrder();
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error("Checkout error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error("Failed to create order. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const accessToken = auth?.accessToken;
    const userId = auth?.userId;

    const orderItems = cartItems.map((item) => ({
      menu_id: item.menuId,
      quantity: item.quantity,
      portion_name: item.portionName.toLowerCase(),
      // comment: item.comment || "",
    }));

    // Get order settings from localStorage
    const orderSettings = localStorage.getItem("orderSettings");
    const orderType = orderSettings
      ? JSON.parse(orderSettings).order_type
      : null;

    // Base payload
    const payload = {
      outlet_id: String(outletId),
      user_id: String(userId),
      section_id: String(sectionId),
      order_type: orderType || "dine-in", // Fallback to takeaway if no order type
      order_items: orderItems,
      action: "create_order",
      app_source: "user_app",
    };

    // Add table_id only for dine-in orders
    if (orderType === "dine-in") {
      // Get table_id from outletDetails or localStorage
      const tableId = outletDetails?.tableId || localStorage.getItem("tableId");
      if (tableId) {
        payload.table_id = String(tableId);
      }
    }

    const response = await axios.post(
      `https://men4u.xyz/v2/common/create_order`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response.data?.order_id) {
      clearCart();
      localStorage.removeItem("cart");
      navigate(`/orders`);
    }
  };

  // Add handlers for modal actions
  const handleModalClose = () => {
    setExistingOrderModal({
      isOpen: false,
      orderDetails: null,
    });
  };

  const handleCancelExisting = async () => {
    try {
      setLoading(true);
      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;
      const userId = auth?.userId;

      if (!accessToken || !userId) {
        toast.error("Authentication required");
        return;
      }

      const orderItems = cartItems.map((item) => ({
        menu_id: item.menuId.toString(),
        quantity: item.quantity,
        portion_name: item.portionName.toLowerCase(),
        // comment: item.comment || "",
      }));

      // Use order_id instead of order_number
      const response = await axios.post(
        "https://men4u.xyz/v2/user/complete_or_cancel_existing_order_create_new_order",
        {
          order_id: existingOrderModal.orderDetails.order_id.toString(),
          user_id: userId,
          order_status: "cancelled",
          outlet_id: outletId.toString(),
          section_id: sectionId.toString(),
          order_type: "dine-in",
          app_source: "user_app",
          table_id: localStorage.getItem("tableId").toString(), // Add this line

          order_items: orderItems,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data?.detail?.order_id) {
        clearCart();
        localStorage.removeItem("cart");
        toast.success("Order cancelled and new order created successfully!");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel existing order and create new one");
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };

  const handleAddToExisting = async () => {
    try {
      setLoading(true);
      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;
      const userId = auth?.userId;

      if (!accessToken || !userId) {
        toast.error("Authentication required");
        return;
      }

      const orderItems = cartItems.map((item) => ({
        menu_id: item.menuId,
        portion_id: item.portionId,
        quantity: item.quantity,
        comment: item.comment || "",
      }));

      const response = await axios.post(
        "https://men4u.xyz/v2/user/add_to_existing_order",
        {
          order_id: existingOrderModal.orderDetails.order_id.toString(),
          user_id: userId.toString(),
          outlet_id: outletId.toString(),
          app_source: "user_app",
          order_items: orderItems,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data?.detail?.order_id) {
        clearCart();
        localStorage.removeItem("cart");
        toast.success("Items added to existing order successfully!");
        navigate("/orders");
      }
    } catch (error) {
      console.error("Error adding to existing order:", error);
      toast.error("Failed to add to existing order");
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };

  // Coupon input handler: only allow capital letters and numbers
  const handleCouponInput = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setCouponCode(value);
  };

  // Coupon verify handler
  const handleVerifyCoupon = async () => {
    setCouponLoading(true);
    setCouponStatus(null);
    try {
      const response = await axios.post(
        "https://men4u.xyz/v2/common/verify_coupon",
        {
          coupon_code: couponCode,
          app_source: "user_App",
        }
      );
      if (response.data?.success) {
        setCouponStatus({
          success: true,
          message: response.data.message || "Coupon applied!",
        });
      } else {
        setCouponStatus({
          success: false,
          message: response.data.message || "Invalid coupon.",
        });
      }
    } catch (err) {
      setCouponStatus({
        success: false,
        message: "Invalid coupon or network error.",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Toaster
        position="bottom-center"
        reverseOrder={true}
        gutter={8}
        containerStyle={{
          bottom: 40,
          margin: "0 auto",
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#333",
            color: "#fff",
            marginBottom: "6rem",
            padding: "1rem",
            borderRadius: "8px",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#4aed88",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#ff4b4b",
              secondary: "#fff",
            },
          },
        }}
      />
      <div
        className="page-content"
        style={{ background: "#f7f8fa", minHeight: "100vh" }}
      >
        <div
          className="container bottom-content"
          style={{ paddingBottom: "40px" }}
        >
          {/* Menu/Cart Items List */}
          <div className="item-list style-2">
            <ul className="list-unstyled">
              {cartItems.length === 0 ? (
                <div
                  className="d-flex flex-column justify-content-center align-items-center"
                  style={{
                    minHeight: "60vh", // Adjust as needed for your header/footer
                    width: "100%",
                    // background: '#fcfbfc'
                  }}
                >
                  {/* Cart SVG Icon */}
                  <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="12" fill="#f8f9fa" />
                    <path
                      d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7.16 15l.94-2h7.45a2 2 0 0 0 1.92-1.45l2.13-7.11A1 1 0 0 0 18.64 3H6.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 5 17h12v-2H7.42a.25.25 0 0 1-.26-.19z"
                      fill="#adb5bd"
                    />
                  </svg>
                  <span
                    className="text-muted fs-5 mt-3 mb-2"
                    style={{ color: "#b0b3b8" }}
                  >
                    Your cart is empty
                  </span>
                  <button
                    className="btn btn-outline-success px-4 py-3 mt-4"
                    style={{ borderRadius: 12, fontWeight: 500 }}
                    onClick={() => navigate("/")}
                  >
                    Go to Home
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <li
                    key={`${item.menuId}-${item.portionId}`}
                    className="mb-3 border-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/product-detail/${item.menuId}`)}
                  >
                    <div
                      className="bg-white rounded-4 shadow-sm position-relative p-3 border-0"
                      style={{ minHeight: 90 }}
                    >
                      {/* Remove button in top right */}
                      <button
                        type="button"
                        className="btn p-0 border-0 bg-transparent shadow-none position-absolute"
                        aria-label="Remove"
                        style={{
                          top: 12,
                          right: 16,
                          fontSize: 22,
                          color: "#b0b3b8",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.menuId, item.portionId);
                        }}
                      >
                        ×
                      </button>
                      <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center mb-1">
                            <h5 className="mb-0" style={{ fontWeight: 600 }}>
                              {item.menuName}
                            </h5>
                          </div>
                          <div className="d-flex align-items-center mb-1">
                            <span
                              className="text-success me-2"
                              style={{
                                fontSize: 15,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <i
                                className="fa-solid fa-utensils me-1"
                                style={{ fontSize: 15, color: "#19b955" }}
                              ></i>
                              {item.portionName}
                            </span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <span
                                className="fw-bold"
                                style={{ color: "#2196f3", fontSize: 18 }}
                              >
                                ₹{item.price}
                              </span>
                              {item.offer > 0 && (
                                <>
                                  <span
                                    className="ms-2 text-muted"
                                    style={{
                                      textDecoration: "line-through",
                                      fontSize: 16,
                                    }}
                                  >
                                    ₹
                                    {item.originalPrice ||
                                      (
                                        item.price /
                                        (1 - item.offer / 100)
                                      ).toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="d-flex flex-column align-items-end gap-1">
                              {item.offer > 0 && (
                                <span
                                  className="text-success fw-bold mb-1"
                                  style={{ fontSize: 16 }}
                                >
                                  {item.offer}% Off
                                </span>
                              )}
                              <div className="bg-light rounded-pill d-flex align-items-center px-2 py-1">
                                <button
                                  className="btn btn-link p-0 m-0"
                                  style={{
                                    color: "#222",
                                    fontSize: 20,
                                    minWidth: 28,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(
                                      item.menuId,
                                      item.portionId,
                                      item.quantity - 1
                                    );
                                  }}
                                >
                                  –
                                </button>
                                <span
                                  className="mx-2"
                                  style={{
                                    minWidth: 18,
                                    textAlign: "center",
                                    fontWeight: 500,
                                  }}
                                >
                                  {item.quantity}
                                </span>
                                <button
                                  className="btn btn-link p-0 m-0"
                                  style={{
                                    color: "#222",
                                    fontSize: 20,
                                    minWidth: 28,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(
                                      item.menuId,
                                      item.portionId,
                                      item.quantity + 1
                                    );
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
          {/* Summary Card - now at the top */}
          {cartItems.length > 0 && (
            <>
              <div
                className="bg-white rounded-4 shadow-sm p-3 mb-3"
                style={{ border: "1px solid #e0e0e0", marginTop: 24 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold" style={{ fontSize: 18 }}>
                    Total
                  </span>
                  <span className="fw-bold" style={{ fontSize: 18 }}>
                    ₹{checkoutDetails?.total_bill_amount || "0.00"}
                  </span>
                </div>
                <hr className="my-2" style={{ borderColor: "#e0e0e0" }} />
                <div
                  className="d-flex justify-content-between align-items-center mb-1"
                  style={{ color: "#b0b3b8" }}
                >
                  <span>
                    Discount ({checkoutDetails?.discount_percent || 0}%)
                  </span>
                  <span>-₹{checkoutDetails?.discount_amount || "0.00"}</span>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center mb-1"
                  style={{ color: "#b0b3b8" }}
                >
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {(
                      parseFloat(checkoutDetails?.total_bill_amount || 0) -
                      parseFloat(checkoutDetails?.discount_amount || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center mb-1"
                  style={{ color: "#b0b3b8" }}
                >
                  <span>
                    Service Charges (
                    {checkoutDetails?.service_charges_percent || 0}%)
                  </span>
                  <span>
                    +₹{checkoutDetails?.service_charges_amount || "0.00"}
                  </span>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center mb-1"
                  style={{ color: "#b0b3b8" }}
                >
                  <span>GST ({checkoutDetails?.gst_percent || 0}%)</span>
                  <span>+₹{checkoutDetails?.gst_amount || "0.00"}</span>
                </div>
                <hr className="my-2" style={{ borderColor: "#e0e0e0" }} />
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold" style={{ fontSize: 18 }}>
                    Grand Total
                  </span>
                  <span className="fw-bold" style={{ fontSize: 18 }}>
                    ₹{checkoutDetails?.final_grand_total || "0.00"}
                  </span>
                </div>
              </div>
              <div className="d-flex justify-content-center mb-4">
                <button
                  className="btn"
                  style={{
                    background: "#19b955",
                    color: "#fff",
                    borderRadius: 30,
                    fontWeight: 600,
                    fontSize: 20,
                    minWidth: 280,
                    boxShadow: "0 2px 8px rgba(25,185,85,0.15)",
                  }}
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || loading}
                >
                  Place Order{" "}
                  <span
                    style={{
                      color: "#b6f5d1",
                      fontSize: 16,
                      fontWeight: 500,
                      marginLeft: 4,
                    }}
                  >
                    ({getCartCount()} Items)
                  </span>
                </button>
              </div>

              {/* Apply Coupon UI */}
              <div className="mt-2 mb-4">
                <label className="mb-1 fw-semibold" style={{ fontSize: 15 }}>
                  Apply Coupon
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={handleCouponInput}
                    maxLength={20}
                    style={{ textTransform: "uppercase", fontWeight: 500 }}
                    autoComplete="off"
                  />
                  <button
                    className="btn"
                    style={{
                      background: "#b6d4fe",
                      color: "#222",
                      fontWeight: 500,
                      minWidth: 70,
                    }}
                    onClick={handleVerifyCoupon}
                    disabled={!couponCode || couponLoading}
                  >
                    {couponLoading ? "..." : "Verify"}
                  </button>
                </div>
                {couponStatus && (
                  <div
                    className={`mt-2 fw-semibold ${
                      couponStatus.success ? "text-success" : "text-danger"
                    }`}
                    style={{ fontSize: 14 }}
                  >
                    {couponStatus.message}
                  </div>
                )}
                <hr className="mt-3 mb-0" />
              </div>
            </>
          )}
        </div>
      </div>

      <OrderExistsModal
        isOpen={existingOrderModal.isOpen}
        onClose={handleModalClose}
        orderNumber={existingOrderModal.orderDetails?.order_number}
        orderStatus={existingOrderModal.orderDetails?.order_status} // <-- add this line
        onCancelExisting={handleCancelExisting}
        onAddToExisting={handleAddToExisting}
        isLoading={loading}
      />

      <Footer />
    </>
  );
}

export default Checkout;
