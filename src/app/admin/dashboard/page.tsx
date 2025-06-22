'use client';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminTable } from "@/components/ui/admin-table";
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  email: string;
  username: string;
  name: string | null;
  createdAt: string;
}

interface ServiceProvider {
  id: number;
  email: string;
  username: string;
  name: string | null;
  serviceType: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

interface Booking {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalAmount: number;
  notes: string | null;
  createdAt: string;
  service: {
    id: number;
    name: string;
    provider: {
      id: number;
      name: string | null;
      username: string;
      email: string;
      serviceType: string;
    }
  };
  customer: {
    id: number;
    name: string | null;
    username: string;
    email: string;
  };
}

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
  provider: {
    id: number;
    name: string | null;
    username: string;
    email: string;
    serviceType: string;
  };
}

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  createdAt: string;
  customer: {
    id: number;
    name: string | null;
    username: string;
    email: string;
  };
  service: {
    id: number;
    name: string;
    provider: {
      id: number;
      name: string | null;
      username: string;
      email: string;
      serviceType: string;
    };
  };
  booking: {
    id: number;
    status: string;
    scheduledDate: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'providers' | 'bookings' | 'services' | 'reviews'>('users');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user as any).userType !== "admin") {
      router.push("/login");
      return;
    }

    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      console.log('Fetching admin data...');
      const [usersRes, providersRes, bookingsRes, servicesRes, reviewsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/providers'),
        fetch('/api/admin/bookings'),
        fetch('/api/admin/services'),
        fetch('/api/admin/reviews')
      ]);

      console.log('Users response status:', usersRes.status);
      console.log('Providers response status:', providersRes.status);
      console.log('Bookings response status:', bookingsRes.status);
      console.log('Services response status:', servicesRes.status);
      console.log('Reviews response status:', reviewsRes.status);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('Users data:', usersData);
        setUsers(usersData);
      } else {
        console.error('Users API error:', await usersRes.text());
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        console.log('Providers data:', providersData);
        setProviders(providersData);
      } else {
        console.error('Providers API error:', await providersRes.text());
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        console.log('Bookings data:', bookingsData);
        setBookings(bookingsData);
      } else {
        console.error('Bookings API error:', await bookingsRes.text());
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        console.log('Services data:', servicesData);
        setServices(servicesData);
      } else {
        console.error('Services API error:', await servicesRes.text());
      }

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        console.log('Reviews data:', reviewsData);
        setReviews(reviewsData);
      } else {
        console.error('Reviews API error:', await reviewsRes.text());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleDeleteProvider = async (providerId: number) => {
    if (!confirm('Are you sure you want to delete this service provider?')) return;

    try {
      const response = await fetch(`/api/admin/providers/${providerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProviders(providers.filter(provider => provider.id !== providerId));
      } else {
        alert('Failed to delete service provider');
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Error deleting service provider');
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setServices(services.filter(service => service.id !== serviceId));
      } else {
        alert('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error deleting service');
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookings(bookings.filter(booking => booking.id !== bookingId));
      } else {
        alert('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(reviews.filter(review => review.id !== reviewId));
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error deleting review');
    }
  };

  const handleViewItem = (id: number) => {
    const data = getCurrentData();
    const item = data.find((item: any) => item.id === id);
    if (item) {
      setViewingItem(item);
      setShowDetailModal(true);
    }
  };

  const handleEditItem = (id: number) => {
    const data = getCurrentData();
    const item = data.find((item: any) => item.id === id);
    if (item) {
      setEditingItem(item);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async (updatedData: any) => {
    try {
      const endpoint = getEditEndpoint();
      const response = await fetch(`${endpoint}/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        updateStateAfterEdit(updatedItem);
        setShowEditModal(false);
        setEditingItem(null);
      } else {
        alert('Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Error updating item');
    }
  };

  const getEditEndpoint = () => {
    switch (activeTab) {
      case 'users': return '/api/admin/users';
      case 'providers': return '/api/admin/providers';
      case 'bookings': return '/api/admin/bookings';
      case 'services': return '/api/admin/services';
      case 'reviews': return '/api/admin/reviews';
      default: return '';
    }
  };

  const updateStateAfterEdit = (updatedItem: any) => {
    switch (activeTab) {
      case 'users':
        setUsers(users.map(user => user.id === updatedItem.id ? updatedItem : user));
        break;
      case 'providers':
        setProviders(providers.map(provider => provider.id === updatedItem.id ? updatedItem : provider));
        break;
      case 'bookings':
        setBookings(bookings.map(booking => booking.id === updatedItem.id ? updatedItem : booking));
        break;
      case 'services':
        setServices(services.map(service => service.id === updatedItem.id ? updatedItem : service));
        break;
      case 'reviews':
        setReviews(reviews.map(review => review.id === updatedItem.id ? updatedItem : review));
        break;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any).userType !== "admin") {
    return null;
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'users': return users;
      case 'providers': return providers;
      case 'bookings': return bookings;
      case 'services': return services;
      case 'reviews': return reviews;
      default: return [];
    }
  };

  const getCurrentDeleteHandler = () => {
    switch (activeTab) {
      case 'users': return handleDeleteUser;
      case 'providers': return handleDeleteProvider;
      case 'bookings': return handleDeleteBooking;
      case 'services': return handleDeleteService;
      case 'reviews': return handleDeleteReview;
      default: return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Navigation Bar */}
      <nav className="w-full bg-black/20 backdrop-blur-md border-b border-white/10 px-8 py-4 sticky top-0 z-50">
        {/* Left: Logo and App Name */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <img
                src="/servicefinder-logo.png"
                alt="ServiceFinder Logo"
                width={24}
                height={24}
                className="object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl tracking-tight">
                Service<span className="text-[#7919e6]">Finder</span>
              </span>
              <span className="text-xs text-gray-300 font-medium">Admin Portal</span>
            </div>
          </div>
          
          {/* Right: User and Settings */}        
          <div className="flex items-center gap-4">          
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30 shadow-sm">            
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">              
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />            
                </svg>
              </div>            
              <span className="text-white font-medium text-sm">{(session.user as any).name || (session.user as any).email}</span>          
            </div>
            
              <button
              className="flex items-center justify-center w-10 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-full transition-all duration-200 hover:scale-105 border border-red-200/50"
                onClick={() => router.push('/api/auth/signout')}
              title="Logout"
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              </button>
            </div>
          </div>
      </nav>

      {/* Modern Header Section */}
      <div className="max-w-7xl mx-auto px-8 pt-12 pb-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Manage your platform with modern tools and real-time insights
          </p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Active users
        </div>
      </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg shadow-green-500/10 hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Service Providers</p>
                <p className="text-3xl font-bold text-gray-900">{providers.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Registered providers
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-2 2m8-2l2 2m-2 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v0" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              All time bookings
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">{services.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Available services
            </div>
          </div>

          <div className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Customer feedback
            </div>
          </div>
        </div>

        {/* Modern Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/5 border border-white/30 mb-8 overflow-hidden">
          <div className="p-2">
            <nav className="flex space-x-2">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'providers'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Providers ({providers.length})
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'bookings'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-2 2m8-2l2 2m-2 0v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9m8 0V9a2 2 0 00-2-2H8a2 2 0 00-2 2v0" />
                </svg>
                Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'services'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Services ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === 'reviews'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Reviews ({reviews.length})
              </button>
            </nav>
          </div>
          </div>

        {/* Table Content */}
        <AdminTable
          type={activeTab}
          data={getCurrentData()}
          onDelete={getCurrentDeleteHandler()}
          onEdit={handleEditItem}
          onView={handleViewItem}
          onRowClick={handleViewItem}
        />

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <EditModal
            type={activeTab}
            item={editingItem}
            onSave={handleSaveEdit}
            onClose={() => {
              setShowEditModal(false);
              setEditingItem(null);
            }}
          />
        )}

        {/* Detail Modal */}
        {showDetailModal && viewingItem && (
          <DetailModal
            type={activeTab}
            item={viewingItem}
            onClose={() => {
              setShowDetailModal(false);
              setViewingItem(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Edit Modal Component
function EditModal({ type, item, onSave, onClose }: {
  type: string;
  item: any;
  onSave: (data: any) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFormFields = () => {
    const inputClass = "w-full p-4 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-2";
    
    switch (type) {
      case 'users':
        return (
          <>
              <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={inputClass}
                placeholder="Enter username"
              />
            </div>
                              <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="Enter email address"
              />
                                </div>
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Enter full name"
              />
                                </div>
          </>
        );
      case 'providers':
        return (
          <>
            <div>
              <label className={labelClass}>Username</label>
              <input
                type="text"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={inputClass}
                placeholder="Enter username"
              />
                              </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
                placeholder="Enter email address"
              />
                            </div>
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className={labelClass}>Service Type</label>
              <input
                type="text"
                value={formData.serviceType || ''}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className={inputClass}
                placeholder="Enter service type"
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className={labelClass}>Shop Location</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className={inputClass}
                placeholder="Enter shop address"
              />
            </div>
          </>
        );
      case 'services':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        );
      case 'bookings':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                value={formData.customerName || ''}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
              <input
                type="email"
                value={formData.customerEmail || ''}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone</label>
              <input
                type="text"
                value={formData.customerPhone || ''}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Booking Location</label>
              <input
                type="text"
                value={formData.customerAddress || ''}
                onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter customer address"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalAmount || ''}
                onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        );
      case 'reviews':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <select
                value={formData.rating || ''}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value={1}>1 Star</option>
                <option value={2}>2 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={5}>5 Stars</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Comment</label>
              <textarea
                value={formData.comment || ''}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider Response</label>
              <textarea
                value={formData.providerComment || ''}
                onChange={(e) => setFormData({ ...formData, providerComment: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Admin can edit provider response..."
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
              Edit {type.slice(0, -1)}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Update the information below</p>
          </div>
                            <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100/80 hover:bg-red-100/80 text-gray-600 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
                            </button>
                </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormFields()}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200/50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105"
            >
              Save Changes
            </button>
              </div>
        </form>
      </div>
    </div>
  );
}

// Detail Modal Component
function DetailModal({ type, item, onClose }: {
  type: string;
  item: any;
  onClose: () => void;
}) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `RM ${amount.toFixed(2)}`;
  };

  const renderDetailContent = () => {
    switch (type) {
      case 'users':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">User ID</label>
                <p className="text-gray-900 font-medium">{item.id}</p>
              </div>
                              <div>
                <label className="text-sm font-semibold text-gray-600">Username</label>
                <p className="text-gray-900 font-medium">{item.username}</p>
                                </div>
                                </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Full Name</label>
              <p className="text-gray-900 font-medium">{item.name || 'Not provided'}</p>
                              </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Email Address</label>
              <p className="text-gray-900 font-medium">{item.email}</p>
                            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Account Created</label>
              <p className="text-gray-900 font-medium">{formatDate(item.createdAt)}</p>
                </div>
          </div>
        );
      case 'providers':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Provider ID</label>
                <p className="text-gray-900 font-medium">{item.id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Username</label>
                <p className="text-gray-900 font-medium">{item.username}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Full Name</label>
              <p className="text-gray-900 font-medium">{item.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Email Address</label>
              <p className="text-gray-900 font-medium">{item.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Service Type</label>
              <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 border border-green-300 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {item.serviceType}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Phone Number</label>
              <p className="text-gray-900 font-medium">{item.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Shop Location</label>
              <p className="text-gray-900 font-medium">{item.address || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Account Created</label>
              <p className="text-gray-900 font-medium">{formatDate(item.createdAt)}</p>
            </div>
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Booking ID</label>
                <p className="text-gray-900 font-medium">{item.id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  item.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  item.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.status}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Customer Information</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 font-medium">{item.customerName}</p>
                <p className="text-gray-600 text-sm">{item.customerEmail}</p>
                <p className="text-gray-600 text-sm">{item.customerPhone}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Service</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 font-medium">{item.service.name}</p>
                <p className="text-gray-600 text-sm">Provider: {item.service.provider.name || item.service.provider.username}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Booking Location</label>
              <p className="text-gray-900 font-medium">{item.customerAddress || 'Not provided'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Scheduled Date</label>
                <p className="text-gray-900 font-medium">{formatDate(item.scheduledDate)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Time</label>
                <p className="text-gray-900 font-medium">{item.scheduledTime}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Total Amount</label>
              <p className="text-gray-900 font-bold text-lg">{formatCurrency(item.totalAmount)}</p>
            </div>
            {item.notes && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Notes</label>
                <p className="text-gray-900 font-medium">{item.notes}</p>
              </div>
            )}
              <div>
              <label className="text-sm font-semibold text-gray-600">Booking Created</label>
              <p className="text-gray-900 font-medium">{formatDate(item.createdAt)}</p>
            </div>
          </div>
        );
      case 'services':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                            <div>
                <label className="text-sm font-semibold text-gray-600">Service ID</label>
                <p className="text-gray-900 font-medium">{item.id}</p>
                              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Category</label>
                <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {item.category}
                              </div>
                            </div>
            </div>
                            <div>
              <label className="text-sm font-semibold text-gray-600">Service Name</label>
              <p className="text-gray-900 font-bold text-lg">{item.name}</p>
                            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Description</label>
              <p className="text-gray-900 font-medium">{item.description}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Price</label>
              <p className="text-gray-900 font-bold text-lg">{formatCurrency(item.price)}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Service Provider</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 font-medium">{item.provider.name || item.provider.username}</p>
                <p className="text-gray-600 text-sm">{item.provider.email}</p>
                <p className="text-gray-600 text-sm">Service Type: {item.provider.serviceType}</p>
              </div>
            </div>
            {item.imageUrl && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Service Image</label>
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            <div>
              <label className="text-sm font-semibold text-gray-600">Service Created</label>
              <p className="text-gray-900 font-medium">{formatDate(item.createdAt)}</p>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Review ID</label>
                <p className="text-gray-900 font-medium">{item.id}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Rating</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-bold text-lg">{item.rating}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Customer</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 font-medium">{item.customer.name || item.customer.username}</p>
                <p className="text-gray-600 text-sm">{item.customer.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Service Provider</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-900 font-medium">{item.service.provider.name || item.service.provider.username}</p>
                <p className="text-gray-600 text-sm">{item.service.provider.email}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Service</label>
              <p className="text-gray-900 font-medium">{item.service.name}</p>
            </div>
            {item.comment && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Customer Comment</label>
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-900 font-medium">{item.comment}</p>
                </div>
              </div>
            )}
            {item.providerComment && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Provider Response</label>
                <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                  <p className="text-gray-900 font-medium">{item.providerComment}</p>
                </div>
              </div>
            )}
                            <div>
              <label className="text-sm font-semibold text-gray-600">Booking Information</label>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Booking ID: {item.booking.id}</p>
                <p className="text-gray-600 text-sm">Status: {item.booking.status}</p>
                <p className="text-gray-600 text-sm">Date: {formatDate(item.booking.scheduledDate)}</p>
                              </div>
                              </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Review Created</label>
              <p className="text-gray-900 font-medium">{formatDate(item.createdAt)}</p>
                            </div>
          </div>
        );
      default:
        return <p>No details available</p>;
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'users': return 'User Details';
      case 'providers': return 'Service Provider Details';
      case 'bookings': return 'Booking Details';
      case 'services': return 'Service Details';
      case 'reviews': return 'Review Details';
      default: return 'Details';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
              {getModalTitle()}
            </h2>
            <p className="text-gray-600 text-sm mt-1">Complete information and details</p>
          </div>
                            <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100/80 hover:bg-red-100/80 text-gray-600 hover:text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
                            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
                            </button>
                </div>
        
        <div className="space-y-6">
          {renderDetailContent()}
              </div>
        
        <div className="flex justify-end pt-6 border-t border-gray-200/50 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 