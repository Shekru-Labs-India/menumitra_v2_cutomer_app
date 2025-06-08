import React from 'react';
// Adjust the path below to where your logo is actually stored
import logo from '../assets/logo.png';

const SOCIAL_LINKS = [
  {
    platform: 'facebook',
    url: 'https://www.facebook.com/people/Menu-Mitra/61565082412478/',
    icon: 'fa-brands fa-facebook'
  },
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/menumitra/',
    icon: 'fa-brands fa-instagram'
  },
  {
    platform: 'youtube',
    url: 'https://www.youtube.com/@menumitra',
    icon: 'fa-brands fa-youtube'
  },
  {
    platform: 'twitter',
    url: 'https://x.com/MenuMitra',
    icon: 'fa-brands fa-twitter'
  }
];

const MenuMitra = () => {
  const renderLogo = () => (
    <div className="d-flex flex-column align-items-center mb-4">
      <a href="/" className="text-decoration-none d-flex align-items-center">
        <img 
          src={logo} 
          alt="MenuMitra Logo" 
          width="32" 
          height="32"
          className="img-fluid" 
        />
        <div className="text-dark fw-semibold ms-2 fs-5">
          MenuMitra
        </div>
      </a>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="d-flex justify-content-center gap-4 mb-3">
      {SOCIAL_LINKS.map(({ platform, url, icon }) => (
        <a
          key={platform}
          href={url}
          className="text-dark"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit MenuMitra on ${platform}`}
        >
          <i className={`${icon} fs-5`}></i>
        </a>
      ))}
    </div>
  );

  const renderFooter = () => (
    <div className="text-center">
      <div className="d-flex align-items-center justify-content-center gap-1 mb-1">
        <i className="fa-solid fa-bolt"></i>
        <span>Powered by</span>
      </div>
      <a 
        className="text-success text-decoration-none d-block mb-1" 
        href="https://www.shekruweb.com" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Shekru Labs India Pvt. Ltd.
      </a>
      <p className="text-muted mb-0 small">Version 2.0</p>
    </div>
  );

  return (
    <div className="border-top pt-4 pb-4">
      {renderLogo()}
      {renderSocialLinks()}
      {renderFooter()}
    </div>
  );
};

export default MenuMitra;