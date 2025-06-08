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
    <div className="d-flex justify-content-center">
      <a href="/" className="text-decoration-none">
        <div className="d-flex align-items-center mt-4">
          <img 
            src={logo} 
            alt="MenuMitra Logo" 
            width="40" 
            height="40"
            className="img-fluid" 
          />
          <div className="text-dark mb-0 mt-1 fw-semibold ms-2 fs-4">
            MenuMitra
          </div>
        </div>
      </a>
    </div>
  );

  const renderSocialLinks = () => (
    <div className="d-flex justify-content-center">
      {SOCIAL_LINKS.map(({ platform, url, icon }) => (
        <a
          key={platform}
          href={url}
          className="mx-3 text-dark"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit MenuMitra on ${platform}`}
        >
          <i className={`${icon} fs-4`}></i>
        </a>
      ))}
    </div>
  );

  const renderFooter = () => (
    <div className="mt-3">
      <i className="fa-solid fa-bolt"></i> Powered by <br />
      <a 
        className="text-success text-decoration-none" 
        href="https://www.shekruweb.com" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Shekru Labs India Pvt. Ltd.
      </a>
      <p className="text-center mb-0 mt-2">Version 2.0</p>
    </div>
  );

  return (
    <div className="border-top">
      {renderLogo()}
      <div className="text-center pb-5">
        <div className="my-4">
          {renderSocialLinks()}
        </div>
        {renderFooter()}
      </div>
    </div>
  );
};

export default MenuMitra;