import React, { useState, useEffect } from "react";
import BaseModal from "../BaseModal";
import { useCart } from "../../../contexts/CartContext";
import { useModal } from "../../../contexts/ModalContext";
import { useAuth } from "../../../contexts/AuthContext";
import { useOutlet } from "../../../contexts/OutletContext";
import axios from "axios";

export const AddToCartModal = () => {
  const { closeModal, modalConfig } = useModal();
  const { addToCart, cartItems } = useCart();
  const { user, setShowAuthOffcanvas, getAccessToken } = useAuth();
  const { outletId } = useOutlet();

  console.log("Modal Config Data:", modalConfig.data);
  console.log("Current Cart Items:", cartItems);

  // Track quantities for all portions
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    modalConfig.data?.portions?.forEach((portion) => {
      const cartItem = cartItems.find(
        (item) =>
          item.menuId === modalConfig.data?.menuId &&
          item.portionId === portion.portion_id
      );
      initial[portion.portion_id] = cartItem?.quantity || 1;
    });
    return initial;
  });

  // Track comments for all portions
  const [comments, setComments] = useState(() => {
    const initial = {};
    modalConfig.data?.portions?.forEach((portion) => {
      const cartItem = cartItems.find(
        (item) =>
          item.menuId === modalConfig.data?.menuId &&
          item.portionId === portion.portion_id
      );
      initial[portion.portion_id] = cartItem?.comment || "";
    });
    return initial;
  });

  const [selectedPortion, setSelectedPortion] = useState(
    modalConfig.data?.portions?.[0]?.portion_id
  );

  console.log("Initial Selected Portion:", selectedPortion);
  console.log("Initial Quantities:", quantities);

  // Check if item exists in cart
  const isInCart = cartItems.some(
    (item) => item.menuId === modalConfig.data?.menuId
  );

  // Find existing cart item for current portion
  const getCurrentCartItem = (portionId) => {
    return cartItems.find(
      (item) =>
        item.menuId === modalConfig.data?.menuId && item.portionId === portionId
    );
  };

  // Update quantity when portion changes
  const handlePortionChange = (portionId) => {
    console.log("Portion Change:", {
      from: selectedPortion,
      to: portionId,
    });

    setSelectedPortion(portionId);

    // Set quantity to 1 if it's 0 or undefined
    setQuantities((prev) => ({
      ...prev,
      [portionId]: prev[portionId] || 1,
    }));
  };

  // Set modal title based on cart status and include menu name
  const modalTitle = `${isInCart ? "Update" : "Add"} - ${
    modalConfig.data?.menuName || modalConfig.data?.menu_name || ""
  }`;

  // Add auth check at the start of the component
  useEffect(() => {
    const authData = localStorage.getItem("auth");
    if (!authData || !user) {
      closeModal("addToCart"); // Close the cart modal
      setShowAuthOffcanvas(true); // Show auth modal
      return;
    }
  }, [user, closeModal, setShowAuthOffcanvas]);

  const handleQuantityChange = (newQuantity) => {
    // Check if user is authenticated
    const authData = localStorage.getItem("auth");
    if (!authData || !user) {
      closeModal("addToCart"); // Close the cart modal
      setShowAuthOffcanvas(true); // Show auth modal
      return;
    }

    console.log("Quantity Change:", {
      currentQuantity: quantities[selectedPortion],
      newQuantity: newQuantity,
      selectedPortion: selectedPortion,
      isInCart,
    });

    const finalQuantity = Math.max(0, newQuantity);
    setQuantities((prev) => ({
      ...prev,
      [selectedPortion]: finalQuantity,
    }));

    // Only update cart immediately if item is already in cart
    if (isInCart && modalConfig.data) {
      addToCart(
        modalConfig.data,
        selectedPortion,
        finalQuantity,
        comments[selectedPortion] || ""
      );
    }
  };

  // Update comment handler to work with selected portion
  const handleCommentChange = (newComment) => {
    if (newComment.length <= 30) {
      setComments((prev) => ({
        ...prev,
        [selectedPortion]: newComment,
      }));
    }
  };

  // Update suggestion handler
  const handleSuggestionClick = (suggestionText) => {
    const currentComment = comments[selectedPortion];
    const isSelected = currentComment.includes(suggestionText);

    if (isSelected) {
      // Remove the suggestion
      const suggestions = currentComment.split(", ");
      const filteredSuggestions = suggestions.filter(
        (s) => s !== suggestionText
      );
      const newComment = filteredSuggestions.join(", ");
      if (newComment.length <= 30) {
        handleCommentChange(newComment);
      }
    } else {
      // Add the suggestion if within limits
      const newComment = currentComment
        ? `${currentComment}, ${suggestionText}`
        : suggestionText;
      if (newComment.length <= 30) {
        handleCommentChange(newComment);
      }
    }
  };

  // Update handleAddToCart to only add the selected portion
  const handleAddToCart = () => {
    // Check if user is authenticated
    const authData = localStorage.getItem("auth");
    if (!authData || !user) {
      closeModal("addToCart"); // Close the cart modal
      setShowAuthOffcanvas(true); // Show auth modal
      return;
    }

    console.log("Final Cart Update:", {
      menuData: modalConfig.data,
      selectedPortion: selectedPortion,
      quantity: quantities[selectedPortion],
      comment: comments[selectedPortion],
      isInCart,
    });

    // Only add/update the selected portion
    if (selectedPortion && quantities[selectedPortion] > 0) {
      addToCart(
        modalConfig.data,
        Number(selectedPortion),
        quantities[selectedPortion],
        comments[selectedPortion] || ""
      );
    }

    closeModal("addToCart");
  };

  // Add a function to check if any portion has quantity > 0
  const hasValidQuantity = () => {
    return Object.values(quantities).some((quantity) => quantity > 0);
  };

  // Initialize menuDetails with modalConfig.data instead of null
  const [menuDetails, setMenuDetails] = useState({
    portions: modalConfig.data?.portions || [],
  });

  // Update the useEffect to silently update the UI
  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const token = getAccessToken();

        const response = await axios.post(
          "https://men4u.xyz/v2/user/get_full_half_price_of_menu",
          {
            outlet_id: outletId,
            menu_id: modalConfig.data?.menuId || modalConfig.data?.menu_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data?.detail?.menu_detail) {
          // Silently update the state without affecting the UI
          setMenuDetails(response.data.detail.menu_detail);

          // Update quantities and comments only if they don't exist
          const newPortions = response.data.detail.menu_detail.portions;

          setQuantities((prev) => {
            const updated = { ...prev };
            newPortions.forEach((portion) => {
              if (!(portion.portion_id in updated)) {
                const cartItem = cartItems.find(
                  (item) =>
                    item.menuId === modalConfig.data?.menuId &&
                    item.portionId === portion.portion_id
                );
                updated[portion.portion_id] = cartItem?.quantity || 1;
              }
            });
            return updated;
          });

          setComments((prev) => {
            const updated = { ...prev };
            newPortions.forEach((portion) => {
              if (!(portion.portion_id in updated)) {
                const cartItem = cartItems.find(
                  (item) =>
                    item.menuId === modalConfig.data?.menuId &&
                    item.portionId === portion.portion_id
                );
                updated[portion.portion_id] = cartItem?.comment || "";
              }
            });
            return updated;
          });

          // Only set selected portion if none is selected
          if (!selectedPortion && newPortions.length > 0) {
            setSelectedPortion(newPortions[0].portion_id);
          }
        }
      } catch (err) {
        // Just log the error without updating UI
        console.error("Error fetching menu details:", err);
      }
    };

    if (modalConfig.data?.menuId || modalConfig.data?.menu_id) {
      fetchMenuDetails();
    }
  }, [modalConfig.data, cartItems, getAccessToken, outletId, selectedPortion]);

  // Add state for dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".position-relative")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Update renderPortionSelection to always show UI without loading or error states
  const renderPortionSelection = () => {
    const portions = menuDetails?.portions || [];

    if (portions.length === 0) {
      return (
        <div
          className="form-control d-flex justify-content-between align-items-center"
          style={{
            border: "1.5px solid #e9ecef",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            backgroundColor: "#f8f9fa",
            color: "#6c757d",
            cursor: "not-allowed",
          }}
        >
          <span>No portion sizes available</span>
        </div>
      );
    }

    return (
      <div className="position-relative">
        <div
          className="form-control d-flex justify-content-between align-items-center"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            border: "1.5px solid #e9ecef",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "14px",
            cursor: "pointer",
            backgroundColor: "white",
            color: "#212529",
            userSelect: "none",
          }}
        >
          <span>
            {selectedPortion && portions.length > 0
              ? `${
                  portions.find((p) => p.portion_id === selectedPortion)
                    ?.portion_name
                } - ₹${
                  portions.find((p) => p.portion_id === selectedPortion)?.price
                } (${
                  portions.find((p) => p.portion_id === selectedPortion)
                    ?.unit_value
                })`
              : "Select a portion size"}
          </span>
          <i
            className={`fas fa-chevron-${isDropdownOpen ? "up" : "down"}`}
            style={{ color: "#6c757d" }}
          ></i>
        </div>

        {isDropdownOpen && portions.length > 0 && (
          <div
            className="position-absolute w-100 mt-1 shadow-sm"
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              border: "1.5px solid #e9ecef",
              zIndex: 1000,
              overflow: "hidden",
            }}
          >
            {portions.map((portion) => (
              <div
                key={portion.portion_id}
                onClick={() => {
                  handlePortionChange(portion.portion_id);
                  setIsDropdownOpen(false);
                }}
                className="d-flex justify-content-between align-items-center"
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor:
                    selectedPortion === portion.portion_id
                      ? "#f8fff8"
                      : "white",
                  borderBottom: "1px solid #e9ecef",
                  transition: "all 0.2s ease",
                }}
              >
                <div className="d-flex flex-column">
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#212529",
                      fontWeight:
                        selectedPortion === portion.portion_id
                          ? "500"
                          : "normal",
                    }}
                  >
                    {`${portion.portion_name} - ₹${portion.price} (${portion.unit_value})`}
                  </span>
                </div>
                {selectedPortion === portion.portion_id && (
                  <i className="fas fa-check" style={{ color: "#28a745" }}></i>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseModal isOpen={true} title={modalTitle} onClose={closeModal}>
      <div className="mb-4">
        <label className="text-secondary mb-2" style={{ fontSize: "14px" }}>
          Select Portion
        </label>
        <div className="row">
          <div className="col-12">{renderPortionSelection()}</div>
        </div>
      </div>

      <div className="mb-4">
        <label className="text-secondary mb-2 d-flex justify-content-between align-items-center">
          <span style={{ fontSize: "14px" }}>
            Special Instructions for{" "}
            {
              menuDetails?.portions?.find(
                (p) => p.portion_id === selectedPortion
              )?.portion_name
            }
          </span>
          <small
            style={{
              color:
                (comments[selectedPortion]?.length || 0) > 30
                  ? "#dc3545"
                  : "#6c757d",
              fontSize: "12px",
            }}
          >
            {comments[selectedPortion]?.length || 0}/30
          </small>
        </label>

        {/* Quick Suggestions */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {[
            { icon: "🌶️", text: "Extra spicy" },
            { icon: "🥬", text: "No onions" },
            { icon: "🧄", text: "No garlic" },
            { icon: "🥄", text: "Extra sauce" },
            { icon: "🔥", text: "Well done" },
            { icon: "🥗", text: "Less spicy" },
            { icon: "🥚", text: "No egg" },
            { icon: "🥜", text: "No nuts" },
          ].map((suggestion, index) => {
            const isSelected = comments[selectedPortion]?.includes(
              suggestion.text
            );

            return (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                style={{
                  backgroundColor: isSelected ? "#e8f5e9" : "#f8f9fa",
                  border: `1px solid ${isSelected ? "#28a745" : "#e9ecef"}`,
                  borderRadius: "20px",
                  padding: "8px 12px",
                  fontSize: "13px",
                  color: isSelected ? "#28a745" : "#6c757d",
                  cursor:
                    comments[selectedPortion]?.length > 30 && !isSelected
                      ? "not-allowed"
                      : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  userSelect: "none",
                  opacity:
                    comments[selectedPortion]?.length > 30 && !isSelected
                      ? 0.5
                      : 1,
                }}
              >
                <span>{suggestion.icon}</span>
                <span>{suggestion.text}</span>
                {isSelected && (
                  <span style={{ marginLeft: "4px", fontSize: "10px" }}>✓</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Comment textarea */}
        <div className="position-relative">
          <textarea
            className="form-control"
            value={comments[selectedPortion] || ""}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder={`Add instructions for ${
              menuDetails?.portions?.find(
                (p) => p.portion_id === selectedPortion
              )?.portion_name
            } portion...`}
            style={{
              border: `1.5px solid ${
                comments[selectedPortion]?.length < 5 &&
                comments[selectedPortion]?.length > 0
                  ? "#dc3545"
                  : comments[selectedPortion]?.length > 30
                  ? "#dc3545"
                  : "#e9ecef"
              }`,
              borderRadius: "12px",
              padding: "12px",
              paddingRight: "60px",
              fontSize: "14px",
              minHeight: "60px",
              maxHeight: "120px",
              resize: "vertical",
              backgroundColor: "#f8f9fa",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              if (comments[selectedPortion]?.length <= 30) {
                e.target.style.border = "1.5px solid #28a745";
              }
            }}
            onBlur={(e) => {
              e.target.style.border =
                comments[selectedPortion]?.length < 5 ||
                comments[selectedPortion]?.length > 30
                  ? "1.5px solid #dc3545"
                  : "1.5px solid #e9ecef";
            }}
          />

          {/* Clear button */}
          {comments[selectedPortion] && (
            <button
              onClick={() => handleCommentChange("")}
              className="d-flex align-items-center gap-1"
              style={{
                position: "absolute",
                right: "12px",
                top: "12px",
                background: "#f1f3f5",
                border: "1px solid #e9ecef",
                borderRadius: "16px",
                padding: "4px 8px",
                color: "#6c757d",
                cursor: "pointer",
                fontSize: "12px",
                zIndex: 2,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Validation message */}
        {comments[selectedPortion]?.length > 0 && (
          <small
            style={{
              color: "#dc3545",
              fontSize: "12px",
              marginTop: "6px",
              display: "block",
            }}
          >
            {comments[selectedPortion]?.length < 5
              ? "Instructions must be at least 5 characters"
              : comments[selectedPortion]?.length > 30
              ? "Instructions cannot exceed 30 characters"
              : ""}
          </small>
        )}

        {/* Helper text */}
        <small
          style={{
            color: "#6c757d",
            fontSize: "12px",
            marginTop: comments[selectedPortion]?.length > 0 ? "2px" : "6px",
            display: "block",
          }}
        >
          Click to add/remove suggestions or type your custom instructions
        </small>
      </div>

      <div className="d-flex align-items-center gap-3 mt-4">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #28a745",
            borderRadius: "999px",
            padding: "5px 5px",
            background: "white",
            flex: "1",
          }}
        >
          <button
            type="button"
            onClick={() =>
              handleQuantityChange(quantities[selectedPortion] - 1)
            }
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#07813a",
              color: "white",
              border: "none",
              fontSize: "20px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "20px",
              transition: "background 0.2s",
              opacity: quantities[selectedPortion] <= 0 ? 0.5 : 1,
            }}
            disabled={quantities[selectedPortion] <= 0}
          >
            –
          </button>
          <span
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "#23232b",
              minWidth: "24px",
              textAlign: "center",
              flex: "1",
            }}
          >
            {quantities[selectedPortion]}
          </span>
          <button
            type="button"
            onClick={() =>
              handleQuantityChange(quantities[selectedPortion] + 1)
            }
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "#07813a",
              color: "white",
              border: "none",
              fontSize: "20px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "20px",
              transition: "background 0.2s",
            }}
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="btn btn-primary py-3 px-2 border-0 rounded-pill fs-6 fw-500 flex-grow-1"
          onClick={handleAddToCart}
          disabled={!hasValidQuantity()}
          style={{
            opacity: hasValidQuantity() ? 1 : 0.5,
          }}
        >
          <i class="fa-solid fa-cart-shopping me-2"></i>
          {isInCart ? "Update Cart" : "Add to Cart"}
        </button>
      </div>
    </BaseModal>
  );
};
