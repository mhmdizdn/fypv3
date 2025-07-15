'use client'
import Link from 'next/link';
import { useState, useEffect, useRef, Suspense } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { BookingForm } from '@/components/ui/booking-form';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  providerId: number;
  createdAt?: string;
  updatedAt?: string;
  provider: {
    id: number;
    name: string | null;
    username?: string;
    email?: string;
    serviceType: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  createdAt: string;
  updatedAt?: string;
  customer: {
    name: string | null;
    username: string;
  };
}

// Create a component that uses useSearchParams
function ServiceNavbarContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession(); // Add status
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const address = mounted ? (searchParams.get('address') || 'Select your location') : 'Select your location';

  // Improved username logic
  const userName = mounted && status === "authenticated" && session?.user 
    ? ((session.user as any)?.username || (session.user as any)?.name || "Account")
    : status === "loading" ? "Loading..." : "Account";

  const [showSettings, setShowSettings] = useState(false);
  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <nav className="w-full bg-gray-900/60 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between fixed top-0 z-50">
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
      {/* Center: Address */}
      <div className="hidden md:flex items-center gap-2 text-white text-lg font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="gray" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#111]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 1116 0c0 4.97-3.582 9-8 9z" />
          <circle cx="12" cy="12" r="3" fill="#E91E63" />
        </svg>
        <span>{address}</span>
      </div>
      {/* Right: User, Cart, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{userName}</span>
        </div>
        {/* Cart Button - Add "Booking" text next to the icon */}
        <Link href="/customer/bookings" className="hover:text-[#E91E63] cursor-pointer flex items-center text-white gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Booking</span>
        </Link>
        <div className="relative">
          <button
            className="hover:text-[#E91E63] cursor-pointer flex items-center text-white"
            onClick={() => setShowSettings((s) => !s)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3.75a.75.75 0 011.5 0v1.068a7.501 7.501 0 014.482 2.57l.76-.76a.75.75 0 111.06 1.06l-.76.76a7.501 7.501 0 012.57 4.482h1.068a.75.75 0 010 1.5h-1.068a7.501 7.501 0 01-2.57 4.482l.76.76a.75.75 0 11-1.06 1.06l-.76-.76a7.501 7.501 0 01-4.482 2.57v1.068a.75.75 0 01-1.5 0v-1.068a7.501 7.501 0 01-4.482-2.57l-.76.76a.75.75 0 11-1.06-1.06l.76-.76a7.501 7.501 0 012.57-4.482H3.75a.75.75 0 010-1.5h1.068a7.501 7.501 0 012.57-4.482l-.76-.76a.75.75 0 111.06-1.06l.76.76a7.501 7.501 0 014.482-2.57V3.75z" />
              <circle cx="12" cy="12" r="3" fill="#E91E63" />
            </svg>
          </button>
          {mounted && showSettings && (
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
  );
}

// Wrapped ServiceNavbar with Suspense
function ServiceNavbar() {
  return (
    <Suspense fallback={
      <div className="w-full h-16 bg-black/20 backdrop-blur-md border-b border-white/10 fixed top-0 z-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <ServiceNavbarContent />
    </Suspense>
  );
}

function ServiceRecommendationContent() {
  const [sort, setSort] = useState('nearby');
  const [quickFilter, setQuickFilter] = useState('');
  const [offers, setOffers] = useState<{vouchers: boolean, deals: boolean}>({vouchers: false, deals: false});
  const [search, setSearch] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [customerAddress, setCustomerAddress] = useState('');
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  // Add category filter states
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const searchParams = useSearchParams();
  
  // Set mounted state and get location coordinates from URL
  useEffect(() => {
    setMounted(true);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const address = searchParams.get('address');
    
    if (lat && lng) {
      setUserCoordinates({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      });
    }
    
    if (address) {
      setCustomerAddress(address);
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
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(data.services.map((service: Service) => service.category))
          ) as string[];
          
          setCategories(['all', ...uniqueCategories]);
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

  // Open service details modal
  const openServiceDetails = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetails(true);
    fetchServiceReviews(service.id);
  };

  // Fetch reviews for a specific service
  const fetchServiceReviews = async (serviceId: number) => {
    try {
      setLoadingReviews(true);
      const response = await fetch(`/api/reviews?serviceId=${serviceId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        console.error('Failed to fetch reviews');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Calculate average rating from reviews
  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Render star rating
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };
    
    return (
      <div className={`flex gap-1 ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Close service details modal
  const closeServiceDetails = () => {
    setShowServiceDetails(false);
    setSelectedService(null);
    setReviews([]);
  };

  // Open booking form
  const openBookingForm = (service: Service) => {
    setSelectedService(service);
    setShowServiceDetails(false);
    setShowBookingForm(true);
  };

  // Close booking form
  const closeBookingForm = () => {
    setShowBookingForm(false);
    setSelectedService(null);
  };

  // Handle successful booking
  const handleBookingSuccess = (booking: any) => {
    setShowBookingForm(false);
    setSelectedService(null);
    if (typeof window !== 'undefined') {
      alert('Booking created successfully! You can view it in your bookings page.');
    }
  };

  // Calculate distance text for display
  const getDistanceText = (service: Service) => {
    if (!userCoordinates || !service.provider.latitude || !service.provider.longitude) {
      return null;
    }

    const distance = calculateDistance(
      userCoordinates.lat,
      userCoordinates.lng,
      service.provider.latitude,
      service.provider.longitude
    );

    if (distance === Infinity) return null;

    // Format distance based on value
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m away`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km away`;
    } else {
      return `${distance.toFixed(0)}km away`;
    }
  };

  // Add this function right here:
  const handleNavigateToShop = (provider: any) => {
    if (provider.latitude && provider.longitude) {
      const destination = `${provider.latitude},${provider.longitude}`;
      const label = encodeURIComponent(provider.name || 'Service Provider');
      
      // Create Google Maps URL for navigation
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
      
      // For mobile devices, try to open in the native maps app
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Try to open in native maps app first
        const nativeMapsUrl = `maps://maps.google.com/maps/dir/?daddr=${destination}`;
        
        // Create a temporary link and try to open native app
        const link = document.createElement('a');
        link.href = nativeMapsUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Fallback to web version after a short delay
        setTimeout(() => {
          window.open(googleMapsUrl, '_blank');
        }, 1000);
      } else {
        // For desktop, open in new tab
        window.open(googleMapsUrl, '_blank');
      }
    } else {
      alert('Location information not available for this provider.');
    }
  };

  // Filter and sort logic
  const filteredServices = services.filter(service => {
    // Text search filter
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.category.toLowerCase().includes(search.toLowerCase()) ||
      (service.provider.name && service.provider.name.toLowerCase().includes(search.toLowerCase())) ||
      service.provider.serviceType.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    // Rating filter
    let matchesRating = true;
    if (ratingFilter !== 'all') {
      const serviceReviews = service.reviews || [];
      if (serviceReviews.length === 0 && ratingFilter !== 'no-rating') {
        matchesRating = false;
      } else if (serviceReviews.length > 0) {
        const avgRating = calculateAverageRating(serviceReviews);
        const targetRating = parseFloat(ratingFilter);
        // Check if the average rating falls within the target star range (e.g., 4.0-4.9 for "4 stars")
        matchesRating = Math.floor(avgRating) === targetRating;
      } else if (ratingFilter === 'no-rating') {
        matchesRating = serviceReviews.length === 0;
      }
    }
    
    return matchesSearch && matchesCategory && matchesRating;
  }).sort((a, b) => {
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

        {/* Main Content Area */}
        <div className="min-h-screen">
          {/* Main Content */}
          <main className="flex-1 p-6 pt-16">
            <div className="w-full flex justify-center mb-8">
              <div className="flex items-center gap-4 w-full max-w-4xl">
                <input
                  type="text"
                  placeholder="Search for services, providers, and categories"
                  className="flex-1 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#7919e6] text-lg shadow-sm text-white placeholder-gray-300"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <button
                  onClick={() => setShowFilterModal(true)}
                  className="px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                  </svg>
                  Filters
                </button>
              </div>
            </div>

            {/* Filter Modal */}
            {showFilterModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-100">Filters</h2>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="text-gray-400 hover:text-white cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Category Filter */}
                    <div className="mb-6">
                      <div className="font-semibold mb-3 text-gray-200">Category</div>
                      <div className="flex flex-col gap-3">
                        {categories.map((category) => (
                          <label key={category} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                            <input 
                              type="radio" 
                              name="category" 
                              checked={categoryFilter === category} 
                              onChange={() => setCategoryFilter(category)} 
                              className="text-[#7919e6]"
                            />
                            <span className="capitalize">
                              {category === 'all' ? 'All Categories' : category}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sort by */}
                    <div className="mb-6">
                      <div className="font-semibold mb-3 text-gray-200">Sort by</div>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input type="radio" name="sort" checked={sort === 'nearby'} onChange={() => setSort('nearby')} className="text-[#7919e6]" />
                          <span>Nearby</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input type="radio" name="sort" checked={sort === 'price-high'} onChange={() => setSort('price-high')} className="text-[#7919e6]" />
                          <span>Price (high to low)</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input type="radio" name="sort" checked={sort === 'price-low'} onChange={() => setSort('price-low')} className="text-[#7919e6]" />
                          <span>Price (low to high)</span>
                        </label>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-6">
                      <div className="font-semibold mb-3 text-gray-200">Rating</div>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === 'all'} 
                            onChange={() => setRatingFilter('all')} 
                            className="text-[#7919e6]"
                          />
                          <span>All ratings</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === '5'} 
                            onChange={() => setRatingFilter('5')} 
                            className="text-[#7919e6]"
                          />
                          <span>5 stars</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === '4'} 
                            onChange={() => setRatingFilter('4')} 
                            className="text-[#7919e6]"
                          />
                          <span>4 stars</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === '3'} 
                            onChange={() => setRatingFilter('3')} 
                            className="text-[#7919e6]"
                          />
                          <span>3 stars</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === '2'} 
                            onChange={() => setRatingFilter('2')} 
                            className="text-[#7919e6]"
                          />
                          <span>2 stars</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === '1'} 
                            onChange={() => setRatingFilter('1')} 
                            className="text-[#7919e6]"
                          />
                          <span>1 star</span>
                        </label>
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="rating" 
                            checked={ratingFilter === 'no-rating'} 
                            onChange={() => setRatingFilter('no-rating')} 
                            className="text-[#7919e6]"
                          />
                          <span className="text-sm text-gray-400">No ratings yet</span>
                        </label>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="flex-1 px-4 py-2 bg-[#7919e6] text-white rounded-lg hover:bg-[#6617c7] transition-colors cursor-pointer"
                      >
                        Apply Filters
                      </button>
                      <button
                        onClick={() => {
                          setCategoryFilter('all');
                          setRatingFilter('all');
                          setSort('nearby');
                        }}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading/Services Grid */}
            {loading ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-[#7919e6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading services...</p>
              </div>
            ) : (
              <>
                {/* Service Providers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map(service => (
                    <div 
                      key={service.id} 
                      onClick={() => openServiceDetails(service)}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-md p-6 cursor-pointer hover:bg-white/20 transition-colors"
                    >
                      <div className="relative h-48 w-full overflow-hidden">
                        {service.imageUrl ? (
                          <img 
                            src={service.imageUrl} 
                            alt={service.name} 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="bg-gray-700 w-full h-full flex items-center justify-center">
                            <span className="text-gray-300">{service.name}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-lg line-clamp-1 text-gray-100">{service.name}</span>
                        </div>
                        
                        {/* Show rating if service has reviews */}
                        {service.reviews && service.reviews.length > 0 ? (
                          <div className="flex items-center gap-2 mb-1">
                            {renderStars(calculateAverageRating(service.reviews), 'sm')}
                            <span className="text-sm text-gray-400">
                              ({calculateAverageRating(service.reviews).toFixed(1)}) • {service.reviews.length} review{service.reviews.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 mb-1">No reviews yet</div>
                        )}
                        
                        <div className="text-gray-300 text-sm mb-1">{service.category}</div>
                        <div className="text-gray-300 text-sm mb-2">Provider: {service.provider.name || 'Unknown'}</div>
                        
                        {getDistanceText(service) && (
                          <div className="text-blue-400 text-sm mb-2 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {getDistanceText(service)}
                          </div>
                        )}
                        
                        <div className="line-clamp-2 text-sm text-gray-400 mb-2">{service.description}</div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-semibold text-[#19E6A7]">RM {service.price.toFixed(2)}</span>
                          <button 
                            className="text-sm text-blue-400 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openServiceDetails(service);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredServices.length === 0 && (
                  <div className="text-center text-gray-400 mt-12 text-lg">No services found for your search/filter.</div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Service Details Modal */}
      {showServiceDetails && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end p-4">
              <button 
                onClick={closeServiceDetails} 
                className="bg-white/20 backdrop-blur-sm cursor-pointer p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 pb-6">
              {/* Service Image */}
              <div className="relative h-64 w-full mb-6">
                {selectedService.imageUrl ? (
                  <img 
                    src={selectedService.imageUrl} 
                    alt={selectedService.name} 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                ) : (
                  <div className="bg-gray-700 w-full h-full rounded-lg flex items-center justify-center">
                    <span className="text-gray-300 text-lg">{selectedService.name}</span>
                  </div>
                )}
              </div>
              
              {/* Service Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-100">{selectedService.name}</h2>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-2 text-gray-200">Description</div>
                    <p className="text-gray-300">{selectedService.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-gray-400 text-sm">Category</div>
                      <div className="font-medium text-gray-200">{selectedService.category}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Price</div>
                      <div className="font-bold text-[#19E6A7]">RM {selectedService.price.toFixed(2)}</div>
                    </div>
                    {selectedService.createdAt && (
                      <div>
                        <div className="text-gray-400 text-sm">Listed Since</div>
                        <div className="text-gray-200">{mounted ? new Date(selectedService.createdAt).toLocaleDateString('en-GB') : selectedService.createdAt}</div>
                      </div>
                    )}
                    {getDistanceText(selectedService) && (
                      <div>
                        <div className="text-gray-400 text-sm">Distance</div>
                        <div className="text-blue-400 flex items-center gap-1 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {getDistanceText(selectedService)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToShop(selectedService.provider);
                          }}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                          </svg>
                          Navigate Shop
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reviews Section */}
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-4 text-gray-200">Customer Reviews</div>
                    
                    {loadingReviews ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7919e6] mx-auto"></div>
                        <p className="text-gray-400 mt-2">Loading reviews...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4">
                        {/* Overall Rating Summary */}
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-[#7919e6]">
                                {calculateAverageRating(reviews).toFixed(1)}
                              </div>
                              <div className="flex justify-center mb-1">
                                {renderStars(calculateAverageRating(reviews), 'md')}
                              </div>
                              <div className="text-sm text-gray-400">
                                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="flex-1">
                              {[5, 4, 3, 2, 1].map(rating => {
                                const count = reviews.filter(r => r.rating === rating).length;
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                  <div key={rating} className="flex items-center gap-2 mb-1">
                                    <span className="text-sm w-2 text-gray-300">{rating}</span>
                                    <span className="text-yellow-400">★</span>
                                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                                      <div 
                                        className="bg-yellow-400 h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-400 w-8">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Individual Reviews */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-600 pb-3 last:border-b-0">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {(review.customer.name || review.customer.username).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm text-gray-200">
                                      {review.customer.name || review.customer.username}
                                    </span>
                                    {renderStars(review.rating, 'sm')}
                                  </div>
                                  {review.comment && (
                                    <p className="text-gray-300 text-sm mb-1">{review.comment}</p>
                                  )}
                                  <p className="text-xs text-gray-400">
                                    {mounted ? new Date(review.createdAt).toLocaleDateString('en-GB') : review.createdAt}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.83-.497l-5.17 1.55 1.55-5.17A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                        <p>No reviews yet</p>
                        <p className="text-sm">Be the first to review this service!</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Provider Info */}
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                  <h3 className="text-lg font-semibold mb-3 text-gray-200">Service Provider</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedService.provider.name ? selectedService.provider.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-200">{selectedService.provider.name || 'Provider'}</div>
                      <div className="text-sm text-gray-400">{selectedService.provider.serviceType}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedService.provider.phone && (
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-sm text-gray-400">Contact</div>
                          <div className="text-gray-200">
                            {selectedService.provider.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedService.provider.email && (
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <div>
                          <div className="text-sm text-gray-400">Email</div>
                          <div className="text-gray-200">{selectedService.provider.email}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedService.provider.address && (
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <div>
                          <div className="text-sm text-gray-400">Location</div>
                          <div className="text-gray-200">{selectedService.provider.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">                    
                    <Button 
                      variant="gradient" 
                      className="w-full cursor-pointer"
                      onClick={() => openBookingForm(selectedService)}
                    >
                      Book Service
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedService && (
        <BookingForm
          service={selectedService}
          onClose={closeBookingForm}
          onSuccess={handleBookingSuccess}
          customerAddress={customerAddress}
          customerCoordinates={userCoordinates}
        />
      )}
    </>
  );
}

// Main component that uses Suspense
export default function ServiceRecommendationPage() {
  return (
    <>
      <ServiceNavbar />
      <div className="min-h-screen relative overflow-hidden pt-20">
        {/* Dark gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-slate-900"></div>
        
        <Suspense fallback={
          <div className="w-full text-center py-10">
            <div className="w-12 h-12 border-4 border-[#7919e6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        }>
          <ServiceRecommendationContent />
        </Suspense>
      </div>
    </>
  );
}
