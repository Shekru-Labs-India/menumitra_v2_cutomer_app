// src/components/TripleSlider/TripleSlider.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';
// Change the imports to use simpler effects
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import LazyImage from '../Shared/LazyImage';

// Import required Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './TripleSlider.css';

const TripleSlider = ({
  slides,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = false,
  speed = 800,
  className = '',
}) => {
  const limitedSlides = slides.slice(0, 5);

  return (
    <div className={`triple-slider ${className}`}>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        spaceBetween={0}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: pauseOnHover,
        }}
        loop={false}
        speed={speed}
        className="triple-swiper"
      >
        {limitedSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="slide-content">
              <LazyImage
                src={slide.backgroundImage}
                alt={slide.title || `Slide ${index + 1}`}
                className="bg-image"
                blur={true}
                aspectRatio="16/9"
              />
              {slide.overlayImage && (
                <div className="overlay-image-wrapper">
                  <LazyImage
                    src={slide.overlayImage}
                    alt={`${slide.title || `Slide ${index + 1}`} overlay`}
                    className="overlay-image"
                    blur={true}
                  />
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

// PropTypes remain the same
TripleSlider.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      backgroundImage: PropTypes.string.isRequired,
      overlayImage: PropTypes.string,
      title: PropTypes.string,
    })
  ).isRequired,
  autoplayDelay: PropTypes.number,
  pauseOnHover: PropTypes.bool,
  loop: PropTypes.bool,
  speed: PropTypes.number,
  className: PropTypes.string,
};

export default TripleSlider;
