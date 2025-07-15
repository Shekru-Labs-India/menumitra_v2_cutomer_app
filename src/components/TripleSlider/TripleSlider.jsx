// src/components/TripleSlider/TripleSlider.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles in correct order
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import required modules
import { EffectFade, Pagination, Navigation } from 'swiper/modules';

import './TripleSlider.css';

const TripleSlider = ({
  slides,
  className = '',
}) => {
  const limitedSlides = slides.slice(0, 5);

  return (
    <div className={`triple-slider ${className}`}>
      <Swiper
        modules={[EffectFade, Pagination, Navigation]}
        effect={'fade'} // Add fade effect for smooth transitions
        slidesPerView={1}
        spaceBetween={0}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={true}
        grabCursor={true} // Makes it clear the slider is interactive
        touchRatio={1} // Makes touch/swipe more responsive
        touchAngle={45} // Makes swiping easier
        touchEventsTarget="wrapper" // Improves touch detection
        className="triple-swiper"
      >
        {limitedSlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="slide-content">
              <img 
                src={slide.backgroundImage}
                alt={slide.title || `Slide ${index + 1}`}
                className="bg-image"
                style={{
                  width: '100%',
                  aspectRatio: '1/1',
                  objectFit: 'cover',
                  display: 'block' // Ensures no extra space
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

TripleSlider.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      backgroundImage: PropTypes.string.isRequired,
      title: PropTypes.string,
    })
  ).isRequired,
  className: PropTypes.string,
};

export default TripleSlider;
