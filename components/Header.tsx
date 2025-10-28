"use client";

import { Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  stats: {
    total: number;
    assigned: number;
    available: number;
    notWorking: number;
  };
}

const Header = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  stats,
}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-md border border-green-100">
              <Image 
                src="/tamer-logo.png" 
                alt="Tamer Logo" 
                width={120} 
                height={40}
                className="h-10 w-auto"
                priority
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
              IT Inventory Management
            </h1>
          </div>
          
          {/* User Info and Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">{user?.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-green-700 font-semibold">Total Devices</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-emerald-700 font-semibold">Assigned</p>
            <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.assigned}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-teal-700 font-semibold">Available</p>
            <p className="text-3xl font-bold text-teal-900 mt-1">{stats.available}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-700 font-semibold">Not Working</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.notWorking}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by asset number, serial number, type, brand, model, or assignee..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              aria-label="Search devices"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium transition-all"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="available">Available</option>
            <option value="not_working">Not Working</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;

