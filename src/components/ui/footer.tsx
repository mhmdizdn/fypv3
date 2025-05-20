import React from "react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#717e87] text-white py-12 px-4 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Social & Discover */}
        <div>
          <div className="mb-4 text-lg font-medium text-gray-300">Follow us!</div>
          <div className="flex items-center gap-3 mb-8">
            <a href="#" aria-label="Facebook" className="hover:opacity-80"><Image src="/fb.svg" alt="Facebook" width={24} height={24} /></a>
            <a href="#" aria-label="Instagram" className="hover:opacity-80"><Image src="/ig.png" alt="Instagram" width={24} height={24} /></a>
          </div>
          <div className="mb-2 text-xl font-semibold">Discover</div>
          <ul className="space-y-1 font-bold">
            <li><a href="/register" className="hover:underline">Become a Tasker</a></li>
            <li><a href="#" className="hover:underline">Help</a></li>
          </ul>
        </div>
        {/* Company */}
        <div>
          <div className="mb-2 text-xl font-semibold">Company</div>
          <ul className="space-y-1 font-bold">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Terms & Privacy</a></li>
            <li><a href="#" className="hover:underline">Legal</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
} 