"use client";

import Image from "next/image";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/lib/auth-context";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full px-6 py-2.5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(34,197,94,0.5)] cursor-pointer">
              <Image 
                src="/Tamer_Logo.png" 
                alt="Tamer Logo" 
                width={120} 
                height={40}
                className="h-10 w-auto object-contain"
                priority
                unoptimized
              />
            </div>
            
            {/* Brand Name */}
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Infora
              </h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">Smart Asset Management</p>
            </div>
          </div>

          {/* Right Side: Notifications */}
          {user && (
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

