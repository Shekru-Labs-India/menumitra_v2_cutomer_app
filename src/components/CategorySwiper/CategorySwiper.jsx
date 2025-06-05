import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import PropTypes from 'prop-types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const categories = [/* ... same categories array ... */];

const DEFAULT_IMAGE = 'https://as2.ftcdn.net/jpg/02/79/12/03/1000_F_279120368_WzIoR2LV2Cgy33oxy6eEKQYSkaWr8AFU.jpg';

const CategorySwiper = ({ 
  onCategoryClick,
  containerClassName,
  containerStyle,
  categories: customCategories = categories
}) => {
  const handleClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  return (
    <div className={`categories-box p-0 m-0 ${containerClassName || ''}`}>
      <div className="swiper-btn-center-lr">
        <Swiper
          spaceBetween={8}
          slidesPerView="auto"
          className="categorie-swiper px-2"
          loop={false}
          grabCursor={true}
          cssMode={true}
          touchEventsTarget="container"
          touchRatio={1}
          touchAngle={45}
          resistance={true}
          resistanceRatio={0.85}
        >
          {customCategories.map((category) => (
            <SwiperSlide 
              key={category.menuCatId} 
              className="swiper-slide-auto"
            >
              <div 
                onClick={() => handleClick(category)}
                className={`
                  category-pill 
                  cursor-pointer 
                  d-inline-flex 
                  align-items-center 
                  px-4 
                  py-2 
                  rounded-pill 
                  border 
                  ${category.menuCatId === 'all' ? 'bg-success text-white' : 'bg-white text-dark'}
                `}
              >
                <span className="fw-medium">
                  {category.categoryName}
                </span>
                <span className="ms-1 opacity-75">
                  ({category.menuCount || 0})
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

// Add the styles using CSS-in-JS
const styles = `
  .swiper-slide-auto {
    width: auto !important;
  }

  .category-pill {
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border-color: #E0E0E0 !important;
  }

  .category-pill:hover {
    transform: translateY(-1px);
  }

  .category-pill.bg-success {
    border-color: transparent !important;
  }

  .category-pill.bg-success:hover {
    background-color: #005432 !important;
  }

  .category-pill.bg-white:hover {
    background-color: #F5F5F5 !important;
  }

  .swiper-wrapper {
    transform: translate3d(0, 0, 0) !important;
    will-change: transform;
  }
`;

// Add the styles to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

CategorySwiper.propTypes = {
  onCategoryClick: PropTypes.func,
  containerClassName: PropTypes.string,
  containerStyle: PropTypes.object,
  categories: PropTypes.array
};

export default CategorySwiper;