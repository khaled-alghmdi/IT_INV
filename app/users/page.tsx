"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Header from "@/components/Header";
import { Users, Package, ChevronDown, ChevronUp, Shield, User } from "lucide-react";
import { updateUserRole } from "@/lib/auth-helpers";
import { UserRole } from "@/lib/types";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role?: UserRole;
}

interface Device {
  id: string;
  asset_number: string;
  serial_number: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  assigned_date: string | null;
  notes: string | null;
}

interface UserWithDevices {
  user: UserData;
  devices: Device[];
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <UsersPageContent />
      </AdminRoute>
    </ProtectedRoute>
  );
}

function UsersPageContent() {
  const [usersWithDevices, setUsersWithDevices] = useState<UserWithDevices[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsersAndDevices();
  }, []);

  const fetchUsersAndDevices = async () => {
    try {
      setLoading(true);

      // Fetch all users from API route (server-side)
      const response = await fetch("/api/users");
      
      if (!response.ok) {
        console.error("Error fetching users:", response.statusText);
        alert("Failed to fetch users. Make sure you're logged in as admin.");
        setLoading(false);
        return;
      }

      const { users } = await response.json();
      
      if (!users) {
        console.error("No users returned");
        setLoading(false);
        return;
      }

      // Fetch all devices
      const { data: devices, error: devicesError } = await supabase
        .from("devices")
        .select("*")
        .eq("status", "assigned")
        .order("assigned_date", { ascending: false });

      if (devicesError) {
        console.error("Error fetching devices:", devicesError);
      }

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Create role map
      const roleMap = new Map<string, UserRole>();
      userRoles?.forEach((ur) => {
        roleMap.set(ur.user_id, ur.role as UserRole);
      });

      // Match devices to users by email
      const usersWithDevicesData: UserWithDevices[] = users.map((user) => {
        const userDevices = devices?.filter(
          (device) => device.assigned_to?.toLowerCase() === user.email?.toLowerCase()
        ) || [];

        return {
          user: {
            id: user.id,
            email: user.email || "No email",
            created_at: user.created_at,
            role: roleMap.get(user.id) || "user",
          },
          devices: userDevices,
        };
      });

      setUsersWithDevices(usersWithDevicesData);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const filteredUsers = usersWithDevices.filter((userWithDevices) =>
    userWithDevices.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = usersWithDevices.length;
  const totalAssignedDevices = usersWithDevices.reduce(
    (sum, u) => sum + u.devices.length,
    0
  );

  const stats = {
    total: totalAssignedDevices,
    assigned: totalAssignedDevices,
    available: 0,
    notWorking: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter="all"
        onStatusFilterChange={() => {}}
        stats={stats}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Users & Their Devices</h2>
              <p className="text-sm text-gray-600">View all users and their assigned devices</p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
            <p className="text-sm text-green-700 font-semibold">Total Users</p>
            <p className="text-3xl font-bold text-green-900 mt-1">{totalUsers}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
            <p className="text-sm text-emerald-700 font-semibold">Assigned Devices</p>
            <p className="text-3xl font-bold text-emerald-900 mt-1">{totalAssignedDevices}</p>
          </div>
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-200 shadow-sm">
            <p className="text-sm text-teal-700 font-semibold">Avg per User</p>
            <p className="text-3xl font-bold text-teal-900 mt-1">
              {totalUsers > 0 ? (totalAssignedDevices / totalUsers).toFixed(1) : "0"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-2">Users will appear here once they sign up</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((userWithDevices) => {
                const isExpanded = expandedUsers.has(userWithDevices.user.id);
                const hasDevices = userWithDevices.devices.length > 0;

                return (
                  <div key={userWithDevices.user.id} className="hover:bg-gray-50 transition-colors">
                    {/* User Header */}
                    <button
                      onClick={() => toggleUser(userWithDevices.user.id)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                      aria-label={`Toggle devices for ${userWithDevices.user.email}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-3 rounded-full ${
                          userWithDevices.user.role === 'admin' 
                            ? 'bg-gradient-to-br from-amber-100 to-orange-100' 
                            : 'bg-green-100'
                        }`}>
                          {userWithDevices.user.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-amber-600" />
                          ) : (
                            <User className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{userWithDevices.user.email}</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              userWithDevices.user.role === 'admin'
                                ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}>
                              {userWithDevices.user.role === 'admin' ? '👑 ADMIN' : 'USER'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Joined: {new Date(userWithDevices.user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Devices</p>
                          <p className={`text-lg font-bold ${hasDevices ? 'text-green-600' : 'text-gray-400'}`}>
                            {userWithDevices.devices.length}
                          </p>
                        </div>
                        {hasDevices && (
                          <div className="text-green-600">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Devices List */}
                    {isExpanded && hasDevices && (
                      <div className="px-6 pb-4 bg-gray-50">
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="min-w-full">
                            <thead className="bg-green-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase">
                                  Asset Number
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase">
                                  Device Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase">
                                  Brand / Model
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-green-700 uppercase">
                                  Assigned Date
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {userWithDevices.devices.map((device) => (
                                <tr key={device.id} className="hover:bg-green-50/50 transition-colors">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <Package className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-mono font-medium text-gray-900">
                                        {device.asset_number}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    {device.device_type}
                                  </td>
                                  <td className="px-4 py-3 text-sm">
                                    <div className="text-gray-900">{device.brand || "-"}</div>
                                    <div className="text-gray-500 text-xs">{device.model || "-"}</div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {device.assigned_date
                                      ? new Date(device.assigned_date).toLocaleDateString()
                                      : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

