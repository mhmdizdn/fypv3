'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  providerId: number;
  provider: {
    id: number;
    name: string | null;
    serviceType: string;
    latitude?: number;
    longitude?: number;
  };
}

function ServiceNavbar() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const address = searchParams?.get('address') || 'Select your location';

  // Get user name from session
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Account';

  const [showSettings, setShowSettings] = useState(false);
  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  return (
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
          Service<span className="text-[#19E6A7]">Finder</span>
        </span>
      </div>
      {/* Center: Address */}
      <div className="hidden md:flex items-center gap-2 text-white text-lg font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#111]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 1116 0c0 4.97-3.582 9-8 9z" />
          <circle cx="12" cy="12" r="3" fill="#E91E63" />
        </svg>
        <span>{address}</span>
      </div>
      {/* Right: User, Cart, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{userName}</span>
        </div>
        {/* Cart Button */}
        <button className="hover:text-[#E91E63] flex items-center" aria-label="Cart">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l1.4-7H6.6M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L19 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
          </svg>
        </button>
        <div className="relative">
          <button
            className="hover:text-[#E91E63] flex items-center"
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
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function ServiceRecommendationPage() {
  const [sort, setSort] = useState('nearby');
  const [quickFilter, setQuickFilter] = useState('');
  const [offers, setOffers] = useState<{vouchers: boolean, deals: boolean}>({vouchers: false, deals: false});
  const [search, setSearch] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  
  const searchParams = useSearchParams();
  
  // Get location coordinates from URL
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    if (lat && lng) {
      setUserCoordinates({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
    }
  }, [searchParams]);

  // Fetch services from the API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        } else {
          console.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  // Filter and sort logic
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(search.toLowerCase()) ||
    service.category.toLowerCase().includes(search.toLowerCase()) ||
    (service.provider.name && service.provider.name.toLowerCase().includes(search.toLowerCase())) ||
    service.provider.serviceType.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    if (sort === 'price-high') {
      return b.price - a.price;
    } else if (sort === 'price-low') {
      return a.price - b.price;
    } else if (sort === 'nearby' && userCoordinates) {
      // Get provider coordinates
      const aLat = a.provider.latitude || 0;
      const aLng = a.provider.longitude || 0;
      const bLat = b.provider.latitude || 0;
      const bLng = b.provider.longitude || 0;
      
      // Calculate distances
      const distanceA = calculateDistance(
        userCoordinates.lat, 
        userCoordinates.lng, 
        aLat, 
        aLng
      );
      
      const distanceB = calculateDistance(
        userCoordinates.lat, 
        userCoordinates.lng, 
        bLat, 
        bLng
      );
      
      return distanceA - distanceB;
    }
    return 0; // Default sorting (no change)
  });

  return (
    <>
      <ServiceNavbar />
      <div className="flex min-h-screen bg-[#fafafa]">
        {/* Sidebar Filters */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6 hidden md:block">
          <h2 className="text-2xl font-bold mb-6">Filters</h2>
          <div className="mb-6">
            <div className="font-semibold mb-2">Sort by</div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'nearby'} onChange={() => setSort('nearby')} /> Nearby
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'price-high'} onChange={() => setSort('price-high')} /> Price (high to low)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'price-low'} onChange={() => setSort('price-low')} /> Price (low to high)
              </label>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2">Quick filters</div>
            <div className="flex flex-col gap-2">
              <button className={`px-3 py-1 rounded-full border flex items-center gap-2 ${quickFilter === 'top' ? 'bg-[#19E6A7] text-white' : 'bg-white text-gray-700'}`} onClick={() => setQuickFilter(quickFilter === 'top' ? '' : 'top')}>
                <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 11-8.49 0M12 3v9" /></svg></span>
                Top provider
              </button>
              <button className={`px-3 py-1 rounded-full border ${quickFilter === '4+' ? 'bg-[#fff] text-[#19E6A7] border-[#19E6A7]' : 'bg-white text-gray-700'}`} onClick={() => setQuickFilter(quickFilter === '4+' ? '' : '4+')}>Ratings 4+</button>
            </div>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="w-full flex justify-center mb-8">
            <input
              type="text"
              placeholder="Search for services, providers, and categories"
              className="w-full max-w-3xl px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#19E6A7] text-lg shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 border-4 border-[#19E6A7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading services...</p>
            </div>
          ) : (
            <>
              {/* Service Providers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden relative flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden">
                      {service.imageUrl ? (
                        <img 
                          src={service.imageUrl} 
                          alt={service.name} 
                          className="object-cover w-full h-full" 
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                          <span className="text-gray-500">{service.name}</span>
                        </div>
                      )}

                      <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-[#19E6A7] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#E91E63]">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.318 6.318a4.5 4.5 0 016.364 0l.318.318.318-.318a4.5 4.5 0 116.364 6.364L12 21.364l-6.682-6.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg line-clamp-1">{service.name}</span>
                        <span className="text-yellow-500 flex items-center gap-1 text-sm font-semibold">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.382 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.382-2.454a1 1 0 00-1.176 0l-3.382 2.454c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                          5.0 <span className="text-gray-500 font-normal">({Math.floor(Math.random() * 20) + 5})</span>
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm mb-1">{service.category}</div>
                      <div className="text-gray-700 text-sm mb-2">Provider: {service.provider.name || 'Unknown'}</div>
                      <div className="line-clamp-2 text-sm text-gray-600 mb-2">{service.description}</div>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-semibold text-[#19E6A7]">RM {service.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredServices.length === 0 && (
                <div className="text-center text-gray-500 mt-12 text-lg">No services found for your search/filter.</div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
