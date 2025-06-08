import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const categories = [/* ... same categories array ... */];

const DEFAULT_IMAGE = 'https://as2.ftcdn.net/jpg/02/79/12/03/1000_F_279120368_WzIoR2LV2Cgy33oxy6eEKQYSkaWr8AFU.jpg';

const CategorySwiper = ({ 
  onCategoryClick,
  containerClassName,
  containerStyle,
  categories: customCategories = categories,
  isLoading = false
}) => {
  const handleClick = (category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  if (isLoading) {
    return (
      <div className={`categories-box p-0 m-0 ${containerClassName || ''}`}>
        <div className="swiper-btn-center-lr">
          <Swiper
            spaceBetween={2}
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
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SwiperSlide 
                key={item}
                className="swiper-slide-auto"
              >
                <div 
                  className="category-pill cursor-pointer d-inline-flex align-items-center rounded-pill border"
                  style={{ 
                    backgroundColor: "#f8f9fa",
                    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)",
                    borderColor: "#dee2e6",
                    padding: "6px 16px",
                    height: "32px"
                  }}
                >
                  <Skeleton
                    width={60}
                    height={20}
                    baseColor="#E9ECEF"
                    highlightColor="#F8F9FA"
                    style={{
                      borderRadius: "12px"
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    );
  }

  return (
    <div className={`categories-box p-0 m-0 ${containerClassName || ''}`}>
      <div className="swiper-btn-center-lr">
        <Swiper
          spaceBetween={2}
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
                  rounded-pill 
                  border 
                  ${category.menuCatId === 'all' ? 'active' : ''}
                `}
              >
                <span className="category-text">
                  {category.categoryName}
                  <span className="count">
                    {category.menuCount || 0}
                  </span>
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

// Update the styles to match Google Images search suggestions
const styles = `
  .swiper-slide-auto {
    width: auto !important;
  }

  .category-pill {
    height: 32px;
    padding: 6px 12px;
    background-color: #f8f9fa;
    border-color: #dee2e6 !important;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    font-size: 14px;
  }

  .category-pill:hover {
    background-color: #e9ecef;
    border-color: #ced4da !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .category-pill.active {
    background-color: #e9ecef;
    border-color: #ced4da !important;
    font-weight: 500;
  }

  .category-text {
    color: #212529;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .count {
    color: #6c757d;
    font-size: 13px;
  }

  .swiper-wrapper {
    transform: translate3d(0, 0, 0) !important;
    will-change: transform;
    padding: 4px 0;
    gap: 0;
  }

  /* Skeleton specific styles */
  .category-pill .react-loading-skeleton {
    line-height: 1;
    display: inline-block;
  }

  .categorie-swiper {
    padding: 0 8px !important;
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
  categories: PropTypes.array,
  isLoading: PropTypes.bool
};

export default CategorySwiper;