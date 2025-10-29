"use client";

import { useEffect, useState } from "react";
import { Device } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import DeviceList from "@/components/DeviceList";
import AddDeviceModal from "@/components/AddDeviceModal";
import EditDeviceModal from "@/components/EditDeviceModal";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserRole } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
      fetchDevices();
    }
  }, [checkingRole]);

  useEffect(() => {
    filterDevices();
  }, [devices, searchTerm, statusFilter]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevices = () => {
    let filtered = [...devices];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (device) =>
          device.asset_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          device.assigned_to?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }

    setFilteredDevices(filtered);
  };

  const handleAddDevice = () => {
    setIsAddModalOpen(true);
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this device?")) return;

    try {
      const { error } = await supabase.from("devices").delete().eq("id", id);

      if (error) throw error;
      await fetchDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Failed to delete device");
    }
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDevice(null);
    fetchDevices();
  };

  const stats = {
    total: devices.length,
    assigned: devices.filter((d) => d.status === "assigned").length,
    available: devices.filter((d) => d.status === "available").length,
    notWorking: devices.filter((d) => d.status === "not_working").length,
  };

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-green-700 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 dots-background flex flex-col">
      {/* Top Navbar */}
      <Navbar />
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 ml-64">
          {/* Stats and Search Bar */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  aria-label="Search devices"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Devices</h2>
          <button
            onClick={handleAddDevice}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2.5 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
            aria-label="Add new device"
          >
            <Plus className="w-5 h-5" />
            Add Device
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <DeviceList
            devices={filteredDevices}
            onEdit={handleEditDevice}
            onDelete={handleDeleteDevice}
          />
        )}

        {isAddModalOpen && (
          <AddDeviceModal isOpen={isAddModalOpen} onClose={handleModalClose} />
        )}

        {isEditModalOpen && selectedDevice && (
          <EditDeviceModal
            isOpen={isEditModalOpen}
            device={selectedDevice}
            onClose={handleModalClose}
          />
        )}
          </main>
        </div>
      </div>
    </div>
  );
}

