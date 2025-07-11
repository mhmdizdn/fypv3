'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string | null;
    username: string;
  };
  service: {
    id: number;
    name: string;
    description: string;
  };
  booking: {
    id: number;
    scheduledDate: string;
    customerName: string;
  };
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
        <Link href="/provider/bookings" className="hover:text-[#7919e6] transition-colors cursor-pointer">
          Bookings
        </Link>
        <Link href="/provider/reviews" className="text-[#7919e6] font-semibold cursor-pointer">
          Reviews
        </Link>
      </div>

      {/* Right: User, Settings */}
      <div className="flex items-center gap-4 text-white">
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
            <div className="absolute right-0 mt-2 w-32 bg-white text-black border rounded shadow-lg z-50">
              <a href="/provider/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
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

export default function ProviderReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/provider/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (reviewId: number) => {
    if (!replyText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      setSubmittingReply(true);
      const response = await fetch('/api/provider/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          providerComment: replyText.trim(),
        }),
      });

      if (response.ok) {
        await fetchReviews(); // Refresh reviews
        setReplyingTo(null);
        setReplyText('');
        if (typeof window !== 'undefined') {
          alert('Response submitted successfully!');
        }
      } else {
        const errorData = await response.json();
        if (typeof window !== 'undefined') {
          alert(errorData.error || 'Failed to submit response');
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined') {
        alert('Network error. Please try again.');
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyText('');
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-yellow-400' : 'text-gray-500'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredReviews = () => {
    switch (filter) {
      case 'replied':
        return reviews.filter(review => review.providerComment);
      case 'not-replied':
        return reviews.filter(review => !review.providerComment);
      case 'high-rating':
        return reviews.filter(review => review.rating >= 4);
      case 'low-rating':
        return reviews.filter(review => review.rating <= 3); // Changed from <= 2 to <= 3
      default:
        return reviews;
    }
  };

  const filteredReviews = getFilteredReviews();

  if (loading) {
    return (
      <>
        <ProviderNavbar />
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
          {/* Dark gradient background */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-gray-900 to-slate-900"></div>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7919e6] mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading reviews...</p>
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
            <h1 className="text-3xl font-bold text-gray-100">Customer Reviews</h1>
            <p className="mt-2 text-gray-400">View and respond to customer feedback for your services</p>
          </div>

          {error && (
            <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Statistics */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-[#7919e6]">{reviews.length}</div>
                <div className="text-sm text-gray-400">Total Reviews</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-yellow-400">
                  {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0'}
                </div>
                <div className="text-sm text-gray-400">Average Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-400">
                  {reviews.filter(r => r.providerComment).length}
                </div>
                <div className="text-sm text-gray-400">Responded To</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-orange-400">
                  {reviews.filter(r => !r.providerComment).length}
                </div>
                <div className="text-sm text-gray-400">Awaiting Response</div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-600">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Reviews' },
                  { key: 'not-replied', label: 'Not Replied' },
                  { key: 'replied', label: 'Replied' },
                  { key: 'high-rating', label: '4-5 Stars' },
                  { key: 'low-rating', label: '1-3 Star' } // Changed from '1-2 Stars' to '1-3 Star'
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`cursor-pointer inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
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

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.83-.497l-5.17 1.55 1.55-5.17A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-200">No reviews found</h3>
              <p className="mt-1 text-sm text-gray-400">
                {filter === 'all' ? 'You haven\'t received any reviews yet.' : `No reviews match the current filter.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-md p-6 cursor-pointer">
                  {/* Review Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold">
                        {(review.customer.name || review.customer.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100">
                          {review.customer.name || review.customer.username}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Service: {review.service.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {renderStars(review.rating)}
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Customer Review */}
                  {review.comment && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-200 mb-2">Customer Review:</h4>
                      <p className="text-gray-300 bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">{review.comment}</p>
                    </div>
                  )}

                  {/* Provider Response */}
                  {review.providerComment ? (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-200 mb-2">Your Response:</h4>
                      <p className="text-gray-300 bg-blue-900/30 backdrop-blur-sm p-3 rounded-lg border-l-4 border-[#7919e6] border border-blue-500/30">
                        {review.providerComment}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Responded on {formatDate(review.updatedAt)}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      {replyingTo === review.id ? (
                        <div>
                          <h4 className="font-medium text-gray-200 mb-2">Your Response:</h4>
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your response to this review..."
                            className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6] focus:border-transparent resize-none"
                            rows={4}
                            disabled={submittingReply}
                          />
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => handleSubmitReply(review.id)}
                              variant="gradient"
                              size="sm"
                              disabled={submittingReply || !replyText.trim()}
                            >
                              {submittingReply ? (
                                <div className="flex items-center gap-2">
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Submitting...
                                </div>
                              ) : (
                                'Submit Response'
                              )}
                            </Button>
                            <Button
                              onClick={handleCancelReply}
                              variant="outline"
                              size="sm"
                              disabled={submittingReply}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => setReplyingTo(review.id)}
                            variant="outline"
                            size="sm"
                            className="cursor-pointer text-[#7919e6] border-[#7919e6] hover:bg-[#7919e6] hover:text-white"
                          >
                            Reply to Review
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="pt-4 border-t border-gray-600">
                    <p className="text-xs text-gray-400">
                      Booking Date: {formatDate(review.booking.scheduledDate)} | 
                      Customer: {review.booking.customerName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 