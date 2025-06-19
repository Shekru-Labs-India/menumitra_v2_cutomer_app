import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOutlet } from "../contexts/OutletContext";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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

      const response = await fetch(
        "https://men4u.xyz/v2/user/rating_to_order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            outlet_id: outletId.toString(),
            user_id: userId,
            order_id: orderId,
            rating: rating.toString(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.detail === "rating updated") {
        setIsSubmitted(true);
      } else {
        throw new Error(data.detail || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
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
                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
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
                <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
              </svg>
            </button>
          ))}
        </div>
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}
        <button
          className="btn btn-primary px-4"
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Submitting...
            </>
          ) : (
            "Submit Rating"
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
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        fill="white"
        stroke="#00B67A"
        strokeWidth="2"
      />
      <circle cx="8" cy="8" r="3" fill="#00B67A" />
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
        x="2"
        y="2"
        width="12"
        height="12"
        rx="2"
        fill="white"
        stroke="#E74C3C"
        strokeWidth="2"
      />
      <circle cx="8" cy="8" r="3" fill="#E74C3C" />
    </svg>
  );

  // Move getStatusClass outside of getStatusBadgeStyle
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "placed":
        return "status-placed";
      case "cooking":
        return "status-cooking";
      case "served":
        return "status-served";
      case "cancelled":
        return "status-cancelled";
      case "paid":
        return "status-paid";
      default:
        return "status-default";
    }
  };

  // Enhanced status badge style with better color coding
  const getStatusBadgeStyle = (status) => {
    const statusColors = {
      placed: {
        backgroundColor: "#FFF8E1",
        color: "#FFA000",
        border: "1px solid #FFE082",
        padding: "6px 15px",
        fontSize: "12px",
        fontWeight: "500",
      },
      cooking: {
        backgroundColor: "#E8F5E9",
        color: "#027335",
        border: "1px solid #A5D6A7",
        padding: "6px 15px",
        fontSize: "12px",
        fontWeight: "500",
      },
      served: {
        backgroundColor: "#E3F2FD",
        color: "#1565C0",
        border: "1px solid #90CAF9",
        padding: "6px 15px",
        fontSize: "12px",
        fontWeight: "500",
      },
      cancelled: {
        backgroundColor: "#FFEBEE",
        color: "#C62828",
        border: "1px solid #FFCDD2",
        padding: "6px 15px",
        fontSize: "12px",
        fontWeight: "500",
      },
      paid: {
        backgroundColor: "#E0F2F1",
        color: "#00796B",
        border: "1px solid #80CBC4",
        padding: "6px 15px",
        fontSize: "12px",
        fontWeight: "500",
      },
    };

    return (
      statusColors[status.toLowerCase()] || {
        backgroundColor: "#FAFAFA",
        color: "#616161",
        border: "1px solid #E0E0E0",
        padding: "6px 15px",
        fontSize: "12px",
        fontWeight: "500",
      }
    );
  };

  const generatePDF = async (orderData) => {
    const { order_details, menu_details } = orderData;
    const outlet_name = order_details.outlet_name || "Outlet Name";
    const outlet_address = order_details.outlet_address || "Outlet Address";
    const outlet_mobile = order_details.outlet_mobile || "Outlet Mobile";
    const website_url = "https://menumitra.com"; // This was hardcoded in your previous snippet, keeping it here

    // Format date and time for the invoice
    const invoiceDate = new Date(order_details.date).toLocaleDateString(
      "en-US",
      { day: "numeric", month: "short", year: "numeric" }
    );
    const invoiceTime = order_details.time;
    const invoiceDateTime = `${invoiceDate} ${invoiceTime}`;

    const content = document.createElement("div");
    content.innerHTML = `
<div style="padding: 10px; width: 100%; max-width: 420px; margin: auto; font-family: Arial, sans-serif; box-sizing: border-box;">        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:10px">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="/src/assets/logo.png"  alt="MenuMitra Logo" style="width: 50px; height: 50px; margin-top: 10px;" />
            <span style="font-size: 20px; font-weight: bold;">MenuMitra</span>
          </div>
          <h2 style="font-size: 20px; font-weight: bold; color: #d9534f;">Invoice</h2>
        </div>
  
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
  <div style="text-align: left; width: 50%;">
    ${
      order_details.user_name
        ? `<p><strong>Hello, ${order_details.user_name}</strong> <br />`
        : `<p><strong>Hello,</strong> <br />`
    }
    Thank you for shopping from our store and for your order.</p>
  </div>
  <div style="text-align: right; width: 50%;">
    <p><strong>Bill no: ${order_details.order_number}</strong> <br />
    ${invoiceDateTime}</p>
  </div>
</div>

  
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr>
              <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: left;">Item</th>
              <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: center;">Quantity</th>
              <th style="border-bottom: 2px solid #ddd; padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${menu_details
              .map(
                (item) => `
              <tr>
                <td style="color: #d9534f; padding: 8px;">${item.menu_name}</td>
                <td style="text-align: center; padding: 8px;">${
                  item.quantity
                }</td>
                <td style="text-align: right; padding: 8px;">₹${parseFloat(
                  item.price
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
  
        <div style="text-align: right; margin-top: 20px; border-top: 2px solid #ddd; padding-top: 10px;">
          <p><strong>Total:</strong> ₹${parseFloat(
            order_details.total_bill_amount || 0
          ).toFixed(2)}</p>
          ${
            order_details.discount_amount && order_details.discount_amount > 0
              ? `<p><strong>Discount (${
                  order_details.discount_percent
                }%):</strong> <span style="color: #ef4444;">-₹${parseFloat(
                  order_details.discount_amount
                ).toFixed(2)}</span></p>`
              : ""
          }
        
          ${
            order_details.special_discount && order_details.special_discount > 0
              ? `<p><strong>Special Discount:</strong> <span style="color: #ef4444;">-₹${parseFloat(
                  order_details.special_discount
                ).toFixed(2)}</span></p>`
              : ""
          }
        
          ${
            order_details.charges && order_details.charges > 0
              ? `<p><strong>Extra Charges:</strong> <span style="color: #222;">+₹${parseFloat(
                  order_details.charges
                ).toFixed(2)}</span></p>`
              : ""
          }
            ${
              order_details.total_bill_with_discount &&
              order_details.total_bill_with_discount > 0
                ? `<p><strong>Subtotal:</strong> <span style="color: black;">₹${parseFloat(
                    order_details.total_bill_with_discount
                  ).toFixed(2)}</span></p>`
                : ""
            }
          ${
            order_details.service_charges_amount &&
            order_details.service_charges_amount > 0
              ? `<p><strong>Service Charges (${parseFloat(
                  order_details.service_charges_percent || 0
                ).toFixed(
                  0
                )}%):</strong><span style="color: #22c55e;"> +₹${parseFloat(
                  order_details.service_charges_amount
                ).toFixed(2)}</span></p>`
              : ""
          }
          ${
            order_details.gst_amount && order_details.gst_amount > 0
              ? `<p><strong>GST (${parseFloat(
                  order_details.gst_percent || 0
                ).toFixed(
                  0
                )}%):</strong><span style="color: #22c55e;"> +₹${parseFloat(
                  order_details.gst_amount
                ).toFixed(2)}</span></p>`
              : ""
          }
           
          ${
            order_details.tip && order_details.tip > 0
              ? `<p><strong>Tip:</strong><span style="color: #22c55e;"> +₹${parseFloat(
                  order_details.tip
                ).toFixed(2)}</span></p>`
              : ""
          }
          <p><strong>Grand Total: ₹${parseFloat(
            order_details.final_grand_total || 0
          ).toFixed(2)} </strong></p>
        </div>
  
        <div style="display: flex; justify-content: space-between; margin-top: 30px; color: #000000;">
          <div>
            <h4><strong>Billing Information</strong></h4>
            <p>➤ ${order_details.user_name || outlet_name}</p>
            <p>➤ ${order_details.outlet_address || outlet_address}</p>
            <p>➤ ${order_details.user_mobile || outlet_mobile}</p>
          </div>
          ${
            order_details.is_paid === "paid"
              ? `<div>
                   <h4>Payment Method</h4>
                   <p style="text-transform:uppercase;"><strong>${
                     order_details.payment_method || "CASH"
                   }</strong></p>
                 </div>`
              : order_details.is_paid === "complementary"
              ? `<div>
                   <h4>Order Type</h4>
                   <p style="text-transform:uppercase;"><strong>COMPLEMENTARY</strong></p>
                 </div>`
              : ""
          }
        </div>

<div style="text-align: center; margin-top: 20px;">
  <p style="font-style: italic;color: #000000; ">Have a nice day.</p>
  <div style="margin-top: 10px ; margin-bottom: 10px;">
    <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <img src="/src/assets/logo.png" alt="MenuMitra Logo" style="width: 30px; margin-top:10px; height: 30px; object-fit: contain;" />
      <span style="font-size: 18px; font-weight: bold; color:black">MenuMitra</span>
    </div>
  </div>
  <p style=" font-size: 14px; color:#000000;">info@menumitra.com</p>
  <p style="margin: 5px 0; font-size: 14px; color: #000000;">+91 9172530151</p>
  <p style="margin: 5px 0; font-size: 14px; color: #000000;">${website_url}</p>
</div>
      </div>
    `;

    document.body.appendChild(content);

    html2canvas(content, { scale: 2 }).then((canvas) => {
      document.body.removeChild(content);

      const imgData = canvas.toDataURL("image/jpeg", 0.6);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 10, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order_details.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleDownloadInvoice = async (e) => {
    e.stopPropagation(); // Prevent accordion toggle
    try {
      const auth = JSON.parse(localStorage.getItem("auth")) || {};
      const accessToken = auth.accessToken;
      const userId = auth.userId || "73";

      if (!accessToken) {
        console.error("Authentication token not found");
        return;
      }

      const response = await axios.post(
        "https://men4u.xyz/v2/user/get_order_details",
        {
          order_id: orderId,
          user_id: parseInt(userId),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const orderDetails = response.data.detail;

      if (!orderDetails) {
        console.error("Order details not found");
        return;
      }

      generatePDF(orderDetails);
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    }
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

        const response = await fetch(
          "https://men4u.xyz/v2/user/get_order_details",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              order_id: orderId,
              user_id: parseInt(userId), // Add user_id to payload
            }),
          }
        );

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
        console.error("Error fetching order details:", error);
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
      <div
        className="page-content bottom-content"
        style={{ backgroundColor: "var(--bs-gray-100)" }}
      >
        <div className="container pb-4">
          {/* Order Header Card */}
          <div className="card dz-card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <span className="text-soft mb-2 d-block">Order ID</span>
                  <h5 className="mb-0">
                    #{orderDetails.order_details.order_number}
                  </h5>
                </div>
                <span
                  className={`badge rounded-pill ${getStatusClass(
                    orderDetails.order_details.order_status
                  )}`}
                  style={getStatusBadgeStyle(
                    orderDetails.order_details.order_status
                  )}
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
              <h5 className="card-title">
                Order Items ({orderDetails.order_details.menu_count})
              </h5>
            </div>
            <div className="card-body pt-3">
              {orderDetails.menu_details.map((menu, index) => (
                <div
                  key={index}
                  className="dz-order-item d-flex align-items-center justify-content-between py-3"
                  style={{
                    borderBottom:
                      index !== orderDetails.menu_details.length - 1
                        ? "1px solid var(--border-color)"
                        : "none",
                  }}
                >
                  <div className="d-flex align-items-center">
                    <div className="food-type-icon me-3">
                      {menu.menu_food_type.toLowerCase() === "veg" ? (
                        <VegIcon />
                      ) : (
                        <NonVegIcon />
                      )}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-1">{menu.menu_name}</h6>
                        {menu.is_favourite === 1 && (
                          <i className="fa-solid fa-heart text-danger"></i>
                        )}
                      </div>
                      <p className="mb-0 text-soft">
                        Qty: {menu.quantity} × ₹{menu.price}
                        {menu.comment && (
                          <span className="ms-2">• {menu.comment}</span>
                        )}
                      </p>
                      {menu.offer > 0 && (
                        <span className="badge bg-success-light text-success">
                          {menu.offer}% OFF
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-end">
                    <h6 className="mb-0">₹{menu.net_price}</h6>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Details */}
          <div className="card dz-card mt-3">
            <div className="card-header border-0 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="card-title">Payment Details</h5>
              {orderDetails.order_details.payment_method && (
                <span className="badge bg-primary-light text-primary">
                  {orderDetails.order_details.payment_method}
                </span>
              )}
            </div>
            <div className="card-body pt-3">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Total</span>
                  <strong>
                    ₹{orderDetails.order_details.total_bill_amount}
                  </strong>
                </li>
                {orderDetails.order_details.special_discount > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0 text-success">
                    <span>Special Discount</span>
                    <strong>
                      -₹{orderDetails.order_details.special_discount}
                    </strong>
                  </li>
                )}
                {orderDetails.order_details.charges > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Extra Charges</span>
                    <strong>+₹{orderDetails.order_details.charges}</strong>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between px-0">
                  <span>Subtotal</span>
                  <strong>
                    ₹
                    {(
                      Number(
                        orderDetails.order_details.total_bill_amount || 0
                      ) -
                      Number(orderDetails.order_details.discount_amount || 0) -
                      Number(orderDetails.order_details.special_discount || 0) +
                      Number(orderDetails.order_details.charges || 0)
                    ).toFixed(2)}
                  </strong>
                </li>
                {orderDetails.order_details.service_charges_amount > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>
                      Service Charges (
                      {orderDetails.order_details.service_charges_percent}%)
                    </span>
                    <strong>
                      +₹{orderDetails.order_details.service_charges_amount}
                    </strong>
                  </li>
                )}
                {orderDetails.order_details.gst_amount > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>GST ({orderDetails.order_details.gst_percent}%)</span>
                    <strong>+₹{orderDetails.order_details.gst_amount}</strong>
                  </li>
                )}
                {orderDetails.order_details.tip > 0 && (
                  <li className="list-group-item d-flex justify-content-between px-0">
                    <span>Tip</span>
                    <strong>+₹{orderDetails.order_details.tip}</strong>
                  </li>
                )}
                <li className="list-group-item d-flex justify-content-between px-0 border-0">
                  <h6 className="mb-0 fw-bold">Grand Total</h6>
                  <h6 className="mb-0 fw-bold">
                    ₹{orderDetails.order_details.final_grand_total}
                  </h6>
                </li>
              </ul>

              {orderDetails.order_details.order_payment_settle_type &&
                orderDetails.order_details.order_payment_settle_type !==
                  "null" && (
                  <div className="mt-3 pt-3 border-top">
                    <span className="text-soft">
                      Settlement Type:{" "}
                      {orderDetails.order_details.order_payment_settle_type}
                    </span>
                  </div>
                )}
            </div>
          </div>
          {/* Invoice Button */}
          {orderDetails.order_details.order_status &&
            orderDetails.order_details.order_status.toLowerCase() ===
              "paid" && (
              <div className="d-flex justify-content-end mt-3">
                <button
                  className="d-flex align-items-center"
                  style={{
                    background: "#F5F5F5",
                    border: "1px solid #E0E0E0",
                    borderRadius: "24px",
                    color: "#222",
                    fontWeight: 500,
                    fontSize: "13px",
                    padding: "3px 12px",
                    boxShadow: "none",
                    outline: "none",
                    transition: "background 0.2s",
                  }}
                  onClick={handleDownloadInvoice}
                >
                  <i
                    className="fa-solid fa-download me-2"
                    style={{ fontSize: 16 }}
                  ></i>
                  Invoice
                </button>
              </div>
            )}

          {/* Table Information */}
          {/* {orderDetails.order_details.table_number && 
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
          )} */}

          {/* Customer & Restaurant Info */}
          {/* <div className="card dz-card mt-3">
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
          </div> */}

          {/* Rating Section */}
          <div className="mt-3">
            {orderDetails.order_details.order_status.toLowerCase() ===
              "paid" && (
              <OrderRating
                orderId={orderDetails.order_details.order_id}
                initialRating={
                  orderDetails.order_details.rating
                    ? parseInt(orderDetails.order_details.rating)
                    : undefined
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
