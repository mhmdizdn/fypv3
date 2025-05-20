'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export default function ProviderDashboard() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [showAddService, setShowAddService] = useState(false);
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

    checkAuth();
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

  return (
    <div className="min-h-screen bg-gray-100">
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