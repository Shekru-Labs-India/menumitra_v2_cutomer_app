import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { parseRestoUrl } from "../utils/urlParser";

const VegIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="1"
      y="1"
      width="14"
      height="14"
      rx="2"
      stroke="#008000"
      strokeWidth="2"
    />
    <circle cx="8" cy="8" r="4" fill="#008000" />
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
      x="1"
      y="1"
      width="14"
      height="14"
      rx="2"
      stroke="#FF0000"
      strokeWidth="2"
    />
    <circle cx="8" cy="8" r="4" fill="#FF0000" />
  </svg>
);

function AllOutlets() {
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState([]);
  const [filteredOutlets, setFilteredOutlets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "all", // 'all', 'veg', 'nonveg'
    status: "all", // 'all', 'open', 'closed'
  });

  useEffect(() => {
    fetchOutlets();
  }, []);

  useEffect(() => {
    // Apply filters whenever outlets or filters change
    applyFilters();
  }, [outlets, filters]);

  const applyFilters = () => {
    let result = [...outlets];

    // Filter by veg/non-veg
    if (filters.type !== "all") {
      result = result.filter((outlet) => outlet.veg_nonveg === filters.type);
    }

    // Filter by open/closed status
    if (filters.status !== "all") {
      result = result.filter((outlet) =>
        filters.status === "open" ? outlet.is_open : !outlet.is_open
      );
    }

    setFilteredOutlets(result);
  };

  const fetchOutlets = async () => {
    try {
      const authData = localStorage.getItem("auth");
      const userData = authData ? JSON.parse(authData) : null;

      const response = await fetch(
        "https://men4u.xyz/v2/user/get_all_restaurants",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${userData?.accessToken}`,
            app_source:"customer_app",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch outlets");
      }

      const data = await response.json();
      setOutlets(data.detail.outlets);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching outlets:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleRestoUrl = (url) => {
    const parsed = parseRestoUrl(url);

    if (!parsed.isValid) {
      console.error("Invalid resto URL format:", url);
      // Show error message to user
      return;
    }

    const { outletCode, sectionId, tableId } = parsed;

    // Navigate using the expected path format for Home.jsx
    navigate(`/o${outletCode}/s${sectionId}/t${tableId}`);
  };

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="container">
          {/* Title Section */}
          {/* <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">All Restaurants</h6>
            <span className="text-muted small">Total: {filteredOutlets.length} outlets</span>
          </div> */}

          {/* Filter Section */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              {/* Restaurant Type Filter - Left Side */}
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  id="vegTypeDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ minWidth: 100 }}
                >
                  {filters.type === "all"
                    ? "All"
                    : filters.type === "veg"
                    ? "Veg"
                    : "Non-Veg"}
                </button>
                <ul className="dropdown-menu" aria-labelledby="vegTypeDropdown">
                  <li>
                    <button
                      className={`dropdown-item${
                        filters.type === "all" ? " green-active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, type: "all" }))
                      }
                    >
                      All
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex align-items-center${
                        filters.type === "veg" ? " active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, type: "veg" }))
                      }
                    >
                      <VegIcon />
                      <span className="ms-2">Veg</span>
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item d-flex align-items-center${
                        filters.type === "nonveg" ? " active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, type: "nonveg" }))
                      }
                    >
                      <NonVegIcon />
                      <span className="ms-2">Non-Veg</span>
                    </button>
                  </li>
                </ul>
              </div>

              {/* Vertical Divider */}
              <div
                className="vr mx-3 opacity-25"
                style={{ height: "35px" }}
              ></div>

              {/* Status Filter - Right Side */}
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  id="statusDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ minWidth: 100 }}
                >
                  {filters.status === "all"
                    ? "All"
                    : filters.status === "open"
                    ? "Open"
                    : "Closed"}
                </button>
                <ul className="dropdown-menu" aria-labelledby="statusDropdown">
                  <li>
                    <button
                      className={`dropdown-item${
                        filters.status === "all" ? " green-active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, status: "all" }))
                      }
                    >
                      All
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item${
                        filters.status === "open" ? " active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, status: "open" }))
                      }
                    >
                      Open
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item${
                        filters.status === "closed" ? " active" : ""
                      }`}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, status: "closed" }))
                      }
                    >
                      Closed
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {isLoading ? (
            <div className="text-center py-4">Loading restaurants...</div>
          ) : error ? (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          ) : filteredOutlets.length === 0 ? (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              No restaurants found matching your filters
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {filteredOutlets.map((outlet) => (
                <div
                  key={outlet.outlet_id}
                  className="card border-0 mb-2"
                  onClick={() => handleRestoUrl(outlet.resto_url)}
                  style={{
                    cursor: outlet.resto_url ? "pointer" : "default",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 .5rem 1rem rgba(0,0,0,.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow =
                      "0 .125rem .25rem rgba(0,0,0,.075)";
                  }}
                >
                  <div className="card-body p-3 rounded border border-1">
                    {/* Header Section */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        {outlet.veg_nonveg === "veg" ? (
                          <span
                            className="d-flex align-items-center"
                            title="Veg"
                          >
                            <VegIcon />
                          </span>
                        ) : (
                          <span
                            className="d-flex align-items-center"
                            title="Non-Veg"
                          >
                            <NonVegIcon />
                          </span>
                        )}
                        <h6 className="card-title mb-0">
                          {outlet.outlet_name}
                        </h6>
                      </div>
                      <span
                        className={`badge rounded-pill px-3 py-2 ${
                          outlet.is_open ? "bg-success" : ""
                        }`}
                        style={
                          !outlet.is_open
                            ? { backgroundColor: "#dc3545" }
                            : undefined
                        }
                      >
                        {outlet.is_open ? "OPEN" : "CLOSED"}
                      </span>
                    </div>

                    {/* Details Section */}
                    <div className="card-text d-flex flex-column gap-2">
                      <p className="d-flex align-items-center text-muted small mb-0">
                        <i
                          className="fas fa-map-marker-alt"
                          style={{ fontSize: "16px", width: "24px" }}
                        ></i>
                        <span>{outlet.address}</span>
                      </p>
                      <p className="d-flex align-items-center text-muted small mb-0">
                        <i
                          className="fas fa-phone"
                          style={{ fontSize: "16px", width: "24px" }}
                        ></i>
                        <span>{outlet.mobile}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AllOutlets;
