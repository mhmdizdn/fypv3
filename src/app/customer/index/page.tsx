'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useMap } from "@/contexts/MapContext";

export default function IndexPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name || (session?.user as any)?.username || "Account";
  const mapRef = useRef<HTMLDivElement>(null);

  // Use the map context
  const {
    location,
    isLoading,
    error,
    mapLoaded,
    getCurrentLocation,
    setLocationByAddress,
    initializeMap,
    clearError
  } = useMap();

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  // Initialize map when loaded and ref is available
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      initializeMap(mapRef.current);
    }
  }, [mapLoaded, initializeMap]);

  // Update address field when location changes
  useEffect(() => {
    if (location) {
      setAddress(location.address);
    }
  }, [location]);

  // Handle manual address change
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress);
    clearError();
  };

  // Handle address search/geocoding
  const handleAddressSearch = async () => {
    if (address.trim() && address !== location?.address) {
      await setLocationByAddress(address.trim());
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      return;
    }

    // Pass data to recommendation page
    const params = new URLSearchParams();
    params.append('address', address);
    
    if (location) {
      params.append('lat', location.latitude.toString());
      params.append('lng', location.longitude.toString());
    }
    
    router.push(`/customer/services/recommendation?${params.toString()}`);
  };

  return (
    <>
      {/* Navigation */}
      <nav className="w-full bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between fixed top-0 z-50">
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
          <span className="text-white font-extrabold text-2xl tracking-tight">
            Service<span className="text-[#7919e6]">Finder</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-white">
          <Link href="/customer/index" className="text-[#7919e6] font-semibold cursor-pointer">
            Home
          </Link>
          <Link href="/customer/bookings" className="hover:text-[#7919e6] transition-colors cursor-pointer">
            My Bookings
          </Link>
        </div>
        
        <div className="flex items-center gap-6 text-gray-700 text-base">
          <div className="flex items-center gap-1 text-white cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
            </svg>
            <span>{userName}</span>
          </div>
          
          <Link href="/customer/bookings" className="hover:text-[#E91E63] cursor-pointer flex items-center text-white">
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
                <a href="/customer/profile" className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</a>
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

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-[70vh] relative overflow-hidden pt-20">
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
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-100 text-center mt-16 mb-6 leading-tight">
          Find trusted services near you,<br />delivered to your door
        </h1>
        
        <form className="w-full max-w-2xl flex flex-col gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-6 mb-10" onSubmit={handleSubmit}>
          {/* Address Input and View Services Button */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex flex-1 gap-2">
              <textarea
                placeholder="Your location will be detected automatically, or enter manually"
                className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6] focus:border-[#7919e6] text-lg resize-none"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                rows={2}
                style={{ minHeight: '48px' }}
              />
              <button
                type="button"
                className="px-3 py-3 bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer rounded-lg transition-colors text-gray-200"
                onClick={handleAddressSearch}
                disabled={isLoading || !address.trim()}
                title="Search address"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
            
            <Button variant="gradient" className="px-8 py-3 cursor-pointer rounded-lg font-bold text-lg" disabled={!address.trim()}>
              View Services
            </Button>
          </div>

          {/* Loading State for Auto-Location */}
          {isLoading && !location && (
            <div className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg text-sm flex items-center">
              <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Detecting your location automatically...
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="ml-2 text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          )}

          {/* Map */}
          <div className="w-full mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-400">
                {isLoading && !location ? "Detecting your location..." : "Your location - Click on map or drag marker to adjust"}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">
                  Refresh if the pinpoint is not appear
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  disabled={isLoading}
                  className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer rounded-lg transition-colors disabled:opacity-50 text-gray-200"
                  title="Refresh page"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                </button>
              </div>
            </div>
            <div 
              ref={mapRef} 
              className="w-full h-64 rounded-lg overflow-hidden border border-white/20 bg-gray-800"
            >
              {!mapLoaded && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <svg className="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading map...
                </div>
              )}
            </div>
          </div>

          {/* Location Info */}
          {location && (
            <div className="w-full mt-2 text-center">
              <div className="bg-green-500/20 border border-green-400/30 text-green-300 rounded-lg p-3 text-sm backdrop-blur-sm">
                <div className="font-semibold">📍 Location Detected</div>
                <div className="mt-1 text-xs text-gray-300">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  You can drag the marker or click anywhere on the map to adjust
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </>
  );
}
