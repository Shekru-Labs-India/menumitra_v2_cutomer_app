import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import OrderAccordionItem from "../components/OrderAccordionItem";
import { useOutlet } from "../contexts/OutletContext";
import Timer from "../components/Timer";
import CancelOrderModal from "../components/Modal/variants/CancelOrderModal";
import axios from "axios";

// Add this new component for no orders state
const NoOrders = ({ message }) => (
  <div className="text-center py-5">
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto mb-3"
    >
      <path
        d="M20.929 1.628C20.8546 1.44247 20.7264 1.28347 20.5608 1.17153C20.3952 1.05959 20.1999 0.999847 20 1H4C3.80012 0.999847 3.60479 1.05959 3.43919 1.17153C3.2736 1.28347 3.14535 1.44247 3.071 1.628L1.071 6.628C1.02414 6.74643 1.00005 6.87264 1 7V22C1 22.2652 1.10536 22.5196 1.29289 22.7071C1.48043 22.8946 1.73478 23 2 23H22C22.2652 23 22.5196 22.8946 22.7071 22.7071C22.8946 22.5196 23 22.2652 23 22V7C23 6.87264 22.9759 6.74643 22.929 6.628L20.929 1.628ZM4.677 3H19.323L20.523 6H3.477L4.677 3ZM3 21V8H21V21H3Z"
        fill="#7D8FAB"
      />
      <path
        d="M10 17H6C5.73478 17 5.48043 17.1054 5.29289 17.2929C5.10536 17.4804 5 17.7348 5 18C5 18.2652 5.10536 18.5196 5.29289 18.7071C5.48043 18.8947 5.73478 19 6 19H10C10.2652 19 10.5196 18.8947 10.7071 18.7071C10.8946 18.5196 11 18.2652 11 18C11 17.7348 10.8946 17.4804 10.7071 17.2929C10.5196 17.1054 10.2652 17 10 17Z"
        fill="#7D8FAB"
      />
    </svg>
    <p className="text-soft mb-0">{message}</p>
  </div>
);

