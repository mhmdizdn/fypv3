'use client';
import { Footer } from "@/components/ui/footer";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

// Define type for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function IndexPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [addressOptions, setAddressOptions] = useState<string[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [locatingAccuracy, setLocatingAccuracy] = useState<number | null>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isCustomMarker, setIsCustomMarker] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name || (session?.user as any)?.username || "Account";

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  // Load Google Maps API
  useEffect(() => {
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHO-yBIFWhrJRWZ0bEJEf6MSYH5KfWvsQ&loading=async&callback=initMap&v=beta`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setMapLoaded(true);
      };
      
      document.head.appendChild(script);
      
      return () => {
        // Clean up the script when component unmounts
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
        // Safe way to delete the property
        if (window.initMap) {
          window.initMap = undefined as any;
        }
      };
    } else if (window.google) {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map when Google Maps is loaded and we have a location
  useEffect(() => {
    if (mapLoaded && userLocation && mapRef.current) {
      if (!googleMapRef.current) {
        // Create new map
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 15,
          mapId: 'DEMO_MAP_ID',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        // Add a click listener to the map to allow location adjustment by clicking
        googleMapRef.current.addListener('click', (e: any) => {
          const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
          };
          updateUserLocation(clickedLocation, true);
        });
      } else {
        // Update existing map
        googleMapRef.current.setCenter(userLocation);
      }
      
      // Update or create marker
      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: userLocation,
          map: googleMapRef.current,
          title: "Your location",
          animation: window.google.maps.Animation.DROP,
          draggable: true, // Allow marker to be dragged
        });

        // Add event listener for when the marker is dragged
        markerRef.current.addListener('dragend', () => {
          const newPosition = markerRef.current.getPosition();
          const newLocation = {
            lat: newPosition.lat(),
            lng: newPosition.lng()
          };
          updateUserLocation(newLocation, true);
        });
      } else {
        markerRef.current.setPosition(userLocation);
      }
    }
  }, [mapLoaded, userLocation]);

  // Clear any existing location watch when component unmounts
  useEffect(() => {
    return () => {
      if (locationWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [locationWatchId]);

  // Function to update location after manual adjustment
  const updateUserLocation = (newLocation: {lat: number, lng: number}, isCustom: boolean = false) => {
    setUserLocation(newLocation);
    setIsCustomMarker(isCustom);
    
    // Update address for the new location
    fetchAddressFromCoordinates(newLocation.lat, newLocation.lng);
    
    // If marker exists, update its position
    if (markerRef.current) {
      markerRef.current.setPosition(newLocation);
    }
    
    // If map exists, pan to the new location
    if (googleMapRef.current) {
      googleMapRef.current.panTo(newLocation);
    }
  };

  // Modified handleInitialLocation to work with the updateUserLocation function
  const handleInitialLocation = (position: GeolocationPosition) => {
    console.log("Initial position accuracy:", position.coords.accuracy, "meters");
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    // Only accept locations with reasonable accuracy (under 5000 meters)
    if (position.coords.accuracy > 5000) {
      setMapError("Location accuracy is very poor (±" + Math.round(position.coords.accuracy) + "m). Please try again in a better location or with a different device.");
      setLocating(false);
      return;
    }
    
    // Use the updateUserLocation function
    updateUserLocation({ lat, lng }, false);
    setLocatingAccuracy(position.coords.accuracy);
  };
  
  // Modified handleWatchLocation to work with the updateUserLocation function
  const handleWatchLocation = (position: GeolocationPosition) => {
    console.log("Watch position accuracy:", position.coords.accuracy, "meters");
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Check for unreasonable accuracy values (likely GPS errors)
    if (position.coords.accuracy > 5000) {
      console.warn("Ignoring location with poor accuracy:", position.coords.accuracy);
      
      // If we've tried several times and still have poor accuracy, give up
      if (newAttempts > 3 && !userLocation) {
        setMapError("Unable to get accurate location after multiple attempts. Please try again later or enter your address manually.");
        setLocating(false);
        
        if (locationWatchId !== null) {
          navigator.geolocation.clearWatch(locationWatchId);
          setLocationWatchId(null);
        }
      }
      
      return;
    }
    
    // Update location if it's more accurate or if we don't have a location yet
    if (!userLocation || position.coords.accuracy < (locatingAccuracy || Infinity)) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Skip update if user has manually adjusted the marker
      if (!isCustomMarker) {
        updateUserLocation({ lat, lng }, false);
        setLocatingAccuracy(position.coords.accuracy);
      }
      
      // Stop watching if we have good accuracy
      if (position.coords.accuracy < 50) {
        if (locationWatchId !== null) {
          console.log("Location accuracy is good enough, stopping watch");
          navigator.geolocation.clearWatch(locationWatchId);
          setLocationWatchId(null);
          setLocating(false);
        }
      }
    }
    
    // Stop watching after reasonable attempts
    if (newAttempts > 10) {
      if (locationWatchId !== null) {
        console.log("Max attempts reached, stopping watch");
        navigator.geolocation.clearWatch(locationWatchId);
        setLocationWatchId(null);
        setLocating(false);
      }
    }
  };

  // Function to find a more accurate location with improved options
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }
    
    // Clear any existing watch
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
    }
    
    setLocating(true);
    setMapError(null);
    setAttempts(0);
    
    try {
      // Add a message to show we're trying to get location
      setMapError("Requesting your precise location. This may take a moment...");
      
      // Request one-time position with maximum accuracy
      navigator.geolocation.getCurrentPosition(
        handleInitialLocation,
        handleLocationError,
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
      );
      
      // Then set up continuous location watching for more accuracy
      const watchId = navigator.geolocation.watchPosition(
        handleWatchLocation,
        (error) => {
          // Only show watch errors if we haven't gotten a position yet
          if (!userLocation) {
            handleLocationError(error);
          }
        },
        { 
          enableHighAccuracy: true, 
          timeout: 15000, 
          maximumAge: 0 
        }
      );
      
      setLocationWatchId(watchId);
    } catch (error) {
      setMapError("Unexpected error accessing geolocation. Please try again.");
      setLocating(false);
    }
  };
  
  // Fetch address from coordinates using multiple services for reliability
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      // First try Nominatim (OpenStreetMap)
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const response = await fetch(nominatimUrl, { 
        headers: { 
          'Accept-Language': 'en',
          'User-Agent': 'ServiceFinder App/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          // Create a more readable address from components
          const formattedAddress = formatNominatimAddress(data);
          setAddress(formattedAddress);
          setAddressOptions([formattedAddress]);
          setMapError(null);
          return;
        }
      }
      
      // Last resort - use coordinates
      setAddress(`Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`);
      
    } catch (error) {
      console.error("Error getting address:", error);
      // Don't override address if we already have one
      if (!address) {
        setAddress(`Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`);
      }
    } finally {
      // If this is our first successful location
      if (!userLocation) {
        setLocating(false);
      }
    }
  };
  
  // Format Nominatim address response into a readable format
  const formatNominatimAddress = (data: any): string => {
    const addr = data.address;
    const components = [];
    
    // Building or place name
    if (addr.building || addr.amenity || addr.shop) {
      components.push(addr.building || addr.amenity || addr.shop);
    }
    
    // Street address
    if (addr.road) {
      const roadPart = addr.house_number ? `${addr.road}, ${addr.house_number}` : addr.road;
      components.push(roadPart);
    }
    
    // Neighborhood
    if (addr.suburb || addr.neighbourhood) {
      components.push(addr.suburb || addr.neighbourhood);
    }
    
    // City, state, postal code
    const cityPart = [];
    if (addr.city || addr.town || addr.village) {
      cityPart.push(addr.city || addr.town || addr.village);
    }
    
    if (addr.state || addr.county) {
      cityPart.push(addr.state || addr.county);
    }
    
    if (addr.postcode) {
      cityPart.push(addr.postcode);
    }
    
    if (cityPart.length > 0) {
      components.push(cityPart.join(", "));
    }
    
    // Country
    if (addr.country) {
      components.push(addr.country);
    }
    
    return components.length > 0 ? components.join(", ") : data.display_name;
  };

  // Handle location errors
  const handleLocationError = (error: GeolocationPositionError) => {
    console.error("Geolocation error:", error);
    let errorMessage = "Error getting location";
    
    switch(error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location access denied. Please enable location permissions in your browser settings.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable. Please try again or enter your address manually.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out. Please try again or check your internet connection.";
        break;
      default:
        errorMessage = `Error getting location: ${error.message}`;
    }
    
    setMapError(errorMessage);
    setLocating(false);
    
    // Clean up watch if there is one
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
  };

  // Handle form submission to pass address to recommendation page
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setMapError("Please enter an address or use the 'Locate me' button");
      return;
    }
    
    // Pass both address and coordinates (if available) to the recommendation page
    const params = new URLSearchParams();
    params.append('address', address);
    
    if (userLocation) {
      params.append('lat', userLocation.lat.toString());
      params.append('lng', userLocation.lng.toString());
    }
    
    router.push(`/customer/services/recommendation?${params.toString()}`);
  };

  return (
    <>
      <nav className="w-full bg-[#111] border-b border-black/30 px-6 py-3 flex items-center justify-between">
      {/* Left: Logo and App Name */}
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="/servicefinder-logo.png"
            alt="ServiceFinder Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <span className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif", letterSpacing: "0.01em" }}>
          Service<span className="text-[#7919e6]">Finder</span>
        </span>
      </div>
      {/* Center: Navigation */}
      <div className="hidden md:flex items-center gap-6 text-white">
        <Link href="/customer/index" className="text-[#7919e6] font-semibold">
          Home
        </Link>
        <Link href="/customer/bookings" className="hover:text-[#7919e6] transition-colors" >
          My Bookings
        </Link>
      </div>
      {/* Right: User, Cart, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{userName}</span>

        </div>
        {/* My Bookings Button */}
        <Link href="/customer/bookings" className="hover:text-[#E91E63] cursor-pointer flex items-center text-white" aria-label="My Bookings">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </Link>
        <div className="relative">
          <button
            className="hover:text-[#E91E63] cursor-pointer flex items-center text-white"
            onClick={() => setShowSettings((s) => !s)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3.75a.75.75 0 011.5 0v1.068a7.501 7.501 0 014.482 2.57l.76-.76a.75.75 0 111.06 1.06l-.76.76a7.501 7.501 0 012.57 4.482h1.068a.75.75 0 010 1.5h-1.068a7.501 7.501 0 01-2.57 4.482l.76.76a.75.75 0 11-1.06 1.06l-.76-.76a7.501 7.501 0 01-4.482 2.57v1.068a.75.75 0 01-1.5 0v-1.068a7.501 7.501 0 01-4.482-2.57l-.76.76a.75.75 0 11-1.06-1.06l.76-.76a7.501 7.501 0 01-2.57-4.482H3.75a.75.75 0 010-1.5h1.068a7.501 7.501 0 012.57-4.482l-.76-.76a.75.75 0 111.06-1.06l.76.76a7.501 7.501 0 014.482-2.57V3.75z" />
              <circle cx="12" cy="12" r="3" fill="#E91E63" />
            </svg>
          </button>
          {showSettings && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
              <a href="/customer/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
      
      <main className="flex flex-col items-center justify-center min-h-[70vh] bg-[#fafafa] relative overflow-hidden">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 text-center mt-16 mb-6 leading-tight">
          Find trusted services near you,<br />delivered to your door
        </h1>
        <form className="w-full max-w-2xl flex flex-col gap-4 bg-white rounded-xl shadow-lg p-4 mb-10" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row items-center gap-4">
              <textarea
                placeholder="Enter your location or address"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7919e6] text-lg resize-none overflow-hidden"
                value={address}
                onChange={e => {
                  setAddress(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                rows={1}
                style={{ minHeight: '48px', maxHeight: '200px' }}
              />
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 px-4 py-3 bg-white border border-[#7919e6] text-[#7919e6] rounded-lg font-semibold hover:bg-[#e6fcf5] transition-colors disabled:opacity-50"
              onClick={handleLocateMe}
              disabled={locating}
            >
              {locating ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#7919e6]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Locating...
                </>
              ) : (
                <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 ">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
              </svg>
              Locate me
                </>
              )}
            </button>
            <Button variant="gradient" className="px-6 py-3 rounded-lg cursor-pointer font-bold text-lg">
              View Services
            </Button>
          </div>
          
          {mapError && (
            <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {mapError}
            </div>
          )}
          
          {userLocation && (
            <>
              <div className="w-full mt-4 flex flex-col items-center">
                <div className="bg-gray-100 rounded-lg p-2 w-full max-w-md text-sm text-gray-700 text-center">
                  Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  {locatingAccuracy && !isCustomMarker && (
                    <div className={`text-xs mt-1 ${locatingAccuracy > 1000 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                      Accuracy: ±{locatingAccuracy < 1 ? "< 1" : Math.round(locatingAccuracy)} meter{locatingAccuracy !== 1 ? "s" : ""}
                      {locatingAccuracy > 1000 && " (Poor accuracy)"}
                    </div>
                  )}
                  {isCustomMarker && (
                    <div className="text-xs mt-1 text-blue-500">
                      Custom location (manually adjusted)
                    </div>
                  )}
                </div>
              </div>
              
              {/* Google Maps container with instructions */}
              <div className="mt-2 text-sm text-gray-600 text-center px-4">
                You can adjust your location by dragging the pin or clicking anywhere on the map
              </div>
              <div 
                ref={mapRef} 
                className="w-full h-64 md:h-80 mt-2 rounded-lg overflow-hidden border border-gray-200"
              ></div>
            </>
          )}
        </form>
      </main>
      
      <Footer />
    </>
  );
}
