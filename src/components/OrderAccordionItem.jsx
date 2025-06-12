import React from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";

const OrderAccordionItem = ({
  orderId,
  orderNumber,
  itemCount,
  status,
  iconColor = "#FFA902", // default color
  iconBgClass = "", // for bg-primary, bg-danger etc
  showTimer = false,
  remainingSeconds = 0,
  outletName,
  orderType,
  totalAmount,
  paymentStatus,
  orderTime,
  tableNumber,
  sectionName,
}) => {
  const navigate = useNavigate();

  const handleViewDetails = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent accordion toggle
    navigate(`/order-detail/${orderId}`);
  };

  // Handle tableNumber which might be an array
  const displayTableNumber = Array.isArray(tableNumber)
    ? tableNumber.join(", ")
    : tableNumber;

  return (
    <>
      {showTimer && (
        <div className="d-flex justify-content-center align-items-center mb-2">
          <Timer initialSeconds={remainingSeconds} />
        </div>
      )}
      <div
        className="order-item mb-3"
        onClick={handleViewDetails}
        style={{ cursor: "pointer" }}
      >
        <div className="border rounded shadow-sm p-3">
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center">
              <div className="me-3">
                <div className={`icon-box ${iconBgClass}`}>
                  <i
                    className="fa-solid fa-bag-shopping"
                    style={{ color: iconColor }}
                  ></i>
                </div>
              </div>
              <div>
                <h6 className="mb-0"># {orderNumber}</h6>
                <p
                  className="mb-0 text-dark font-weight-bold"
                  style={{ fontSize: "14px" }}
                >
                  <i className="bi bi-shop me-2"></i> {outletName}
                </p>
                <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                  <i className="bi bi-silverware me-2"></i> {orderType} •{" "}
                  {itemCount} Menu
                </p>
                {/* Re-introducing status display based on user request */}
                {paymentStatus === "Paid" ? (
                  <p className="mb-0 text-success" style={{ fontSize: "12px" }}>
                    <i className="bi bi-check-circle-fill me-2"></i> Paid
                  </p>
                ) : status === "Cancelled" ? (
                  <p className="mb-0 text-danger" style={{ fontSize: "12px" }}>
                    <i className="bi bi-x-circle-fill me-2"></i> Cancelled
                  </p>
                ) : (
                  <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                    {status}
                  </p>
                )}
              </div>
            </div>

            <div className="text-end">
              <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                {orderTime}
              </p>
              <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>
                {/* Display section name and table number */}
                {sectionName && displayTableNumber ? (
                  <>
                    <i className="bi bi-geo-alt-fill me-2"></i> {sectionName} -{" "}
                    {displayTableNumber}
                  </>
                ) : sectionName ? (
                  <>
                    <i className="bi bi-geo-alt-fill me-2"></i> {sectionName}
                  </>
                ) : displayTableNumber ? (
                  <>
                    <i className="bi bi-geo-alt-fill me-2"></i>{" "}
                    {displayTableNumber}
                  </>
                ) : null}
              </p>
              <h6 className="mb-2" style={{ color: "var(--dz-theme-color)" }}>
                ₹{totalAmount}
              </h6>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigating to order details
                  // Handle invoice download/view logic here
                }}
                style={{ borderRadius: "8px", fontSize: "12px" }}
              >
                <i className="bi bi-download me-1"></i> Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderAccordionItem;
