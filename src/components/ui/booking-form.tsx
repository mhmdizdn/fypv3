'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './button';

interface Service {
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
  };
}

interface BookingFormProps {
  service: Service;
  onClose: () => void;
  onSuccess: (booking: any) => void;
  customerAddress?: string;
  customerCoordinates?: { lat: number; lng: number } | null;
}

export function BookingForm({ service, onClose, onSuccess, customerAddress = '', customerCoordinates = null }: BookingFormProps) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || '';
  const userName = (session?.user as any)?.name || (session?.user as any)?.username || '';

  const [formData, setFormData] = useState({
    customerName: userName,
    customerEmail: userEmail,
    customerPhone: '',
    customerAddress: customerAddress,
    scheduledDate: '',
    scheduledTime: '',
    notes: ''
  });
  const [additionalAddress, setAdditionalAddress] = useState(customerAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate time slots
  const timeSlots = [
   '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
    
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare the customer address with coordinates
      const finalCustomerAddress = customerCoordinates
        ? `GPS Coordinates: ${customerCoordinates.lat.toFixed(6)}, ${customerCoordinates.lng.toFixed(6)}${additionalAddress ? ` | Address: ${additionalAddress}` : ''}`
        : formData.customerAddress;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          ...formData,
          customerAddress: finalCustomerAddress
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.booking);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create booking');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Book Service</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Service Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg text-gray-900">{service.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{service.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Provider: {service.provider.name || 'Service Provider'}
              </span>
              <span className="text-xl font-bold text-[#7919e6]">
                RM {service.price.toFixed(2)}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="User name from session"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Name from your account session</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                    placeholder="User email from session"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email from your account session</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Time *
                </label>
                <select
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map(time => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Location *
              </label>
              {customerCoordinates ? (
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-800">GPS Coordinates</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Latitude</label>
                        <input
                          type="text"
                          value={customerCoordinates.lat.toFixed(6)}
                          readOnly
                          className="w-full px-2 py-1 text-sm bg-white border border-blue-300 rounded text-center font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-700 mb-1">Longitude</label>
                        <input
                          type="text"
                          value={customerCoordinates.lng.toFixed(6)}
                          readOnly
                          className="w-full px-2 py-1 text-sm bg-white border border-blue-300 rounded text-center font-mono"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Service will be provided at your pinpointed location from the map
                    </p>
                  </div>
                                     <div>
                     <label className="block text-xs font-medium text-gray-600 mb-1">Address Reference (Optional)</label>
                     <textarea
                       value={additionalAddress}
                       onChange={(e) => setAdditionalAddress(e.target.value)}
                       rows={2}
                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7919e6] bg-gray-50"
                       placeholder="Additional address details, building name, floor, etc."
                     />
                   </div>
                </div>
              ) : (
                <textarea
                  name="customerAddress"
                  value={formData.customerAddress}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                  placeholder="Enter the address where the service should be provided"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7919e6]"
                placeholder="Any special requirements or additional information..."
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Amount:</span>
                <span className="text-[#7919e6]">RM {service.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Payment will be collected upon service completion
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}