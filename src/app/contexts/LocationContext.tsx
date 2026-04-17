import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'shop' | 'store';
  city: string;
  state: string;
  address_line1: string;
  address_line2?: string;
  pin_code?: string;
  is_active: boolean;
  total_products: number;
  total_stock_value: number;
  out_of_stock_count?: number;
}

interface LocationContextType {
  selectedLocationId: string | null;
  selectedLocationName: string;
  locationsList: Location[];
  isLoadingLocations: boolean;
  setSelectedLocation: (id: string | null, name: string) => void;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const LS_KEY = 'stocksense_selected_location';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LS_KEY) || null;
    } catch {
      return null;
    }
  });
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [locationsList, setLocationsList] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const fetchLocations = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoadingLocations(true);
    try {
      const res = await api.get('/locations/', { params: { include_inactive: false } });
      const list: Location[] = Array.isArray(res.data)
        ? res.data
        : (res.data?.items ?? res.data?.locations ?? res.data?.data ?? []);
      setLocationsList(list);

      // Restore selectedLocationName from list
      if (selectedLocationId) {
        const found = list.find(l => l.id === selectedLocationId);
        if (found) {
          setSelectedLocationName(found.name);
        } else {
          // Previously selected location no longer exists — reset
          setSelectedLocationId(null);
          setSelectedLocationName('');
          localStorage.removeItem(LS_KEY);
        }
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setIsLoadingLocations(false);
    }
  }, [isLoggedIn, selectedLocationId]);

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const setSelectedLocation = useCallback((id: string | null, name: string) => {
    setSelectedLocationId(id);
    setSelectedLocationName(name);
    if (id) {
      localStorage.setItem(LS_KEY, id);
    } else {
      localStorage.removeItem(LS_KEY);
    }
  }, []);

  const refreshLocations = useCallback(async () => {
    setIsLoadingLocations(true);
    try {
      const res = await api.get('/locations/', { params: { include_inactive: false } });
      const list: Location[] = Array.isArray(res.data)
        ? res.data
        : (res.data?.items ?? res.data?.locations ?? res.data?.data ?? []);
      setLocationsList(list);
    } catch (err) {
      console.error('Failed to refresh locations:', err);
    } finally {
      setIsLoadingLocations(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      selectedLocationId,
      selectedLocationName,
      locationsList,
      isLoadingLocations,
      setSelectedLocation,
      refreshLocations,
    }),
    [selectedLocationId, selectedLocationName, locationsList, isLoadingLocations, setSelectedLocation, refreshLocations]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}
