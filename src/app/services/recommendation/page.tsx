'use client'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar';
import { useSearchParams } from 'next/navigation';

// Dummy data for home service providers
const serviceProviders = [
  {
    id: 1,
    name: 'Sparkle Home Cleaning',
    category: 'Cleaning',
    rating: 5.0,
    reviews: 12,
    price: 'RM50.00',
    status: 'Closed until Wed 10:00',
    image: '/service-cleaning.jpg',
  },
  {
    id: 2,
    name: 'HandyFix Plumbing',
    category: 'Plumbing',
    rating: 5.0,
    reviews: 8,
    price: 'RM80.00',
    status: 'Closed until Wed 07:00',
    image: '/service-plumbing.jpg',
  },
  {
    id: 3,
    name: 'CoolBreeze Aircon Service',
    category: 'Air Conditioning',
    rating: 5.0,
    reviews: 28,
    price: 'RM120.00',
    status: 'Closed until Wed 11:00',
    image: '/service-aircon.jpg',
  },
  {
    id: 4,
    name: 'LaundryPro',
    category: 'Laundry',
    rating: 5.0,
    reviews: 15,
    price: 'RM30.00',
    status: 'Closed until Wed 10:00',
    image: '/service-laundry.jpg',
  },
  {
    id: 5,
    name: 'Bright Tutors',
    category: 'Tutoring',
    rating: 5.0,
    reviews: 20,
    price: 'RM40.00',
    status: 'Closed until Wed 13:30',
    image: '/service-tutoring.jpg',
  },
  {
    id: 6,
    name: 'GardenCare',
    category: 'Gardening',
    rating: 5.0,
    reviews: 10,
    price: 'RM60.00',
    status: 'Closed until Wed 11:30',
    image: '/service-gardening.jpg',
  },
];

function ServiceNavbar() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const address = searchParams?.get('address') || 'Select your location';

  // TSX-safe userName logic
  const [userName, setUserName] = useState<string>('Account');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserName(localStorage.getItem('userName') || 'Account');
    }
  }, []);

  const [showSettings, setShowSettings] = useState(false);
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
      {/* Left: Logo and App Name */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 flex items-center justify-center">
          <img
            src="/servicefinder-logo.png"
            alt="ServiceFinder Logo"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <span className="text-[#E91E63] font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif", letterSpacing: "0.01em" }}>
          service<span className="text-[#111]">finder</span>
        </span>
      </div>
      {/* Center: Address */}
      <div className="hidden md:flex items-center gap-2 text-gray-700 text-lg font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-[#111]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-4.03-8-9a8 8 0 1116 0c0 4.97-3.582 9-8 9z" />
          <circle cx="12" cy="12" r="3" fill="#E91E63" />
        </svg>
        <span>{address}</span>
      </div>
      {/* Right: User, Cart, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{userName}</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
          </svg>
        </div>
        {/* Cart Button */}
        <button className="hover:text-[#E91E63] flex items-center" aria-label="Cart">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l1.4-7H6.6M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L19 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
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
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
              <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</a>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
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

export default function ServiceRecommendationPage() {
  const [sort, setSort] = useState('relevance');
  const [quickFilter, setQuickFilter] = useState('');
  const [offers, setOffers] = useState<{vouchers: boolean, deals: boolean}>({vouchers: false, deals: false});
  const [search, setSearch] = useState('');

  // Filter and sort logic (simple for mockup)
  let filteredProviders = serviceProviders.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  if (quickFilter === 'top') filteredProviders = filteredProviders.filter(p => p.rating >= 5);
  if (quickFilter === '4+') filteredProviders = filteredProviders.filter(p => p.rating >= 4);
  if (offers.vouchers) filteredProviders = filteredProviders.filter(p => p.id % 2 === 0); // Dummy logic
  if (offers.deals) filteredProviders = filteredProviders.filter(p => p.id % 2 === 1); // Dummy logic
  if (sort === 'rating') filteredProviders = [...filteredProviders].sort((a, b) => b.rating - a.rating);

  return (
    <>
      <ServiceNavbar />
      <div className="flex min-h-screen bg-[#fafafa]">
        {/* Sidebar Filters */}
        <aside className="w-80 bg-white border-r border-gray-200 p-6 hidden md:block">
          <h2 className="text-2xl font-bold mb-6">Filters</h2>
          <div className="mb-6">
            <div className="font-semibold mb-2">Sort by</div>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'relevance'} onChange={() => setSort('relevance')} /> Relevance
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'fastest'} onChange={() => setSort('fastest')} /> Fastest delivery
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'distance'} onChange={() => setSort('distance')} /> Distance
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="sort" checked={sort === 'rating'} onChange={() => setSort('rating')} /> Top rated
              </label>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2">Quick filters</div>
            <div className="flex flex-col gap-2">
              <button className={`px-3 py-1 rounded-full border flex items-center gap-2 ${quickFilter === 'top' ? 'bg-[#19E6A7] text-white' : 'bg-white text-gray-700'}`} onClick={() => setQuickFilter(quickFilter === 'top' ? '' : 'top')}>
                <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.24 7.76a6 6 0 11-8.49 0M12 3v9" /></svg></span>
                Top provider
              </button>
              <button className={`px-3 py-1 rounded-full border ${quickFilter === '4+' ? 'bg-[#fff] text-[#19E6A7] border-[#19E6A7]' : 'bg-white text-gray-700'}`} onClick={() => setQuickFilter(quickFilter === '4+' ? '' : '4+')}>Ratings 4+</button>
            </div>
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2">Offers</div>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={offers.vouchers} onChange={e => setOffers(o => ({...o, vouchers: e.target.checked}))} /> Accepts vouchers
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={offers.deals} onChange={e => setOffers(o => ({...o, deals: e.target.checked}))} /> Deals
            </label>
          </div>
          <div className="mb-6">
            <div className="font-semibold mb-2">Service Type</div>
            <input
              type="text"
              placeholder="Search for service type"
              className="w-full px-3 py-2 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#19E6A7]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="w-full flex justify-center mb-8">
            <input
              type="text"
              placeholder="Search for services, providers, and categories"
              className="w-full max-w-3xl px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#19E6A7] text-lg shadow-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <h1 className="text-5xl font-extrabold mb-8">Closed for now</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map(provider => (
              <div key={provider.id} className="bg-white rounded-xl shadow-md overflow-hidden relative flex flex-col">
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={provider.image} alt={provider.name} className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                    <span className="text-white font-bold text-lg mb-2">{provider.status}</span>
                    <button className="bg-[#E91E63] text-white px-4 py-2 rounded font-semibold">Book for later</button>
                  </div>
                  <button className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-[#19E6A7] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#E91E63]">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.318 6.318a4.5 4.5 0 016.364 0l.318.318.318-.318a4.5 4.5 0 116.364 6.364L12 21.364l-6.682-6.682a4.5 4.5 0 010-6.364z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg line-clamp-1">{provider.name}</span>
                    <span className="text-yellow-500 flex items-center gap-1 text-sm font-semibold">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.382 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.382-2.454a1 1 0 00-1.176 0l-3.382 2.454c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                      {provider.rating} <span className="text-gray-500 font-normal">({provider.reviews})</span>
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm mb-2">{provider.category}</div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-semibold text-[#19E6A7]">{provider.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredProviders.length === 0 && (
            <div className="text-center text-gray-500 mt-12 text-lg">No service providers found for your search/filter.</div>
          )}
        </main>
      </div>
    </>
  );
}
