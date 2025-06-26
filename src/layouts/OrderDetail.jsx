import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOutlet } from "../contexts/OutletContext";
import axios from "axios";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import MenuMitra from "../assets/logo.png";

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

  const generatePDF = async (orderDetails) => {
    try {
      if (!orderDetails?.order_details) {
        toast.error("Order details not found");
        return;
      }

      const { order_details, menu_details } = orderDetails;
      const outlet_name =
        localStorage.getItem("outlet_name") || order_details.outlet_name || "";
      const outlet_address = localStorage.getItem("outlet_address") || "-";
      const outlet_mobile = localStorage.getItem("outlet_mobile") || "-";
      const website_url = "https://menumitra.com";
      const customerName =
        localStorage.getItem("customerName") ||
        order_details.customer_name ||
        "Guest";

      // Add current date and time for PDF generation timestamp
      const now = new Date();
      const generationDate = now.toLocaleDateString();
      const generationTime = now
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
        .replace("am", "AM")
        .replace("pm", "PM");

      // Create a hidden container with specific dimensions
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "800px";
      container.style.margin = "0";
      container.style.padding = "20px";
      container.style.fontSize = "16px";
      container.style.backgroundColor = "#ffffff";
      document.body.appendChild(container);

      container.innerHTML = `
        <div style="padding: 20px; max-width: 100%; margin: auto; font-family: Arial, sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <div style="display: flex; align-items: center;">
              <img src="${MenuMitra}" alt="MenuMitra Logo" style="width: 35px; height: 35px;" />
              <span style="font-size: 20px; font-weight: bold; margin-left: 8px;">MenuMitra</span>
            </div>
            <span style="color: #d9534f; font-size: 20px; font-weight: normal;">Invoice</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
            <div>
              <p style="margin: 0; font-weight: bold;">Hello, ${customerName}</p>
              <p style="margin: 5px 0 0 0; color: #333;">Thank you for shopping from our store and for your order.</p>
          </div>
          <div style="text-align: right;">
              <p style="margin: 0;">Bill no: ${order_details.order_number}</p>
              <p style="margin: 5px 0 0 0; color: #666;">${
                order_details.date || ""
              } ${generationTime || ""}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <th style="text-align: left; padding: 8px 0; border-bottom: 1px solid #ddd; color: #333;">Item</th>
              <th style="text-align: center; padding: 8px 0; border-bottom: 1px solid #ddd; color: #333;">Quantity</th>
              <th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #ddd; color: #333;">Price</th>
            </tr>
            ${menu_details
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px 0; color: #d9534f;">${
                  item.menu_name
                }</td>
                <td style="text-align: center; padding: 8px 0;">${
                  item.quantity
                }</td>
                <td style="text-align: right; padding: 8px 0;">₹ ${item.price.toFixed(
                  2
                )}</td>
              </tr>
            `
              )
              .join("")}
        </table>

          <!-- Billing Summary -->
