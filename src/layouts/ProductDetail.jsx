import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../contexts/CartContext";
import { useModal } from "../contexts/ModalContext";
import { useOutlet } from "../contexts/OutletContext";
import { useAuth } from "../contexts/AuthContext";
import LazyImage from "../components/Shared/LazyImage";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";

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

function ProductDetail() {
  const { menuId, menuCatId } = useParams();
  const [menuDetails, setMenuDetails] = useState(null);
  const { openModal } = useModal();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { outletId } = useOutlet();
  const { user, setShowAuthOffcanvas } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem("auth") || "{}");
        const user_id = auth.userId;

        const response = await axios.post(
          "https://men4u.xyz/v2/user/get_menu_details",
          {
            outlet_id: outletId,
            menu_id: Number(menuId),
            menu_cat_id: Number(menuCatId),
            user_id: Number(user_id) || null,
          }
        );

        setMenuDetails(response.data.details);
      } catch (error) {
        console.error("Error fetching menu details:", error);
      }
    };

    fetchMenuDetails();
  }, [menuId, menuCatId, outletId]);

  // Check if item exists in cart with proper menuId comparison
  const cartItem = cartItems.find(
    (item) =>
      item.menuId === Number(menuId) &&
      item.portionId === menuDetails?.portions?.[0]?.portion_id
  );

  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!user) {
      setShowAuthOffcanvas(true);
      return;
    }

    // Format menu details to include required fields for checkout
    const formattedMenuDetails = {
      ...menuDetails,
      menuId: Number(menuId),
      menuName: menuDetails.menu_name,
      image: menuDetails.images?.[0] || null,
      portions: menuDetails.portions.map((portion) => ({
        ...portion,
        portion_id: portion.portion_id,
        portion_name: portion.portion_name,
        price: portion.price,
        unit_value: portion.unit_value,
      })),
    };

    openModal("addToCart", formattedMenuDetails);
  };

  if (!menuDetails) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="content-body bottom-content">
          <div className="swiper-btn-center-lr my-0">
            <Swiper
              modules={[Pagination]}
              pagination={{
                el: ".swiper-pagination",
                clickable: true,
              }}
              className="demo-swiper swiper-initialized swiper-horizontal swiper-pointer-events swiper-watch-progress swiper-backface-hidden"
            >
              {(menuDetails.images?.length ? menuDetails.images : [null]).map(
                (image, index) => (
                  <SwiperSlide
                    key={index}
                    role="group"
                    aria-label={`${index + 1} / ${
                      menuDetails.images?.length || 1
                    }`}
                    className={
                      index === 0
                        ? "swiper-slide-visible swiper-slide-active"
                        : ""
                    }
                  >
                    <div className="dz-banner-heading">
                      <div className="overlay-black-light">
                        {image ? (
                          <LazyImage
                            src={image}
                            alt={`${menuDetails.menu_name} image ${index + 1}`}
                            className="bnr-img"
                            aspectRatio="16/9"
                            blur={true}
                          />
                        ) : (
                          <div
                            className="bnr-img d-flex justify-content-center align-items-center border border-2 border-light-subtle"
                            style={{ aspectRatio: "16/9" }}
                          >
                            <i className="fa-solid fa-utensils font-100 opacity-50 text-muted"></i>
                          </div>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                )
              )}
              <div className="swiper-btn">
                <div className="swiper-pagination style-2 flex-1"></div>
              </div>
              <span
                className="swiper-notification"
                aria-live="assertive"
                aria-atomic="true"
              ></span>
            </Swiper>
          </div>

          <div className="account-box style-1">
            <div className="container p-b60">
              <div className="company-detail">
                <div className="detail-content">
                  <div className="flex-1">
                    <h3 className="text-secondary sub-title small d-flex align-items-center">
                      <FoodTypeIcon foodType={menuDetails.menu_food_type} />
                      <span className="ms-2">
                        {menuDetails.category_name?.toUpperCase()}
                      </span>
                    </h3>
                    <h4 className="d-flex justify-content-between align-items-center">
                      {menuDetails.menu_name}
                    </h4>
                  </div>
                </div>
                {/* <ul className="item-inner">
                  <li>
                    <div className="reviews-info">
                      <h6 className="reviews">
                        {menuDetails.rating || "0"} (
                        {menuDetails.reviews_count || "0"} reviews)
                      </h6>
                    </div>
                  </li>
                </ul> */}
              </div>

              <div className="item-list-2">
                <div className="price">
                  <span className="text-style text-soft">Price</span>
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="sub-title mb-0">
                      ₹{menuDetails.portions[0]?.price}
                      {menuDetails.offer > 0 && (
                        <del className="ms-2 text-muted">
                          ₹
                          {Math.round(
                            menuDetails.portions[0]?.price /
                              (1 - menuDetails.offer / 100)
                          )}
                        </del>
                      )}
                    </h3>
                    {menuDetails.offer > 0 && (
                      <span className="text-success small fw-bold ms-3">
                        {menuDetails.offer}% Off
                      </span>
                    )}
                  </div>
                </div>
                {cartItem && (
                  <div className="dz-stepper border-1 rounded-stepper">
                    <div className="input-group bootstrap-touchspin bootstrap-touchspin-injected">
                      <span className="input-group-btn input-group-prepend">
                        <button
                          className="btn btn-primary bootstrap-touchspin-down"
                          type="button"
                          onClick={() => {
                            if (cartItem.quantity === 1) {
                              removeFromCart(
                                Number(menuId),
                                cartItem.portionId
                              );
                            } else {
                              updateQuantity(
                                Number(menuId),
                                cartItem.portionId,
                                cartItem.quantity - 1
                              );
                            }
                          }}
                        >
                          -
                        </button>
                      </span>
                      <input
                        readOnly
                        className="stepper form-control"
                        type="text"
                        value={cartItem.quantity}
                        name="demo3"
                      />
                      <span className="input-group-btn input-group-append">
                        <button
                          className="btn btn-primary bootstrap-touchspin-up"
                          type="button"
                          onClick={() => {
                            if (cartItem.quantity < 20) {
                              updateQuantity(
                                Number(menuId),
                                cartItem.portionId,
                                cartItem.quantity + 1
                              );
                            }
                          }}
                          disabled={cartItem.quantity >= 20}
                        >
                          +
                        </button>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {menuDetails.ingredients && (
                <div className="mb-3">
                  <h6 className="text-style text-soft mb-2">Ingredients</h6>
                  <p>{menuDetails.ingredients}</p>
                </div>
              )}

              {menuDetails.description && (
                <div className="mb-3">
                  <h6 className="text-style text-soft mb-2">Description</h6>
                  <p>{menuDetails.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer fixed p-b55">
          <div className="container">
            <button
              onClick={handleAddToCart}
              className="btn btn-primary text-start w-100"
              disabled={!menuDetails.portions?.length}
            >
              <i className="fa-solid fa-cart-shopping me-2"></i>
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetail;
