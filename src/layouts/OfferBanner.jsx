import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
// Import all necessary Swiper styles
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/pagination";
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import { useMenuItems } from "../hooks/useMenuItems";

const OfferBanner = () => {
  const { menuItems, isLoading } = useMenuItems();
  const offerMenus = menuItems.filter((item) => item.offer > 0);

  if (isLoading) return <div>Loading...</div>;
  if (offerMenus.length === 0) return <div>No offers available.</div>;

  return (
    <div className="offer-banner-container" style={{ position: 'relative' }}>
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        centeredSlides={true}
        spaceBetween={20}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 1.2,
          },
          768: {
            slidesPerView: 1.5,
          }
        }}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {offerMenus.map((menu) => (
          <SwiperSlide key={menu.menuId}>
            <div style={{ padding: '10px' }}>
              <HorizontalMenuCard
                image={menu.image}
                title={menu.menuName}
                currentPrice={menu.portions?.[0]?.price || 0}
                originalPrice={menu.portions?.[0]?.original_price || 0}
                discount={menu.offer + "% Off"}
                menuItem={menu}
                productUrl={`/product-detail/${menu.menuId}/${menu.menuCatId}`}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default OfferBanner;
