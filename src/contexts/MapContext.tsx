'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

// Define types for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface MapLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface MapContextType {
  // Location data
  location: MapLocation | null;
  isLoading: boolean;
  error: string | null;
  
  // Map state
  mapLoaded: boolean;
  mapInstance: any;
  marker: any;
  
  // Functions
  getCurrentLocation: () => Promise<void>;
  setLocationByCoordinates: (lat: number, lng: number, preserveZoom?: boolean) => Promise<void>;
  setLocationByAddress: (address: string) => Promise<void>;
  initializeMap: (mapElement: HTMLElement, options?: any) => void;
  clearError: () => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

const GOOGLE_MAPS_API_KEY = 'AIzaSyBHO-yBIFWhrJRWZ0bEJEf6MSYH5KfWvsQ';
const DEFAULT_CENTER = { lat: 3.1390, lng: 101.6869 }; // Kuala Lumpur, Malaysia

export function MapProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&callback=initMap&v=beta`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        if (window.initMap) {
          window.initMap = undefined as any;
        }
      };
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  // Automatically get user location when provider mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Try Google Maps Geocoding API first
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          return data.results[0].formatted_address;
        }
      }
    } catch (error) {
      console.warn("Google Geocoding failed, trying OpenStreetMap:", error);
    }

    // Fallback to OpenStreetMap Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'ServiceFinder App/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch (error) {
      console.warn("OpenStreetMap geocoding failed:", error);
    }

    // Final fallback
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Get coordinates from address using geocoding
  const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry.location;
          return { lat, lng };
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
    return null;
  };

  // Update location and map
  const updateLocation = async (lat: number, lng: number, preserveZoom: boolean = false) => {
    const address = await getAddressFromCoordinates(lat, lng);
    
    const newLocation = {
      latitude: lat,
      longitude: lng,
      address
    };
    
    setLocation(newLocation);

    // Update map and marker if they exist
    if (mapInstanceRef.current) {
      const position = { lat, lng };
      
      // Preserve current zoom level if requested, otherwise set to default
      if (preserveZoom) {
        mapInstanceRef.current.setCenter(position);
      } else {
        mapInstanceRef.current.setCenter(position);
        mapInstanceRef.current.setZoom(15);
      }

      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: "Selected location",
          draggable: true,
        });

        // Add drag listener
        markerRef.current.addListener('dragend', () => {
          const newPosition = markerRef.current.getPosition();
          setLocationByCoordinates(newPosition.lat(), newPosition.lng(), true); // Preserve zoom on drag
        });
      }
    }
  };

  // Get current GPS location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      await updateLocation(latitude, longitude);

    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enable location services.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An error occurred while getting your location.');
        }
      } else {
        setError('An error occurred while getting your location.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Set location by coordinates
  const setLocationByCoordinates = async (lat: number, lng: number, preserveZoom: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateLocation(lat, lng, preserveZoom);
    } catch (error) {
      setError('Failed to update location');
    } finally {
      setIsLoading(false);
    }
  };

  // Set location by address
  const setLocationByAddress = async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const coordinates = await getCoordinatesFromAddress(address);
      if (coordinates) {
        await updateLocation(coordinates.lat, coordinates.lng);
      } else {
        setError('Could not find the specified address');
      }
    } catch (error) {
      setError('Failed to geocode address');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize map
  const initializeMap = (mapElement: HTMLElement, options: any = {}) => {
    if (!window.google || !mapLoaded) {
      console.warn('Google Maps not loaded yet');
      return;
    }

    const defaultOptions = {
      center: location ? { lat: location.latitude, lng: location.longitude } : DEFAULT_CENTER,
      zoom: location ? 15 : 11,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapElement, {
      ...defaultOptions,
      ...options
    });

    // Add click listener to map
    mapInstanceRef.current.addListener('click', (e: any) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLocationByCoordinates(lat, lng, true); // Preserve zoom on map click
    });

    // Add existing location marker if we have one
    if (location) {
      const position = { lat: location.latitude, lng: location.longitude };
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: "Selected location",
        draggable: true,
      });

      markerRef.current.addListener('dragend', () => {
        const newPosition = markerRef.current.getPosition();
        setLocationByCoordinates(newPosition.lat(), newPosition.lng());
      });
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const contextValue: MapContextType = {
    location,
    isLoading,
    error,
    mapLoaded,
    mapInstance: mapInstanceRef.current,
    marker: markerRef.current,
    getCurrentLocation,
    setLocationByCoordinates,
    setLocationByAddress,
    initializeMap,
    clearError,
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
} 