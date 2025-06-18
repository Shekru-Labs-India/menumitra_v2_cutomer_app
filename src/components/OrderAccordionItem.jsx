import React from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";

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
      <div style="padding: 20px; max-width: 90%; margin: auto; font-family: Arial, sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom:10px">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="/src/assets/logo.png" alt="MenuMitra Logo" style="width: 50px; height: 50px; margin-top: 10px;" />
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
              ? `
              <p><strong>
                  ${
                    order_details.order_type === "dine-in"
                      ? "Extra Charges"
                      : order_details.order_type === "drive-through"
                      ? "Extra Charges"
                      : order_details.order_type === "counter"
                      ? "Extra Charges"
                      : order_details.order_type === "parcel"
                      ? "Extra Charges"
                      : order_details.order_type === "delivery"
                      ? "Extra Charges"
                      : "Extra Charges"
                  }:</p>`
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
  
        <div style="display: flex; justify-content: space-between; margin-top: 30px;">
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
  <p style="font-style: italic;">Have a nice day.</p>
  <div style="margin-top: 10px ; margin-bottom: 10px;">
    <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <img src="/src/assets/logo.png" alt="MenuMitra Logo" style="width: 30px; margin-top:10px; height: 30px; object-fit: contain;" />
      <span style="font-size: 18px; font-weight: bold; color:black">MenuMitra</span>
    </div>
  </div>
  <p style=" font-size: 14px; color: #666;">info@menumitra.com</p>
  <p style="margin: 5px 0; font-size: 14px; color: #666;">+91 9172530151</p>
  <p style="margin: 5px 0; font-size: 14px; color: #666;">${website_url}</p>
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
              {status !== "Cancelled" && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleDownloadInvoice}
                  style={{ borderRadius: "8px", fontSize: "12px" }}
                >
                  <i className="bi bi-download me-1"></i> Invoice
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderAccordionItem;
