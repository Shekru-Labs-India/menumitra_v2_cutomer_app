import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { useOutlet } from "../contexts/OutletContext";
import apiService from "../api/apiService";
import "./HorizontalMenuCard.css"; // We'll create this CSS file next

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
                // transform: "rotate(-15deg)",
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
  title = "",
  currentPrice = 0,
  discount = "",
  menuItem = {},
  isFavorite = false,
  onFavoriteUpdate,
  image,
  // Add new props for customization
  imageSize = {
    width: "100px",
    height: "100px"
  },
  colors = {
    primary: "#2d9cdb",
    success: "#27ae60",
    danger: "#dc3545",
    secondary: "#6c757d",
    discountGradient: ["#ffe066", "#ffd700"],
    discountText: "#5a5a00"
  },
  fontSizes = {
    title: "15px",
    category: "11px",
    price: "14px",
    discount: "10px"
  },
  icons = {
    category: "fa fa-cutlery",
    placeholder: "fa-solid fa-utensils"
  }
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useModal();
  const { user, setShowAuthOffcanvas, getUserId } = useAuth();
  const { outletId } = useOutlet();
  const userId = getUserId();

  // Convert isFavorite to boolean if it's a number
  const isFavoriteBoolean = typeof isFavorite === 'number' ? isFavorite === 1 : Boolean(isFavorite);

  // Check if this menu item belongs to the current outlet
  const isCurrentOutlet = true;

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowAuthOffcanvas(true);
      return;
    }

    if (isLoading || !menuItem?.menuId) return;

    try {
      setIsLoading(true);
      
      if (isFavoriteBoolean) {
        await apiService.favorites.remove({
          outletId,
          userId,
          menuId: menuItem.menuId
        });
      } else {
        await apiService.favorites.add({
          outletId,
          userId,
          menuId: menuItem.menuId
        });
      }
      
      onFavoriteUpdate(menuItem.menuId, !isFavoriteBoolean);
    } catch (error) {
      console.error("Error updating favorite status:", error);
      openModal("ERROR", {
        message: error.message || "Failed to update favorite status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate the product URL from menuItem data with safety checks
  const detailPageUrl =
    menuItem?.menuId && menuItem?.menuCatId
      ? `/product-detail/${menuItem.menuId}/${menuItem.menuCatId}`
      : "#";

  return (
    <div 
      className="horizontal-menu-card card product-card position-relative shadow border border-1 border-light"
      style={{ 
        minHeight: 50, 
        padding: "8px 0",
        width: "100%",
        overflowX: "auto",
        whiteSpace: "nowrap",
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "-ms-autohiding-scrollbar",
      }}>
      <div 
        className="d-flex align-items-center p-1" 
        style={{ 
          minHeight: 70,
          minWidth: "100%",
        }}>
        {/* Left side - Image and Icons */}
        <div 
          className="position-relative d-flex align-items-center justify-content-center"
          style={{
            width: imageSize.width,
            height: imageSize.height,
            background: "#f5f5f5",
            borderRadius: 0,
            flexShrink: 0,
            overflow: "hidden",
          }}>
          {/* Background icon */}
          <i
            className={icons.placeholder}
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
          
          {/* Menu Image */}
          {typeof image === 'string' && (
            <img
              src={image}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                position: "absolute",
                left: 0,
                top: 0,
                zIndex: 2,
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          
          {/* Veg/Nonveg/Vegan/Egg icon */}
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
          
          {/* Favorite icon */}
          {isCurrentOutlet && (
            <button
              className={`favorite-btn ${isLoading ? "disabled" : ""}`}
              onClick={handleFavoriteToggle}
              style={{
                position: "absolute",
                right: 2,
                bottom: 2,
                pointerEvents: isLoading ? "none" : "auto",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                zIndex: 3,
              }}
            >
              <div className={`like-button ${isFavoriteBoolean ? "active" : ""}`}>
                <i
                  className={`fa-${isFavoriteBoolean ? "solid" : "regular"} fa-heart`}
                  style={{
                    fontSize: "16px",
                    color: isFavoriteBoolean ? colors.danger : colors.secondary,
                    lineHeight: 1,
                    background: "#fff",
                    padding: "4px",
                    borderRadius: "50%",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                    border: "1.5px solid #fff",
                  }}
                />
              </div>
            </button>
          )}
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
                background: `linear-gradient(90deg, ${colors.discountGradient[0]}, ${colors.discountGradient[1]})`,
                color: colors.discountText,
                fontSize: fontSizes.discount,
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
            style={{ 
              fontSize: fontSizes.title, 
              fontWeight: 700, 
              marginBottom: 2 
            }}
          >
            <Link to={detailPageUrl} className="text-dark text-decoration-none">
              {title}
            </Link>
          </h5>
          {/* Category name */}
          {menuItem.categoryName && (
            <div
              style={{
                color: colors.success,
                fontSize: fontSizes.category,
                fontWeight: 500,
                marginBottom: 1,
              }}
            >
              <i className={`${icons.category} me-1`}></i>
              {menuItem.categoryName}
            </div>
          )}
          {/* Price Section */}
          <div className="d-flex align-items-center mb-1">
            <h6
              className="mb-0 me-1"
              style={{ 
                color: colors.primary, 
                fontSize: fontSizes.price, 
                fontWeight: 600 
              }}
            >
              <span className="fw-bold">₹{currentPrice}</span>
            </h6>
          </div>
        </div>
      </div>
    </div>
  );
};

HorizontalMenuCard.propTypes = {
  title: PropTypes.string,
  currentPrice: PropTypes.number,
  discount: PropTypes.string,
  menuItem: PropTypes.object,
  isFavorite: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  onFavoriteUpdate: PropTypes.func.isRequired,
  image: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  // Add new prop types
  imageSize: PropTypes.shape({
    width: PropTypes.string,
    height: PropTypes.string
  }),
  colors: PropTypes.shape({
    primary: PropTypes.string,
    success: PropTypes.string,
    danger: PropTypes.string,
    secondary: PropTypes.string,
    discountGradient: PropTypes.arrayOf(PropTypes.string),
    discountText: PropTypes.string
  }),
  fontSizes: PropTypes.shape({
    title: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.string,
    discount: PropTypes.string
  }),
  icons: PropTypes.shape({
    category: PropTypes.string,
    placeholder: PropTypes.string
  })
};

export default HorizontalMenuCard;
