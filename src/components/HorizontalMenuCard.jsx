import React from "react";
import PropTypes from "prop-types";
import fallbackImage from "../assets/images/food/small/6.png";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import "./HorizontalMenuCard.css"; // We'll create this CSS file next
import { Link } from "react-router-dom";

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

const HorizontalMenuCard = ({
  image,
  title = "Fresh Tomatoes",
  currentPrice = 5.0,
  originalPrice = 8.9,
  discount = "10%Off",
  menuItem = {},
  onFavoriteClick = () => {},
  isFavorite = false,
  productUrl = "#",
}) => {
  const { openModal } = useModal();
  const { user, setShowAuthOffcanvas } = useAuth();
  const { cartItems } = useCart();

  // Check if any portion of this menu exists in cart
  const cartItemsForMenu = menuItem?.menuId
    ? cartItems.filter((item) => item.menuId === menuItem.menuId)
    : [];

  const handleAddToCart = (e) => {
    e.preventDefault();

    if (!menuItem) return;

    if (!user) {
      setShowAuthOffcanvas(true);
      return;
    }

    openModal("addToCart", menuItem);
  };

  // Add touch handling for swipe gestures
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // You can add swipe actions here if needed
      console.log("swiped", isLeftSwipe ? "left" : "right");
    }
  };

  // Generate the product URL from menuItem data with safety checks
  const detailPageUrl =
    menuItem?.menuId && menuItem?.menuCatId
      ? `/product-detail/${menuItem.menuId}/${menuItem.menuCatId}`
      : "#";

  // Assume you have variables: price (current price), offer_percent (discount percent)
  const offer_percent = discount
    ? parseFloat(discount.replace("%Off", ""))
    : null;
  const price = currentPrice;
  const originalPriceCalculated = offer_percent
    ? (price / (1 - offer_percent / 100)).toFixed(0)
    : null;

  return (
    <div
      className="horizontal-menu-card card product-card position-relative shadow border border-1 border-light"
      style={{ minHeight: 50, padding: "8px 0" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="d-flex align-items-center p-1" style={{ minHeight: 70 }}>
        {/* Left side - Image and Icons */}
        <div
          className="position-relative d-flex align-items-center justify-content-center"
          style={{
            width: "80px",
            height: "100px",
            background: "#f5f5f5",
            borderRadius: 0,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Fork & Knife icon as background */}
          <i
            className="fa-solid fa-utensils"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 70,
              opacity: 0.13,
              color: "#888",
              zIndex: 1,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          ></i>
          {/* Image on top if present */}
          {/* {image && (
            <img
              src={image}
              alt={title}
              className="rounded-3 w-100 h-100"
              style={{ objectFit: "cover", position: "relative", zIndex: 2 }}
            />
          )} */}
          {/* Veg/Nonveg/Vegan/Egg icon in bottom-left */}
          {menuItem.menuFoodType && (
            <span
              style={{
                position: "absolute",
                left: 2,
                bottom: 2,
                zIndex: 3,
              }}
            >
              <FoodTypeIcon foodType={menuItem.menuFoodType} />
            </span>
          )}
          {/* Heart icon in bottom-right */}
          <span
            className={`favorite-icon ${isFavorite ? "active" : ""}`}
            onClick={onFavoriteClick}
            style={{
              position: "absolute",
              right: 2,
              bottom: 2,
              background: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              border: "1.5px solid #fff",
              cursor: "pointer",
              zIndex: 3,
            }}
          >
            <i
              className="fa fa-heart"
              style={{ color: isFavorite ? "#e74c3c" : "#ccc", fontSize: 12 }}
            ></i>
          </span>
        </div>
        {/* Right side - Content */}
        <div className="ms-2 flex-grow-1 pe-1">
          {/* Discount badge */}
          {discount && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                background: "linear-gradient(90deg, #ffe066, #ffd700)",
                color: "#5a5a00",
                fontSize: 10,
                fontWeight: 600,
                borderRadius: "6px 0 8px 0",
                padding: "1px 7px",
                zIndex: 4,
              }}
            >
              {discount} Off
            </div>
          )}
          <h5
            className="mb-1"
            style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}
          >
            <Link to={detailPageUrl} className="text-dark text-decoration-none">
              {title}
            </Link>
          </h5>
          {/* Category name */}
          {menuItem.categoryName && (
            <div
              style={{
                color: "#27ae60",
                fontSize: 11,
                fontWeight: 500,
                marginBottom: 1,
              }}
            >
              <i className="fa fa-cutlery me-1"></i>
              {menuItem.categoryName}
            </div>
          )}
          {/* Spicy index with icon */}
          {typeof menuItem.spicyIndex !== "undefined" && (
            <span className="me-1">
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
                      fontSize: 12,
                      marginRight: 0,
                    }}
                  ></i>
                );
              })}
            </span>
          )}
          {/* Price Section */}
          <div className="d-flex align-items-center mb-1">
            <h6
              className="mb-0 me-1"
              style={{ color: "#2d9cdb", fontSize: 14, fontWeight: 600 }}
            >
              <span className="fw-bold">₹{price}</span>
            </h6>
            {originalPriceCalculated && (
              <del
                className="text-muted"
                style={{ fontSize: 12, marginLeft: 2 }}
              >
                ₹{originalPriceCalculated}
              </del>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

HorizontalMenuCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  currentPrice: PropTypes.number,
  originalPrice: PropTypes.number,
  discount: PropTypes.string,
  menuItem: PropTypes.object,
  onFavoriteClick: PropTypes.func,
  isFavorite: PropTypes.bool,
  productUrl: PropTypes.string,
};

export default HorizontalMenuCard;
