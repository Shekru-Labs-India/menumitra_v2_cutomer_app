import React, { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import fallbackImage from '../assets/images/food/food8.png';
import { useCart } from '../contexts/CartContext';
import { useModal } from '../contexts/ModalContext';
import { useOutlet } from '../contexts/OutletContext';
import { useAuth } from '../contexts/AuthContext';
import LazyImage from '../components/Shared/LazyImage';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

function ProductDetail() {
  const { menuId, menuCatId } = useParams();
  const [menuDetails, setMenuDetails] = useState(null);
  const { openModal } = useModal();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { outletId } = useOutlet();
  const { user, setShowAuthOffcanvas } = useAuth();

  useEffect(() => {
    const fetchMenuDetails = async () => {
      try {
        const auth = JSON.parse(localStorage.getItem('auth') || '{}');
        const user_id = auth.userId;

        const response = await axios.post('https://men4u.xyz/v2/user/get_menu_details', {
          outlet_id: outletId,
          menu_id: Number(menuId),
          menu_cat_id: Number(menuCatId),
          user_id: Number(user_id) || null
        });

        setMenuDetails(response.data.details);
      } catch (error) {
        console.error('Error fetching menu details:', error);
      }
    };

    fetchMenuDetails();
  }, [menuId, menuCatId, outletId]);

  // Check if item exists in cart with proper menuId comparison
  const cartItem = cartItems.find(item => 
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
      menuId: Number(menuId), // Add menuId explicitly
      menuName: menuDetails.menu_name,
      image: menuDetails.images?.[0] || fallbackImage,
      portions: menuDetails.portions.map(portion => ({
        ...portion,
        portion_id: portion.portion_id,
        portion_name: portion.portion_name,
        price: portion.price,
        unit_value: portion.unit_value
      }))
    };
    
    openModal('ADD_TO_CART', formattedMenuDetails);
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
              el: '.swiper-pagination',
              clickable: true,
            }}
            className="demo-swiper swiper-initialized swiper-horizontal swiper-pointer-events swiper-watch-progress swiper-backface-hidden"
          >
            {(menuDetails.images?.length ? menuDetails.images : [fallbackImage]).map((image, index) => (
              <SwiperSlide 
                key={index} 
                role="group" 
                aria-label={`${index + 1} / ${menuDetails.images?.length || 1}`}
                className={index === 0 ? "swiper-slide-visible swiper-slide-active" : ""}
              >
                <div className="dz-banner-heading">
                  <div className="overlay-black-light">
                    <LazyImage
                      src={image}
                      alt={`${menuDetails.menu_name} image ${index + 1}`}
                      fallbackSrc={fallbackImage}
                      className="bnr-img"
                      aspectRatio="16/9"
                      blur={true}
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
            <div className="swiper-btn">
              <div className="swiper-pagination style-2 flex-1"></div>
            </div>
            <span className="swiper-notification" aria-live="assertive" aria-atomic="true"></span>
          </Swiper>
        </div>

        <div className="account-box style-1">
          <div className="container">
            <div className="company-detail">
              <div className="detail-content">
                <div className="flex-1">
                  <h6 className="text-secondary sub-title">{menuDetails.category_name?.toUpperCase()}</h6>
                  <h4>{menuDetails.menu_name}</h4>
                  <p>{menuDetails.description || 'No description available'}</p>
                </div>
              </div>
              <ul className="item-inner">
                <li>
                  <div className="reviews-info">
                   
                    <h6 className="reviews">{menuDetails.rating || '0'} ({menuDetails.reviews_count || '0'} reviews)</h6>
                  </div>
                </li>
               
              </ul>
            </div>
            <div className="item-list-2">
              <div className="price">
                <span className="text-style text-soft">Price</span>
                <h3 className="sub-title">
                  ₹{menuDetails.portions[0]?.price} 
                  {menuDetails.portions[1] && <del>₹{menuDetails.portions[1].price}</del>}
                </h3>
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
                            removeFromCart(Number(menuId), cartItem.portionId);
                          } else {
                            updateQuantity(Number(menuId), cartItem.portionId, cartItem.quantity - 1);
                          }
                        }}
                      >-</button>
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
                            updateQuantity(Number(menuId), cartItem.portionId, cartItem.quantity + 1);
                          }
                        }}
                        disabled={cartItem.quantity >= 20}
                      >+</button>
                    </span>
                  </div>
                </div>
              )}
            </div>
            {menuDetails.offer > 0 && (
              <div className="d-flex align-items-center justify-content-between">
                <div className="badge bg-accent badge-lg badge-warning font-w400 px-3">
                  {menuDetails.offer}% OFF DISCOUNT
                </div>     
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="footer fixed p-b55">
        <div className="container">
          {!cartItem ? (
            <button 
              onClick={handleAddToCart} 
              className="btn btn-primary text-start w-100"
              disabled={!menuDetails.portions?.length}
            >
              <i class="fa-solid fa-cart-shopping me-2"></i>
              ADD TO CART
            </button>
          ) : (
            <div className="d-flex gap-3">
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-outline-primary flex-1"
              >
                ADD MORE MENUS
              </button>
              <button 
                onClick={() => window.location.href = '/checkout'} 
                className="btn btn-primary flex-1"
              >
                CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
}

export default ProductDetail;