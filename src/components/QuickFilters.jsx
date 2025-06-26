import React, { useState, useRef, useEffect } from "react";

const QuickFilters = ({ onFilterChange }) => {
  const [activeFilters, setActiveFilters] = useState({
    type: null,
    price: null,
    spicy: null,
  });

  // Add state to track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null);

  // Add refs for each dropdown
  const dropdownRefs = {
    type: useRef(),
    price: useRef(),
    spicy: useRef(),
  };

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest(".dropdown")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDropdown]);

  const typeOptions = [
    { id: "all", label: "All", icon: "🍽️" },
    { id: "veg", label: "Veg", icon: "🥬" },
    { id: "nonveg", label: "Nonveg", icon: "🍗" },
    { id: "vegan", label: "Vegan", icon: "🌱" },
    { id: "egg", label: "Egg", icon: "🥚" },
  ];

  const priceOptions = [
    { id: "all", label: "All Prices", icon: "₹" },
    { id: "50", label: "Under ₹50", icon: "₹" },
    { id: "100", label: "Under ₹100", icon: "₹" },
    { id: "200", label: "Under ₹200", icon: "₹" },
    { id: "500", label: "Under ₹500", icon: "₹" },
    { id: "1000", label: "Under ₹1000", icon: "₹" },
    { id: "above1000", label: "Above ₹1000", icon: "₹" },
  ];

  const spicyOptions = [
    {
      id: "all",
      label: "All",
      icon: (
        <span
          style={{
            position: "relative",
            display: "inline-block",
            width: 24,
            height: 20,
          }}
        >
          {/* Green filter icon */}
          <svg
            width="22"
            height="20"
            viewBox="0 0 22 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ verticalAlign: "middle" }}
          >
            <path
              d="M2 3.5C2 2.11929 3.11929 1 4.5 1H17.5C18.8807 1 20 2.11929 20 3.5C20 4.09544 19.7625 4.66812 19.3416 5.08902L13.5 10.9306V17C13.5 17.5523 13.0523 18 12.5 18H9.5C8.94772 18 8.5 17.5523 8.5 17V10.9306L2.65837 5.08902C2.23747 4.66812 2 4.09544 2 3.5Z"
              fill="#22A45D"
            />
          </svg>
          {/* White X in green circle at bottom right */}
          <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", right: -2, bottom: -2 }}
          >
            <circle cx="6.5" cy="6.5" r="6.5" fill="#22A45D" />
            <path
              d="M4.8 4.8L8.2 8.2M8.2 4.8L4.8 8.2"
              stroke="white"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ),
    },
    {
      id: "low",
      label: "Low",
      icon: (
        <i
          className="fa-solid fa-pepper-hot"
          style={{ color: "#22A45D", fontSize: 18 }}
        ></i>
      ),
    },
    {
      id: "medium",
      label: "Medium",
      icon: (
        <i
          className="fa-solid fa-pepper-hot"
          style={{ color: "#FFA500", fontSize: 18 }}
        ></i>
      ),
    },
    {
      id: "high",
      label: "High",
      icon: (
        <i
          className="fa-solid fa-pepper-hot"
          style={{ color: "#FF2D2D", fontSize: 18 }}
        ></i>
      ),
    },
  ];

  const handleFilterClick = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: activeFilters[filterType] === value ? null : value,
    };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
    setOpenDropdown(null); // Close dropdown after selection
  };

  const getButtonIcon = (type) => {
    switch (type.toLowerCase()) {
      case "type":
        return (
          <i
            className="fa-solid fa-filter"
            style={{ color: "#22A45D", fontSize: 18, marginRight: 6 }}
          ></i>
        );
      case "price":
        return (
          <i
            className="fa-solid fa-indian-rupee-sign"
            style={{ color: "#22A45D", fontSize: 18, marginRight: 6 }}
          ></i>
        );
      case "spicy":
        return (
          <i
            className="fa-solid fa-pepper-hot"
            style={{ color: "#22A45D", fontSize: 18, marginRight: 6 }}
          ></i>
        );
      default:
        return null;
    }
  };

  const getButtonLabel = (type, options, activeValue) => {
    if (!activeValue || activeValue === "all") {
      return type; // Show default type name if no selection or 'all' is selected
    }
    const selectedOption = options.find((opt) => opt.id === activeValue);
    // Return only the label text without the icon
    return selectedOption?.label || type;
  };

  const handleDropdownToggle = (dropdownName, isOpen) => {
    if (isOpen) {
      // Close other dropdowns
      Object.keys(dropdownRefs).forEach((key) => {
        if (key !== dropdownName && dropdownRefs[key].current) {
          const dropdown =
            dropdownRefs[key].current.querySelector(".dropdown-menu");
          if (dropdown.classList.contains("show")) {
            dropdown.classList.remove("show");
          }
        }
      });
      setOpenDropdown(dropdownName);
    } else {
      setOpenDropdown(null);
    }
  };

  const renderFilterDropdown = (type, options, activeValue) => {
    const dropdownType = type.toLowerCase();

    return (
      <div className="card" ref={dropdownRefs[dropdownType]}>
        <div className="card-body p-0">
          <div className="basic-dropdown">
            <div className="dropdown">
              <button
                type="button"
                className={`btn ${
                  activeValue && activeValue !== "all"
                    ? "btn-success"
                    : "btn-outline-success"
                } dropdown-toggle`}
                data-bs-toggle="dropdown"
                aria-expanded={openDropdown === dropdownType}
                onClick={(e) => {
                  e.preventDefault();
                  handleDropdownToggle(
                    dropdownType,
                    openDropdown !== dropdownType
                  );
                }}
              >
                {getButtonIcon(type)}
                {getButtonLabel(type, options, activeValue)}
              </button>
              <div
                className={`dropdown-menu ${
                  openDropdown === dropdownType ? "show" : ""
                }`}
              >
                {options.map((option) => (
                  <a
                    key={option.id}
                    className={`dropdown-item ${
                      activeValue === option.id ? "active" : ""
                    }`}
                    href="javascript:void(0);"
                    onClick={() => handleFilterClick(dropdownType, option.id)}
                  >
                    <span className="me-2">{option.icon}</span>
                    {option.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex gap-2">
      {renderFilterDropdown("Type", typeOptions, activeFilters.type)}
      {renderFilterDropdown("Price", priceOptions, activeFilters.price)}
      {renderFilterDropdown("Spicy", spicyOptions, activeFilters.spicy)}
    </div>
  );
};

export default QuickFilters;
