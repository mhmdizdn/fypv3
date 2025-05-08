
import Link from "next/link";
import Image from "next/image";
import { Button } from "./button";

export function Navbar() {
  return (
    <nav className="w-full bg-[#111] border-b border-black/30 px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-1">
        <div className="w-8 h-8 flex items-center justify-center">
          <Image
            src="/servicefinder-logo.png"
            alt="ServiceFinder Logo"
            width={32}
            height={32}
            priority
          />
        </div>
        <span className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif", letterSpacing: "0.01em" }}>
          Service<span className="text-[#19E6A7]">Finder</span>
        </span>
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center gap-6 text-white text-sm font-medium">
        <Link href="#" className="hover:text-[#19E6A7] transition-colors">Product</Link>
        <Link href="#" className="hover:text-[#19E6A7] transition-colors">Customers</Link>
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-[#19E6A7] transition-colors">
            Channels
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {/* Dropdown (hidden by default) */}
          <div className="absolute left-0 mt-2 min-w-[140px] bg-[#181818] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20">
            <Link href="#" className="block px-4 py-2 hover:bg-[#222]">Channel 1</Link>
            <Link href="#" className="block px-4 py-2 hover:bg-[#222]">Channel 2</Link>
          </div>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-[#19E6A7] transition-colors">
            Resources
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div className="absolute left-0 mt-2 min-w-[140px] bg-[#181818] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-20">
            <Link href="#" className="block px-4 py-2 hover:bg-[#222]">Blog</Link>
            <Link href="#" className="block px-4 py-2 hover:bg-[#222]">Guides</Link>
          </div>
        </div>
        <Link href="#" className="hover:text-[#19E6A7] transition-colors">Docs</Link>
        <Link href="#" className="hover:text-[#19E6A7] transition-colors">Pricing</Link>
      </div>

      {/* Right: Auth & CTA */}
      <div className="flex items-center gap-3">
        <Link href="#" className="text-white text-sm font-medium hover:text-[#19E6A7] transition-colors">Sign in</Link>
        <Button className="bg-[#19E6A7] text-black font-semibold hover:bg-[#13c18d] px-5 py-2 rounded-md text-sm shadow-none">
          Become a Provider
        </Button>
      </div>
    </nav>
  );
}
