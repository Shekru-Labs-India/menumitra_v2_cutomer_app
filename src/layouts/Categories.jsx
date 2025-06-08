import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useOutlet } from '../contexts/OutletContext';

const API_BASE_URL = "https://men4u.xyz/v2";

function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { outletId } = useOutlet();

  useEffect(() => {
    const fetchCategories = async () => {
      console.log('🔄 Fetching categories...');
      try {
        setLoading(true);
        const authData = localStorage.getItem('auth');
        const userData = authData ? JSON.parse(authData) : null;
        
        console.log('📦 Using outlet ID:', outletId);

        const response = await fetch(`${API_BASE_URL}/user/get_category_list_with_image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${userData?.accessToken}`
          },
          body: JSON.stringify({
            outlet_id: outletId
          })
        });

        const data = await response.json();
        const mappedCategories = data.detail.menu_list.map(category => ({
          menuCatId: category.menu_cat_id,
          categoryName: category.category_name,
          outletId: category.outlet_id,
          outletVegNonveg: category.outlet_veg_nonveg,
          menuCount: category.menu_count
        }));

        setCategories(mappedCategories);
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    navigate(`/category-menu/${category.menuCatId}`, { 
      state: { 
        categoryName: category.categoryName,
        menuCount: category.menuCount 
      } 
    });
  };

  // Skeleton component for loading state
  const CategorySkeleton = () => {
    const skeletonCount = 8; // Number of skeleton cards to show
    const skeletons = Array(skeletonCount).fill(null);

    return skeletons.map((_, index) => (
      <div key={`skeleton-${index}`} className="col-6 col-md-4 col-lg-3">
        <div 
          className="card h-100 border-0 rounded-4 shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shimmer effect overlay */}
          <div 
            className="skeleton-shimmer"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          
          <div className="card-body d-flex flex-column align-items-center justify-content-center p-3">
            {/* Icon skeleton */}
            <div className="mb-3" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#e0e0e0',
            }} />
            
            {/* Title skeleton */}
            <div className="mb-2" style={{
              width: '80%',
              height: '20px',
              borderRadius: '4px',
              background: '#e0e0e0',
            }} />
            
            {/* Count skeleton */}
            <div style={{
              width: '60px',
              height: '24px',
              borderRadius: '12px',
              background: '#e0e0e0',
            }} />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <Header />
      <div className="page-content py-4">
        <div className="container">
          {/* Add shimmer animation styles */}
          <style>
            {`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                100% {
                  transform: translateX(100%);
                }
              }
              .skeleton-shimmer {
                pointer-events: none;
              }
            `}
          </style>
          
          <div className="row g-3">
            {loading ? (
              <CategorySkeleton />
            ) : (
              categories.map((category, index) => (
                <div key={category.menuCatId} className="col-6 col-md-4 col-lg-3">
                  <div 
                    onClick={(e) => handleCategoryClick(e, category)}
                    className="card h-100 border-0 rounded-4 shadow-sm cursor-pointer"
                    style={{
                      background: index % 4 === 0 
                        ? 'linear-gradient(135deg, #FF7043 0%, #F4511E 100%)' // Warm Orange
                        : index % 4 === 1
                        ? 'linear-gradient(135deg, #26A69A 0%, #00796B 100%)' // Teal
                        : index % 4 === 2
                        ? 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)' // Indigo
                        : 'linear-gradient(135deg, #7E57C2 0%, #512DA8 100%)', // Deep Purple
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                    }}
                  >
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                        backgroundSize: '10px 10px',
                      }}
                    />
                    
                    <div className="card-body d-flex flex-column align-items-center justify-content-center p-3 position-relative">
                      <div className="icon-wrapper mb-3">
                        <i className={`${
                          index % 4 === 0 
                            ? 'fas fa-utensils'
                            : index % 4 === 1
                            ? 'fas fa-hamburger'
                            : index % 4 === 2
                            ? 'fas fa-pizza-slice'
                            : 'fas fa-coffee'
                        } fa-2x text-white opacity-90`}></i>
                      </div>
                      <h6 className="card-title text-white text-center mb-2"
                        style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                        }}>
                        {category.categoryName}
                      </h6>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-white bg-opacity-25 text-white px-2 py-1 rounded-pill">
                          {category.menuCount} Items
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Categories;
