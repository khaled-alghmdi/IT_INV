"use client";

import Image from "next/image";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full px-6 py-2.5">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="p-1 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.6)] cursor-pointer">
            <Image 
              src="/Tamer_Logo.png" 
              alt="Tamer Logo" 
              width={100} 
              height={33}
              className="h-8 w-auto object-contain transition-all duration-300"
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
      </div>
    </nav>
  );
};

export default Navbar;

