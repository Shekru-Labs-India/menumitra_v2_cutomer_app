import React from "react";
import PropTypes from "prop-types";
import fallbackImage from "../assets/images/food/small/6.png";
import { useModal } from "../contexts/ModalContext";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import "./HorizontalMenuCard.css"; // We'll create this CSS file next
import { Link } from "react-router-dom";

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
      console.log('swiped', isLeftSwipe ? 'left' : 'right');
    }
  };

  // Generate the product URL from menuItem data with safety checks
  const detailPageUrl = menuItem?.menuId && menuItem?.menuCatId
    ? `/product-detail/${menuItem.menuId}/${menuItem.menuCatId}`
    : "#";

  return (
    <div 
      className="horizontal-menu-card card product-card position-relative shadow border border-1 border-light"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="d-flex align-items-center p-3">
        {/* Left side - Image and Favorite Button */}
        <div
          className="position-relative"
          style={{ width: "95px", height: "95px" }}
        >
          <Link to={detailPageUrl}>
            {image ? (
              <img
                src={image}
                alt={title}
                className="rounded-3 w-100 h-100"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div 
                className="rounded-3 w-100 h-100 d-flex justify-content-center align-items-center border border-2 border-light-subtle"
                style={{ objectFit: "cover" }}
              >
                <i className="fa-solid fa-utensils font-55 opacity-50 text-muted"></i>
              </div>
            )}
          </Link>
          {/* <button
            className={`position-absolute top-0 end-0 btn btn-link p-0 m-2 ${
              isFavorite ? "text-danger" : "text-white"
            }`}
            onClick={onFavoriteClick}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke={isFavorite ? "none" : "currentColor"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16.785 2.04751C15.9489 2.04694 15.1209 2.21163 14.3486 2.53212C13.5764 2.85261 12.8751 3.32258 12.285 3.91501L12 4.18501L11.73 3.91501C11.1492 3.2681 10.4424 2.74652 9.65306 2.3822C8.86367 2.01787 8.00824 1.81847 7.13912 1.79618C6.27 1.7739 5.40547 1.9292 4.59845 2.25259C3.79143 2.57599 3.05889 3.06066 2.44566 3.67695C1.83243 4.29325 1.35142 5.02819 1.03206 5.83682C0.712696 6.64544 0.561704 7.51073 0.588323 8.37973C0.614942 9.24873 0.818613 10.1032 1.18687 10.8907C1.55513 11.6783 2.08022 12.3824 2.73002 12.96L12 22.2675L21.3075 12.96C22.2015 12.0677 22.8109 10.9304 23.0589 9.6919C23.3068 8.45338 23.1822 7.16915 22.7006 6.00144C22.2191 4.83373 21.4023 3.83492 20.3534 3.13118C19.3045 2.42744 18.0706 2.05034 16.8075 2.04751H16.785Z" />
            </svg>
          </button> */}
        </div>

        {/* Right side - Content */}
        <div className="ms-3 flex-grow-1 pe-5">
          <h5 className="mb-2">
            <Link to={detailPageUrl} className="text-dark text-decoration-none">
              {title}
            </Link>
          </h5>

          {/* Price Section */}
          <div className="d-flex align-items-center mb-2">
            <h6 className="mb-0 me-2">₹{currentPrice}</h6>
            {originalPrice && (
              <del className="text-muted">
                <h6 className="mb-0">₹{originalPrice}</h6>
              </del>
            )}
          </div>

          {/* Discount */}
          {discount && (
            <div className="d-flex align-items-center">
              <svg
                className="me-2"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6666 0.000106812H9.12485C8.75825 0.000106812 8.24587 0.212488 7.98685 0.471314L0.389089 8.06903C-0.129696 8.58723 -0.129696 9.43684 0.389089 9.95441L6.04624 15.6114C6.56385 16.1296 7.41263 16.1296 7.93103 15.6108L15.5288 8.01423C15.7876 7.75544 16 7.24224 16 6.87642V1.3335C16 0.600298 15.3998 0.000106812 14.6666 0.000106812ZM11.9998 5.33347C11.2634 5.33347 10.6664 4.73585 10.6664 4.00008C10.6664 3.26309 11.2634 2.66669 11.9998 2.66669C12.7362 2.66669 13.3334 3.26309 13.3334 4.00008C13.3334 4.73585 12.7362 5.33347 11.9998 5.33347Z"
                  fill="#C29C1D"
                />
              </svg>
              <span className="text-warning small">Disc. {discount}</span>
            </div>
          )}
        </div>

        {/* Cart Button - Show different states based on cart */}
        <Link
          to={detailPageUrl}
          className="position-absolute end-0 top-50 translate-middle-y me-3 btn btn-success rounded-3 p-2"
          onClick={handleAddToCart}
        >
          <i className="fa fa-shopping-cart text-white"></i>
        </Link>
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