<div style="border-top: 2px solid #ddd; margin-top: 20px;">
  <div style="text-align: right; margin-top: 10px;">
    <!-- Total -->
    ${
      order_details.total_bill_amount
        ? `<span style="font-weight: bold;">Total:</span> ₹${order_details.total_bill_amount.toFixed(
            2
          )}</br>`
        : ""
    }

    <!-- Discount -->
    ${
      order_details.discount_percent > 0
        ? `<span style="font-weight: bold;">Discount:</span>(${
            order_details.discount_percent
          }%): <span style="color: red;">-₹${order_details.discount_amount.toFixed(
            2
          )}</span></br>`
        : ""
    }

    <!-- Special Discount -->
    ${
      order_details.special_discount
        ? `<span style="font-weight: bold;">Special Discount:</span><span style="color: red;">-₹${order_details.special_discount.toFixed(
            2
          )}</span></br>`
        : ""
    }
    <!-- Extra Charges -->
    ${
      order_details.charges > 0
        ? `<span style="font-weight: bold;">Extra Charges:</span><span style="color: green;">+₹${order_details.charges.toFixed(
            2
          )}</span></br>`
        : ""
    }
    <!-- Subtotal -->
    ${
      order_details.total_bill_with_discount
        ? `<span style="font-weight: bold;">Subtotal:</span> ₹${order_details.total_bill_with_discount.toFixed(
            2
          )}</br>`
        : ""
    }
    <!-- Service Charges -->
          ${
            order_details.service_charges_amount
              ? `<span style="font-weight: bold;">Service Charges (${
                  order_details.service_charges_percent || ""
                }%):</span> <span style="color: green;">+₹${order_details.service_charges_amount.toFixed(
                  2
                )}</span></br>`
              : ""
          }

    <!-- GST -->
    ${
      order_details.gst_amount
        ? `<span style="font-weight: bold;">GST (${
            order_details.gst_percent || ""
          }%):</span> <span style="color: green;">+₹${order_details.gst_amount.toFixed(
            2
          )}</span></br>`
        : ""
    }
<!-- Tip -->
          ${
            order_details.tip && order_details.tip > 0
              ? `<span style="font-weight: bold;">Tip:</span><span style="color: green;">+₹${order_details.tip.toFixed(
                  2
                )}</span></br>`
              : ""
          }


    <!-- Grand Total -->
    ${
      order_details.final_grand_total
        ? `<span style="font-weight: bold;">Grand Total:</span> ₹${order_details.final_grand_total.toFixed(
            2
          )}</br>`
        : ""
    }
  </div>
</div>
          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div>
              <p style="margin: 0 0 10px 0; font-weight: bold;">Billing Information</p>
              <p style="margin: 5px 0;">► ${outlet_name}</p>
              <p style="margin: 5px 0;">► ${outlet_address}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 10px 0; font-weight: bold;">Payment Method</p>
              <p style="margin: 5px 0; text-transform: uppercase;">${
                order_details.payment_method || ""
              }</p>
        </div>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p style="font-style: italic; margin-bottom: 20px;">Have a nice day.</p>
            <div style="margin: 20px 0;">
              <div style="display: inline-flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                <img src="${MenuMitra}" alt="MenuMitra Logo" style="width: 25px; height: 25px;" />
                <span style="font-size: 16px; font-weight: bold; margin-left: 8px;">MenuMitra</span>
              </div>
            </div>
            <p style="margin: 3px 0; color: #666; font-size: 13px;">info@menumitra.com</p>
            <p style="margin: 3px 0; color: #666; font-size: 13px;">+91 9172530151</p>
            <p style="margin: 3px 0; color: #666; font-size: 13px;">${website_url}</p>
</div>
      </div>
    `;

      try {
        // Wait for all images to load
        const images = container.getElementsByTagName("img");
        await Promise.all(
          Array.from(images).map((img) => {
            return new Promise((resolve) => {
              if (img.complete) {
                resolve();
              } else {
                img.onload = resolve;
                img.onerror = resolve;
              }
            });
          })
        );

        // Generate PDF with exact same configuration as MyOrder.js
        const canvas = await html2canvas(container, {
          scale: 3,
          width: 800,
          height: container.offsetHeight,
          backgroundColor: "#ffffff",
          windowWidth: 800,
          windowHeight: container.offsetHeight,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });

        // Create PDF with A4 dimensions
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
        });

        // Calculate dimensions to fit A4 while maintaining aspect ratio
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Add image with proper scaling
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${order_details.order_number}.pdf`);

        toast.success("Invoice downloaded successfully");
      } catch (error) {
        console.error("PDF generation error:", error);
        toast.error("Failed to generate invoice");
      } finally {
        // Clean up: Remove the temporary container
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate invoice");
    }
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
                  {/* <span className="text-soft mb-2 d-block">Order ID</span> */}
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
        </div>
      </div>
      <Footer />
    </>
  );
}

export default OrderDetail;
