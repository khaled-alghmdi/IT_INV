"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { 
  AlertCircle, CheckCircle, Laptop, Wifi, HelpCircle, 
  Send, FileText, MapPin, AlertTriangle 
} from "lucide-react";

export default function ReportIssuePage() {
  return (
    <ProtectedRoute>
      <ReportIssueContent />
    </ProtectedRoute>
  );
}

function ReportIssueContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [myDevices, setMyDevices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    issueType: "hardware" as "hardware" | "software" | "network" | "other",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    title: "",
    description: "",
    deviceId: "",
    deviceAssetNumber: "",
    deviceType: "",
    location: "",
  });

  useEffect(() => {
    fetchMyDevices();
  }, [user]);

  const fetchMyDevices = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("assigned_to", user.email)
        .eq("status", "assigned");

      if (error) throw error;
      setMyDevices(data || []);
    } catch (err) {
      console.error("Error fetching devices:", err);
    }
  };

  const handleDeviceSelect = (deviceId: string) => {
    const device = myDevices.find((d) => d.id === deviceId);
    if (device) {
      setFormData({
        ...formData,
        deviceId: device.id,
        deviceAssetNumber: device.asset_number,
        deviceType: device.device_type,
      });
    } else {
      setFormData({
        ...formData,
        deviceId: "",
        deviceAssetNumber: "",
        deviceType: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: insertError } = await supabase
        .from("issue_reports")
        .insert([
          {
            user_email: user?.email,
            user_name: user?.email?.split("@")[0],
            issue_type: formData.issueType,
            severity: formData.severity,
            title: formData.title,
            description: formData.description,
            device_id: formData.deviceId || null,
            device_asset_number: formData.deviceAssetNumber || null,
            device_type: formData.deviceType || null,
            location: formData.location || null,
            status: "pending",
          },
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      
      // Reset form
      setFormData({
        issueType: "hardware",
        severity: "medium",
        title: "",
        description: "",
        deviceId: "",
        deviceAssetNumber: "",
        deviceType: "",
        location: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/my-issues");
      }, 2000);

    } catch (err: any) {
      console.error("Error submitting report:", err);
      setError(err.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-md">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
                  <p className="text-gray-600 mt-1">Submit hardware or software problems for IT support</p>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-semibold">Issue reported successfully!</p>
                  <p className="text-green-700 text-sm">Redirecting to your issues...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <div className="space-y-6">
                {/* Issue Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Issue Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "hardware", label: "Hardware", icon: Laptop, color: "blue" },
                      { value: "software", label: "Software", icon: FileText, color: "purple" },
                      { value: "network", label: "Network", icon: Wifi, color: "green" },
                      { value: "other", label: "Other", icon: HelpCircle, color: "gray" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleChange("issueType", type.value)}
                        className={`p-4 rounded-lg border-2 transition-all text-center ${
                          formData.issueType === type.value
                            ? `border-${type.color}-600 bg-${type.color}-50`
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                          formData.issueType === type.value ? `text-${type.color}-600` : "text-gray-400"
                        }`} />
                        <span className={`text-sm font-medium ${
                          formData.issueType === type.value ? `text-${type.color}-700` : "text-gray-700"
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { value: "low", label: "Low", color: "bg-blue-100 text-blue-700 border-blue-300" },
                      { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
                      { value: "high", label: "High", color: "bg-orange-100 text-orange-700 border-orange-300" },
                      { value: "critical", label: "Critical", color: "bg-red-100 text-red-700 border-red-300" },
                    ].map((severity) => (
                      <button
                        key={severity.value}
                        type="button"
                        onClick={() => handleChange("severity", severity.value)}
                        className={`p-3 rounded-lg border-2 transition-all font-medium ${
                          formData.severity === severity.value
                            ? severity.color
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {severity.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Related Device (Optional)
                  </label>
                  <select
                    value={formData.deviceId}
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">-- No device selected --</option>
                    {myDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.asset_number} - {device.device_type} ({device.brand} {device.model})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select if this issue is related to a specific device assigned to you</p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Issue Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Provide detailed information about the issue, when it started, and any error messages..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange("location", e.target.value)}
                      placeholder="e.g., Building A - 3rd Floor, Office 305"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Issue Report
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

