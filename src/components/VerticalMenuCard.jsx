import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import LazyImage from "./Shared/LazyImage";
import { useModal } from "../contexts/ModalContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useOutlet } from "../contexts/OutletContext";

// FoodTypeIcon component
const FoodTypeIcon = ({ foodType }) => {
  const getIcon = () => {
    switch (foodType?.toLowerCase()) {
      case "veg":
        return (
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              border: "1px solid #4CAF50",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
              }}
            ></div>
          </div>
        );
      case "nonveg":
        return (
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              border: "1px solid #F44336",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "3px solid transparent",
                borderRight: "3px solid transparent",
                borderBottom: "5px solid #F44336",
              }}
            ></div>
          </div>
        );
      case "vegan":
        return (
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              border: "1px solid #4CAF50",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
            }}
          >
            <i
              className="fa-solid fa-leaf"
              style={{
                color: "#4CAF50",
                fontSize: "10px",
                lineHeight: 1,
              }}
            ></i>
          </div>
        );
      case "egg":
        return (
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "3px",
              border: "1px solid #e0e0e0",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              verticalAlign: "middle",
            }}
          >
            <i
              className="fa-solid fa-egg"
              style={{
                color: "#B0BEC5",
                fontSize: "10px",
                transform: "rotate(-15deg)",
              }}
            ></i>
          </div>
        );
      default:
        return null;
    }
  };

  return getIcon();
};

