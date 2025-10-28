"use client";

import { useEffect, useState } from "react";
import { Device } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import DeviceList from "@/components/DeviceList";
import AddDeviceModal from "@/components/AddDeviceModal";
import EditDeviceModal from "@/components/EditDeviceModal";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Plus } from "lucide-react";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        stats={stats}
      />

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
      </main>

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
    </div>
  );
}

