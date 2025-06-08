import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from "react-router-dom";

const OutletContext = createContext();

// Update the regex pattern to match the exact format with prefixes
const URL_PATTERN = /^\/o(\d+)\/s(\d+)\/t(\d+)$/;

// Regex: matches /o123, /o456, etc. (no /s or /t after)
const outletOnlyPattern = /^\/o\d+$/;

export const useOutlet = () => {
  const context = useContext(OutletContext);
  if (!context) {
    throw new Error('useOutlet must be used within an OutletProvider');
  }
  return context;
};

export const OutletProvider = ({ children }) => {
  // Always read from localStorage for outletInfo
  const getStoredOutlet = () => {
    const stored = localStorage.getItem('selectedOutlet');
    return stored ? JSON.parse(stored) : null;
  };

  const [outletInfo, setOutletInfo] = useState(getStoredOutlet());
  const [outletId, setOutletId] = useState(getStoredOutlet()?.outletId || null);
  const [outletDetails, setOutletDetails] = useState(getStoredOutlet() || null);
  const [isOutletOnlyUrl, setIsOutletOnlyUrl] = useState(false);

  // Add new state for orderSettings
  const [orderSettings, setOrderSettings] = useState(() => {
    const savedSettings = localStorage.getItem('orderSettings');
    return savedSettings ? JSON.parse(savedSettings) : { order_type: null };
  });

  const location = useLocation();
  const navigate = useNavigate();

  const parseOutletUrl = (url) => {
    const matches = url.match(URL_PATTERN);
    if (matches) {
      return {
        outletCode: matches[1],
        sectionId: matches[2],
        tableId: matches[3]
      };
    }
    return null;
  };

  function extractOutletParamsFromPath(pathname) {
    // Split and filter out empty segments
    const segments = pathname.split('/').filter(Boolean);
    // We expect the last three segments to be o<outletCode>, s<sectionId>, t<tableId>
    if (segments.length < 3) return null;
    const [o, s, t] = segments.slice(-3);

    const oMatch = o.match(/^o(\d+)$/);
    const sMatch = s.match(/^s(\d+)$/);
    const tMatch = t.match(/^t(\d+)$/);

    if (oMatch && sMatch && tMatch) {
      return {
        outletCode: oMatch[1],
        sectionId: sMatch[1],
        tableId: tMatch[1],
      };
    }
    return null;
  }

  // First, add a function to extract just the outlet code
  function extractOutletCode(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    const match = lastSegment?.match(/^o(\d+)$/);
    return match ? match[1] : null;
  }

  // Add function to update orderSettings
  const updateOrderSettings = (settings) => {
    const newSettings = { ...orderSettings, ...settings };
    setOrderSettings(newSettings);
    localStorage.setItem('orderSettings', JSON.stringify(newSettings));
  };

  useEffect(() => {
    const fullPath = window.location.pathname;
    const params = extractOutletParamsFromPath(fullPath);
    const stored = getStoredOutlet();

    if (params) {
      const { outletCode, sectionId, tableId } = params;
      // Existing full URL handling
      updateOrderSettings({ order_type: 'dine-in' });
      if (!stored || 
          stored.outletCode !== outletCode || 
          stored.sectionId !== sectionId || 
          stored.tableId !== tableId) {
        localStorage.setItem('outletCode', outletCode);
        localStorage.setItem('sectionId', sectionId);
        localStorage.setItem('tableId', tableId);

        fetchOutletDetailsByCode(outletCode).then((details) => {
          if (details) {
            localStorage.setItem('selectedOutlet', JSON.stringify(details));
            setOutletInfo(details);
            setOutletId(details.outletId);
            setOutletDetails(details);
          }
        });
      }
    } else {
      // Check if it's outlet-only URL
      const outletOnlyPattern = /^(\/menumitra_customer_app)?\/o\d+\/?$/;
      if (outletOnlyPattern.test(fullPath)) {
        const outletCode = extractOutletCode(fullPath);
        if (outletCode) {
          updateOrderSettings({ order_type: null });
          // Add API call for outlet-only URL
          fetchOutletDetailsByCode(outletCode).then((details) => {
            if (details) {
              localStorage.setItem('selectedOutlet', JSON.stringify(details));
              setOutletInfo(details);
              setOutletId(details.outletId);
              setOutletDetails(details);
            }
          });
        }
      }
    }
  }, [location.pathname]);

  // Updated pattern to handle basename
  useEffect(() => {
    // This regex pattern will:
    // 1. Optionally match /menumitra_customer_app
    // 2. Then match /o followed by numbers
    // 3. Match end of path or trailing slash
    const outletOnlyPattern = /^(\/menumitra_customer_app)?\/o\d+\/?$/;
    
    setIsOutletOnlyUrl(outletOnlyPattern.test(location.pathname));
  }, [location.pathname]);

  const fetchOutletDetailsByCode = async (outletCode) => {
    try {
      // Get section_id and table_id from localStorage
      const sectionId = localStorage.getItem('sectionId');
      const tableId = localStorage.getItem('tableId');

      const response = await axios.post('https://men4u.xyz/v2/user/get_restaurant_details_by_code', {
        outlet_code: outletCode,
        section_id: sectionId || '',
        table_number: tableId || ''
      });

      if (response.data?.data?.outlet_details) {
        const details = response.data.data.outlet_details;
        
        // Get existing outlet info from localStorage
        const existingOutletInfo = localStorage.getItem('selectedOutlet') 
          ? JSON.parse(localStorage.getItem('selectedOutlet'))
          : {};

        const formattedOutletInfo = {
          // First spread existing data
          ...existingOutletInfo,
          // Then add new/updated data from API
          outletId: details.outlet_id,
          outletCode: outletCode,
          outletName: details.name,
          isOpen: details.is_open,
          mobile: details.mobile,
          fssaiNumber: details.fssainumber,
          gstNumber: details.gstnumber,
          address: details.address,
          ownerId: details.owner_id,
          outletType: details.outlet_type,
          outletVegNonveg: details.outlet_veg_nonveg,
          whatsapp: details.whatsapp,
          facebook: details.facebook,
          instagram: details.instagram,
          website: details.website,
          googleReview: details.google_review,
          googleBusinessLink: details.google_business_link,
          sectionName: details.section_name,
          // Use API values with fallback to existing values
          sectionId: details.section_id?.toString() || existingOutletInfo.sectionId || localStorage.getItem('sectionId'),
          tableId: details.table_id?.toString() || existingOutletInfo.tableId || localStorage.getItem('tableId'),
          tableNumber: details.table_number?.toString() || details.table_id?.toString() || existingOutletInfo.tableNumber
        };

        // Update localStorage with merged data
        localStorage.setItem('sectionId', formattedOutletInfo.sectionId);
        localStorage.setItem('tableId', formattedOutletInfo.tableId);
        localStorage.setItem('selectedOutlet', JSON.stringify(formattedOutletInfo));
        
        return formattedOutletInfo;
      }
    } catch (error) {
      console.error('Error fetching outlet details:', error);
      throw error;
    }
  };

  const updateOutletInfo = (newInfo) => {
    // Ensure we preserve section and table IDs when updating
    const updatedInfo = {
      ...newInfo,
      sectionId: newInfo.sectionId || localStorage.getItem('sectionId'),
      tableId: newInfo.tableId || localStorage.getItem('tableId')
    };
    localStorage.setItem('selectedOutlet', JSON.stringify(updatedInfo));
    setOutletInfo(updatedInfo);
    setOutletId(updatedInfo.outletId);
    setOutletDetails(updatedInfo);
  };

  // Modify clearOutletInfo to also clear orderSettings
  const clearOutletInfo = () => {
    localStorage.removeItem('selectedOutlet');
    localStorage.removeItem('outletCode');
    localStorage.removeItem('sectionId');
    localStorage.removeItem('tableId');
    localStorage.removeItem('orderSettings');
    setOutletInfo(null);
    setOutletId(null);
    setOutletDetails(null);
    setOrderSettings({ order_type: null });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    const stored = getStoredOutlet();
    return {
      outletInfo: stored,
      updateOutletInfo,
      clearOutletInfo,
      fetchOutletDetailsByCode,
      outletId: stored?.outletId,
      outletDetails: stored,
      setOutletId,
      setOutletDetails,
      isOutletOnlyUrl,
      outletCode: stored?.outletCode,
      sectionId: stored?.sectionId,
      tableId: stored?.tableId,
      outletName: stored?.outletName,
      isOpen: stored?.isOpen,
      mobile: stored?.mobile,
      fssaiNumber: stored?.fssaiNumber,
      gstNumber: stored?.gstNumber,
      address: stored?.address,
      ownerId: stored?.ownerId,
      outletType: stored?.outletType,
      outletVegNonveg: stored?.outletVegNonveg,
      whatsapp: stored?.whatsapp,
      facebook: stored?.facebook,
      instagram: stored?.instagram,
      website: stored?.website,
      googleReview: stored?.googleReview,
      googleBusinessLink: stored?.googleBusinessLink,
      sectionName: stored?.sectionName,
      orderSettings,
      updateOrderSettings,
    };
  }, [outletInfo, isOutletOnlyUrl, orderSettings]);

  return (
    <OutletContext.Provider value={contextValue}>
      {children}
    </OutletContext.Provider>
  );
};
