'use client';

import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookingForm } from '@/components/ui/booking-form';

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  createdAt: string;
  customer: {
    name: string | null;
    username: string;
  };
}

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

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [scrollY, setScrollY] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [mounted, setMounted] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch services from the API
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
          
          setCategories(["All", ...uniqueCategories]);
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

    // Add scroll listener for parallax effects
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter services by category
  const filteredServices = selectedCategory === "All" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  // Get top 6 services for display
  const displayServices = filteredServices.slice(0, 6);

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
    if (!session) {
      // If not logged in, redirect to login page
      router.push('/login');
      return;
    }
    
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

  const handleServiceClick = (service: Service) => {
    openServiceDetails(service);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark gradient background - same as provider pages */}
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

      {/* Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="pt-16 w-full max-w-full relative z-40">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center px-4 md:px-10 relative z-30">
            <motion.div 
              className="text-center relative z-30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                transform: `translateY(${scrollY * 0.3}px)`,
                opacity: Math.max(0.3, 1 - scrollY / 1000)
              }}
            >
              <h1 className="text-gray-100 text-4xl md:text-7xl font-bold text-center mb-6">
                Welcome to <span className="text-[#7919e6]">ServiceFinder</span>
              </h1>
              <p className="text-gray-300 text-lg md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed">
                Connect with trusted service providers in your area. From home repairs to professional services, find exactly what you need.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8 relative z-40">
                <motion.button 
                  onClick={scrollToServices}
                  className="px-8 py-4 bg-[#7919e6] hover:bg-[#621ac1] transition duration-300 rounded-lg text-white text-lg font-semibold shadow-lg hover:shadow-xl relative z-50 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Services
                </motion.button>
                <motion.button 
                  onClick={scrollToAbout}
                  className="px-8 py-4 text-white border-2 border-white hover:bg-white hover:text-black transition duration-300 rounded-lg text-lg font-semibold relative z-50 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          </section>
        
        {/* Featured Services Section */}
        <section ref={servicesRef} className="py-16 relative z-10" id="services">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4 text-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Explore Our Services
              </motion.h2>
              <motion.p 
                className="text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Discover top-rated service providers in your area and get the help you need today.
              </motion.p>
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {categories.map((category, index) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-[#7919e6] text-white shadow-lg"
                      : "bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 shadow-md text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-[#7919e6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Loading services...</p>
              </div>
            ) : (
              <>
                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.6, delay: 0.1 * index }}
                      className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:bg-white/20 transition-all duration-300 cursor-pointer relative group border border-white/20"
                      onClick={() => handleServiceClick(service)}
                      whileHover={{ y: -5, scale: 1.02 }}
                    >
                      <div className="h-48 overflow-hidden">
                        {service.imageUrl ? (
                          <img 
                            src={service.imageUrl} 
                            alt={service.name} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                            <span className="text-gray-500">{service.name}</span>
                          </div>
                        )}
                      </div>
                                              <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-100">{service.name}</h3>
                          <span className="bg-white/20 px-2 py-1 rounded-full text-xs text-gray-200">{service.category}</span>
                        </div>
                        
                        {/* Show rating if service has reviews */}
                        {service.reviews && service.reviews.length > 0 ? (
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(calculateAverageRating(service.reviews), 'sm')}
                            <span className="text-sm text-gray-300">
                              ({calculateAverageRating(service.reviews).toFixed(1)}) • {service.reviews.length} review{service.reviews.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 mb-2">No reviews yet</div>
                        )}
                        
                        <p className="text-gray-400 mb-4 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-8 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold">
                              {service.provider.name ? service.provider.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <span className="text-sm text-gray-400">{service.provider.name || 'Provider'}</span>
                          </div>
                          <span className="font-bold text-[#7919e6]">RM {service.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* View All Services Button */}
                <div className="text-center mt-12">
                  {session ? (
                    <Link href="/customer/services" passHref>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="gradient" size="xl">
                          View All Services
                        </Button>
                      </motion.div>
                    </Link>
                  ) : (
                    <Link href="/login" passHref>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="gradient" size="xl">
                          Login to View All Services
                        </Button>
                      </motion.div>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* About ServiceFinder Section */}
        <section ref={aboutRef} className="py-20 relative z-10" id="about">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-100">About <span className="text-[#7919e6]">ServiceFinder</span></h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                ServiceFinder connects you with trusted local service providers, making it easy to find the help you need for any task, big or small.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div 
                className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg text-center hover:shadow-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-[#7919e6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#7919e6" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-100">Local Services</h3>
                <p className="text-gray-400">
                  Find service providers in your neighborhood, with precise location tracking to show you the nearest options.
                </p>
              </motion.div>

              <motion.div 
                className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg text-center hover:shadow-xl hover:bg-white/20 transition-all duration-300 border border-white/20"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-[#7919e6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#7919e6" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-100">Trusted Providers</h3>
                <p className="text-gray-400">
                  All service providers undergo verification. Read reviews from other customers to make informed decisions.
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-16 bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
              whileHover={{ scale: 1.02 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-10 md:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-gray-100 mb-6">Become a Service Provider</h3>
                  <p className="text-gray-400 mb-8">
                    Join our network of skilled professionals. Create your profile, list your services, and start growing your business with ServiceFinder.
                  </p>
                  <Link href="/register" passHref>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="gradient" className="text-black">
                        Join as Provider
                      </Button>
                    </motion.div>
                  </Link>
                </div>
                <div className="bg-[url('/provider-illustration.jpg')] bg-cover bg-center h-64 md:h-auto">                </div>
              </div>
            </motion.div>
          </div>
        </section>
        </main>
      
      {/* Service Details Modal */}
      {showServiceDetails && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end p-4">
              <button 
                onClick={closeServiceDetails} 
                className="bg-gray-100 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
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
                  <div className="bg-gray-200 w-full h-full rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-lg">{selectedService.name}</span>
                  </div>
                )}
              </div>
              
              {/* Service Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-2">Description</div>
                    <p className="text-gray-700">{selectedService.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-gray-500 text-sm">Category</div>
                      <div className="font-medium">{selectedService.category}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Price</div>
                      <div className="font-bold text-[#19E6A7]">RM {selectedService.price.toFixed(2)}</div>
                    </div>
                    {selectedService.createdAt && (
                      <div>
                        <div className="text-gray-500 text-sm">Listed Since</div>
                        <div>{mounted ? new Date(selectedService.createdAt).toLocaleDateString('en-GB') : selectedService.createdAt}</div>
                      </div>
                    )}
                  </div>

                  {/* Reviews Section */}
                  <div className="mb-6">
                    <div className="text-lg font-semibold mb-4">Customer Reviews</div>
                    
                    {loadingReviews ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7919e6] mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading reviews...</p>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4">
                        {/* Overall Rating Summary */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-[#7919e6]">
                                {calculateAverageRating(reviews).toFixed(1)}
                              </div>
                              <div className="flex justify-center mb-1">
                                {renderStars(calculateAverageRating(reviews), 'md')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div className="flex-1">
                              {[5, 4, 3, 2, 1].map(rating => {
                                const count = reviews.filter(r => r.rating === rating).length;
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                  <div key={rating} className="flex items-center gap-2 mb-1">
                                    <span className="text-sm w-2">{rating}</span>
                                    <span className="text-yellow-400">★</span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-yellow-400 h-2 rounded-full" 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600 w-8">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        
                        {/* Individual Reviews */}
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {(review.customer.name || review.customer.username).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                      {review.customer.name || review.customer.username}
                                    </span>
                                    {renderStars(review.rating, 'sm')}
                                  </div>
                                  {review.comment && (
                                    <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {mounted ? new Date(review.createdAt).toLocaleDateString('en-GB') : review.createdAt}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-2.83-.497l-5.17 1.55 1.55-5.17A8.013 8.013 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                        </svg>
                        <p>No reviews yet</p>
                        <p className="text-sm">Be the first to review this service!</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Provider Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Service Provider</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedService.provider.name ? selectedService.provider.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div className="font-semibold">{selectedService.provider.name || 'Provider'}</div>
                      <div className="text-sm text-gray-600">{selectedService.provider.serviceType}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedService.provider.phone && (
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">Contact</div>
                          <div>
                            {selectedService.provider.phone}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedService.provider.email && (
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div>{selectedService.provider.email}</div>
                        </div>
                      </div>
                    )}
                    
                    {selectedService.provider.address && (
                      <div className="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-600 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <div>
                          <div className="text-sm text-gray-500">Location</div>
                          <div>{selectedService.provider.address}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    {session ? (
                      <Button 
                        variant="gradient" 
                        className="w-full cursor-pointer"
                        onClick={() => openBookingForm(selectedService)}
                      >
                        Book Service
                      </Button>
                    ) : (
                      <Link href="/login" className="block">
                        <Button 
                          variant="gradient" 
                          className="w-full cursor-pointer"
                        >
                          Login to Book Service
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm && selectedService && session && (
        <BookingForm
          service={selectedService}
          onClose={closeBookingForm}
          onSuccess={handleBookingSuccess}
          customerAddress=""
          customerCoordinates={null}
        />
      )}
    </div>
  );
}