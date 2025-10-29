"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserRole } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardDrive, Users as UsersIcon, FileText, TrendingUp, Package, ArrowRight, Activity } from "lucide-react";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDevices: 0,
    assignedDevices: 0,
    availableDevices: 0,
    notWorkingDevices: 0,
    totalUsers: 0,
    pendingRequests: 0,
  });
  const [recentDevices, setRecentDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      const role = await getUserRole();
      
      // Redirect regular users to their devices page
      if (role === "user") {
        router.push("/my-devices");
        return;
      }
      
      setCheckingRole(false);
    };

    checkUserRole();
  }, [router]);

  useEffect(() => {
    if (!checkingRole) {
      fetchDashboardData();
    }
  }, [checkingRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch devices
      const { data: devices, error: devicesError } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false });

      if (devicesError) throw devicesError;

      // Fetch users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("*");

      if (usersError) throw usersError;

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from("device_requests")
        .select("*")
        .eq("status", "pending");

      if (requestsError) throw requestsError;

      // Calculate stats
      setStats({
        totalDevices: devices?.length || 0,
        assignedDevices: devices?.filter((d) => d.status === "assigned").length || 0,
        availableDevices: devices?.filter((d) => d.status === "available").length || 0,
        notWorkingDevices: devices?.filter((d) => d.status === "not_working").length || 0,
        totalUsers: users?.length || 0,
        pendingRequests: requests?.length || 0,
      });

      // Get 5 most recent devices
      setRecentDevices(devices?.slice(0, 5) || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_working":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 dots-background flex flex-col">
      {/* Top Navbar */}
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Page Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600 mt-1">Overview of your IT inventory system</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Devices */}
                    <Link
                      href="/devices"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-lg">
                          <HardDrive className="w-6 h-6 text-green-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Devices</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDevices}</p>
                      <div className="mt-3 flex gap-3 text-xs">
                        <span className="text-blue-600">Assigned: {stats.assignedDevices}</span>
                        <span className="text-green-600">Available: {stats.availableDevices}</span>
                        <span className="text-red-600">Issues: {stats.notWorkingDevices}</span>
                      </div>
                    </Link>

                    {/* Total Users */}
                    <Link
                      href="/users"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg">
                          <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Avg devices per user: {stats.totalUsers > 0 ? (stats.assignedDevices / stats.totalUsers).toFixed(1) : "0"}
                      </p>
                    </Link>

                    {/* Pending Requests */}
                    <Link
                      href="/requests"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Pending Requests</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
                      {stats.pendingRequests > 0 && (
                        <p className="text-xs text-orange-600 font-medium mt-3">
                          Requires attention
                        </p>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Recent Devices */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Devices</h2>
                    <Link
                      href="/devices"
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {recentDevices.length === 0 ? (
                      <div className="p-12 text-center">
                        <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No devices yet</p>
                        <Link
                          href="/devices"
                          className="inline-flex items-center gap-2 mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Add your first device
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asset Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand/Model
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned To
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recentDevices.map((device) => (
                              <tr key={device.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {device.asset_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {device.device_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {device.brand} {device.model}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(device.status)}`}>
                                    {device.status.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {device.assigned_to || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/devices"
                      className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
                    >
                      <HardDrive className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Manage Devices</h3>
                      <p className="text-sm text-green-50">Add, edit, or remove devices</p>
                      <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/users"
                      className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
                    >
                      <UsersIcon className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Manage Users</h3>
                      <p className="text-sm text-blue-50">View and assign user roles</p>
                      <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/requests"
                      className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
                    >
                      <FileText className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Review Requests</h3>
                      <p className="text-sm text-orange-50">Approve or reject device requests</p>
                      <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
