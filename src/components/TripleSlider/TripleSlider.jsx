// src/components/TripleSlider/TripleSlider.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCreative, Parallax } from 'swiper/modules';
import LazyImage from '../Shared/LazyImage';

// Import required Swiper styles
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/parallax';
import './TripleSlider.css';

const TripleSlider = ({
  slides,
  autoplayDelay = 3000,
  pauseOnHover = true,
  loop = true,
  speed = 800,
  className = '',
}) => {
  return (
    <div className={`triple-slider ${className}`}>
      <Swiper
        modules={[Autoplay, EffectCreative, Parallax]}
        centeredSlides={true}
        parallax={true}
        effect="creative"
        creativeEffect={{
          prev: {
            translate: ['-20%', 0, -1],
            scale: 0.85,
            opacity: 0.5,
          },
          next: {
            translate: ['100%', 0, 0],
            scale: 0.85,
            opacity: 0.5,
          },
        }}
        autoplay={{
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: pauseOnHover,
        }}
        loop={loop}
        speed={speed}
        breakpoints={{
          320: {
            slidesPerView: 1.2,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1.5,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 1.8,
            spaceBetween: 40,
          },
        }}
        className="triple-swiper"
      >
        {slides.map((slide, index) => (
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
                <div className="overlay-image-wrapper" data-swiper-parallax-x="50%">
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
