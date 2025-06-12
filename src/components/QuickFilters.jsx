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
    { id: "all", label: "All", icon: "🌶️" },
    { id: "low", label: "Low", icon: "🌶️" },
    { id: "medium", label: "Medium", icon: "🌶️🌶️" },
    { id: "high", label: "High", icon: "🌶️🌶️🌶️" },
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
