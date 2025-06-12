import React, { useState, useCallback, useEffect } from "react";
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

function Search() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState("");
  const [originalSearchResults, setOriginalSearchResults] = useState([]);

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

  // Modified handleSearch to handle the specific API response format
  const handleSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setSearchResults([]);
      setOriginalSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        outlet_id: outletId,
        keyword: searchTerm.trim(),
      };

      if (userId) {
        payload.user_id = userId;
      }

      const response = await axios({
        method: "POST",
        url: "https://men4u.xyz/v2/user/search_menu",
        headers: {
          "Content-Type": "application/json",
        },
        data: payload,
      });

      // Handle the specific API response format
      if (
        response.data &&
        response.data.detail &&
        Array.isArray(response.data.detail.menu_list)
      ) {
        const menuList = response.data.detail.menu_list;

        if (menuList.length > 0) {
          setOriginalSearchResults(menuList);
          setSearchResults(menuList);
          debouncedUpdateRecentSearches(searchTerm, menuList);
        } else {
          setOriginalSearchResults([]);
          setSearchResults([]);
          setError("No menu items found matching your search.");
        }
      } else {
        setOriginalSearchResults([]);
        setSearchResults([]);
        setError("No menu items available at the moment.");
      }
    } catch (err) {
      console.error("Search error:", err);

      // Handle different error scenarios
      if (err.response) {
        // API returned an error response
        const errorMessage =
          err.response.data?.message ||
          err.response.data?.detail?.message ||
          "Unable to find menu items. Please try again.";
        setError(errorMessage);
      } else if (err.request) {
        // Network error
        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        // Other errors
        setError(
          "Something went wrong while searching. Please try again later."
        );
      }

      setOriginalSearchResults([]);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Modified handleSearchChange
  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchInputValue(searchTerm); // Update the input value state

    // If user clears the search, show empty state without error
    if (!searchTerm || searchTerm.trim() === "") {
      setSearchResults([]);
      setOriginalSearchResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    handleSearch(searchTerm);
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
    setIsLoading(true);
    setActiveFilters(filters);

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

      setSearchResults(filteredResults);
    } catch (err) {
      setError(err.message);
      setSearchResults(originalSearchResults); // Reset to original results on error
    } finally {
      setIsLoading(false);
    }
  };

  const getFoodTypeFilter = (foodType) => {
    if (foodType.veg && !foodType.nonveg) return "veg";
    if (!foodType.veg && foodType.nonveg) return "nonveg";
    return "all";
  };

  // Add handler for quick filter changes
  const handleQuickFilterChange = (filters) => {
    setQuickFilters(filters);

    // Filter the results based on the quick filters
    let filtered = [...originalSearchResults];

    if (filters.type) {
      filtered = filtered.filter((item) => {
        if (filters.type === "all") return true;
        return item.menu_food_type.toLowerCase() === filters.type.toLowerCase();
      });
    }

    if (filters.price) {
      filtered = filtered.filter((item) => {
        const price = item.portions?.[0]?.price || 0;
        const priceMap = {
          50: 50,
          100: 100,
          200: 200,
          500: 500,
          1000: 1000,
          above1000: 1001,
        };

        if (filters.price === "all") return true;
        if (filters.price === "above1000") return price >= 1000;
        return price <= priceMap[filters.price];
      });
    }

    if (filters.spicy) {
      filtered = filtered.filter((item) => {
        if (filters.spicy === "all") return true;
        return item.spicy_level === filters.spicy;
      });
    }

    setSearchResults(filtered);
  };

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
                    <div className="input-icon search-icon">
                      <i
                        className="fas fa-search"
                        style={{ fontSize: "20px", color: "#7D8FAB" }}
                      ></i>
                    </div>
                  </div>
                  <input
                    type="search"
                    className="form-control main-in px-0 bs-0"
                    placeholder="Search menu items..."
                    onChange={handleSearchChange}
                    value={searchInputValue}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch(searchInputValue);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <QuickFilters onFilterChange={handleQuickFilterChange} />
            {recentSearches.length > 0 && (
              <>
                <div className="title-bar mt-0">
                  <span className="title mb-0 font-18">Recent Search</span>
                  <a
                    className="font-14 font-w500 text-accent all-close"
                    href="javascript:void(0);"
                    onClick={clearRecentSearches}
                  >
                    Clear All
                  </a>
                </div>
                <ul className="recent-search-list">
                  {recentSearches.map((term, index) => (
                    <li key={index}>
                      <div
                        className="d-flex align-items-center"
                        onClick={() => handleRecentSearchClick(term)}
                        style={{ cursor: "pointer" }}
                      >
                        <i
                          className="fas fa-history"
                          style={{ fontSize: "20px", color: "#7D8FAB" }}
                        ></i>
                        <h5 className="sub-title ms-2 mb-0">{term}</h5>
                      </div>
                      <a
                        href="javascript:void(0);"
                        className="close-1 remove-tag"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearchTerm(term);
                        }}
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
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
                  <p className="mt-3 text-muted">{error}</p>
                </div>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="item-list style-2">
                <div className="saprater" />
                <div className="title-bar">
                  <span className="title mb-0 font-18">
                    Search Results ({searchResults.length})
                  </span>
                </div>
                <ul>
                  {searchResults.map((menu) => (
                    <li key={menu.menu_id}>
                      <HorizontalMenuCard
                        image={menu.image || null}
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
                          image: menu.image,
                          menuFoodType: menu.menu_food_type,
                          category: menu.category_name,
                          rating: menu.rating,
                          isSpecial: menu.is_special,
                        }}
                        onFavoriteClick={() =>
                          handleFavoriteClick(menu.menu_id)
                        }
                        isFavorite={menu.is_favourite === 1}
                        rating={menu.rating}
                        categoryName={menu.category_name}
                        spicyIndex={menu.spicy_index}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : searchInputValue.trim() !== "" ? (
              <div className="text-center py-4">
                <div className="empty-search-state">
                  <i
                    className="fas fa-search"
                    style={{
                      fontSize: "64px",
                      color: "#7D8FAB",
                      opacity: "0.5",
                      marginBottom: "1rem",
                    }}
                  ></i>
                  <p className="mt-3 text-muted">
                    No results found for "{searchInputValue}". Try a different
                    search term.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="empty-search-state">
                  <i
                    className="fas fa-search"
                    style={{
                      fontSize: "64px",
                      color: "#7D8FAB",
                      opacity: "0.5",
                      marginBottom: "1rem",
                    }}
                  ></i>
                  <p className="mt-3 text-muted">
                    Type something to search for delicious menu items
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {hasSearchResults() && (
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
      )}

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
`;

export default Search;
