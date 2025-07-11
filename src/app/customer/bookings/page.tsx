'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Import the RatingModal component
const RatingModal = require('@/components/ui/rating-modal').RatingModal;

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  createdAt: string;
  updatedAt?: string;
}

// Update the Booking interface to include provider location fields
interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  review?: Review;
  service: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    provider: {
      id: number;
      name: string | null;
      serviceType: string;
      phone?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    };
  };
}

function CustomerNavbar() {
  const { data: session, status } = useSession();
  const [showSettings, setShowSettings] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = mounted && session?.user 
    ? ((session.user as any)?.name || (session.user as any)?.username || "Account")
    : "Account";

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  return (
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
      
      {/* Center: Navigation */}
      <div className="hidden md:flex items-center gap-6 text-white">
        <Link href="/customer/index" className="hover:text-[#7919e6] transition-colors cursor-pointer">
          Home
        </Link>
        <Link href="/customer/bookings" className="text-[#7919e6] font-semibold cursor-pointer">
          My Bookings
        </Link>
      </div>

      {/* Right: User, Cart, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{userName}</span>
        </div>
        
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

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({ isOpen: false, booking: null });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings?userType=customer');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (typeof window !== 'undefined' && !confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      } else {
        const errorData = await response.json();
        if (typeof window !== 'undefined') {
          alert(errorData.error || 'Failed to cancel booking');
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        alert('Network error. Please try again.');
      }
    }
  };

  const handleOpenRatingModal = (booking: Booking) => {
    setRatingModal({ isOpen: true, booking });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({ isOpen: false, booking: null });
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!ratingModal.booking) return;

    try {
      setSubmittingReview(true);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: ratingModal.booking.id,
          rating,
          comment,
        }),
      });

      if (response.ok) {
        // Refresh bookings to show the new review
        await fetchBookings();
        handleCloseRatingModal();
        if (typeof window !== 'undefined') {
          alert('Thank you for your review!');
        }
      } else {
        const errorData = await response.json();
        if (typeof window !== 'undefined') {
          alert(errorData.error || 'Failed to submit review');
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        alert('Network error. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REJECTED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!mounted) return dateString;
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAddress = (address: string) => {
    // Check if the address contains GPS coordinates
    if (address.startsWith('GPS Coordinates:')) {
      const parts = address.split(' | ');
      const coordsPart = parts[0].replace('GPS Coordinates: ', '');
      const addressPart = parts[1]?.replace('Address: ', '') || '';
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-xs font-medium text-blue-600">GPS Location</span>
          </div>
          <div className="font-mono text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
            {coordsPart}
          </div>
          {addressPart && (
            <div className="text-xs text-gray-600">
              {addressPart}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-sm text-gray-600">{address}</span>;
  };

  // Replace the existing getNavigationUrl function with this new one for provider navigation
  const getProviderNavigationUrl = (provider: Booking['service']['provider']) => {
    // If provider has GPS coordinates, use them
    if (provider.latitude && provider.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`;
    }
    
    // If provider has address, use it
    if (provider.address) {
      // Check if the address contains GPS coordinates
      if (provider.address.startsWith('GPS Coordinates:')) {
        const parts = provider.address.split(' | ');
        const coordsPart = parts[0].replace('GPS Coordinates: ', '');
        const [lat, lng] = coordsPart.split(', ').map(coord => coord.trim());
        
        // Return Google Maps URL for navigation
        return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      } else {
        // Use address for navigation
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(provider.address)}`;
      }
    }
    
    return null;
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <>
        <CustomerNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7919e6] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CustomerNavbar />
      <div className="min-h-screen relative overflow-hidden pt-20">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-100">My Bookings</h1>
            <p className="mt-2 text-gray-400">Manage and track your service bookings</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Bookings' },
                  { key: 'PENDING', label: 'Pending' },
                  { key: 'CONFIRMED', label: 'Confirmed' },
                  { key: 'IN_PROGRESS', label: 'In Progress' },
                  { key: 'COMPLETED', label: 'Completed' },
                  { key: 'CANCELLED', label: 'Cancelled' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`cursor-pointer py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === tab.key
                        ? 'border-[#7919e6] text-[#7919e6]'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-200">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-400">
                {filter === 'all' ? 'You haven\'t made any bookings yet.' : `No ${filter.toLowerCase()} bookings found.`}
              </p>
              <div className="mt-6">
                <Link href="/customer/index">
                  <Button variant="gradient">
                    Find Services
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-md p-6 cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                                          <div>
                        <h3 className="text-xl font-semibold text-gray-100">{booking.service.name}</h3>
                        <p className="text-gray-300">{booking.service.description}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Provider: {booking.service.provider.name || 'Service Provider'}
                        </p>
                      </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Booking Details</h4>
                      <p className="text-sm text-gray-300">Date: {formatDate(booking.scheduledDate)}</p>
                      <p className="text-sm text-gray-300">Time: {booking.scheduledTime}</p>
                      <p className="text-sm text-gray-300">Amount: RM {booking.totalAmount.toFixed(2)}</p>
                      {booking.service.provider.phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-300">Provider Contact</p>
                          <p className="text-sm text-gray-200">{booking.service.provider.phone}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Service Location</h4>
                      {formatAddress(booking.customerAddress)}
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-200 mb-2">Notes</h4>
                      <p className="text-sm text-gray-300">{booking.notes}</p>
                    </div>
                  )}

                  {/* Show existing review if available */}
                  {booking.review && (
                    <div className="mb-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                      <h4 className="font-medium text-gray-200 mb-2">Your Review</h4>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(booking.review.rating)}
                        <span className="text-sm text-gray-300">
                          ({booking.review.rating}/5)
                        </span>
                      </div>
                      {booking.review.comment && (
                        <p className="text-sm text-gray-300 mb-2">{booking.review.comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mb-3">
                        Reviewed on {formatDate(booking.review.createdAt)}
                      </p>
                      
                      {/* Provider Response */}
                      {booking.review.providerComment && (
                        <div className="bg-[#7919e6]/20 border-l-4 border-[#7919e6] p-3 rounded">
                          <h5 className="font-medium text-gray-200 mb-1">Provider Response:</h5>
                          <p className="text-sm text-gray-300">{booking.review.providerComment}</p>
                          {booking.review.updatedAt && (
                            <p className="text-xs text-gray-400 mt-2">
                              Responded on {formatDate(booking.review.updatedAt)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                                      <div className="flex justify-between items-center pt-4 border-t border-white/20">
                    <p className="text-sm text-gray-400">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {booking.status === 'PENDING' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          Cancel Booking
                        </Button>
                      )}
                      {/* Add rating button for completed bookings without reviews */}
                      {booking.status === 'COMPLETED' && !booking.review && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenRatingModal(booking)}
                          className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                          </svg>
                          Rate Service
                        </Button>
                      )}
                      {/* Updated navigate button to go to provider shop */}
                      {getProviderNavigationUrl(booking.service.provider) && booking.status !== 'COMPLETED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              const navUrl = getProviderNavigationUrl(booking.service.provider);
                              if (navUrl) {
                                window.open(navUrl, '_blank');
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.158.69-.158 1.006 0l4.994 2.497c.317.158.69.158 1.007 0z" />
                          </svg>
                          Navigate Shop
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={handleCloseRatingModal}
        onSubmit={handleSubmitReview}
        serviceName={ratingModal.booking?.service.name || ''}
        loading={submittingReview}
      />
    </>
  );
} 
