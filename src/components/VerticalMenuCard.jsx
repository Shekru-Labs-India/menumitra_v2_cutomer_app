import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import LazyImage from "./Shared/LazyImage";
import fallbackImage from "../assets/images/food/food8.png";
import { useModal } from "../contexts/ModalContext";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useOutlet } from "../contexts/OutletContext";

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
  const { openModal } = useModal();
  const { cartItems, updateQuantity, removeFromCart, getCartItemComment } =
    useCart();
  const { user, setShowAuthOffcanvas } = useAuth();
  const { outletId } = useOutlet();
  const MAX_QUANTITY = 20;

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
      const apiUrl = initialIsFavorite
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
        // Update parent component's state immediately
        onFavoriteUpdate(menuItem.menuId, !initialIsFavorite);
      } else {
        console.error("Failed to update favorite status:", data.detail);
        openModal("ERROR", {
          message: data.detail || "Failed to update favorite status",
        });
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
      <div className="dz-media">
        <Link to={detailPageUrl}>
          <LazyImage
            src={image}
            alt={title}
            fallbackSrc={fallbackImage}
            // aspectRatio="4/3"
            blur={true}
            className="menu-image"
            style={{
              borderRadius: "12px",
              width: "100%",
            }}
          />
        </Link>
        <a
          href="javascript:void(0);"
          className={`r-btn ${isLoading ? "disabled" : ""}`}
          onClick={handleFavoriteToggle}
          style={{
            pointerEvents: isLoading ? "none" : "auto",
            cursor: "pointer",
          }}
        >
          <div
            className="d-flex justify-content-center align-items-center"
            style={{
              width: "25px",
              height: "25px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.75)",
            }}
          >
            <div className={`like-button ${initialIsFavorite ? "active" : ""}`}>
              <i
                className={`fa-${
                  initialIsFavorite ? "solid" : "regular"
                } fa-heart`}
                style={{
                  fontSize: "16px",
                  color: initialIsFavorite ? "#dc3545" : "inherit",
                  lineHeight: 1,
                }}
              />
            </div>
          </div>
        </a>
        {discount && <div className="label">{discount} OFF</div>}
      </div>
      <div className="dz-content">
        <h6 className="title mb-3">
          <Link to={detailPageUrl}>{title}</Link>
        </h6>
        <div className="dz-meta mb-3">
          <ul>
            <li className="price text-accent">₹{currentPrice}</li>
            {reviewCount && (
              <li className="review">
                <span className="text-accent">{reviewCount}</span>
                {/* <i className="fa fa-star"></i> */}
              </li>
            )}
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
                          <div className="text-muted small">
                            {portion.portion_name.toLowerCase() === "full"
                              ? "F"
                              : portion.portion_name.toLowerCase() === "half"
                              ? "H"
                              : portion.portion_name.charAt(0).toUpperCase()}
                          </div>
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
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  currentPrice: PropTypes.number.isRequired,
  reviewCount: PropTypes.number,
  isFavorite: PropTypes.bool,
  discount: PropTypes.string,
  menuItem: PropTypes.object,
  onFavoriteUpdate: PropTypes.func.isRequired,
};

export default VerticalMenuCard;
