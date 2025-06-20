import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';
import { Platform } from 'react-native';

export type MeasurementSystem = 'metric' | 'imperial';

interface LocationContextType {
  measurementSystem: MeasurementSystem;
  location: Location.LocationObject | null;
  isLoading: boolean;
  requestLocationPermission: () => Promise<void>;
  setMeasurementSystem: (system: MeasurementSystem) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

// Countries that primarily use imperial system
const IMPERIAL_COUNTRIES = ['US', 'LR', 'MM']; // United States, Liberia, Myanmar

export const LocationProvider = ({ children }: LocationProviderProps) => {
  const [measurementSystem, setMeasurementSystemState] = useState<MeasurementSystem>('metric');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'web') {
      // For web, we'll use a fallback approach
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        const countryCode = data.country_code;
        
        if (IMPERIAL_COUNTRIES.includes(countryCode)) {
          setMeasurementSystemState('imperial');
        } else {
          setMeasurementSystemState('metric');
        }
      } catch (error) {
        console.log('Could not determine location, defaulting to metric');
        setMeasurementSystemState('metric');
      }
      return;
    }

    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Reverse geocode to get country
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const countryCode = reverseGeocode[0].isoCountryCode;
        
        if (countryCode && IMPERIAL_COUNTRIES.includes(countryCode)) {
          setMeasurementSystemState('imperial');
        } else {
          setMeasurementSystemState('metric');
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setMeasurementSystem = (system: MeasurementSystem) => {
    setMeasurementSystemState(system);
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const value = {
    measurementSystem,
    location,
    isLoading,
    requestLocationPermission,
    setMeasurementSystem,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};