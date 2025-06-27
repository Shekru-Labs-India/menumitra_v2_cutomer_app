import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import { useMenuItems } from "../hooks/useMenuItems";

const OfferBanner = () => {
  const { menuItems, isLoading } = useMenuItems();
  const offerMenus = menuItems.filter((item) => item.offer > 0);

  if (isLoading) return <div>Loading...</div>;
  if (offerMenus.length === 0) return <div>No offers available.</div>;

  return (
    <div>
      {/* <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Offers</h3> */}
      <Swiper
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={1.1}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        speed={1000}
        loop={true}
        grabCursor={true}
        style={{ paddingBottom: 0 }}
      >
        {offerMenus.map((menu) => (
          <SwiperSlide key={menu.menuId}>
            <HorizontalMenuCard
              image={menu.image}
              title={menu.menuName}
              currentPrice={menu.portions?.[0]?.price || 0}
              originalPrice={menu.portions?.[0]?.original_price || 0}
              discount={menu.offer + "% Off"}
              menuItem={menu}
              productUrl={`/product-detail/${menu.menuId}/${menu.menuCatId}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default OfferBanner;
