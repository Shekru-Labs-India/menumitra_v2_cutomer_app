import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../contexts/CartContext";
import axios from "axios";
import { API_CONFIG } from "../constants/config";
import { useNavigate } from "react-router-dom";
import { useOutlet } from "../contexts/OutletContext";
import OrderExistsModal from "../components/Modal/variants/OrderExistsModal";

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
  return (
    <div className="view-title mb-2">
      <ul>
        <li className="py-0">
          <h5>Total</h5>
          <h5>₹{details.grand_total}</h5>
        </li>
        <li>
          <span className="text-soft">
            Discount ({details.discount_percent}%)
          </span>
          <span className="text-soft">₹{details.discount_amount}</span>
        </li>
        <li>
          <span className="text-soft">Subtotal</span>
          <span className="text-soft">₹{details.total_bill_amount}</span>
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
          <span className="text-soft">
            Service Charge ({details.service_charges_percent}%)
          </span>
          <span className="text-soft">₹{details.service_charges_amount}</span>
        </li>
        <li>
          <span className="text-soft">GST ({details.gst_percent}%)</span>
          <span className="text-soft">₹{details.gst_amount}</span>
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
  const { outletId, sectionId } = useOutlet();
  const [checkoutDetails, setCheckoutDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const MAX_QUANTITY = 20;
  const [existingOrderModal, setExistingOrderModal] = useState({
    isOpen: false,
    orderDetails: null,
  });

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
    } else if (newQuantity <= MAX_QUANTITY) {
      updateQuantity(menuId, portionId, newQuantity);
    }
  };

  const fetchCheckoutDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage.auth
      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;

      if (!accessToken) {
        setError("Authentication required");
        return;
      }

      // Transform cart items to required format
      const orderItems = cartItems.map((item) => ({
        menu_id: item.menuId,
        portion_id: item.portionId,
        quantity: item.quantity,
      }));

      // Debug logs
      console.log("POST URL:", "https://men4u.xyz/v2/user/get_checkout_detail");
      console.log("orderItems:", orderItems);

      const response = await axios.post(
        "https://men4u.xyz/v2/user/get_checkout_detail",
        {
          outlet_id: 1,
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

      setCheckoutDetails((prev) => ({
        ...prev,
        ...response.data.detail,
      }));
    } catch (err) {
      console.error("Checkout details error:", err);
      if (err.response) {
        console.error("API error response:", err.response);
      }
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to fetch checkout details");
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
    try {
      setLoading(true);
      setError(null);

      const auth = JSON.parse(localStorage.getItem("auth"));
      const accessToken = auth?.accessToken;
      const userId = auth?.userId;

      if (!accessToken || !userId) {
        setError("Authentication required");
        return;
      }

      // First check for existing order
      const existingOrder = await checkExistingOrder(userId, outletId);

      if (existingOrder) {
        // Show modal instead of error
        setExistingOrderModal({
          isOpen: true,
          orderDetails: existingOrder,
        });
        return;
      }

      // Proceed with creating new order
      await createOrder();
    } catch (err) {
      console.error("Checkout error:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError("Failed to create order. Please try again.");
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
      comment: item.comment || "",
    }));

    const payload = {
      outlet_id: String(outletId),
      user_id: String(userId),
      section_id: String(sectionId),
      order_type: "dine-in",
      order_items: orderItems,
      action: "create_order",
    };

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
        setError("Authentication required");
        return;
      }

      // Transform cart items to required format
      const orderItems = cartItems.map((item) => ({
        menu_id: item.menuId.toString(),
        quantity: item.quantity,
        portion_name: item.portionName.toLowerCase(),
        comment: item.comment || "",
      }));

      // Call API to cancel existing order and create new one
      const response = await axios.post(
        "https://men4u.xyz/v2/user/complete_or_cancel_existing_order_create_new_order",
        {
          order_id: existingOrderModal.orderDetails.order_number,
          user_id: userId,
          order_status: "cancelled",
          outlet_id: outletId.toString(),
          section_id: sectionId.toString(),
          order_type: "parcel",
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

      if (response.data?.order_id) {
        // Clear cart and navigate on success
        clearCart();
        localStorage.removeItem("cart");
        navigate("/");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError("Failed to cancel existing order and create new one");
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
        setError("Authentication required");
        return;
      }

      // Transform cart items to required format
      const orderItems = cartItems.map((item) => ({
        menu_id: item.menuId.toString(),
        quantity: item.quantity,
        portion_name: item.portionName.toLowerCase(),
        comment: item.comment || "",
      }));

      // Call API to complete existing order and create new one
      const response = await axios.post(
        "https://men4u.xyz/v2/user/complete_or_cancel_existing_order_create_new_order",
        {
          order_id: existingOrderModal.orderDetails.order_number,
          user_id: userId,
          order_status: "completed",
          outlet_id: outletId.toString(),
          section_id: sectionId.toString(),
          order_type: "parcel",
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

      if (response.data?.order_id) {
        // Clear cart and navigate on success
        clearCart();
        localStorage.removeItem("cart");
        navigate("/");
      }
    } catch (error) {
      console.error("Error adding to existing order:", error);
      setError("Failed to add to existing order");
    } finally {
      setLoading(false);
      handleModalClose();
    }
  };

  return (
    <>
      <Header />
      <div className="page-content">
        {/* shop-cart-wrapper */}
        <div
          className="container bottom-content"
          style={{ paddingBottom: "390px" }}
        >
          <div className="item-list style-2">
            <ul>
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
                    className="position-relative"
                  >
                    <div className="item-content">
                      <div className="item-media media media-100">
                        <img
                          src={
                            item.image ||
                            "https://cdn.vox-cdn.com/thumbor/aNM9cSJCkTc4-RK1avHURrKBOjU=/1400x1400/filters:format(jpeg)/cdn.vox-cdn.com/uploads/chorus_asset/file/20059022/shutterstock_1435374326.jpg"
                          }
                          alt={item.menuName}
                        />
                      </div>
                      <div className="item-inner">
                        <div className="item-title-row d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="item-title sub-title">
                              <a href={`/product/${item.menuId}`}>
                                {item.menuName}
                              </a>
                            </h5>
                            <div className="item-subtitle text-soft">
                              {item.portionName}
                              {item.comment && (
                                <small className="d-block">
                                  {item.comment}
                                </small>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn p-0 border-0 bg-transparent shadow-none"
                            aria-label="Remove"
                            onClick={() =>
                              handleRemoveItem(item.menuId, item.portionId)
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="currentColor"
                              className="bi bi-x"
                              viewBox="0 0 16 16"
                            >
                              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                          </button>
                        </div>
                        <div className="item-footer">
                          <div className="d-flex align-items-center">
                            <h6 className="me-2">₹ {item.price}</h6>
                          </div>
                          <div className="d-flex align-items-center">
                            <div className="dz-stepper stepper-fill small-stepper border-2">
                              <div className="input-group bootstrap-touchspin bootstrap-touchspin-injected">
                                <span className="input-group-btn input-group-prepend">
                                  <button
                                    className="btn btn-primary bootstrap-touchspin-down"
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.menuId,
                                        item.portionId,
                                        item.quantity - 1
                                      )
                                    }
                                  >
                                    -
                                  </button>
                                </span>
                                <input
                                  className="stepper form-control"
                                  type="text"
                                  value={item.quantity}
                                  readOnly
                                />
                                <span className="input-group-btn input-group-append">
                                  <button
                                    className="btn btn-primary bootstrap-touchspin-up"
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        item.menuId,
                                        item.portionId,
                                        item.quantity + 1
                                      )
                                    }
                                    disabled={item.quantity >= MAX_QUANTITY}
                                    style={{
                                      opacity:
                                        item.quantity >= MAX_QUANTITY ? 0.5 : 1,
                                    }}
                                  >
                                    +
                                  </button>
                                </span>
                              </div>
                              {item.quantity >= MAX_QUANTITY && (
                                <small className="text-danger d-block text-center mt-1">
                                  Max quantity reached
                                </small>
                              )}
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
        </div>
        {cartItems.length > 0 && (
          <div className="footer fixed p-b60">
            <div className="container">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <FooterSummary checkoutDetails={checkoutDetails} />
              <div className="footer-btn d-flex align-items-center">
                <button
                  className="btn btn-primary flex-1"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0 || !!error}
                >
                  CHECKOUT ({getCartCount()} items)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <OrderExistsModal
        isOpen={existingOrderModal.isOpen}
        onClose={handleModalClose}
        orderNumber={existingOrderModal.orderDetails?.order_number}
        onCancelExisting={handleCancelExisting}
        onAddToExisting={handleAddToExisting}
        isLoading={loading}
      />

      <Footer />
    </>
  );
}

export default Checkout;
