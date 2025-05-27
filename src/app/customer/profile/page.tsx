'use client';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function UserProfilePage() {
  const { data: session } = useSession();
  const [user, setUser] = useState({
    name: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch current user profile from API on mount
  useEffect(() => {
    async function fetchProfile() {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setUser({
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          currentPassword: '',
          newPassword: '',
        });
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    // Clear any previous success/error messages when user makes changes
    setSuccess(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError('');
    
    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    
    setSaving(false);
    
    if (res.ok) {
      setSuccess(true);
      // Clear password fields after successful update
      setUser({
        ...user,
        currentPassword: '',
        newPassword: '',
      });
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to update profile');
    }
  };

  const [showSettings, setShowSettings] = useState(false);
  const handleLogout = async () => {
    localStorage.clear();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
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
      {/* Center: Navigation */}
      <div className="hidden md:flex items-center gap-6 text-white">
        <Link href="/customer/index" className="hover:text-[#7919e6] transition-colors">
          Home
        </Link>
        <Link href="/customer/bookings" className="hover:text-[#7919e6] transition-colors" >
          My Bookings
        </Link>
        <Link href="/customer/profile" className="text-[#7919e6] font-semibold" >
          Profile
        </Link>
      </div>
      {/* Right: User, Cart, Settings */}
      <div className="flex items-center gap-6 text-gray-700 text-base">
        <div className="flex items-center gap-1 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{user.name}</span>
          
        </div>
        {/* Cart Button */}
        <button className="hover:text-[#E91E63] cursor-pointer flex items-center text-white" aria-label="Cart">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l1.4-7H6.6M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L19 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
          </svg>
        </button>
        <div className="relative">
          <button
            className="hover:text-[#E91E63]  cursor-pointer flex items-center text-white"
            onClick={() => setShowSettings((s) => !s)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 3.75a.75.75 0 011.5 0v1.068a7.501 7.501 0 014.482 2.57l.76-.76a.75.75 0 111.06 1.06l-.76.76a7.501 7.501 0 012.57 4.482h1.068a.75.75 0 010 1.5h-1.068a7.501 7.501 0 01-2.57 4.482l.76.76a.75.75 0 11-1.06 1.06l-.76-.76a7.501 7.501 0 01-4.482 2.57v1.068a.75.75 0 01-1.5 0v-1.068a7.501 7.501 0 01-4.482-2.57l-.76.76a.75.75 0 11-1.06-1.06l.76-.76a7.501 7.501 0 01-2.57-4.482H3.75a.75.75 0 010-1.5h1.068a7.501 7.501 0 012.57-4.482l-.76-.76a.75.75 0 111.06-1.06l.76.76a7.501 7.501 0 014.482-2.57V3.75z" />
              <circle cx="12" cy="12" r="3" fill="#E91E63" />
            </svg>
          </button>
          {showSettings && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
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
    {/* Profile Page */}
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          My profile
          <span title="Profile information">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4m0-4h.01" />
            </svg>
          </span>
        </h2>
        
        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="p-3 mb-4 bg-green-100 text-green-700 rounded">Profile updated successfully!</div>}
        
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={user.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              name="username"
              type="text"
              value={user.username}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        <hr className="my-6" />

        <h3 className="text-xl font-bold mb-2">Email</h3>
        <div className="space-y-2 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              value={user.email} 
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 bg-gray-100" 
            />
            <p className="text-xs text-gray-500 mt-1">Changing your email will require you to login again.</p>
          </div>
        </div>

        <hr className="my-6" />

        <h3 className="text-xl font-bold mb-2">Password</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Current password</label>
            <input 
              name="currentPassword"
              type="password" 
              value={user.currentPassword}
              onChange={handleChange}
              placeholder="Enter your current password" 
              className="w-full border rounded px-3 py-2 bg-gray-100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input 
              name="newPassword"
              type="password" 
              value={user.newPassword}
              onChange={handleChange}
              placeholder="Enter your new password" 
              className="w-full border rounded px-3 py-2 bg-gray-100" 
            />
          </div>
        </div>
        
        <Button
          variant="gradient"
          onClick={handleSave}
          disabled={saving}
          className="mt-6"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </>
  );
}