"use client";

import { useEffect, useState } from "react";
import { Device } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import DeviceList from "@/components/DeviceList";
import AddDeviceModal from "@/components/AddDeviceModal";
import EditDeviceModal from "@/components/EditDeviceModal";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AdminRoute from "@/components/AdminRoute";
import { Plus, Search, HardDrive, Trash2 } from "lucide-react";

export default function DevicesPage() {
  return (
    <AdminRoute>
      <DevicesContent />
    </AdminRoute>
  );
}

function DevicesContent() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

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

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDevice(null);
    fetchDevices();
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  const handleDeleteDevice = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;
    setDeviceToDelete(device);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("devices")
        .delete()
        .eq("id", deviceToDelete.id);

      if (error) throw error;

      // Refresh the device list
      fetchDevices();
      setDeviceToDelete(null);
    } catch (error: any) {
      console.error("Error deleting device:", error);
      alert(`Failed to delete device: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeviceToDelete(null);
  };

  // Calculate stats
  const stats = {
    total: devices.length,
    assigned: devices.filter((d) => d.status === "assigned").length,
    available: devices.filter((d) => d.status === "available").length,
    notWorking: devices.filter((d) => d.status === "not_working").length,
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
          {/* Page Header with Stats and Search */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Device Management</h1>
                  <p className="text-gray-600 mt-1">Manage all devices in the system</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
                  aria-label="Add new device"
                >
                  <Plus className="w-5 h-5" />
                  Add Device
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-green-700 font-semibold">Total Devices</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{stats.total}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-blue-700 font-semibold">Assigned</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{stats.assigned}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-emerald-700 font-semibold">Available</p>
                  <p className="text-3xl font-bold text-emerald-900 mt-1">{stats.available}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-red-700 font-semibold">Not Working</p>
                  <p className="text-3xl font-bold text-red-900 mt-1">{stats.notWorking}</p>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search devices..."
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

          {/* Device List */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredDevices.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <HardDrive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm || statusFilter !== "all" ? "No devices found" : "No devices yet"}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Click the 'Add Device' button to get started"}
                </p>
              </div>
            ) : (
              <DeviceList
                devices={filteredDevices}
                onEdit={handleEditDevice}
                onDelete={handleDeleteDevice}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddDeviceModal isOpen={isAddModalOpen} onClose={handleModalClose} />
      )}

      {selectedDevice && (
        <EditDeviceModal
          isOpen={isEditModalOpen}
          device={selectedDevice}
          onClose={handleModalClose}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deviceToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete Device</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              Are you sure you want to permanently delete this device? This action cannot be undone.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Asset Number:</span>
                  <span className="text-gray-900 font-mono">{deviceToDelete.asset_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Type:</span>
                  <span className="text-gray-900">{deviceToDelete.device_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Brand:</span>
                  <span className="text-gray-900">{deviceToDelete.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Model:</span>
                  <span className="text-gray-900">{deviceToDelete.model || 'N/A'}</span>
                </div>
                {deviceToDelete.assigned_to && (
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Assigned To:</span>
                    <span className="text-gray-900">{deviceToDelete.assigned_to}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Device
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

