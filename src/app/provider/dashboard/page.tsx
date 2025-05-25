'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from "@/components/ui/button";

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
    const [provider, setProvider] = useState({    name: '',    username: '',    email: '',    serviceType: '',    phone: ''  });
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
                    setProvider({            name: data.name || data.username || '',            username: data.username || '',            email: data.email || '',            serviceType: data.serviceType || '',            phone: data.phone || ''          });
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
      }
    } catch (error) {
      console.error('Failed to add service:', error);
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
            Service<span className="text-[#7919e6]">Finder</span>
          </span>
        </div>
        {/* Center: Service Type */}
        <div className="hidden md:flex items-center gap-2 text-white text-lg font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <span>{provider.serviceType}</span>
        </div>
                {/* Right: User, Cart, Settings */}        <div className="flex items-center gap-6 text-white text-base">          <div className="flex items-center gap-1 cursor-pointer">            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">              <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />            </svg>            <span>{provider.name}</span>          </div>          {provider.phone && (            <div className="flex items-center gap-1">              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />              </svg>              <span>{provider.phone}</span>            </div>          )}
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
          <Button
            onClick={() => setShowAddService(true)}
            variant="gradient"
            size="lg"
          >
            Add New Service
          </Button>
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
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Service Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Image preview" 
                        className="w-full h-40 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddService(false);
                      setImagePreview(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                  >
                    Add Service
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Service Modal */}
        {showEditService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Edit Service</h2>
              <form onSubmit={handleEditService}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={editService.name}
                    onChange={(e) => setEditService({ ...editService, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editService.description}
                    onChange={(e) => setEditService({ ...editService, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Price (RM)</label>
                  <input
                    type="number"
                    value={editService.price}
                    onChange={(e) => setEditService({ ...editService, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={editService.category}
                    onChange={(e) => setEditService({ ...editService, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Service Image</label>
                  <input
                    type="file"
                    ref={editFileInputRef}
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {editImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={editImagePreview} 
                        alt="Image preview" 
                        className="w-full h-40 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowEditService(false);
                      setEditImagePreview(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && currentService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Delete Service</h2>
              <p className="mb-6">Are you sure you want to delete the service "{currentService.name}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteService}
                  variant="danger"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(services) && services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {service.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.imageUrl} 
                    alt={service.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-blue-600 font-bold">RM {service.price.toFixed(2)}</span>
                  <span className="text-gray-500">{service.category}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => openEditModal(service)}
                    variant="gradient"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => openDeleteConfirmation(service)}
                    variant="danger"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 