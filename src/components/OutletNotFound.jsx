import React from 'react'

function OutletNotFound() {
  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center p-4 rounded-4">
        <img 
          src="/src/assets/images/scanQr.gif" 
          alt="Scan QR Code" 
          className="img-fluid mb-4 rounded-4"
          style={{ maxWidth: '200px', height: '200px' }}
        />
        <h5 className="mt-3">Outlet having issue. 
        <br />
        Rescan the QR Code again!</h5>
      </div>
    </div>
  )
}

export default OutletNotFound