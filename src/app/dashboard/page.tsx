'use client';

import { HeroSectionNexus } from "@/components/ui/hero-section-nexus";
import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  providerId: number;
  provider: {
    id: number;
    name: string | null;
    serviceType: string;
  };
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const servicesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

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
  }, []);

  // Filter services by category
  const filteredServices = selectedCategory === "All" 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  // Get top 6 services for display
  const displayServices = filteredServices.slice(0, 6);

  const handleServiceClick = (serviceId: number) => {
    if (session) {
      // If logged in, navigate to the recommendation page
      router.push(`/customer/services/recommendation?serviceId=${serviceId}`);
    } else {
      // If not logged in, redirect to login page
      router.push('/login');
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <HeroSectionNexus 
          onGetStartedClick={scrollToServices} 
          onLearnMoreClick={scrollToAbout}
        />
        
        {/* Featured Services Section */}
        <section ref={servicesRef} className="py-16 bg-gray-50" id="services">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Explore Our Services
              </motion.h2>
              <motion.p 
                className="text-gray-600 max-w-2xl mx-auto"
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-[#7919e6] text-white"
                      : "bg-white border hover:bg-gray-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-[#7919e6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading services...</p>
              </div>
            ) : (
              <>
                {/* Services Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                      onClick={() => handleServiceClick(service.id)}
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
                          <h3 className="text-xl font-bold">{service.name}</h3>
                          <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{service.category}</span>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-8 bg-[#7919e6] rounded-full flex items-center justify-center text-white font-bold">
                              {service.provider.name ? service.provider.name.charAt(0).toUpperCase() : 'P'}
                            </div>
                            <span className="text-sm text-gray-600">{service.provider.name || 'Provider'}</span>
                          </div>
                          <span className="font-bold text-[#7919e6]">RM {service.price.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Login overlay for non-authenticated users */}
                      {!session && (
                        <div>
                          <Link href="/login" passHref>
                            <button
                              onClick={(e) => e.stopPropagation()}
                            >
                            </button>
                          </Link>
                        </div>
                      )}
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
        <section ref={aboutRef} className="py-20 bg-white" id="about">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">About <span className="text-[#7919e6]">ServiceFinder</span></h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                ServiceFinder connects you with trusted local service providers, making it easy to find the help you need for any task, big or small.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <motion.div 
                className="bg-gray-50 p-8 rounded-xl shadow-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-[#7919e6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#7919e6" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Local Services</h3>
                <p className="text-gray-600">
                  Find service providers in your neighborhood, with precise location tracking to show you the nearest options.
                </p>
              </motion.div>

              <motion.div 
                className="bg-gray-50 p-8 rounded-xl shadow-sm text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-[#7919e6]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#7919e6" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Trusted Providers</h3>
                <p className="text-gray-600">
                  All service providers undergo verification. Read reviews from other customers to make informed decisions.
                </p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-16 bg-gray-900 rounded-2xl overflow-hidden shadow-xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-10 md:p-16 flex flex-col justify-center">
                  <h3 className="text-3xl font-bold text-white mb-6">Become a Service Provider</h3>
                  <p className="text-gray-300 mb-8">
                    Join our network of skilled professionals. Create your profile, list your services, and start growing your business with ServiceFinder.
                  </p>
                  <Link href="/register/provider" passHref>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button variant="gradient" className="text-black">
                        Join as Provider
                      </Button>
                    </motion.div>
                  </Link>
                </div>
                <div className="bg-[url('/provider-illustration.jpg')] bg-cover bg-center h-64 md:h-auto"></div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}