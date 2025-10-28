"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Device, DeviceFormData } from "@/lib/types";
import { X } from "lucide-react";

interface UserOption {
  id: string;
  email: string;
}

interface EditDeviceModalProps {
  isOpen: boolean;
  device: Device;
  onClose: () => void;
}

const EditDeviceModal = ({ isOpen, device, onClose }: EditDeviceModalProps) => {
  const [formData, setFormData] = useState<DeviceFormData>({
    asset_number: "",
    serial_number: "",
    device_type: "",
    brand: "",
    model: "",
    status: "available",
    assigned_to: "",
    assigned_date: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        asset_number: device.asset_number,
        serial_number: device.serial_number,
        device_type: device.device_type,
        brand: device.brand || "",
        model: device.model || "",
        status: device.status,
        assigned_to: device.assigned_to || "",
        assigned_date: device.assigned_date || "",
        notes: device.notes || "",
      });
    }
  }, [device]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch("/api/users");
      
      if (response.ok) {
        const { users: fetchedUsers } = await response.json();
        const userOptions = fetchedUsers.map((user: any) => ({
          id: user.id,
          email: user.email,
        }));
        setUsers(userOptions);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.asset_number || !formData.serial_number || !formData.device_type) {
        setError("Asset Number, Serial Number, and Device Type are required");
        setLoading(false);
        return;
      }

      // Prepare data for update
      const deviceData: any = {
        asset_number: formData.asset_number,
        serial_number: formData.serial_number,
        device_type: formData.device_type,
        brand: formData.brand || null,
        model: formData.model || null,
        status: formData.status,
        notes: formData.notes || null,
        updated_at: new Date().toISOString(),
      };

      // Only add assigned_to and assigned_date if status is assigned
      if (formData.status === "assigned") {
        deviceData.assigned_to = formData.assigned_to || null;
        deviceData.assigned_date = formData.assigned_date || new Date().toISOString().split('T')[0];
      } else {
        deviceData.assigned_to = null;
        deviceData.assigned_date = null;
      }

      const { error: updateError } = await supabase
        .from("devices")
        .update(deviceData)
        .eq("id", device.id);

      if (updateError) throw updateError;

      onClose();
    } catch (err: any) {
      console.error("Error updating device:", err);
      setError(err.message || "Failed to update device");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-device-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 id="edit-device-title" className="text-2xl font-bold text-gray-900">
            Edit Device
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="asset_number" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="asset_number"
                name="asset_number"
                value={formData.asset_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="device_type" className="block text-sm font-medium text-gray-700 mb-1">
                Device Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="device_type"
                name="device_type"
                value={formData.device_type}
                onChange={handleChange}
                required
                placeholder="e.g., Laptop, Monitor, Desktop"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              >
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="not_working">Not Working</option>
              </select>
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Dell, HP, Apple"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
              />
            </div>

            {formData.status === "assigned" && (
              <>
                <div>
                  <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned To
                  </label>
                  <select
                    id="assigned_to"
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                  >
                    <option value="">Select a user...</option>
                    {loadingUsers ? (
                      <option disabled>Loading users...</option>
                    ) : (
                      users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.email}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="assigned_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    id="assigned_date"
                    name="assigned_date"
                    value={formData.assigned_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional information..."
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg"
            >
              {loading ? "Updating..." : "Update Device"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeviceModal;

