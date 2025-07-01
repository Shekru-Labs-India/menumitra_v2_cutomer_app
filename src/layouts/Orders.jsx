import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OrderAccordionItem from "../components/OrderAccordionItem";
import { useOutlet } from "../contexts/OutletContext";
import Timer from "../components/Timer";
import CancelOrderModal from "../components/Modal/variants/CancelOrderModal";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Update the NoOrders component with new icon
const NoOrders = ({ message }) => {
  const navigate = useNavigate();

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - 400px)" }}
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
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h5 className="mb-3">{message}</h5>
        <p className="text-muted mb-4">
          Check back later for your order history
        </p>
        <button
          className="btn btn-primary px-4 py-3"
          style={{ borderRadius: 12, fontWeight: 500 }}
          onClick={() => navigate("/")}
        >
          Browse Menu
        </button>
      </div>
    </div>
  );
};

function Orders() {
  const { outletId } = useOutlet();
  const { user, setShowAuthOffcanvas } = useAuth();
  const [ordersData, setOrdersData] = useState({
    paid: {},
    complimentary_paid: {},
    cancelled: {},
  });
  const [ongoingOrders, setOngoingOrders] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState({
    ongoing: null,
    history: null,
  });
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(null);
  const [cancelOrderStatus, setCancelOrderStatus] = useState(true);
  const navigate = useNavigate();

  // State for managing expansion of date accordions
  const [expandedCompletedDates, setExpandedCompletedDates] = useState({});
  const [expandedCancelledDates, setExpandedCancelledDates] = useState({});

  const [udhariPaidOrders, setUdhariPaidOrders] = useState([]);

  const [expandedUdhariPaidDates, setExpandedUdhariPaidDates] = useState({});

  // Add state for udhariPendingOrders
  const [udhariPendingOrders, setUdhariPendingOrders] = useState([]);

  // Add state for managing expansion of date accordions for pending orders
  const [expandedPendingDates, setExpandedPendingDates] = useState({});

  useEffect(() => {
    // Call both APIs independently
    fetchOngoingOrders();
    fetchCompletedOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchOngoingOrders();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Handler for expanding/collapsing individual date accordions for completed orders
  const toggleCompletedDateExpansion = (date) => {
    setExpandedCompletedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Handler for expanding all completed date accordions
  const handleExpandAllCompleted = () => {
    const newExpandedState = {};
    Object.keys(transformedOrders.completedByDate).forEach((date) => {
      newExpandedState[date] = true;
    });
    setExpandedCompletedDates(newExpandedState);
  };

  // Handler for collapsing all completed date accordions
  const handleCollapseAllCompleted = () => {
    setExpandedCompletedDates({});
  };

  // Handler for expanding/collapsing individual date accordions for cancelled orders
  const toggleCancelledDateExpansion = (date) => {
    setExpandedCancelledDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Handler for expanding all cancelled date accordions
  const handleExpandAllCancelled = () => {
    const newExpandedState = {};
    Object.keys(transformedOrders.cancelledByDate).forEach((date) => {
      newExpandedState[date] = true;
    });
    setExpandedCancelledDates(newExpandedState);
  };

  // Handler for collapsing all cancelled date accordions
  const handleCollapseAllCancelled = () => {
    setExpandedCancelledDates({});
  };

  // Fix groupUdhariPaidByDate to always group by date (Month DD, YYYY)
  const groupUdhariPaidByDate = (orders) => {
    const grouped = {};
    orders.forEach((order) => {
      let formattedDate = "Unknown Date";
      if (order.datetime) {
        // Always use only the first three parts for the date
        const parts = order.datetime.split(" ");
        if (parts.length >= 3) {
          const [day, mon, year] = parts;
          const dateObj = new Date(`${mon} ${day}, ${year}`);
          if (!isNaN(dateObj)) {
            formattedDate = dateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          }
        }
      }
      if (!grouped[formattedDate]) grouped[formattedDate] = [];
      grouped[formattedDate].push(order);
    });
    return grouped;
  };

  const udhariPaidGrouped = groupUdhariPaidByDate(udhariPaidOrders);

  const toggleUdhariPaidDateExpansion = (date) => {
    setExpandedUdhariPaidDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const fetchCompletedOrders = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const userId = auth.userId || "73";
      const accessToken = auth.accessToken;

      if (!accessToken) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "https://men4u.xyz/v2/user/get_completed_and_cancel_order_list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: parseInt(userId),
            outlet_id: outletId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch order history");
      }

      const data = await response.json();

      if (data.detail && data.detail.lists) {
        // Transform the data to include all order types
        const transformedData = {
          paid: data.detail.lists.paid || {},
          complimentary_paid: data.detail.lists.complimentary_paid || {},
          cancelled: data.detail.lists.cancelled || {},
          // Add any other order types here
        };
        setOrdersData(transformedData);

        // Extract udhari_paid orders and flatten them into a single array
        const udhariPaidRaw = data.detail.lists.udhari_paid || {};
        const udhariPaidList = Object.values(udhariPaidRaw).flat();
        // Map to match ongoingOrders structure
        const mappedUdhariPaid = udhariPaidList.map((order) => ({
          id: order.order_number,
          orderId: order.order_id,
          orderNumber: order.order_number,
          itemCount: order.menu_count,
          status: order.order_status,
          iconColor: "#FFA902",
          iconBgClass: "bg-warning",
          isExpanded: false,
          parentId: "accordionExample1",
          orderType: order.order_type,
          outletName: order.outlet_name,
          totalAmount: order.final_grand_total,
          paymentMethod: order.payment_method || "Not selected",
          time: order.time,
          tableNumber: order.table_number,
          sectionName: order.section_name,
        }));
        setUdhariPaidOrders(mappedUdhariPaid);

        // Extract udhari_pending orders and flatten them into a single array
        const udhariPendingRaw = data.detail.lists.udhari_pending || {};
        const udhariPendingList = Object.values(udhariPendingRaw).flat();
        const mappedUdhariPending = udhariPendingList.map((order) => ({
          id: order.order_number,
          orderId: order.order_id,
          orderNumber: order.order_number,
          itemCount: order.menu_count,
          status: order.order_status,
          iconColor: "#FFA902",
          iconBgClass: "bg-warning",
          isExpanded: false,
          parentId: "accordionExamplePending",
          orderType: order.order_type,
          outletName: order.outlet_name,
          totalAmount: order.final_grand_total,
          paymentMethod: order.payment_method || "Not selected",
          time: order.time,
          tableNumber: order.table_number,
          sectionName: order.section_name,
        }));
        setUdhariPendingOrders(mappedUdhariPending);
      }
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError((prev) => ({ ...prev, history: err.message }));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchOngoingOrders = async () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const userId = auth.userId || "73";
      const accessToken = auth.accessToken;

      if (!accessToken) throw new Error("Authentication token not found");

      const { data } = await axios.post(
        "https://men4u.xyz/v2/user/get_ongoing_or_placed_order",
        {
          user_id: parseInt(userId),
          outlet_id: outletId,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (data.detail?.orders) {
        const transformedOngoingOrders = data.detail.orders.map((order) => {
          return {
            id: order.order_number,
            orderId: order.order_id,
            orderNumber: order.order_number,
            itemCount: order.menu_count,
            status: order.status,
            iconColor: "#FFA902",
            iconBgClass: "bg-warning",
            isExpanded: false,
            parentId: "accordionExample1",
            orderType: order.order_type,
            outletName: order.outlet_name,
            totalAmount: order.final_grand_total,
            paymentMethod: order.payment_method || "Not selected",
            time: order.time,
          };
        });

        setOngoingOrders(transformedOngoingOrders);
        setError((prev) => ({ ...prev, ongoing: null }));
      }
    } catch (err) {
      console.error("Error fetching ongoing orders:", err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        setOngoingOrders([]);
        setError((prev) => ({ ...prev, ongoing: "404" }));
      } else {
        setError((prev) => ({ ...prev, ongoing: err.message }));
      }
    }
  };

  // Transform API data for OrderAccordionItem
  const transformOrderData = (orders) => {
    const transformedOrders = {
      completedByDate: {},
      cancelledByDate: {},
    };

    // Helper function to format date from 'YYYY-MM-DD' to 'DD Mon YYYY'
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        const options = { day: "numeric", month: "short", year: "numeric" };
        return date.toLocaleDateString("en-US", options);
      } catch (e) {
        console.error("Invalid date string:", dateString, e);
        return dateString; // Fallback
      }
    };

    // Helper function to get order status and styling
    const getOrderStatus = (order) => {
      switch (order.order_status) {
        case "complimentary_paid":
          return {
            status: "Complimentary",
            iconColor: "#6c5ce7",
            iconBgClass: "bg-info",
          };
        case "paid":
          return {
            status: "Completed",
            iconColor: "#00B67A",
            iconBgClass: "bg-success",
          };
        case "cancelled":
          return {
            status: "Cancelled",
            iconColor: "#E74C3C",
            iconBgClass: "bg-danger",
          };
        default:
          return {
            status: order.order_status || "Completed",
            iconColor: "#00B67A",
            iconBgClass: "bg-success",
          };
      }
    };

    // Process all order types
    const processOrders = (orderList, dateKey, isCancelled = false) => {
      const formattedDate = formatDate(dateKey);
      const orders = orderList.map((order) => {
        const { status, iconColor, iconBgClass } = getOrderStatus(order);
        return {
          id: order.order_number,
          orderId: order.order_id,
          orderNumber: order.order_number,
          itemCount: order.menu_count,
          status,
          iconColor,
          iconBgClass,
          isExpanded: true,
          parentId: isCancelled ? "accordionExample2" : "accordionExample3",
          outletName: order.outlet_name,
          orderType: order.order_type,
          totalAmount: order.final_grand_total,
          paymentStatus:
            order.order_status === "complimentary_paid"
              ? "Complimentary"
              : order.order_status === "paid"
              ? "Paid"
              : order.order_status === "cancelled"
              ? "Cancelled"
              : order.payment_status,
          orderTime: order.time,
          tableNumber: order.table_number,
          sectionName: order.section_name,
        };
      });

      if (isCancelled) {
        transformedOrders.cancelledByDate[formattedDate] = {
          date: formattedDate,
          orderCount: orders.length,
          orders,
        };
      } else {
        if (transformedOrders.completedByDate[formattedDate]) {
          transformedOrders.completedByDate[formattedDate].orders = [
            ...transformedOrders.completedByDate[formattedDate].orders,
            ...orders,
          ];
          transformedOrders.completedByDate[formattedDate].orderCount +=
            orders.length;
        } else {
          transformedOrders.completedByDate[formattedDate] = {
            date: formattedDate,
            orderCount: orders.length,
            orders,
          };
        }
      }
    };

    // Process paid orders
    if (orders.paid) {
      Object.entries(orders.paid).forEach(([dateKey, orderList]) => {
        processOrders(orderList, dateKey);
      });
    }

    // Process complimentary paid orders
    if (orders.complimentary_paid) {
      Object.entries(orders.complimentary_paid).forEach(
        ([dateKey, orderList]) => {
          processOrders(orderList, dateKey);
        }
      );
    }

    // Process cancelled orders
    if (orders.cancelled) {
      Object.entries(orders.cancelled).forEach(([dateKey, orderList]) => {
        processOrders(orderList, dateKey, true);
      });
    }

    return transformedOrders;
  };

  const transformedOrders = transformOrderData(ordersData);

  // Update the handleCancelOrder function
  const handleCancelOrder = (orderId, orderNumber) => {
    setSelectedOrderId(orderId);
    setSelectedOrderNumber(orderNumber);
    setShowCancelModal(true);
  };

  // Update handleConfirmCancel
  const handleConfirmCancel = async (reason) => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const accessToken = auth.accessToken;
      if (!accessToken) throw new Error("Authentication token not found");

      const { data } = await axios.post(
        "https://men4u.xyz/v2/user/cancel_order",
        {
          outlet_id: outletId,
          order_id: selectedOrderId,
          note: reason,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setCancelOrderStatus(true);
      await fetchOngoingOrders();
      handleCloseCancelModal();
    } catch (err) {
      setCancelOrderStatus(false);
      console.error("Error cancelling order:", err);
    }
  };

  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setSelectedOrderId(null);
    setSelectedOrderNumber(null);
  };

  const handleLogin = () => {
    setShowAuthOffcanvas(true);
  };

  // Group udhariPendingOrders by date
  const udhariPendingGrouped = groupUdhariPaidByDate(udhariPendingOrders);

  // Handler for expanding/collapsing individual date accordions for pending orders
  const togglePendingDateExpansion = (date) => {
    setExpandedPendingDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  // Handler for expanding all pending date accordions
  const handleExpandAllPending = () => {
    const newExpandedState = {};
    Object.keys(udhariPendingGrouped).forEach((date) => {
      newExpandedState[date] = true;
    });
    setExpandedPendingDates(newExpandedState);
  };

  // Handler for collapsing all pending date accordions
  const handleCollapseAllPending = () => {
    setExpandedPendingDates({});
  };

  // First check if user is not logged in
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
                  <h5 className="mb-3">Please Login to View Orders</h5>
                  <p className="text-muted mb-4">
                    Login to your account to see your order history
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

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="container pb">
          {/* Only show if error is not 404 and we have orders */}
          {error.ongoing !== "404" && ongoingOrders.length > 0 && (
            <div className="mb-4">
              <h6 className="mb-3">Ongoing Orders</h6>
              <div className="orders-list">
                {ongoingOrders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="order-item mb-3"
                      onClick={() => navigate(`/order-detail/${order.orderId}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="border border-warning shadow-sm p-3 rounded">
                        <div className="d-flex align-items-center justify-content-between w-100">
                          {/* Left side with icon and order details */}
                          <div className="d-flex align-items-center">
                            {order.status === "placed" ? (
                              <Timer orderTime={order.time} />
                            ) : (
                              <span className={`icon-box ${order.iconBgClass}`}>
                                <i className="fa-solid fa-bag-shopping text-white"></i>
                              </span>
                            )}
                            <div className="ms-3">
                              <h6 className="mb-0">
                                Order #{order.orderNumber}
                              </h6>
                              <span className="text-soft">
                                {order.itemCount} Items {order.status}
                              </span>
                            </div>
                          </div>

                          {/* Right side with dine-in status and cancel button */}
                          <div className="d-flex flex-column align-items-end">
                            <span className="text-soft mb-2">
                              {order.orderType}
                            </span>
                            {order.status === "placed" && (
                              <button
                                className="btn btn-sm text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelOrder(
                                    order.orderId,
                                    order.orderNumber
                                  );
                                }}
                                style={{
                                  backgroundColor: "#FF0000",
                                }}
                              >
                                Cancel Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="default-tab style-1">
            <ul
              className="nav nav-tabs d-flex flex-nowrap overflow-auto w-100"
              id="myTab3"
              role="tablist"
            >
              <li className="nav-item flex-shrink-0 w-33" role="presentation">
                <button
                  className="nav-link active w-100"
                  id="completed-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#completed-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="completed-tab-pane"
                  aria-selected="true"
                  style={{
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="fa-solid fa-circle-check me-2"
                    style={{ color: "#27ae60", fontSize: "16px" }}
                  ></i>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>
                    Completed
                  </span>
                </button>
              </li>
              <li className="nav-item flex-shrink-0 w-33" role="presentation">
                <button
                  className="nav-link d-flex align-items-center justify-content-center w-100"
                  id="cancelled-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#cancelled-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="cancelled-tab-pane"
                  aria-selected="false"
                  style={{
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="fa-solid fa-ban me-2"
                    style={{ color: "#e74c3c", fontSize: "16px" }}
                  ></i>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>
                    Cancelled
                  </span>
                </button>
              </li>
              <li className="nav-item flex-shrink-0 w-33" role="presentation">
                <button
                  className="nav-link w-100"
                  id="pending-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#pending-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="pending-tab-pane"
                  aria-selected="false"
                  style={{
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="fa-solid fa-clock me-2"
                    style={{ color: "black", fontSize: "16px" }}
                  ></i>
                  <span style={{ fontSize: "13px", fontWeight: 500 }}>
                    Pending
                  </span>
                </button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent3">
              {/* Pending Orders Tab */}
              <div
                className="tab-pane fade"
                id="pending-tab-pane"
                role="tabpanel"
                aria-labelledby="pending-tab"
                tabIndex={0}
              >
                <div className="accordion style-3" id="accordionExamplePending">
                  {error.ongoing !== "404" &&
                  Object.keys(udhariPendingGrouped).length > 0 ? (
                    <>
                      {/* Expand/Collapse All for Pending Orders */}
                      <div className="d-flex justify-content-end align-items-center mb-3">
                        <button
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={
                            Object.values(expandedPendingDates).some((e) => e)
                              ? handleCollapseAllPending
                              : handleExpandAllPending
                          }
                          aria-expanded={Object.values(
                            expandedPendingDates
                          ).some((e) => e)}
                        >
                          <span>
                            {Object.values(expandedPendingDates).some((e) => e)
                              ? "Collapse All"
                              : "Expand All"}
                          </span>
                          <i
                            className={`ms-2 fas ${
                              Object.values(expandedPendingDates).some((e) => e)
                                ? "fa-chevron-up"
                                : "fa-chevron-down"
                            }`}
                          ></i>
                        </button>
                      </div>
                      {Object.entries(udhariPendingGrouped).map(
                        ([dateKey, orders]) => (
                          <div className="accordion-item" key={dateKey}>
                            <h2
                              className="accordion-header"
                              id={
                                "headingUdhariPending" +
                                dateKey.replace(/\s/g, "")
                              }
                            >
                              <button
                                className={
                                  "btn btn-link w-100 d-flex justify-content-between align-items-center p-0 " +
                                  (!expandedPendingDates[dateKey]
                                    ? "collapsed"
                                    : "")
                                }
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={
                                  "#collapseUdhariPending" +
                                  dateKey.replace(/\s/g, "")
                                }
                                aria-expanded={
                                  expandedPendingDates[dateKey] || false
                                }
                                aria-controls={
                                  "collapseUdhariPending" +
                                  dateKey.replace(/\s/g, "")
                                }
                                onClick={() =>
                                  togglePendingDateExpansion(dateKey)
                                }
                              >
                                <span className="flex-grow-1 text-start">
                                  {dateKey}
                                </span>
                                <span className="me-2">{orders.length}</span>
                                <i
                                  className={`ms-2 fas ${
                                    expandedPendingDates[dateKey]
                                      ? "fa-chevron-up"
                                      : "fa-chevron-down"
                                  }`}
                                ></i>
                              </button>
                            </h2>
                            <div
                              id={
                                "collapseUdhariPending" +
                                dateKey.replace(/\s/g, "")
                              }
                              className={
                                "accordion-collapse collapse " +
                                (expandedPendingDates[dateKey] ? "show" : "")
                              }
                              aria-labelledby={
                                "headingUdhariPending" +
                                dateKey.replace(/\s/g, "")
                              }
                              data-bs-parent="#accordionUdhariPending"
                            >
                              <div className="accordion-body">
                                {orders.map((order) => (
                                  <OrderAccordionItem
                                    key={order.id + "-" + order.status}
                                    orderId={order.orderId}
                                    orderNumber={order.orderNumber}
                                    itemCount={order.itemCount}
                                    status={order.status}
                                    iconColor={order.iconColor}
                                    iconBgClass={order.iconBgClass}
                                    isExpanded={order.isExpanded}
                                    parentId={order.parentId}
                                    outletName={order.outletName}
                                    orderType={order.orderType}
                                    totalAmount={order.totalAmount}
                                    paymentStatus={order.paymentStatus}
                                    orderTime={order.time}
                                    tableNumber={order.tableNumber}
                                    sectionName={order.sectionName}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <NoOrders message="No pending orders" />
                  )}
                </div>
              </div>
              {/* Completed Orders Tab */}
              <div
                className="tab-pane fade show active"
                id="completed-tab-pane"
                role="tabpanel"
                aria-labelledby="completed-tab"
                tabIndex={0}
              >
                <div className="accordion style-3" id="accordionExample3">
                  {error.history ? (
                    <NoOrders message="No completed orders" />
                  ) : Object.keys(transformedOrders.completedByDate).length >
                    0 ? (
                    <>
                      {/* Expand/Collapse All for Completed Orders */}
                      <div className="d-flex justify-content-end align-items-center mb-3">
                        <button
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={
                            Object.values(expandedCompletedDates).some((e) => e)
                              ? handleCollapseAllCompleted
                              : handleExpandAllCompleted
                          }
                          aria-expanded={Object.values(
                            expandedCompletedDates
                          ).some((e) => e)}
                        >
                          <span>
                            {Object.values(expandedCompletedDates).some(
                              (e) => e
                            )
                              ? "Collapse All"
                              : "Expand All"}
                          </span>
                          <i
                            className={`ms-2 fas ${
                              Object.values(expandedCompletedDates).some(
                                (e) => e
                              )
                                ? "fa-chevron-up"
                                : "fa-chevron-down"
                            }`}
                          ></i>
                        </button>
                      </div>
                      {Object.entries(transformedOrders.completedByDate).map(
                        ([dateKey, dailyOrderData]) => (
                          <div className="accordion-item" key={dateKey}>
                            <h2
                              className="accordion-header"
                              id={"heading" + dateKey.replace(/\s/g, "")}
                            >
                              <button
                                className={
                                  "btn btn-link w-100 d-flex justify-content-between align-items-center p-0 " +
                                  (!expandedCompletedDates[dateKey]
                                    ? "collapsed"
                                    : "")
                                }
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={
                                  "#collapse" + dateKey.replace(/\s/g, "")
                                }
                                aria-expanded={
                                  expandedCompletedDates[dateKey] || false
                                }
                                aria-controls={
                                  "collapse" + dateKey.replace(/\s/g, "")
                                }
                                onClick={() =>
                                  toggleCompletedDateExpansion(dateKey)
                                }
                              >
                                <span className="flex-grow-1 text-start">
                                  {dailyOrderData.date}
                                </span>
                                <span className="me-2">
                                  {dailyOrderData.orderCount}
                                </span>
                                <i
                                  className={`ms-2 fas ${
                                    expandedCompletedDates[dateKey]
                                      ? "fa-chevron-up"
                                      : "fa-chevron-down"
                                  }`}
                                ></i>
                              </button>
                            </h2>
                            <div
                              id={"collapse" + dateKey.replace(/\s/g, "")}
                              className={
                                "accordion-collapse collapse " +
                                (expandedCompletedDates[dateKey] ? "show" : "")
                              }
                              aria-labelledby={
                                "heading" + dateKey.replace(/\s/g, "")
                              }
                              data-bs-parent="#accordionExample3"
                            >
                              <div className="accordion-body">
                                {dailyOrderData.orders.map((order) => (
                                  <OrderAccordionItem
                                    key={order.id}
                                    orderId={order.orderId}
                                    orderNumber={order.orderNumber}
                                    itemCount={order.itemCount}
                                    status={order.status}
                                    iconColor={order.iconColor}
                                    iconBgClass={order.iconBgClass}
                                    isExpanded={order.isExpanded}
                                    parentId={order.parentId}
                                    outletName={order.outletName}
                                    orderType={order.orderType}
                                    totalAmount={order.totalAmount}
                                    paymentStatus={order.paymentStatus}
                                    orderTime={order.orderTime}
                                    tableNumber={order.tableNumber}
                                    sectionName={order.sectionName}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <NoOrders message="No completed orders" />
                  )}
                </div>
              </div>

              {/* Cancelled Orders Tab */}
              <div
                className="tab-pane fade"
                id="cancelled-tab-pane"
                role="tabpanel"
                aria-labelledby="cancelled-tab"
                tabIndex={0}
              >
                <div className="accordion style-3" id="accordionExample2">
                  {isLoadingHistory ? (
                    <div className="text-center py-4">
                      Loading order history...
                    </div>
                  ) : error.history ? (
                    <NoOrders message="No cancelled orders" />
                  ) : Object.keys(transformedOrders.cancelledByDate).length >
                    0 ? (
                    <>
                      {/* Expand/Collapse All for Cancelled Orders */}
                      <div className="d-flex justify-content-end align-items-center mb-3">
                        <button
                          className="btn btn-sm btn-link text-dark p-0"
                          onClick={
                            Object.values(expandedCancelledDates).some((e) => e)
                              ? handleCollapseAllCancelled
                              : handleExpandAllCancelled
                          }
                          aria-expanded={Object.values(
                            expandedCancelledDates
                          ).some((e) => e)}
                        >
                          <span>
                            {Object.values(expandedCancelledDates).some(
                              (e) => e
                            )
                              ? "Collapse All"
                              : "Expand All"}
                          </span>
                          <i
                            className={`ms-2 fas ${
                              Object.values(expandedCancelledDates).some(
                                (e) => e
                              )
                                ? "fa-chevron-up"
                                : "fa-chevron-down"
                            }`}
                          ></i>
                        </button>
                      </div>
                      {Object.entries(transformedOrders.cancelledByDate).map(
                        ([dateKey, dailyOrderData]) => (
                          <div className="accordion-item" key={dateKey}>
                            <h2
                              className="accordion-header"
                              id={
                                "headingCancelled" + dateKey.replace(/\s/g, "")
                              }
                            >
                              <button
                                className={
                                  "btn btn-link w-100 d-flex justify-content-between align-items-center p-0 " +
                                  (!expandedCancelledDates[dateKey]
                                    ? "collapsed"
                                    : "")
                                }
                                type="button"
                                onClick={() =>
                                  toggleCancelledDateExpansion(dateKey)
                                }
                              >
                                <span className="flex-grow-1 text-start">
                                  {dailyOrderData.date}
                                </span>
                                <span className="me-2">
                                  {dailyOrderData.orderCount}
                                </span>
                                <i
                                  className={`ms-2 fas ${
                                    expandedCancelledDates[dateKey]
                                      ? "fa-chevron-up"
                                      : "fa-chevron-down"
                                  }`}
                                ></i>
                              </button>
                            </h2>
                            <div
                              id={
                                "collapseCancelled" + dateKey.replace(/\s/g, "")
                              }
                              className={
                                "accordion-collapse collapse " +
                                (expandedCancelledDates[dateKey] ? "show" : "")
                              }
                              aria-labelledby={
                                "headingCancelled" + dateKey.replace(/\s/g, "")
                              }
                              data-bs-parent="#accordionExample2"
                            >
                              <div className="accordion-body">
                                {dailyOrderData.orders.map((order) => (
                                  <OrderAccordionItem
                                    key={order.id}
                                    orderId={order.orderId}
                                    orderNumber={order.orderNumber}
                                    itemCount={order.itemCount}
                                    status={order.status}
                                    iconColor={order.iconColor}
                                    iconBgClass={order.iconBgClass}
                                    isExpanded={order.isExpanded}
                                    parentId={order.parentId}
                                    outletName={order.outletName}
                                    orderType={order.orderType}
                                    totalAmount={order.totalAmount}
                                    paymentStatus={order.paymentStatus}
                                    orderTime={order.orderTime}
                                    tableNumber={order.tableNumber}
                                    sectionName={order.sectionName}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </>
                  ) : (
                    <NoOrders message="No cancelled orders" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        orderId={selectedOrderId}
        orderNumber={selectedOrderNumber}
      />
      <Footer />
    </>
  );
}

export default Orders;
