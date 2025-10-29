"use client";

import { Search, LogOut, User, Users, LayoutDashboard, Bell, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";

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
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getUserRole();
      setIsAdmin(role === "admin");
      
      if (role === "admin") {
        fetchPendingRequests();
        
        // Subscribe to changes in device_requests table
        const channel = supabase
          .channel("device_requests_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "device_requests",
            },
            () => {
              fetchPendingRequests();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    checkRole();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("device_requests")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      if (error) throw error;
      setPendingRequestsCount(data?.length || 0);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-2 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(34,197,94,0.6)] cursor-pointer">
              <Image 
                src="/Tamer_Logo.png" 
                alt="Tamer Logo" 
                width={150} 
                height={50}
                className="h-12 w-auto object-contain transition-all duration-300"
                priority
                unoptimized
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                Infora
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wide">Smart Asset Management</p>
            </div>
          </div>
          
          {/* Navigation and User Info */}
          <div className="flex items-center gap-3">
            {/* Navigation Links - Admin Only */}
            {isAdmin && (
              <>
                <Link
                  href="/"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    pathname === "/"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                
                <Link
                  href="/users"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    pathname === "/users"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Users</span>
                </Link>

                <Link
                  href="/requests"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium relative ${
                    pathname === "/requests"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Requests</span>
                  {pendingRequestsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingRequestsCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* User Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-100">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 hidden md:inline">{user?.email}</span>
            </div>
            
            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
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

