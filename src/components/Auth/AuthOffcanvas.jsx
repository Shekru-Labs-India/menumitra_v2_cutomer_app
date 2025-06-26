import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Offcanvas from "../Shared/Offcanvas";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import { useTheme } from "../../contexts/ThemeContext";

const STEPS = {
  LOGIN: "login",
  SIGNUP: "signup",
  OTP: "otp",
};

const API_BASE_URL = "https://men4u.xyz/v2";

// Create axios instance with common config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const AuthOffcanvas = () => {
  const { showAuthOffcanvas, setShowAuthOffcanvas, handleLoginSuccess } =
    useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.LOGIN);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (currentStep === STEPS.OTP) {
      const otpInputs = document.querySelectorAll("#otp input");

      const handleOTPInput = (e) => {
        const input = e.target;
        const value = input.value.replace(/\D/g, "");

        if (value) {
          input.value = value;

          const next = input.getAttribute("data-next");
          if (next && value.length === 1) {
            const nextInput = document.getElementById(next);
            if (nextInput) {
              nextInput.focus();
            }
          }
        }
      };

      const handleKeyDown = (e) => {
        const input = e.target;

        if (e.key === "Backspace" && !input.value) {
          const prev = input.getAttribute("data-previous");
          if (prev) {
            const prevInput = document.getElementById(prev);
            if (prevInput) {
              prevInput.focus();
            }
          }
        }
      };

      const updateOTPState = () => {
        const digits = [...otpInputs].map((input) => input.value).join("");
        setOtp(digits);
      };

      otpInputs.forEach((input) => {
        input.addEventListener("input", (e) => {
          handleOTPInput(e);
          updateOTPState();
        });
        input.addEventListener("keydown", handleKeyDown);
      });

      otpInputs[0]?.focus();

      return () => {
        otpInputs.forEach((input) => {
          input.removeEventListener("input", handleOTPInput);
          input.removeEventListener("keydown", handleKeyDown);
        });
      };
    }
  }, [currentStep]);

  useEffect(() => {
    const handleVisualViewport = () => {
      const viewportHeight =
        window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const offcanvas = document.querySelector(".auth-offcanvas");

      // Check if keyboard is open
      const keyboardIsOpen = viewportHeight < windowHeight * 0.75;

      if (offcanvas) {
        if (keyboardIsOpen) {
          // Lock background scroll
          document.body.style.overflow = "hidden";
          document.body.style.position = "fixed";
          document.body.style.width = "100%";

          // Simple transform to move above keyboard
          const keyboardHeight = windowHeight - viewportHeight;
          offcanvas.style.transform = `translateY(-${keyboardHeight}px)`;
          offcanvas.style.transition = "transform 0.2s ease-out";
        } else {
          // Reset all styles
          document.body.style.overflow = "";
          document.body.style.position = "";
          document.body.style.width = "";

          offcanvas.style.transform = "translateY(0)";
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleVisualViewport);
      window.visualViewport.addEventListener("scroll", handleVisualViewport);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleVisualViewport
        );
        window.visualViewport.removeEventListener(
          "scroll",
          handleVisualViewport
        );
      }
      // Cleanup styles
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  const handleInputFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const handleClose = () => {
    setCurrentStep(STEPS.LOGIN);
    setPhoneNumber("");
    setOtp("");
    setUserDetails({ name: "", email: "" });
    setError("");
    setShowAuthOffcanvas(false);
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/common/login", {
        mobile: phoneNumber,
      });

      if (data.role === "customer") {
        setCurrentStep(STEPS.OTP);
      } else {
        setError("This mobile number is not registered as a customer.");
      }
    } catch (err) {
      console.error("Login error:", err);

      // Check for 500 status with specific error message
      if (
        err.response?.status === 500 &&
        err.response?.data?.detail ===
          "400: This mobile number is not registered."
      ) {
        // Automatically switch to signup step
        setCurrentStep(STEPS.SIGNUP);
        return; // Exit early to avoid showing error message
      }

      setError(
        err.response?.data?.detail ||
          "Unable to process request. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api.post("/user/account_signup", {
        mobile: phoneNumber,
        name: userDetails.name,
      });

      setError("Account created successfully!");
      setTimeout(() => {
        setCurrentStep(STEPS.OTP);
        setError("");
      }, 1500);
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const deviceInfo = {
      fcm_token: "457896354789",
      device_id: "8974561234",
      device_model: "Laptop 122",
    };

    try {
      const { data } = await api.post("/common/verify_otp", {
        mobile: phoneNumber,
        otp: otp,
        ...deviceInfo,
      });

      handleLoginSuccess({
        ...data,
        mobile: phoneNumber,
      });
      handleClose();
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/common/resend-otp", {
        phone: phoneNumber,
        country_code: "+91",
      });

      if (data.success) {
        setError("OTP resent successfully!");
        setTimeout(() => setError(""), 3000);
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(
        err.response?.data?.message || "Failed to resend OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const backButtonIcon = (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.40366 8L9.91646 2.58333L7.83313 0.499999L0.333132 8L7.83313 15.5L9.91644 13.4167L4.40366 8Z"
        fill={isDarkMode ? "#ffffff" : "#027335"}
      />
    </svg>
  );

  const renderLoginStep = () => (
    <div className="px-1">
      <h6 className="title font-w600 mb-4">Login to MenuMitra</h6>
      {error && (
        <div
          className={`alert ${
            error.includes("successfully") ? "alert-success" : "alert-danger"
          } py-2 mb-3`}
        >
          {error}
        </div>
      )}
      <form onSubmit={handlePhoneSubmit}>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <div className="input-group">
            <span className="input-group-text">+91</span>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setPhoneNumber(value);
                }
              }}
              onFocus={handleInputFocus}
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              disabled={isLoading}
            />
          </div>
          <small className="text-muted">Enter 10 digit mobile number</small>
        </div>
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={isLoading || phoneNumber.length !== 10}
        >
          {isLoading ? (
            <span>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Please wait...
            </span>
          ) : (
            "Get OTP"
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
          <div className="border-bottom flex-grow-1"></div>
          <button
            type="button"
            className="btn btn-link p-0 text-decoration-none"
            onClick={() => setCurrentStep(STEPS.SIGNUP)}
            disabled={isLoading}
            style={{
              fontSize: "0.875rem",
              fontWeight: "500",
              transition: "opacity 0.2s ease",
              color: "#6c757d",
            }}
          >
            New to MenuMitra?{" "}
            <span className="ms-2" style={{ color: "#027335" }}>
              Register
              <svg
                className="ms-1 mt-0"
                viewBox="0 0 10 10"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{
                  width: "0.68em",
                  height: "0.68em",
                  color: "#027335",
                }}
              >
                <path
                  d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
          <div className="border-bottom flex-grow-1"></div>
        </div>
      </div>
    </div>
  );

  const buttonContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "1rem",
  };

  const backButtonStyle = {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDarkMode ? "#027335" : "#e8f5eb",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  };

  const renderSignupStep = () => (
    <div className="px-1">
      <h6 className="title font-w600 mb-4">Create Account</h6>
      {error && (
        <div
          className={`alert ${
            error.includes("successfully") ? "alert-success" : "alert-danger"
          } py-2 mb-3`}
        >
          {error}
        </div>
      )}
      <form onSubmit={handleSignupSubmit}>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <div className="input-group">
            <span className="input-group-text">+91</span>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setPhoneNumber(value);
                }
              }}
              onFocus={handleInputFocus}
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              disabled={isLoading}
            />
          </div>
          <small className="text-muted">Enter 10 digit mobile number</small>
        </div>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            type="text"
            className="form-control"
            value={userDetails.name}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow alphabets and spaces
              if (/^[a-zA-Z ]*$/.test(value)) {
                setUserDetails((prev) => ({ ...prev, name: value }));
              }
            }}
            onFocus={handleInputFocus}
            placeholder="Enter your full name"
            required
            disabled={isLoading}
          />
        </div>
        <div style={buttonContainerStyle}>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => setCurrentStep(STEPS.LOGIN)}
            disabled={isLoading}
            className={`back-btn ${isDarkMode ? "dark-mode" : ""}`}
          >
            {backButtonIcon}
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-grow-1"
            disabled={
              isLoading || !userDetails.name.trim() || phoneNumber.length !== 10
            }
          >
            {isLoading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Creating Account...
              </span>
            ) : (
              "NEXT"
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderResendOTP = () => {
    if (currentStep !== STEPS.OTP) return null;

    return (
      <div className="text-center mt-3">
        <button
          type="button"
          className="btn btn-link text-decoration-none"
          onClick={handleResendOTP}
          disabled={isLoading}
        >
          Resend OTP
        </button>
      </div>
    );
  };

  const renderOTPStep = () => (
    <div className="px-1">
      <h6 className="title font-w600 mb-4">Verify OTP</h6>
      {error && (
        <div
          className={`alert ${
            error.includes("success") ? "alert-success" : "alert-danger"
          } py-2 mb-3`}
        >
          {error}
        </div>
      )}
      <p className="text-muted mb-4">
        Enter the verification code sent to{" "}
        <span className="fw-bold">+91 {phoneNumber}</span>
      </p>
      <form onSubmit={handleOTPSubmit}>
        <div className="mb-4">
          <div
            id="otp"
            className="digit-group d-flex gap-2 justify-content-center"
          >
            {[1, 2, 3, 4].map((digit) => (
              <input
                key={digit}
                className="form-control text-center"
                type="text"
                id={`digit-${digit}`}
                name={`digit-${digit}`}
                data-next={digit < 4 ? `digit-${digit + 1}` : null}
                data-previous={digit > 1 ? `digit-${digit - 1}` : null}
                maxLength="1"
                pattern="[0-9]"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                disabled={isLoading}
                onFocus={handleInputFocus}
              />
            ))}
          </div>
        </div>
        <div style={buttonContainerStyle}>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => setCurrentStep(STEPS.LOGIN)}
            disabled={isLoading}
            className={`back-btn ${isDarkMode ? "dark-mode" : ""}`}
          >
            {backButtonIcon}
          </button>
          <button
            type="submit"
            className="btn btn-primary flex-grow-1"
            disabled={isLoading || otp.length !== 4}
          >
            {isLoading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Verifying...
              </span>
            ) : (
              "SUBMIT"
            )}
          </button>
        </div>
      </form>
      {renderResendOTP()}
    </div>
  );

  return (
    <Offcanvas
      isOpen={showAuthOffcanvas}
      onClose={handleClose}
      position="bottom"
      className="auth-offcanvas m-3 rounded"
      style={{
        transition: "transform 0.2s ease-out",
        willChange: "transform",
      }}
    >
      {currentStep === STEPS.LOGIN && renderLoginStep()}
      {currentStep === STEPS.SIGNUP && renderSignupStep()}
      {currentStep === STEPS.OTP && renderOTPStep()}
    </Offcanvas>
  );
};

AuthOffcanvas.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  defaultStep: PropTypes.oneOf(Object.values(STEPS)),
};

export default AuthOffcanvas;
