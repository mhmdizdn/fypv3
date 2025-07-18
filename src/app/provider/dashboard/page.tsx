'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditService, setShowEditService] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [provider, setProvider] = useState({
    name: '',
    username: '',
    email: '',
    serviceType: '',
    phone: '',
    latitude: null as number | null,
    longitude: null as number | null,
    address: null as string | null
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null
  });
  const [editService, setEditService] = useState({
    id: 0,
    name: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null,
    currentImageUrl: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in and is a service provider
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (!data.isAuthenticated || data.userType !== 'serviceProvider') {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    // Get provider profile
    const getProviderProfile = async () => {
      try {
        const response = await fetch('/api/provider/profile');
        if (response.ok) {
          const data = await response.json();
          setProvider({
            name: data.name || data.username || '',
            username: data.username || '',
            email: data.email || '',
            serviceType: data.serviceType || '',
            phone: data.phone || '',
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            address: data.address || null
          });
        }
      } catch (error) {
        console.error('Failed to load provider profile:', error);
      }
    };

    checkAuth();
    getProviderProfile();
    // Load provider's services
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/provider/services');
      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewService({ ...newService, image: file });
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditService({ ...editService, image: file });
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setEditImagePreview(editService.currentImageUrl);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newService.name);
      formData.append('description', newService.description);
      formData.append('price', newService.price);
      formData.append('category', newService.category);
      if (newService.image) {
        formData.append('image', newService.image);
      }

      const response = await fetch('/api/provider/services', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowAddService(false);
        setNewService({ name: '', description: '', price: '', category: '', image: null });
        setImagePreview(null);
        loadServices(); // Reload services after adding
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.missingFields) {
          // Profile incomplete error
          alert(`${errorData.message}\n\nPlease go to your profile page to complete the missing information.`);
        } else {
          alert(errorData.message || 'Failed to add service');
        }
      }
    } catch (error) {
      console.error('Failed to add service:', error);
      alert('Failed to add service. Please try again.');
    }
  };

  const openEditModal = (service: Service) => {
    setEditService({
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
      image: null,
      currentImageUrl: service.imageUrl || ''
    });
    setEditImagePreview(service.imageUrl || null);
    setCurrentService(service);
    setShowEditService(true);
  };

  const handleEditService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('id', editService.id.toString());
      formData.append('name', editService.name);
      formData.append('description', editService.description);
      formData.append('price', editService.price);
      formData.append('category', editService.category);
      if (editService.image) {
        formData.append('image', editService.image);
      }

      const response = await fetch(`/api/provider/services/${editService.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        setShowEditService(false);
        setEditService({ id: 0, name: '', description: '', price: '', category: '', image: null, currentImageUrl: '' });
        setEditImagePreview(null);
        loadServices(); // Reload services after editing
      }
    } catch (error) {
      console.error('Failed to edit service:', error);
    }
  };

  const openDeleteConfirmation = (service: Service) => {
    setCurrentService(service);
    setShowDeleteConfirm(true);
  };

  const handleDeleteService = async () => {
    if (!currentService) return;
    
    try {
      const response = await fetch(`/api/provider/services/${currentService.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteConfirm(false);
        setCurrentService(null);
        loadServices(); // Reload services after deleting
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
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
        {/* Center: Navigation */}
        <div className="hidden md:flex items-center gap-6 text-white">
          <Link href="/provider/dashboard" className="text-[#7919e6] font-semibold cursor-pointer">
            Dashboard
          </Link>
          <Link href="/provider/bookings" className="hover:text-[#7919e6] transition-colors cursor-pointer" >
            Bookings
          </Link>
          <Link href="/provider/reviews" className="hover:text-[#7919e6] transition-colors cursor-pointer">
            Reviews
          </Link>
        </div>
        {/* Right: User, Cart, Settings */}        
        <div className="flex items-center gap-6 text-white text-base">          
          <div className="flex items-center gap-1 cursor-pointer">            
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">              
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />            
            </svg>            
            <span>{provider.name}</span>          
            </div>          {provider.phone && (            
              <div className="flex items-center gap-1">             
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">                
               <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />             
                </svg>              
                <span>{provider.phone}</span>            
                </div>         
               )}
               
          {/* Notifications */}
          <NotificationDropdown 
            onNotificationClick={(notification: any) => {
              // If it's a booking notification, navigate to bookings page
              if (notification.type === 'BOOKING' || notification.type === 'BOOKING_UPDATE') {
                router.push('/provider/bookings');
              }
            }}
          />
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
                <a href="/provider/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
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
        {/* Profile Completion Warning */}
        {(!provider.phone || !provider.latitude || !provider.longitude) && (
          <div className="mb-6 p-4 bg-amber-900/20 backdrop-blur-sm border-l-4 border-amber-400 rounded-lg border border-amber-400/30">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-300">Complete Your Profile</h3>
                <div className="mt-1 text-sm text-amber-200">
                  <p>
                    Please complete your profile before adding services. You need to add:
                    {!provider.phone && <span className="font-medium"> Phone Number</span>}
                    {!provider.phone && (!provider.latitude || !provider.longitude) && <span>, </span>}
                    {(!provider.latitude || !provider.longitude) && <span className="font-medium"> Shop Location</span>}
                  </p>
                </div>
                <div className="mt-2">
                  <a
                    href="/provider/profile"
                    className="inline-flex items-center text-sm font-medium text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    Go to Profile
                    <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Provider Dashboard</h1>
          {provider.phone && provider.latitude && provider.longitude ? (
            <Button
              onClick={() => setShowAddService(true)}
              variant="gradient"
              size="lg"
            >
              Add New Service
            </Button>
          ) : (
            <Button
              onClick={() => {
                alert('Please complete your profile first. You need to add your phone number and shop location before adding services.');
              }}
              variant="outline"
              size="lg"
              className="opacity-50 cursor-not-allowed"
            >
              Add New Service
            </Button>
          )}
        </div>

        {/* Add Service Modal */}
        {showAddService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Add New Service</h2>
              <form onSubmit={handleAddService}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Price (RM)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Service Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="gradient" className="flex-1">
                    Add Service
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddService(false);
                      setNewService({ name: '', description: '', price: '', category: '', image: null });
                      setImagePreview(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-md overflow-hidden">
              <div className="relative w-full h-48">
                {service.imageUrl ? (
                  <>
                    <img 
                      src={service.imageUrl}
                      alt={service.name} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        console.error('=== IMAGE LOAD ERROR ===');
                        console.error('Failed URL:', service.imageUrl);
                        console.error('Service ID:', service.id);
                        console.error('Timestamp:', new Date().toISOString());
                        
                        // If it's an old-style URL, try converting it
                        if (service.imageUrl?.startsWith('/uploads/')) {
                          const newUrl = service.imageUrl.replace('/uploads/', '/api/uploads/');
                          console.log('Trying converted URL:', newUrl);
                          e.currentTarget.src = newUrl;
                          return;
                        }
                        
                        // Show fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully:', service.imageUrl);
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-gray-700 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto mb-2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        <span className="text-gray-300 text-sm">Image failed to load</span>
                        <p className="text-gray-500 text-xs mt-1 break-all">{service.imageUrl}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-300">No image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">{service.name}</h3>
                <p className="text-gray-300 mb-2">{service.description}</p>
                <p className="text-gray-400 text-sm mb-2">Category: {service.category}</p>
                <p className="text-[#19E6A7] font-bold text-lg mb-4">RM {service.price.toFixed(2)}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(service)}
                    className="flex-1 cursor-pointer"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteConfirmation(service)}
                    className="flex-1 text-red-400 border-red-400 hover:bg-red-400 hover:text-white cursor-pointer"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-200 mb-2">No services yet</h3>
            <p className="text-gray-400 mb-4">Get started by adding your first service</p>
            {provider.phone && provider.latitude && provider.longitude && (
              <Button onClick={() => setShowAddService(true)} variant="gradient">
                Add Your First Service
              </Button>
            )}
          </div>
        )}

        {/* Edit Service Modal */}
        {showEditService && currentService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Edit Service</h2>
              <form onSubmit={handleEditService}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={editService.name}
                    onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editService.description}
                    onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Price (RM)</label>
                  <input
                    type="number"
                    value={editService.price}
                    onChange={(e) => setEditService({ ...editService, price: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={editService.category}
                    onChange={(e) => setEditService({ ...editService, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Service Image</label>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                  />
                  {editImagePreview && (
                    <div className="mt-2">
                      <img src={editImagePreview} alt="Preview" className="w-full h-32 object-cover rounded" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="gradient" className="flex-1">
                    Update Service
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditService(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && currentService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900/95 backdrop-blur-md border border-white/20 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-100">Delete Service</h2>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete "{currentService.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleDeleteService}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 