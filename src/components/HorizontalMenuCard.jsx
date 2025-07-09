import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { useOutlet } from "../contexts/OutletContext";
import { useCacheData } from "../contexts/CacheDataContext";
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
  title = "Fresh Tomatoes",
  currentPrice = 5.0,
  discount = "10%Off",
  menuItem = {},
  isFavorite = false,
  onFavoriteUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { openModal } = useModal();
  const { user, setShowAuthOffcanvas } = useAuth();
  const { outletId } = useOutlet();
  const { clearCacheItem, generateCacheKey } = useCacheData();

  // Check if this menu item belongs to the current outlet
  const isCurrentOutlet = menuItem?.outletId === outletId;

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

      const authData = localStorage.getItem("auth");
      const auth = authData ? JSON.parse(authData) : null;

      if (!auth || !auth.userId || !auth.accessToken) {
        openModal("LOGIN_REQUIRED");
        return;
      }

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
          app_source: "user_app",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const menuListCacheKey = generateCacheKey("get_all_menu_list_by_category", {
          outlet_id: outletId,
          user_id: auth.userId,
        });
        const specialMenuCacheKey = generateCacheKey("get_special_menu_list", {
          outlet_id: outletId,
          user_id: auth.userId,
        });
        
        clearCacheItem(menuListCacheKey);
        clearCacheItem(specialMenuCacheKey);
        
        onFavoriteUpdate(menuItem.menuId, !isFavorite);
      } else {
        console.error("Failed to update favorite status:", data.detail);
        if (data.detail === "Menu already in favorites") {
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

  // Generate the product URL from menuItem data with safety checks
  const detailPageUrl =
    menuItem?.menuId && menuItem?.menuCatId
      ? `/product-detail/${menuItem.menuId}/${menuItem.menuCatId}`
      : "#";

  return (
    <div className="horizontal-menu-card card product-card position-relative shadow border border-1 border-light"
      style={{ minHeight: 50, padding: "8px 0" }}>
      <div className="d-flex align-items-center p-1" style={{ minHeight: 70 }}>
        {/* Left side - Image and Icons */}
        <div className="position-relative d-flex align-items-center justify-content-center"
          style={{
            width: "100px",
            height: "100px",
            background: "#f5f5f5",
            borderRadius: 0,
            flexShrink: 0,
            overflow: "hidden",
          }}>
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
          
          {/* Updated favorite icon - only show for current outlet */}
          {isCurrentOutlet && (
            <span
              className={`favorite-icon ${isFavorite ? "active" : ""} ${isLoading ? "disabled" : ""}`}
              onClick={handleFavoriteToggle}
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
                cursor: isLoading ? "not-allowed" : "pointer",
                zIndex: 3,
                pointerEvents: isLoading ? "none" : "auto",
              }}
            >
              <i
                className={`fa-${isFavorite ? "solid" : "regular"} fa-heart`}
                style={{ color: isFavorite ? "#e74c3c" : "#ccc", fontSize: 12 }}
              ></i>
            </span>
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
          {/* Price Section */}
          <div className="d-flex align-items-center mb-1">
            <h6
              className="mb-0 me-1"
              style={{ color: "#2d9cdb", fontSize: 14, fontWeight: 600 }}
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
  isFavorite: PropTypes.bool,
  onFavoriteUpdate: PropTypes.func.isRequired,
};

export default HorizontalMenuCard;