const VerticalMenuCard = ({
  image,
  title,
  currentPrice,
  reviewCount,
  isFavorite: initialIsFavorite = false,
  discount,
  menuItem = {},
  onFavoriteUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const { openModal } = useModal();
  const { cartItems, updateQuantity, removeFromCart, getCartItemComment } =
    useCart();
  const { user, setShowAuthOffcanvas } = useAuth();
  const { outletId } = useOutlet();
  const MAX_QUANTITY = 20;

  // Sync local isFavorite state with prop
  React.useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  // Generate the product URL from menuItem data with safety checks
  const detailPageUrl =
    menuItem?.menuId && menuItem?.menuCatId
      ? `/product-detail/${menuItem.menuId}/${menuItem.menuCatId}`
      : "#";

  // Check if any portion of this menu exists in cart with safety check
  const cartItemsForMenu = menuItem?.menuId
    ? cartItems.filter((item) => item.menuId === menuItem.menuId)
    : [];

  // Get the comment for this menu item with safety check
  const menuComment = menuItem?.menuId
    ? getCartItemComment(menuItem.menuId)
    : "";

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();

    // Check if user is authenticated
    if (!user) {
      setShowAuthOffcanvas(true);
      return;
    }

    if (isLoading || !menuItem?.menuId) return;

    try {
      setIsLoading(true);

      // Get auth data from localStorage
      const authData = localStorage.getItem("auth");
      const auth = authData ? JSON.parse(authData) : null;

      if (!auth || !auth.userId || !auth.accessToken) {
        openModal("LOGIN_REQUIRED");
        return;
      }

      // Choose API endpoint based on current favorite status
      const apiUrl = isFavorite
        ? "https://men4u.xyz/v2/user/remove_favourite_menu"
        : "https://men4u.xyz/v2/user/save_favourite_menu";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({
          outlet_id: outletId,
          menu_id: menuItem.menuId,
          user_id: auth.userId || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsFavorite(!isFavorite);
        onFavoriteUpdate(menuItem.menuId, !isFavorite);
      } else {
        console.error("Failed to update favorite status:", data.detail);
        if (data.detail === "Menu already in favorites") {
          setIsFavorite(true); // Force UI update to show as favorite
          onFavoriteUpdate(menuItem.menuId, true);
          window.alert("Menu is already in your favorites.");
        } else {
          openModal("ERROR", {
            message: data.detail || "Failed to update favorite status",
          });
        }
      }
    } catch (error) {
      console.error("Error updating favorite status:", error);
      openModal("ERROR", {
        message: "Failed to connect to the server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();

    if (!menuItem) return;

    // Check if user is authenticated
    if (!user) {
      setShowAuthOffcanvas(true);
      return;
    }

    openModal("addToCart", menuItem);
  };

  // Get total quantity across all portions
  const getTotalQuantity = () => {
    return cartItemsForMenu.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Handle quantity changes
  const handleQuantityChange = (increment) => {
    if (!menuItem) return;

    // Check if user is authenticated
    const authData = localStorage.getItem("auth");
    if (!authData || !user) {
      setShowAuthOffcanvas(true);
      return;
    }

    openModal("addToCart", menuItem);
  };

  return (
    <div className="card-item style-1">
      <div className="dz-media" style={{ position: "relative" }}>
        <Link to={detailPageUrl}>
          {typeof image === "string" ? (
            <LazyImage
              src={image}
              alt={title}
              blur={true}
              className="menu-image"
              style={{
                borderRadius: "12px",
                width: "100%",
              }}
            />
          ) : (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{
                borderRadius: "12px",
                width: "100%",
                aspectRatio: "4/3",
                backgroundColor: "#f8f9fa",
              }}
            >
              {image}
            </div>
          )}
        </Link>
        {discount && (
          <div
            className="rainbow-off-label"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              padding: "2px 14px 2px 10px",
              borderTopLeftRadius: "12px",
              borderBottomRightRadius: "16px",
              fontSize: "15px",
              fontWeight: 700,
              color: "#fff",
              background:
                "linear-gradient(90deg, #a8e063, #f8ff00, #f7971e, #f857a6, #a8e063)",
              backgroundSize: "400% 400%",
              animation: "rainbow 3s ease infinite",
              zIndex: 2,
              minWidth: "70px",
              textAlign: "center",
              letterSpacing: "0.5px",
            }}
          >
            {discount} Off
          </div>
        )}
      </div>
      <div className="dz-content">
        {/* Category name and food type icon */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <FoodTypeIcon foodType={menuItem?.menuFoodType} />
            <span className="text-muted small" style={{ fontSize: "12px" }}>
              {menuItem?.categoryName || "Category"}
            </span>
          </div>
          <a
            href="javascript:void(0);"
            className={`${isLoading ? "disabled" : ""}`}
            onClick={handleFavoriteToggle}
            style={{
              pointerEvents: isLoading ? "none" : "auto",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <div className={`like-button ${isFavorite ? "active" : ""}`}>
              <i
                className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}
                style={{
                  fontSize: "16px",
                  color: isFavorite ? "#dc3545" : "#6c757d",
                  lineHeight: 1,
                }}
              />
            </div>
          </a>
        </div>

        <h6 className="title mb-3" style={{ textAlign: "left" }}>
          <Link to={detailPageUrl}>{title}</Link>
        </h6>

        <div className="dz-meta mb-3">
          <ul
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {/* Spicy index with icon */}
            {menuItem?.spicyIndex && Number(menuItem.spicyIndex) > 0 && (
              <li
                className="spicy_index"
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {[...Array(3)].map((_, index) => {
                  const spicyIndex = Number(menuItem.spicyIndex);
                  let color = "#E0E0E0"; // default: white/grey
                  if (spicyIndex === 1) {
                    color = index === 0 ? "#22A45D" : "#E0E0E0"; // green, rest white
                  } else if (spicyIndex === 2) {
                    color = index < 2 ? "#FFA500" : "#E0E0E0"; // orange, last white
                  } else if (spicyIndex === 3) {
                    color = "#FF2D2D"; // all red
                  }
                  return (
                    <i
                      key={index}
                      className="fa-solid fa-pepper-hot"
                      style={{
                        color,
                        fontSize: "14px",
                        marginRight: index < 2 ? "2px" : "0",
                      }}
                    ></i>
                  );
                })}
              </li>
            )}
            <li
              className="price"
              style={{
                color: "#3AB4F2",
                // fontWeight: "bold",
                fontSize: "15px",
                marginLeft: "auto",
              }}
            >
              ₹{currentPrice}
            </li>
          </ul>
        </div>
        <div className="mt-2" style={{ minHeight: "38px" }}>
          {!cartItemsForMenu.length ? (
            <a
              className="btn btn-primary add-btn light w-100"
              href="javascript:void(0);"
              onClick={handleAddToCartClick}
            >
              <i class="fa-solid fa-cart-shopping me-2"></i>
              Add to cart
            </a>
          ) : null}
          <div
            className={`dz-stepper border-1 rounded-stepper stepper-fill ${
              cartItemsForMenu.length ? "active" : ""
            }`}
          >
            <div className="input-group bootstrap-touchspin bootstrap-touchspin-injected d-flex align-items-center">
              <button
                className="btn btn-primary rounded-circle p-2"
                type="button"
                onClick={() => handleQuantityChange(false)}
                style={{ width: "35px", height: "35px" }}
              >
                -
              </button>

              <div
                className="d-flex align-items-center justify-content-center mx-2"
                style={{ flex: 1 }}
              >
                {cartItemsForMenu.length > 0 && menuItem?.portions ? (
                  <div className="row g-0 w-100">
                    {menuItem.portions
                      .map((portion) => {
                        const cartItem = cartItemsForMenu.find(
                          (item) => item.portionId === portion.portion_id
                        );
                        return {
                          ...portion,
                          quantity: cartItem?.quantity || 0,
                          comment: cartItem?.comment || "",
                        };
                      })
                      .filter((portion) => portion.quantity > 0)
                      .map((portion, index, filteredArray) => (
                        <div
                          key={portion.portion_id}
                          className={`col text-center ${
                            index < filteredArray.length - 1 ? "border-end" : ""
                          }`}
                        >
                          <div className="fw-bold">{portion.quantity}</div>
                          {/* <div className="text-muted small">
                            {portion.portion_name.toLowerCase() === "full"
                              ? "F"
                              : portion.portion_name.toLowerCase() === "half"
                              ? "H"
                              : portion.portion_name.charAt(0).toUpperCase()}
                          </div> */}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center w-100">
                    <span className="fw-bold">0</span>
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary rounded-circle p-2"
                type="button"
                onClick={() => handleQuantityChange(true)}
                style={{ width: "35px", height: "35px" }}
              >
                +
              </button>
            </div>
          </div>
        </div>
        {menuComment && (
          <div className="text-muted small mt-1" style={{ fontSize: "12px" }}>
            <i className="fas fa-comment-alt me-1"></i>
            {menuComment}
          </div>
        )}
      </div>
    </div>
  );
};

VerticalMenuCard.propTypes = {
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  title: PropTypes.string.isRequired,
  currentPrice: PropTypes.number.isRequired,
  reviewCount: PropTypes.number,
  isFavorite: PropTypes.bool,
  discount: PropTypes.string,
  menuItem: PropTypes.object,
  onFavoriteUpdate: PropTypes.func.isRequired,
};

export default VerticalMenuCard;
