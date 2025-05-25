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
                <span className="text-white font-extrabold text-2xl tracking-tight" style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif", letterSpacing: "0.01em" }}>          Service<span className="text-[#7919e6]">Finder</span>        </span>
      </div>

      {/* Right: Auth & CTA */}
      <div className="flex items-center gap-3">
      <Link href="/login" className="text-white text-sm font-medium hover:text-[#7919e6] transition-colors">Login</Link>
        <Button asChild variant="gradient" size="sm">
          <Link href="/register">Become a Provider</Link>
        </Button>
      </div>
    </nav>
  );
}
