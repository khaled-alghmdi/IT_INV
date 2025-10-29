"use client";

import { LogOut, User, Users, LayoutDashboard, FileText, Package, Monitor, HardDrive, BarChart3 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserRole } from "@/lib/auth-helpers";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const Sidebar = () => {
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
    <aside className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-64 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 shadow-lg border-r border-gray-200 flex flex-col z-40">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-full">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.email}</p>
            <p className="text-[10px] text-green-600 font-medium">
              {isAdmin ? "Administrator" : "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {isAdmin ? (
            <>
              {/* Admin Navigation */}
              <Link
                href="/"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                  pathname === "/"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-sm">Dashboard</span>
              </Link>

              <Link
                href="/devices"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                  pathname === "/devices"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <HardDrive className="w-5 h-5" />
                <span className="text-sm">Devices</span>
              </Link>

              <Link
                href="/users"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                  pathname === "/users"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm">Users</span>
              </Link>

              <Link
                href="/requests"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium relative ${
                  pathname === "/requests"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-sm">Requests</span>
                {pendingRequestsCount > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                    {pendingRequestsCount}
                  </span>
                )}
              </Link>

              <Link
                href="/reports"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                  pathname === "/reports"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm">Reports</span>
              </Link>
            </>
          ) : (
            <>
              {/* User Navigation */}
              <Link
                href="/my-devices"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                  pathname === "/my-devices"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <Package className="w-5 h-5" />
                <span className="text-sm">My Devices</span>
              </Link>

              <Link
                href="/request-device"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${
                  pathname === "/request-device"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
              >
                <Monitor className="w-5 h-5" />
                <span className="text-sm">Request Device</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Sign Out Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-lg transition-all font-medium border border-gray-200 hover:border-red-200"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

