"use client";

import { useState, useEffect } from "react";
import { DeviceRequest } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import UserRoute from "@/components/UserRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Monitor, Package, Send, CheckCircle, XCircle, Clock } from "lucide-react";

export default function RequestDevicePage() {
  return (
    <UserRoute>
      <RequestDeviceContent />
    </UserRoute>
  );
}

function RequestDeviceContent() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    device_type: "",
    brand: "",
    model: "",
    justification: "",
  });

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("device_requests")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.device_type || !formData.justification) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from("device_requests").insert([
        {
          user_id: user?.id,
          user_email: user?.email,
          device_type: formData.device_type,
          brand: formData.brand || null,
          model: formData.model || null,
          justification: formData.justification,
          status: "pending",
        },
      ]);

      if (error) throw error;

      setFormData({
        device_type: "",
        brand: "",
        model: "",
        justification: "",
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      await fetchMyRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
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
              <h1 className="text-3xl font-bold text-gray-900">Request Device</h1>
              <p className="text-gray-600 mt-1">Submit a request for a new device</p>
            </div>
          </div>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Submit Device Request
              </h2>

              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-green-700 font-medium">
                    Request submitted successfully!
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="device_type"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Device Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="device_type"
                    name="device_type"
                    value={formData.device_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    aria-label="Device type"
                  >
                    <option value="">Select device type</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Monitor">Monitor</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Mouse">Mouse</option>
                    <option value="Headset">Headset</option>
                    <option value="Webcam">Webcam</option>
                    <option value="Docking Station">Docking Station</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="brand"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Preferred Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., Dell, HP, Lenovo"
                    aria-label="Preferred brand"
                  />
                </div>

                <div>
                  <label
                    htmlFor="model"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Preferred Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="e.g., ThinkPad X1"
                    aria-label="Preferred model"
                  />
                </div>

                <div>
                  <label
                    htmlFor="justification"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Justification <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="justification"
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Please explain why you need this device..."
                    aria-label="Justification"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Submit request"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* My Requests */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              My Requests
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center border border-gray-200">
                <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No requests yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Submit your first device request
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {request.device_type}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    {(request.brand || request.model) && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Requested:</span>{" "}
                          {request.brand} {request.model}
                        </p>
                      </div>
                    )}

                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        Justification:
                      </p>
                      <p className="text-sm text-gray-600">
                        {request.justification}
                      </p>
                    </div>

                    {request.admin_notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Admin Notes:
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.admin_notes}
                        </p>
                      </div>
                    )}

                    {request.reviewed_at && (
                      <div className="mt-3 text-xs text-gray-500">
                        Reviewed on{" "}
                        {new Date(request.reviewed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          </main>
        </div>
      </div>
    </div>
  );
}

