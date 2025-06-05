import React from 'react';
// Adjust the path below to where your logo is actually stored
import logo from '../assets/logo.png';

function MenuMitra() {
  return (
    <div className="d-flex align-items-center ms-3">
      <img
        src={logo}
        alt="MenuMitra Logo"
        style={{ height: 55, width: 55, marginRight: 12 }}
      />
      <div className="d-flex flex-column">
        <span className="fw-semibold fs-4">MenuMitra</span>
        <span className="text-muted" style={{ fontSize: 14 }}>v2.0</span>
      </div>
    </div>
  );
}

export default MenuMitra;