'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { CompletionEvidenceModal } from '@/components/ui/completion-evidence-modal';
import { CompletionEvidenceViewer } from '@/components/ui/completion-evidence-viewer';

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
  service: {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
  };
  customer: {
    id: number;
    name: string | null;
    email: string;
    username: string;
  };
  completionImage?: string;
}

function ProviderNavbar() {
  const { data: session } = useSession();
  const userName = (session?.user as any)?.name || (session?.user as any)?.username || "Provider";
  const [showSettings, setShowSettings] = useState(false);

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
        <Link href="/provider/dashboard" className="hover:text-[#7919e6] transition-colors cursor-pointer">
          Dashboard
        </Link>
        <Link href="/provider/bookings" className="text-[#7919e6] font-semibold cursor-pointer">
          Bookings
        </Link>
        <Link href="/provider/reviews" className="hover:text-[#7919e6] transition-colors cursor-pointer">
          Reviews
        </Link>
      </div>

      {/* Right: User, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{userName}</span>
        </div>
        
        <NotificationDropdown />
        
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
              <a href="/provider/profile" className="block px-4 py-2 hover:bg-gray-100 text-black">Profile</a>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
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

export default function ProviderBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings?userType=provider');
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

  const handleUpdateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to update booking status');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  // Add these functions at the top of your component
  const canStartService = (scheduledDate: string, scheduledTime: string) => {
    const now = new Date(); // Uses local device time
    const [hours, minutes] = scheduledTime.split(':');
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return now >= scheduledDateTime;
  };

  const getTimeUntilStart = (scheduledDate: string, scheduledTime: string) => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':');
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const timeDiff = scheduledDateTime.getTime() - now.getTime();
    if (timeDiff <= 0) return null;
    
    const hoursLeft = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursLeft > 0) {
      return `${hoursLeft}h ${minutesLeft}m`;
    }
    return `${minutesLeft}m`;
  };

  // Update the getAvailableActions function
  const getAvailableActions = (booking: Booking) => {
    const { status, scheduledDate, scheduledTime } = booking;
    
    switch (status) {
      case 'PENDING':
        return [
          { label: 'Confirm', status: 'CONFIRMED', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: 'Reject', status: 'REJECTED', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'CONFIRMED':
        const canStart = canStartService(scheduledDate, scheduledTime);
        const timeUntil = getTimeUntilStart(scheduledDate, scheduledTime);
        return [
          { 
            label: canStart ? 'Start Service' : `Wait ${timeUntil}`, 
            status: 'IN_PROGRESS', 
            color: canStart ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500',
            disabled: !canStart
          }
        ];
      case 'IN_PROGRESS':
        return [
          { 
            label: 'Complete with Evidence',
            action: () => {
              setSelectedBookingId(booking.id);
              setShowCompletionModal(true);
            },
            color: 'bg-purple-600 hover:bg-purple-700'
          }
        ];
      default:
        return [];
    }
  };

  // Add this effect to update the UI every minute
  useEffect(() => {
    const timer = setInterval(() => {
      // Force re-render to update time displays
      setBookings(prev => [...prev]);
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-900/30 border border-yellow-500/50 text-yellow-300';
      case 'CONFIRMED': return 'bg-blue-900/30 border border-blue-500/50 text-blue-300';
      case 'IN_PROGRESS': return 'bg-purple-900/30 border border-purple-500/50 text-purple-300';
      case 'COMPLETED': return 'bg-green-900/30 border border-green-500/50 text-green-300';
      case 'CANCELLED': return 'bg-red-900/30 border border-red-500/50 text-red-300';
      case 'REJECTED': return 'bg-gray-900/30 border border-gray-500/50 text-gray-300';
      default: return 'bg-gray-900/30 border border-gray-500/50 text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-xs font-medium text-blue-400">GPS Location</span>
          </div>
          <div className="font-mono text-xs text-gray-300 bg-white/10 backdrop-blur-sm px-2 py-1 rounded border border-white/20">
            {coordsPart}
          </div>
          {addressPart && (
            <div className="text-xs text-gray-400">
              {addressPart}
            </div>
          )}
        </div>
      );
    }
    
    return <span className="text-sm text-gray-300">{address}</span>;
  };

  const getNavigationUrl = (address: string) => {
    // Check if the address contains GPS coordinates
    if (address.startsWith('GPS Coordinates:')) {
      const parts = address.split(' | ');
      const coordsPart = parts[0].replace('GPS Coordinates: ', '');
      const [lat, lng] = coordsPart.split(', ').map(coord => coord.trim());
      
      // Return Google Maps URL for navigation
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return null;
  };

  const handleCompletionEvidenceUpload = async (bookingId: number, image: File) => {
    try {
      setUploadingEvidence(true);
      
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`/api/bookings/${bookingId}/completion`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error as JSON, but handle non-JSON responses
        let errorMessage = 'Failed to upload completion evidence';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          const textError = await response.text();
          console.error('Non-JSON error response:', textError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      await fetchBookings(); // Refresh the bookings list
      setShowCompletionModal(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload completion evidence');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <>
        <ProviderNavbar />
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Dark gradient background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-slate-900"></div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7919e6] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading your bookings...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProviderNavbar />
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
            <h1 className="text-3xl font-bold text-gray-100">Booking Management</h1>
            <p className="mt-2 text-gray-400">Manage and track your service bookings</p>
          </div>

          {error && (
            <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-600">
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
                    className={`py-2 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                      filter === tab.key
                        ? 'border-[#7919e6] text-[#7919e6]'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
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
                {filter === 'all' ? 'You haven\'t received any bookings yet.' : `No ${filter.toLowerCase()} bookings found.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-100">{booking.service.name}</h3>
                      <p className="text-gray-300">{booking.service.description}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Customer: {booking.customerName}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Booking Details</h4>
                      <p className="text-sm text-gray-300">Date: {formatDate(booking.scheduledDate)}</p>
                      <p className="text-sm text-gray-300">Time: {booking.scheduledTime}</p>
                      <p className="text-sm text-gray-300">Amount: RM {booking.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Customer Contact</h4>
                      <p className="text-sm text-gray-300">Email: {booking.customerEmail}</p>
                      <p className="text-sm text-gray-300">Phone: {booking.customerPhone}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">Service Location</h4>
                      {formatAddress(booking.customerAddress)}
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-200 mb-2">Customer Notes</h4>
                      <p className="text-sm text-gray-300 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">{booking.notes}</p>
                    </div>
                  )}

                  {booking.status === 'COMPLETED' && booking.completionImage && (
                    <CompletionEvidenceViewer
                      imageUrl={booking.completionImage}
                      serviceName={booking.service.name}
                    />
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-gray-600">
                    <p className="text-sm text-gray-400">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                    <div className="flex gap-2">
                      {getAvailableActions(booking).map((action, index) => (
                        <Button
                          key={index}
                          onClick={() => {
                            if (action.action) {
                              action.action();
                            } else if (action.status) {
                              handleUpdateBookingStatus(booking.id, action.status);
                            }
                          }}
                          disabled={action.disabled}
                          className={action.color}
                        >
                          {action.label}
                        </Button>
                      ))}
                      {getNavigationUrl(booking.customerAddress) && booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white cursor-pointer"
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              const navUrl = getNavigationUrl(booking.customerAddress);
                              if (navUrl) {
                                window.open(navUrl, '_blank');
                              }
                            }
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.158.69-.158 1.006 0l4.994 2.497c.317.158.69.158 1.007 0z" />
                          </svg>
                          Navigate
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

      {/* Add the CompletionEvidenceModal */}
      <CompletionEvidenceModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setSelectedBookingId(null);
        }}
        onSubmit={(image) => {
          if (selectedBookingId) {
            return handleCompletionEvidenceUpload(selectedBookingId, image);
          }
          return Promise.resolve();
        }}
        loading={uploadingEvidence}
      />
    </>
  );
} 