function Orders() {
  const { outletId } = useOutlet();
  const [ordersData, setOrdersData] = useState({
    paid: {},
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

  useEffect(() => {
    // Call both APIs independently
    fetchOngoingOrders();
    fetchCompletedOrders();
  }, []);

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
        setOrdersData(data.detail.lists);
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
          // Parse order time
          const [hours, minutes, seconds] = order.time.split(":");
          const [_, period] = order.time.split(" ");
          const orderTime = new Date();

          // Set the order time
          if (period === "PM" && hours !== "12") {
            orderTime.setHours(parseInt(hours) + 12);
          } else if (period === "AM" && hours === "12") {
            orderTime.setHours(0);
          } else {
            orderTime.setHours(parseInt(hours));
          }
          orderTime.setMinutes(parseInt(minutes));
          orderTime.setSeconds(parseInt(seconds.split(" ")[0]));

          const currentTime = new Date();
          const timeDifferenceInSeconds = Math.floor(
            (currentTime - orderTime) / 1000
          );
          const remainingSeconds = Math.max(90 - timeDifferenceInSeconds, 0);
          const showTimer = order.status === "placed" && remainingSeconds > 0;

          return {
            id: order.order_number,
            orderId: order.order_id,
            orderNumber: order.order_number,
            itemCount: order.menu_count,
            status:
              order.status === "placed"
                ? "Order Placed"
                : order.status === "cooking"
                ? "Preparing"
                : order.status.charAt(0).toUpperCase() + order.status.slice(1),
            iconColor: "#FFA902",
            iconBgClass: "bg-warning",
            orderSteps: [
              {
                title: "Order Created",
                timestamp: order.time,
                completed: true,
              },
              {
                title: "Order Received",
                timestamp: order.time,
                completed: order.status !== "placed",
              },
              {
                title: "Order Confirmed",
                timestamp: order.time,
                completed: order.status === "cooking",
              },
              {
                title: "Order Processed",
                timestamp: order.time,
                completed: false,
              },
              {
                title: "Order Delivered",
                timestamp: order.time,
                completed: false,
              },
            ],
            isExpanded: false,
            parentId: "accordionExample1",
            orderType: order.order_type,
            outletName: order.outlet_name,
            totalAmount: order.final_grand_total,
            paymentMethod: order.payment_method || "Not selected",
            showTimer,
            remainingSeconds,
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
      completed: [],
      cancelled: [],
    };

    // Handle paid/completed orders
    if (orders.paid) {
      Object.entries(orders.paid).forEach(([, orderList]) => {
        orderList.forEach((order) => {
          transformedOrders.completed.push({
            id: order.order_number,
            orderId: order.order_id,
            itemCount: order.menu_count,
            status: "Completed",
            iconColor: "#00B67A",
            iconBgClass: "bg-success",
            orderSteps: [
              {
                title: "Order Created",
                timestamp: order.datetime,
                completed: true,
              },
              {
                title: "Order Received",
                timestamp: order.datetime,
                completed: true,
              },
              {
                title: "Order Confirmed",
                timestamp: order.datetime,
                completed: true,
              },
              {
                title: "Order Processed",
                timestamp: order.datetime,
                completed: true,
              },
              {
                title: "Order Delivered",
                timestamp: order.datetime,
                completed: true,
              },
            ],
            isExpanded: false,
            parentId: "accordionExample3",
          });
        });
      });
    }

    // Handle cancelled orders
    if (orders.cancelled) {
      Object.entries(orders.cancelled).forEach(([, orderList]) => {
        orderList.forEach((order) => {
          transformedOrders.cancelled.push({
            id: order.order_number,
            orderId: order.order_id,
            itemCount: order.menu_count,
            status: "Cancelled",
            iconColor: "#E74C3C",
            iconBgClass: "bg-danger",
            orderSteps: [
              {
                title: "Order Created",
                timestamp: order.datetime,
                completed: true,
              },
              {
                title: "Order Cancelled",
                timestamp: order.datetime,
                completed: true,
              },
            ],
            isExpanded: false,
            parentId: "accordionExample2",
          });
        });
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
      console.log("[Orders] Cancel order status:", true);
      await fetchOngoingOrders();
      handleCloseCancelModal();
    } catch (err) {
      setCancelOrderStatus(false);
      console.log("[Orders] Cancel order status:", false);
      console.error("Error cancelling order:", err);
    }
  };

  const handleCloseCancelModal = () => {
    console.log("[Orders] handleCloseCancelModal called, closing modal.");
    setShowCancelModal(false);
    setSelectedOrderId(null);
    setSelectedOrderNumber(null);
  };

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
                {ongoingOrders.map((order) => (
                  <div key={order.id} className="order-item mb-3">
                    <div
                      className="order-header p-3 rounded"
                      style={{
                        border: "1px solid #ef962e",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.09)",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between w-100">
                        {/* Left side with icon and order details */}
                        <div className="d-flex align-items-center">
                          <span className={`icon-box ${order.iconBgClass}`}>
                            <i className="fa-solid fa-bag-shopping text-white"></i>
                          </span>
                          <div className="ms-3">
                            <h6 className="mb-0">Order #{order.orderNumber}</h6>
                            <span className="text-soft">
                              {order.itemCount} Items {order.status}
                            </span>
                          </div>
                        </div>

                        {/* Right side with cancel button */}
                        <div className="d-flex align-items-center">
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
                ))}
              </div>
            </div>
          )}

          <div className="default-tab style-1">
            <ul
              className="nav nav-tabs d-flex flex-nowrap overflow-auto w-100"
              id="myTab3"
              role="tablist"
            >
              <li className="nav-item flex-shrink-0 w-50" role="presentation">
                <button
                  className="nav-link active w-100"
                  id="completed-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#completed-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="completed-tab-pane"
                  aria-selected="true"
                >
                  <svg
                    className="me-2"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx={8}
                      cy={8}
                      r={7}
                      fill="#027335"
                      stroke="var(--bg-white)"
                      strokeWidth={2}
                    />
                  </svg>
                  Completed
                </button>
              </li>
              <li className="nav-item flex-shrink-0 w-50" role="presentation">
                <button
                  className="nav-link d-flex align-items-center justify-content-center w-100"
                  id="cancelled-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#cancelled-tab-pane"
                  type="button"
                  role="tab"
                  aria-controls="cancelled-tab-pane"
                  aria-selected="false"
                >
                  <svg
                    className="me-2"
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx={8}
                      cy={8}
                      r={7}
                      fill="#FF0000"
                      stroke="var(--bg-white)"
                      strokeWidth={2}
                    />
                  </svg>
                  Cancelled
                </button>
              </li>
            </ul>
            <div className="tab-content" id="myTabContent3">
              {isLoadingHistory ? (
                <div className="text-center py-4">Loading order history...</div>
              ) : (
                <>
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
                      ) : transformedOrders.completed.length > 0 ? (
                        transformedOrders.completed.map((order) => (
                          <OrderAccordionItem
                            key={order.id}
                            orderId={order.orderId}
                            itemCount={order.itemCount}
                            status={order.status}
                            iconColor={order.iconColor}
                            iconBgClass={order.iconBgClass}
                            orderSteps={order.orderSteps}
                            isExpanded={order.isExpanded}
                            parentId={order.parentId}
                          />
                        ))
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
                      {error.history ? (
                        <NoOrders message="No cancelled orders" />
                      ) : transformedOrders.cancelled.length > 0 ? (
                        transformedOrders.cancelled.map((order) => (
                          <OrderAccordionItem
                            key={order.id}
                            orderId={order.orderId}
                            itemCount={order.itemCount}
                            status={order.status}
                            iconColor={order.iconColor}
                            iconBgClass={order.iconBgClass}
                            orderSteps={order.orderSteps}
                            isExpanded={order.isExpanded}
                            parentId={order.parentId}
                          />
                        ))
                      ) : (
                        <NoOrders message="No cancelled orders" />
                      )}
                    </div>
                  </div>
                </>
              )}
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
