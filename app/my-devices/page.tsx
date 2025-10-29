"use client";

import { useEffect, useState } from "react";
import { Device } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import UserRoute from "@/components/UserRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Monitor, HardDrive, Package, Calendar } from "lucide-react";

export default function MyDevicesPage() {
  return (
    <UserRoute>
      <MyDevicesContent />
    </UserRoute>
  );
}

function MyDevicesContent() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyDevices();
    }
  }, [user]);

  const fetchMyDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("assigned_to", user?.email)
        .order("assigned_date", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-100 text-green-800 border-green-200";
      case "available":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not_working":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDeviceIcon = (type: string) => {
    if (type.toLowerCase().includes("monitor")) {
      return <Monitor className="w-6 h-6 text-green-600" />;
    }
    return <HardDrive className="w-6 h-6 text-green-600" />;
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
              <h1 className="text-3xl font-bold text-gray-900">My Devices</h1>
              <p className="text-gray-600 mt-1">View all devices currently assigned to you</p>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : devices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No devices assigned to you</p>
            <p className="text-gray-400 text-sm mt-2">
              You can request a device from the Request Device page
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="bg-white/20 p-2 rounded-lg">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                        device.status
                      )}`}
                    >
                      {device.status === "assigned" ? "Assigned" : device.status === "available" ? "Available" : "Not Working"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {device.device_type}
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Asset Number
                      </p>
                      <p className="text-sm font-mono text-gray-900 mt-1">
                        {device.asset_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Serial Number
                      </p>
                      <p className="text-sm font-mono text-gray-900 mt-1">
                        {device.serial_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">
                        Brand / Model
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {device.brand || "-"} {device.model ? `/ ${device.model}` : ""}
                      </p>
                    </div>

                    {device.assigned_date && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Assigned Date
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {new Date(device.assigned_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {device.notes && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Notes
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {device.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
          </main>
        </div>
      </div>
    </div>
  );
}

