import React from "react";
import { useNavigate } from "react-router-dom";
import Timer from "./Timer";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import axios from "axios";
import logo from "../assets/logo.png"; // adjust path as needed

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
      <div style="background: #fff; max-width: 700px; margin: 32px auto; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); padding: 32px 24px 24px 24px; font-family: 'Segoe UI', Arial, sans-serif; color: #222;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src='/logo.png' alt='MenuMitra Logo' style='width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #eee;'/>
            <span style="font-size: 22px; font-weight: 600; letter-spacing: 0.5px;">MenuMitra</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 600; color: #e74c3c; margin-bottom: 2px;">Invoice</div>
            <div style="font-size: 15px; color: #888;">Bill no: <b>${
              order_details.order_number
            }</b></div>
            <div style="font-size: 14px; color: #888;">${invoiceDateTime}</div>
          </div>
        </div>
        <div style="margin-bottom: 18px;">
          <div style="font-size: 16px; font-weight: 500; margin-bottom: 2px;">Hello, <b>${
            order_details.user_name || "Customer"
          }</b></div>
          <div style="font-size: 14px; color: #444;">Thank you for shopping from our store and for your order.</div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin: 18px 0 10px 0;">
          <thead>
            <tr>
              <th style="text-align: left; font-size: 15px; font-weight: 600; padding: 8px 0;">Item</th>
              <th style="text-align: center; font-size: 15px; font-weight: 600; padding: 8px 0;">Quantity</th>
              <th style="text-align: right; font-size: 15px; font-weight: 600; padding: 8px 0;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${menu_details
              .map(
                (item) => `
              <tr>
                <td style="color: #e74c3c; font-size: 15px; padding: 6px 0;">${
                  item.menu_name
                }</td>
                <td style="text-align: center; font-size: 15px; padding: 6px 0;">${
                  item.quantity
                }</td>
                <td style="text-align: right; font-size: 15px; padding: 6px 0;">₹${parseFloat(
                  item.price
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <hr style="border: none; border-top: 1.5px solid #eee; margin: 10px 0 18px 0;" />
        <div style="max-width: 320px; margin-left: auto; font-size: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>Total:</span><span>₹${parseFloat(
            order_details.total_bill_amount || 0
          ).toFixed(2)}</span></div>
          ${
            order_details.special_discount && order_details.special_discount > 0
              ? `<div style="display: flex; justify-content: space-between; color: #e74c3c;"><span>Special Discount:</span><span>-₹${parseFloat(
                  order_details.special_discount
                ).toFixed(2)}</span></div>`
              : ""
          }
          ${
            order_details.charges && order_details.charges > 0
              ? `<div style="display: flex; justify-content: space-between; color: #27ae60;"><span>Extra Charges:</span><span>+₹${parseFloat(
                  order_details.charges
                ).toFixed(2)}</span></div>`
              : ""
          }
          ${
            order_details.total_bill_with_discount &&
            order_details.total_bill_with_discount > 0
              ? `<div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>₹${parseFloat(
                  order_details.total_bill_with_discount
                ).toFixed(2)}</span></div>`
              : ""
          }
          ${
            order_details.service_charges_amount &&
            order_details.service_charges_amount > 0
              ? `<div style="display: flex; justify-content: space-between; color: #27ae60;"><span>Service Charges (${parseFloat(
                  order_details.service_charges_percent || 0
                ).toFixed(0)}%):</span><span>+₹${parseFloat(
                  order_details.service_charges_amount
                ).toFixed(2)}</span></div>`
              : ""
          }
          ${
            order_details.gst_amount && order_details.gst_amount > 0
              ? `<div style="display: flex; justify-content: space-between; color: #27ae60;"><span>GST (${parseFloat(
                  order_details.gst_percent || 0
                ).toFixed(0)}%):</span><span>+₹${parseFloat(
                  order_details.gst_amount
                ).toFixed(2)}</span></div>`
              : ""
          }
          ${
            order_details.tip && order_details.tip > 0
              ? `<div style="display: flex; justify-content: space-between; color: #27ae60;"><span>Tip:</span><span>+₹${parseFloat(
                  order_details.tip
                ).toFixed(2)}</span></div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 16px; margin-top: 6px;"><span>Grand Total:</span><span>₹${parseFloat(
            order_details.final_grand_total || 0
          ).toFixed(2)}</span></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 32px;">
          <div style="font-size: 15px;">
            <div style="font-weight: 600; margin-bottom: 6px;">Billing Information</div>
            <div>▶ ${order_details.user_name || outlet_name}</div>
            <div>▶ ${order_details.outlet_address || outlet_address}</div>
            <div>▶ ${order_details.user_mobile || outlet_mobile}</div>
          </div>
          <div style="font-size: 15px; text-align: right;">
            <div style="font-weight: 600; margin-bottom: 6px;">Payment Method</div>
            <div style="text-transform: uppercase;">${
              order_details.payment_method || "CASH"
            }</div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 36px;">
          <div style="font-style: italic; color: #444; margin-bottom: 12px;">Have a nice day.</div>
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 10px;">
            <img src="/logo.png" alt="MenuMitra Logo" style="width: 28px; height: 28px; object-fit: contain; border-radius: 50%; border: 1px solid #eee;" />
            <span style="font-size: 17px; font-weight: bold; color: #222;">MenuMitra</span>
          </div>
          <div style="font-size: 14px; color: #888; margin-top: 6px;">info@menumitra.com</div>
          <div style="font-size: 14px; color: #888;">+91 9172530151</div>
          <div style="font-size: 14px; color: #888;">${website_url}</div>
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
