"use client";

import { useEffect, useState } from "react";
import { DeviceRequest } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import AdminRoute from "@/components/AdminRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare } from "lucide-react";

export default function RequestsPage() {
  return (
    <AdminRoute>
      <RequestsContent />
    </AdminRoute>
  );
}

function RequestsContent() {
  const [requests, setRequests] = useState<DeviceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<DeviceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<DeviceRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("device_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const handleReviewRequest = (request: DeviceRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setShowModal(true);
  };

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("device_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user?.email || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
      await fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Failed to update request. Please try again.");
    } finally {
      setProcessing(false);
    }
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

  const requestStats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
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
          {/* Page Header with Stats */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Device Requests</h1>
            <p className="text-gray-600 mb-6">Review and manage user device requests</p>

            {/* Request Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-blue-700 font-semibold">Total Requests</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{requestStats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-yellow-700 font-semibold">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{requestStats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-green-700 font-semibold">Approved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{requestStats.approved}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-red-700 font-semibold">Rejected</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{requestStats.rejected}</p>
               </div>
             </div>
           </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white font-medium transition-all"
            aria-label="Filter by status"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No requests found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Device Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand / Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Justification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {request.user_email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {request.device_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {request.brand || "-"} {request.model ? `/ ${request.model}` : ""}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {request.justification}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleReviewRequest(request)}
                          className="text-green-600 hover:text-green-900 px-4 py-2 rounded-lg hover:bg-green-50 transition-all shadow-sm hover:shadow font-medium"
                          aria-label={`Review request from ${request.user_email}`}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Review Request</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700">User</p>
                  <p className="text-gray-900">{selectedRequest.user_email}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Device Type</p>
                  <p className="text-gray-900">{selectedRequest.device_type}</p>
                </div>

                {(selectedRequest.brand || selectedRequest.model) && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Preferred Brand / Model</p>
                    <p className="text-gray-900">
                      {selectedRequest.brand} {selectedRequest.model}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700">Justification</p>
                  <p className="text-gray-900">{selectedRequest.justification}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">Request Date</p>
                  <p className="text-gray-900">
                    {new Date(selectedRequest.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="admin_notes"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Admin Notes
                  </label>
                  <textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Add notes about this request..."
                    aria-label="Admin notes"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleUpdateStatus("approved")}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Approve request"
                >
                  <CheckCircle className="w-5 h-5" />
                  {processing ? "Processing..." : "Approve"}
                </button>
                <button
                  onClick={() => handleUpdateStatus("rejected")}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Reject request"
                >
                  <XCircle className="w-5 h-5" />
                  {processing ? "Processing..." : "Reject"}
                </button>
              </div>
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

