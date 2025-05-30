import React from "react";
import { Link } from "react-router-dom";

const TestEnvironmentBanner = () => {
  // Check if current domain is production
  const isProductionDomain = () => {
    const hostname = window.location.hostname;
    return (
      hostname === "menumitra.com" ||
      hostname === "user.menumitra.com" ||
      hostname === "www.menumitra.com" ||
      hostname === "www.user.menumitra.com"
    );
  };

  // Return null (render nothing) if on production domain
  if (isProductionDomain()) {
    return null;
  }

  return (
    <div
      className="text-white d-flex justify-content-between align-items-center px-3 py-2"
      style={{
        backgroundColor: "orange",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <div className="flex-grow-1 text-center d-flex align-items-center justify-content-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12.8943 4.55846C12.5318 3.94241 11.4682 3.94241 11.1057 4.55846L2.18046 19.4415C1.81797 20.0576 2.24949 20.8334 2.57476 20.8334H21.4252C21.7505 20.8334 22.182 20.0576 21.8195 19.4415L12.8943 4.55846ZM12 8.33337C12.4606 8.33337 12.8334 8.70615 12.8334 9.16671V13.5001C12.8334 13.9606 12.4606 14.3334 12 14.3334C11.5394 14.3334 11.1667 13.9606 11.1667 13.5001V9.16671C11.1667 8.70615 11.5394 8.33337 12 8.33337ZM12 17.5001C11.5394 17.5001 11.1667 17.1273 11.1667 16.6667C11.1667 16.2062 11.5394 15.8334 12 15.8334C12.4606 15.8334 12.8334 16.2062 12.8334 16.6667C12.8334 17.1273 12.4606 17.5001 12 17.5001Z"
            fill="currentColor"
          />
        </svg>
        <span className="ms-1" style={{ fontWeight: "600", letterSpacing: "0.5px" }}>
          TESTING ENVIRONMENT
        </span>
      </div>
      <Link
        to="https://user.menumitra.com/"
        className="btn d-flex align-items-center"
        target="_blank"
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          color: "#027335",
          border: "none",
          borderRadius: "6px",
          padding: "8px 16px",
          fontWeight: "600",
          fontSize: "0.9rem",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Prod
        <svg
          className="ms-1 mt-0"
          style={{ width: "0.68em", height: "0.68em" }}
          viewBox="0 0 10 10"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M1.004 9.166 9.337.833m0 0v8.333m0-8.333H1.004"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>
    </div>
  );
};

export default TestEnvironmentBanner;
