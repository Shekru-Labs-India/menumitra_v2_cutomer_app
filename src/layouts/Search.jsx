import React, { useState, useCallback, useEffect, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HorizontalMenuCard from "../components/HorizontalMenuCard";
import OffcanvasSearchFilter from "../components/Shared/OffcanvasSearchFilter";
import { useAuth } from "../contexts/AuthContext"; // Assuming you have AuthContext
import { useCart } from "../contexts/CartContext"; // Add this import
import { useModal } from "../contexts/ModalContext"; // Add this import
import { debounce } from "lodash"; // Make sure to install lodash
import { useOutlet } from "../contexts/OutletContext";
import QuickFilters from "../components/QuickFilters";
import axios from "axios";
import apiService from "../api/apiService";
import { useQuery } from '@tanstack/react-query';

function Search() {
  // Add this at the start of the component, with other useEffects
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [originalSearchResults, setOriginalSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState([]); // Keep this state
  const [filteredResults, setFilteredResults] = useState([]); // Add this state ONCE

  const searchInputRef = useRef(null);

  // Get these from context/props
  const { userId } = useAuth(); // Get user_id from auth context

  // Get cart context
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();

  // Get modal context
  const { openModal } = useModal();

  const { outletId } = useOutlet();

  const MAX_QUANTITY = 20;

  // Add new state for quick filters
  const [quickFilters, setQuickFilters] = useState({
    type: null,
    price: null,
    spicy: null,
  });

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Function to update recent searches
  const updateRecentSearches = (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) return;

    setRecentSearches((prev) => {
      // Remove the search term if it already exists
      const filtered = prev.filter((term) => term !== searchTerm);
      // Add the new search term at the beginning
      const updated = [searchTerm, ...filtered].slice(0, 3);
      // Save to localStorage
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  // Function to clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  // Function to remove a single search term
  const removeSearchTerm = (termToRemove) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((term) => term !== termToRemove);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  };

  // Modified debounced function for recent searches
  const debouncedUpdateRecentSearches = useCallback(
    debounce((searchTerm, results) => {
      // Only update if we have results and a valid search term
      if (results && results.length > 0 && searchTerm && searchTerm.trim()) {
        setRecentSearches((prev) => {
          // Check if the search term is a substring of any existing term
          const isSubstring = prev.some(
            (term) =>
              term.toLowerCase().includes(searchTerm.toLowerCase()) ||
              searchTerm.toLowerCase().includes(term.toLowerCase())
          );

          // If it's a substring and shorter than existing term, don't add it
          if (
            isSubstring &&
            prev.some((term) => term.length > searchTerm.length)
          ) {
            return prev;
          }

          // Remove similar terms (case insensitive)
          const filtered = prev.filter((term) => {
            const termLower = term.toLowerCase();
            const searchTermLower = searchTerm.toLowerCase();
            return (
              !termLower.includes(searchTermLower) &&
              !searchTermLower.includes(termLower)
            );
          });

          // Add the new search term at the beginning
          const updated = [searchTerm, ...filtered].slice(0, 3);
          localStorage.setItem("recentSearches", JSON.stringify(updated));
          return updated;
        });
      }
    }, 1000), // Increased delay to 1 second
    []
  );

  // Tanstack Query: only run when refetch() is called
  const {
    data: searchData,
    isLoading,
    error: searchError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['searchMenus', outletId, userId, searchInputValue.trim()],
    queryFn: () =>
      apiService.menus.searchMenus({
        outletId,
        userId,
        keyword: searchInputValue.trim(),
      }),
    enabled: false, // Only run when manually triggered
    // staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  });

  // Update searchResults when searchData changes
  useEffect(() => {
    if (searchData?.detail?.menu_list) {
      setSearchResults(searchData.detail.menu_list);
      setFilteredResults([]); // Reset filtered results when new search happens
    }
  }, [searchData]);

  // Only trigger search on Enter or search icon
  const handleSearch = async () => {
    setHasSearched(true);
    setError(null);
    const { error: queryError } = await refetch();
    if (queryError) setError(queryError);
  };

  // Input change handler (does NOT trigger search)
  const handleSearchChange = (event) => {
    setSearchInputValue(event.target.value);
    if (!event.target.value.trim()) {
      setHasSearched(false); // Reset search state if input is cleared
    }
  };

  // Modified handleRecentSearchClick
  const handleRecentSearchClick = (searchTerm) => {
    setSearchInputValue(searchTerm); // Update the input value state

    // Update the search input value
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
      searchInput.value = searchTerm;
    }

    handleSearch(searchTerm);
  };

  // Cleanup both debounce functions on unmount
  useEffect(() => {
    return () => {
      debouncedUpdateRecentSearches.cancel();
    };
  }, [debouncedUpdateRecentSearches]);

  // Modified handleAddToCart function to match Home.jsx implementation
  const handleAddToCart = (menu) => {
    // Format the menu data for modal
    const menuItem = {
      menuId: menu.menu_id,
      menuName: menu.menu_name,
      portions: menu.portions.map((portion) => ({
        portion_id: portion.portion_id,
        portion_name: portion.portion_name,
        price: portion.price,
      })),
      image: menu.image,
      menuFoodType: menu.menu_food_type,
    };

    openModal("addToCart", menuItem); // Update modal ID to match the new system
  };

  // Add helper function to check if item exists in cart
  const getCartItem = (menuId, portionId) => {
    return cartItems.find(
      (item) => item.menuId === menuId && item.portionId === portionId
    );
  };

  // Add quantity change handler
  const handleQuantityChange = (menuId, portionId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(menuId, portionId);
    } else if (newQuantity <= MAX_QUANTITY) {
      updateQuantity(menuId, portionId, newQuantity);
    }
  };

  const handleFavoriteClick = (menuId) => {
    // Implement favorite toggle logic
  };

  // Add this helper function
  const hasSearchResults = () => {
    return searchResults && searchResults.length > 0;
  };

  // Modify the toggle filter function
  const toggleFilter = () => {
    if (hasSearchResults()) {
      setShowFilter(!showFilter);
    }
  };

  // Modified handleApplyFilter to filter locally
  const handleApplyFilter = (filters) => {
    setError(null);

    try {
      let filteredResults = [...originalSearchResults]; // Start with original results

      // Apply price range filter
      if (filters.priceRange.min || filters.priceRange.max) {
        const minPrice = filters.priceRange.min
          ? parseFloat(filters.priceRange.min)
          : 0;
        const maxPrice = filters.priceRange.max
          ? parseFloat(filters.priceRange.max)
          : Infinity;

        filteredResults = filteredResults.filter((menu) => {
          const menuPrice = menu.portions?.[0]?.price || 0;
          return menuPrice >= minPrice && menuPrice <= maxPrice;
        });
      }

      // Apply food type filter
      const selectedFoodTypes = Object.entries(filters.foodType)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type);

      if (selectedFoodTypes.length > 0) {
        filteredResults = filteredResults.filter((menu) =>
          selectedFoodTypes.includes(menu.menu_food_type)
        );
      }

      // Apply other filters
      if (filters.others.discount) {
        filteredResults = filteredResults.filter((menu) => menu.offer > 0);
      }

      if (filters.others.voucher) {
        filteredResults = filteredResults.filter((menu) => menu.has_voucher); // Assuming this property exists
      }

      if (filters.others.freeShipping) {
        filteredResults = filteredResults.filter((menu) => menu.free_shipping); // Assuming this property exists
      }

      if (filters.others.sameDayDelivery) {
        filteredResults = filteredResults.filter(
          (menu) => menu.same_day_delivery
        ); // Assuming this property exists
      }

      // setSearchResults(filteredResults); // This line is removed
    } catch (err) {
      setError(err.message);
      // setSearchResults(originalSearchResults); // This line is removed
    } finally {
    }
  };

  const getFoodTypeFilter = (foodType) => {
    if (foodType.veg && !foodType.nonveg) return "veg";
    if (!foodType.veg && foodType.nonveg) return "nonveg";
    return "all";
  };

  // Handle quick filter changes
  const handleQuickFilterChange = (filtered) => {
    setFilteredResults(filtered);
  };

  // Focus the search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Use filteredResults if available, otherwise use searchResults
  const displayResults = filteredResults.length > 0 ? filteredResults : searchResults;

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="container">
          <div className="serach-area">
            <div className="d-flex align-items-center mb-4">
              <div className="w-100">
                <div className="mb-0 input-group input-group-icon">
                  <div className="input-group-text">
                    <div
                      className="input-icon search-icon"
                      onClick={handleSearch}
                      style={{ cursor: 'pointer' }}
                    >
                      <i
                        className="fas fa-search"
                        style={{ fontSize: "20px", color: "#7D8FAB" }}
                      ></i>
                    </div>
                  </div>
                  <input
                    ref={searchInputRef}
                    type="search"
                    className="form-control main-in px-0 bs-0"
                    placeholder="Search menu items..."
                    onChange={handleSearchChange}
                    value={searchInputValue}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    autoComplete="off"
                    results="0"
                    data-search-input
                  />
                </div>
              </div>
            </div>
            <QuickFilters 
              onFilterChange={handleQuickFilterChange} 
              menuList={searchResults} // Pass the original search results
            />
           
            {isLoading || isFetching ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error || searchError ? (
              <div className="text-center py-4">
                <div className="empty-search-state">
                  <i
                    className="fas fa-exclamation-circle"
                    style={{
                      fontSize: "64px",
                      color: "#dc3545",
                      opacity: "0.5",
                      marginBottom: "1rem",
                    }}
                  ></i>
                  <p className="mt-3 text-muted">
                    Error: {error?.message || searchError?.message || "Failed to fetch"}
                  </p>
                </div>
              </div>
            ) : !hasSearched || searchInputValue.trim() === "" ? (
              <div className="text-center py-4">
                <div className="empty-search-state">
                  <p className="mt-3 text-muted">Search the menu</p>
                </div>
              </div>
            ) : displayResults.length === 0 ? (
              <div className="text-center py-4">
                <div className="empty-search-state">
                  <i
                    className="fas fa-exclamation-circle"
                    style={{
                      fontSize: "64px",
                      color: "#dc3545",
                      opacity: "0.5",
                      marginBottom: "1rem",
                    }}
                  ></i>
                  <p className="mt-3 text-muted">No menu found</p>
                </div>
              </div>
            ) : (
              <div className="item-list style-2">
                <div className="saprater" />
                {/* <div className="title-bar">
                  <span className="title mb-0 font-18">
                    Search Results ({searchResults.length})
                  </span>
                </div> */}
                <ul>
                  {displayResults.map((menu) => (
                    <li key={menu.menu_id}>
                      <HorizontalMenuCard
                        image={
                          menu.images && Array.isArray(menu.images) && menu.images.length > 0
                            ? menu.images[0].image
                            : menu.image || null
                        }
                        title={menu.menu_name}
                        currentPrice={menu.portions?.[0]?.price || 0}
                        originalPrice={
                          menu.portions?.[0]?.price && menu.offer
                            ? menu.portions[0].price +
                              (menu.portions[0].price * menu.offer) / 100
                            : null
                        }
                        discount={menu.offer > 0 ? `${menu.offer}%` : null}
                        menuItem={{
                          menuId: menu.menu_id,
                          menuCatId: menu.menu_cat_id,
                          menuName: menu.menu_name,
                          portions:
                            menu.portions?.map((portion) => ({
                              portion_id: portion.portion_id,
                              portion_name: portion.portion_name,
                              price: portion.price,
                              unit_value: portion.unit_value,
                              unit_type: portion.unit_type,
                            })) || [],
                          image:
                            menu.images && Array.isArray(menu.images) && menu.images.length > 0
                              ? menu.images[0].image
                              : menu.image || null,
                          menuFoodType: menu.menu_food_type,
                          category: menu.category_name,
                          rating: menu.rating,
                          isSpecial: menu.is_special,
                        }}
                        onFavoriteClick={() => handleFavoriteClick(menu.menu_id)}
                        isFavorite={menu.is_favourite === 1}
                        rating={menu.rating}
                        categoryName={menu.category_name}
                        spicyIndex={menu.spicy_index}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* {hasSearchResults() && (
        <div
          className={`offcanvas offcanvas-start be-0 ${
            showFilter ? "show" : ""
          }`}
          tabIndex="-1"
          id="offcanvasLeft"
          aria-modal="true"
          role="dialog"
        >
          <OffcanvasSearchFilter
            onClose={() => setShowFilter(false)}
            onApplyFilter={handleApplyFilter}
          />
        </div>
      )} */}

      <Footer />
    </>
  );
}

const styles = `
  .input-icon.search-icon.disabled {
    pointer-events: none;
  }
  
  .empty-search-state {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .empty-search-state i {
    margin-bottom: 1rem;
  }
  
  .empty-search-state p {
    font-size: 1rem;
    color: #6c757d;
    margin: 0;
    max-width: 80%;
    text-align: center;
  }
  
  .recent-search-list i {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Remove the clear (x) button from search inputs - Comprehensive solution */
  input[type="search"]::-webkit-search-decoration,
  input[type="search"]::-webkit-search-cancel-button,
  input[type="search"]::-webkit-search-results-button,
  input[type="search"]::-webkit-search-results-decoration,
  input[type="search"]::-webkit-clear-button {
    -webkit-appearance: none;
    appearance: none;
    display: none;
  }
  
  /* For Edge/IE */
  input[type="search"]::-ms-clear,
  input[type="search"]::-ms-reveal {
    display: none;
    width: 0;
    height: 0;
  }

  /* For Firefox */
  input[type="search"] {
    -moz-appearance: none;
  }

  /* Global override */
  input[type="search"] {
    appearance: none;
  }

  /* Additional safety measure */
  .main-in::-webkit-search-cancel-button {
    display: none !important;
    -webkit-appearance: none !important;
  }

  /* QuickFilters styles */
  .basic-dropdown {
    position: relative;
    z-index: 1050; /* Higher z-index to ensure visibility */
  }

  .basic-dropdown .dropdown-menu {
    z-index: 1051; /* Even higher z-index for the dropdown menu */
  }

  .basic-dropdown .dropdown-menu.show {
    display: block;
    margin-top: 5px;
  }

  /* Ensure the search container doesn't overlap */
  .serach-area {
    position: relative;
    z-index: 1;
  }
`;

export default Search;
