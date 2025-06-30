'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { NotificationDropdown } from '@/components/ui/notification-dropdown';

// Define Google Maps type
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

interface ProviderProfile {
  name: string;
  username: string;
  email: string;
  serviceType: string;
  phone?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [providerData, setProviderData] = useState<ProviderProfile>({
    name: '',
    username: '',
    email: '',
    serviceType: '',
    phone: '',
    latitude: null,
    longitude: null,
    address: null
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Map related states
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    // Check if user is logged in and is a service provider
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.isAuthenticated || data.userType !== 'serviceProvider') {
          router.push('/login');
        } else {
          fetchProviderData();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

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

  // Initialize map when Google Maps is loaded and provider data is fetched
  useEffect(() => {
    if (mapLoaded && !isLoading && mapRef.current) {
      const defaultLocation = { lat: 3.140853, lng: 101.693207 }; // Default to KL
      const shopLocation = providerData.latitude && providerData.longitude 
        ? { lat: providerData.latitude, lng: providerData.longitude }
        : defaultLocation;

      if (!googleMapRef.current) {
        // Create new map
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          center: shopLocation,
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
          updateShopLocation(clickedLocation);
        });
      } else {
        // Update existing map center
        googleMapRef.current.setCenter(shopLocation);
      }
      
      // Update or create marker
      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: shopLocation,
          map: googleMapRef.current,
          title: "Shop Location",
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
          updateShopLocation(newLocation);
        });
      } else {
        markerRef.current.setPosition(shopLocation);
      }
    }
  }, [mapLoaded, isLoading, providerData.latitude, providerData.longitude]);

  const fetchProviderData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/provider/profile');
      if (response.ok) {
        const data = await response.json();
        setProviderData(data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while loading profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProviderData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Update shop location
  const updateShopLocation = async (location: { lat: number, lng: number }) => {
    setProviderData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
    
    // Update marker position
    if (markerRef.current) {
      markerRef.current.setPosition(location);
    }

    // Fetch address from coordinates
    try {
      const address = await fetchAddressFromCoordinates(location.lat, location.lng);
      setProviderData(prev => ({
        ...prev,
        address: address
      }));
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  // Fetch address using coordinates
  const fetchAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using Nominatim (OpenStreetMap)
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
          // Create a readable address from components
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
        }
      }
      
      // Fallback to coordinates
      return `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Error getting address:", error);
      return `Latitude: ${lat.toFixed(6)}, Longitude: ${lng.toFixed(6)}`;
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(providerData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Password updated successfully' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'An error occurred while updating password' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-slate-900"></div>
      
      {/* Top gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, #1e1b4b, #312e81)`
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      
      {/* Bottom gradient overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            background: `linear-gradient(to top right, #0f172a, #1e293b)`
          }}
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 opacity-15 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
      {/* Navigation Bar */}
      <nav className="w-full bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between fixed top-0 z-50">
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
        {/* Center: Service Type */}
        <div className="hidden md:flex items-center gap-2 text-white text-lg font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span>{providerData.serviceType}</span>
        </div>
        {/* Right: User, Cart, Settings */}
                <div className="flex items-center gap-6 text-white text-base">          <div className="flex items-center gap-1 cursor-pointer">            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />            </svg>            <span>{providerData.name || providerData.username}</span>          </div>          {providerData.phone && (            <div className="flex items-center gap-1">              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />              </svg>              <span>{providerData.phone}</span>            </div>          )}
          {/* Notifications */}
          <NotificationDropdown />
          <div className="relative">
            <button
              className="hover:text-[#E91E63] flex items-center cursor-pointer"
              onClick={() => setShowSettings((s) => !s)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3.75a.75.75 0 011.5 0v1.068a7.501 7.501 0 014.482 2.57l.76-.76a.75.75 0 111.06 1.06l-.76.76a7.501 7.501 0 012.57 4.482h1.068a.75.75 0 010 1.5h-1.068a7.501 7.501 0 01-2.57 4.482l.76.76a.75.75 0 11-1.06 1.06l-.76-.76a7.501 7.501 0 01-4.482 2.57v1.068a.75.75 0 01-1.5 0v-1.068a7.501 7.501 0 01-4.482-2.57l-.76.76a.75.75 0 11-1.06-1.06l.76-.76a7.501 7.501 0 01-2.57-4.482H3.75a.75.75 0 010-1.5h1.068a7.501 7.501 0 012.57-4.482l-.76-.76a.75.75 0 111.06-1.06l.76.76a7.501 7.501 0 014.482-2.57V3.75z" />
                <circle cx="12" cy="12" r="3" fill="#E91E63" />
              </svg>
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-32 text-black bg-white border rounded shadow-lg z-50">
                <a href="/provider/dashboard" className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Dashboard</a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-black hover:bg-gray-100 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Provider Profile</h1>
          <p className="text-gray-600">Manage your profile information</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Profile Completion Status */}
            {(!providerData.phone || !providerData.latitude || !providerData.longitude) && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Complete Your Profile to Add Services</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        To add services on the platform, you need to complete the following required fields:
                        {!providerData.phone && <span className="font-medium"> Phone Number</span>}
                        {!providerData.phone && (!providerData.latitude || !providerData.longitude) && <span>, </span>}
                        {(!providerData.latitude || !providerData.longitude) && <span className="font-medium"> Shop Location</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Information */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                
                {message.text && (
                  <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                  </div>
                )}
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={providerData.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={providerData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={providerData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Service Type</label>
                    <input
                      type="text"
                      name="serviceType"
                      value={providerData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                      <span className="text-sm text-gray-500 font-normal">(Required to add services)</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={providerData.phone || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                        !providerData.phone ? 'border-red-300 focus:ring-red-500' : 'focus:ring-blue-500'
                      }`}
                      placeholder="Enter your phone number"
                    />
                    {!providerData.phone && (
                      <p className="text-red-500 text-sm mt-1">Phone number is required to add services</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                      Shop Location <span className="text-red-500">*</span>
                      <span className="text-sm text-gray-500 font-normal">(Required to add services)</span>
                    </label>
                    <div 
                      ref={mapRef} 
                      className={`w-full h-96 rounded-lg border mb-2 ${
                        !providerData.latitude || !providerData.longitude ? 'border-red-300' : 'border-gray-300'
                      }`}
                    ></div>
                    <p className="text-sm text-gray-500 mb-2">Click on the map or drag the marker to set your shop location</p>
                    {(!providerData.latitude || !providerData.longitude) && (
                      <p className="text-red-500 text-sm mb-2">Shop location is required to add services</p>
                    )}
                    {mapError && (
                      <p className="text-red-500 text-sm">{mapError}</p>
                    )}
                    <div className="mb-2">
                      <label className="block text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={providerData.address || ''}
                        readOnly
                        className="w-full px-3 py-2 border rounded bg-gray-50"
                      />
                      <p className="text-xs text-gray-500 mt-1">This address is automatically generated from your shop location</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 mb-1">Latitude</label>
                        <input
                          type="text"
                          value={providerData.latitude?.toString() || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-1">Longitude</label>
                        <input
                          type="text"
                          value={providerData.longitude?.toString() || ''}
                          readOnly
                          className="w-full px-3 py-2 border rounded bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      variant="gradient"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Change Password */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                
                <form onSubmit={handlePasswordUpdate}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSaving}
                      variant="gradient"
                    >
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
                <Button
                  onClick={() => router.push('/provider/dashboard')}
                  variant="outline"
                  className="w-full mb-2"
                >
                  Return to Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="danger"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
} 