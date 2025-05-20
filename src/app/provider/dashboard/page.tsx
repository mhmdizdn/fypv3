'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [services, setServices] = useState<Service[]>([]);
  const [showAddService, setShowAddService] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState({
    name: '',
    username: '',
    email: '',
    serviceType: ''
  });
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    category: ''
  });

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
            serviceType: data.serviceType || ''
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

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/provider/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newService),
      });

      if (response.ok) {
        setShowAddService(false);
        setNewService({ name: '', description: '', price: '', category: '' });
        loadServices(); // Reload services after adding
      }
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  };

  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
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
        {/* Center: Service Type */}
        <div className="hidden md:flex items-center gap-2 text-white text-lg font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span>{provider.serviceType}</span>
        </div>
        {/* Right: User, Cart, Settings */}
        <div className="flex items-center gap-6 text-white text-base">
          <div className="flex items-center gap-1 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{provider.name}</span>
          </div>
          {/* Notifications */}
          <button className="hover:text-[#E91E63] flex items-center" aria-label="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
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
              <div className="absolute right-0 mt-2 w-32 text-black bg-white border rounded shadow-lg z-50">
                <a href="/provider/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          <button
            onClick={() => setShowAddService(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Add New Service
          </button>
        </div>

        {/* Add Service Modal */}
        {showAddService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add New Service</h2>
              <form onSubmit={handleAddService}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Price (RM)</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddService(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Service
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(services) && services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-bold">RM {service.price}</span>
                <span className="text-gray-500">{service.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 