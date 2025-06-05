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
  const [outletInfo, setOutletInfo] = useState(() => {
    const stored = localStorage.getItem('selectedOutlet');
    return stored ? JSON.parse(stored) : null;
  });

  const [outletId, setOutletId] = useState(null);
  const [outletDetails, setOutletDetails] = useState(null);
  const [isOutletOnlyUrl, setIsOutletOnlyUrl] = useState(false);

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

  useEffect(() => {
    const fullPath = window.location.pathname;
    console.log('Full path:', fullPath);
    const segments = fullPath.split('/').filter(Boolean);
    console.log('Segments:', segments);
    const initializeOutlet = async () => {
      const params = extractOutletParamsFromPath(fullPath);

      if (params) {
        const { outletCode, sectionId, tableId } = params;
        console.log('Extracted from URL:', params);

        localStorage.setItem('outletCode', outletCode);
        localStorage.setItem('sectionId', sectionId);
        localStorage.setItem('tableId', tableId);

        await fetchOutletDetailsByCode(outletCode);
      } else {
        console.log('No outlet params found in path:', fullPath);
        // No URL pattern, try localStorage
        const storedOutletCode = localStorage.getItem('outletCode');
        const storedOutlet = localStorage.getItem('selectedOutlet');
        
        if (storedOutletCode && !storedOutlet) {
          // We have a code but no details, fetch them
          console.log('Using stored outlet code:', storedOutletCode);
          await fetchOutletDetailsByCode(storedOutletCode);
        } else if (storedOutlet) {
          console.log('Using stored outlet details');
          setOutletInfo(JSON.parse(storedOutlet));
        } else {
          // No outlet info in URL or localStorage, redirect to all-outlets
          navigate('/all-outlets', { replace: true });
        }
      }
    };

    initializeOutlet().catch(console.error);
  }, []); // Run only on mount

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
      const response = await axios.post('https://men4u.xyz/v2/user/get_restaurant_details_by_code', {
        outlet_code: outletCode
      });
      
      if (response.data?.data?.outlet_details) {
        const details = response.data.data.outlet_details;
        const formattedOutletInfo = {
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
          // Include section and table IDs
          sectionId: localStorage.getItem('sectionId'),
          tableId: localStorage.getItem('tableId')
        };

        // Store complete outlet info in localStorage
        localStorage.setItem('selectedOutlet', JSON.stringify(formattedOutletInfo));
        setOutletInfo(formattedOutletInfo);
        setOutletId(details.outlet_id);
        setOutletDetails(formattedOutletInfo);
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

  const clearOutletInfo = () => {
    localStorage.removeItem('selectedOutlet');
    localStorage.removeItem('outletCode');
    localStorage.removeItem('sectionId');
    localStorage.removeItem('tableId');
    setOutletInfo(null);
    setOutletId(null);
    setOutletDetails(null);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    outletInfo,
    updateOutletInfo,
    clearOutletInfo,
    fetchOutletDetailsByCode,
    // Convenience getters with null checks
    outletId,
    outletDetails,
    setOutletId,
    setOutletDetails,
    isOutletOnlyUrl,
    outletCode: outletInfo?.outletCode,
    sectionId: outletInfo?.sectionId,
    tableId: outletInfo?.tableId,
    outletName: outletInfo?.outletName,
    isOpen: outletInfo?.isOpen,
    mobile: outletInfo?.mobile,
    fssaiNumber: outletInfo?.fssaiNumber,
    gstNumber: outletInfo?.gstNumber,
    address: outletInfo?.address,
    ownerId: outletInfo?.ownerId,
    outletType: outletInfo?.outletType,
    outletVegNonveg: outletInfo?.outletVegNonveg,
    whatsapp: outletInfo?.whatsapp,
    facebook: outletInfo?.facebook,
    instagram: outletInfo?.instagram,
    website: outletInfo?.website,
    googleReview: outletInfo?.googleReview,
    googleBusinessLink: outletInfo?.googleBusinessLink,
    sectionName: outletInfo?.sectionName
  }), [outletInfo, outletId, outletDetails, isOutletOnlyUrl]);

  return (
    <OutletContext.Provider value={contextValue}>
      {children}
    </OutletContext.Provider>
  );
};
