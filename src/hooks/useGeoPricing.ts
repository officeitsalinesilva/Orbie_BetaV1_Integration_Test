import { useState, useEffect, useCallback } from 'react';
import {
  CountryPricingProfile,
  CalculatedPrice,
  TierInfo,
  TIER_DEFINITIONS,
  COUNTRY_DATABASE,
  resolveCountryProfile,
  calculateRegionalPrice,
} from '../utils/pricingEngine';

export interface GeoPricingState {
  currentCountry: CountryPricingProfile;
  tierInfo: TierInfo;
  isLoadingGeo: boolean;
  isAutoDetected: boolean;
  detectedIp?: string;
  setCountry: (countryQuery: string) => void;
  calculate: (credits: number) => CalculatedPrice;
  allCountries: CountryPricingProfile[];
}

const STORAGE_GEO_KEY = 'orb_user_geo_country';

export function useGeoPricing(initialCountryName?: string): GeoPricingState {
  const [currentCountry, setCurrentCountry] = useState<CountryPricingProfile>(() => {
    // 1. Check localStorage override
    try {
      const saved = localStorage.getItem(STORAGE_GEO_KEY);
      if (saved) return resolveCountryProfile(saved);
    } catch {}

    // 2. Check profile country or default to Brazil
    if (initialCountryName) {
      return resolveCountryProfile(initialCountryName);
    }
    return COUNTRY_DATABASE.BR;
  });

  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(true);
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);
  const [detectedIp, setDetectedIp] = useState<string>('');

  // Auto-detect country by IP on initial load
  useEffect(() => {
    let isMounted = true;

    async function detectGeo() {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        const res = await fetch(`/api/geo/detect?tz=${encodeURIComponent(tz)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.countryCode) {
            setDetectedIp(data.ip || '');
            // Only overwrite if user hasn't explicitly set a custom preference in localStorage
            const saved = localStorage.getItem(STORAGE_GEO_KEY);
            if (!saved) {
              const detected = resolveCountryProfile(data.countryCode);
              setCurrentCountry(detected);
              setIsAutoDetected(true);
            }
          }
        }
      } catch (err) {
        console.warn('Geo IP detection warning:', err);
      } finally {
        if (isMounted) setIsLoadingGeo(false);
      }
    }

    detectGeo();

    return () => {
      isMounted = false;
    };
  }, []);

  const setCountry = useCallback((countryQuery: string) => {
    const profile = resolveCountryProfile(countryQuery);
    setCurrentCountry(profile);
    setIsAutoDetected(false);
    try {
      localStorage.setItem(STORAGE_GEO_KEY, profile.countryCode);
    } catch {}
  }, []);

  const calculate = useCallback(
    (credits: number): CalculatedPrice => {
      return calculateRegionalPrice(credits, currentCountry.countryCode);
    },
    [currentCountry.countryCode]
  );

  const tierInfo = TIER_DEFINITIONS[currentCountry.tier];
  const allCountries = Object.values(COUNTRY_DATABASE);

  return {
    currentCountry,
    tierInfo,
    isLoadingGeo,
    isAutoDetected,
    detectedIp,
    setCountry,
    calculate,
    allCountries,
  };
}
