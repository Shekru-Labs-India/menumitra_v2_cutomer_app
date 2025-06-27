import React, { useState } from "react";
import axios from "axios";

const CustomerFeedbackModal = ({ show, onClose }) => {
  const [form, setForm] = useState({
    order_number: "",
    customer_name: "",
    mobile: "",
    feedback_description: "",
    feedback_rating: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.feedback_description.trim() || !form.feedback_rating) {
      setError("Feedback and rating are required.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("https://men4u.xyz/v2/common/customer_feedback", {
        ...form,
        feedback_rating: Number(form.feedback_rating),
      });
      setSuccess("Thank you for your feedback!");
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.3)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div
            className="modal-header d-flex align-items-center justify-content-between"
            style={{ paddingRight: 8 }}
          >
            <h5 className="modal-title mb-0">Customer Feedback</h5>
            <button
              type="button"
              className="btn"
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                color: "#222",
                boxShadow: "none",
                outline: "none",
                padding: 0,
              }}
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}
              {success && (
                <div className="alert alert-success py-2">{success}</div>
              )}
              <div className="mb-2">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Mobile</label>
                <input
                  type="text"
                  className="form-control"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                />
              </div>
              <div className="mb-2">
                <label className="form-label">Order Number</label>
                <input
                  type="text"
                  className="form-control"
                  name="order_number"
                  value={form.order_number}
                  onChange={handleChange}
                  placeholder="Enter your order number"
                />
              </div>
              <div className="mb-2">
                <label className="form-label">
                  <span className="text-danger">*</span>Feedback
                </label>
                <textarea
                  className="form-control"
                  name="feedback_description"
                  value={form.feedback_description}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Write your feedback here..."
                />
              </div>
              <div className="mb-2">
                <label className="form-label">
                  <span className="text-danger">*</span>Rating
                </label>
                <div style={{ display: "flex", gap: 4, fontSize: 24 }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i
                      key={n}
                      className={
                        n <= Number(form.feedback_rating)
                          ? "fa-solid fa-star"
                          : "fa-regular fa-star"
                      }
                      style={{
                        color:
                          n <= Number(form.feedback_rating)
                            ? "#FFD600"
                            : "#ccc",
                        cursor: "pointer",
                        transition: "color 0.2s",
                      }}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, feedback_rating: n }))
                      }
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                    ></i>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerFeedbackModal;
