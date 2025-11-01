"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { 
  AlertCircle, Laptop, FileText, Wifi, HelpCircle, 
  Calendar, MapPin, User, CheckCircle, XCircle, Clock
} from "lucide-react";

export default function ManageIssuesPage() {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <ManageIssuesContent />
      </AdminRoute>
    </ProtectedRoute>
  );
}

function ManageIssuesContent() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAllIssues();

    // Real-time subscription
    const channel = supabase
      .channel("all_issues_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issue_reports",
        },
        () => {
          console.log("📋 Issues updated");
          fetchAllIssues();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAllIssues = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("issue_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (issueId: string, newStatus: string, resolutionNotes?: string) => {
    setUpdating(true);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === "resolved" && resolutionNotes) {
        updateData.resolution_notes = resolutionNotes;
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("issue_reports")
        .update(updateData)
        .eq("id", issueId);

      if (error) throw error;

      setSelectedIssue(null);
      fetchAllIssues();
    } catch (err) {
      console.error("Error updating issue:", err);
      alert("Failed to update issue");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "critical":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "hardware":
        return <Laptop className="w-5 h-5" />;
      case "software":
        return <FileText className="w-5 h-5" />;
      case "network":
        return <Wifi className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  };

  const filteredIssues = filterStatus === "all" 
    ? issues 
    : issues.filter(issue => issue.status === filterStatus);

  const stats = {
    total: issues.length,
    pending: issues.filter(i => i.status === "pending").length,
    inProgress: issues.filter(i => i.status === "in_progress").length,
    resolved: issues.filter(i => i.status === "resolved").length,
    critical: issues.filter(i => i.severity === "critical" && i.status !== "resolved").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl shadow-md">
                  <AlertCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Manage Issue Reports</h1>
                  <p className="text-gray-600 mt-1">Review and resolve user-reported issues</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <p className="text-sm text-gray-600 font-medium">Total Issues</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                <p className="text-sm text-blue-700 font-medium">In Progress</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{stats.inProgress}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                <p className="text-sm text-green-700 font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{stats.resolved}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                <p className="text-sm text-red-700 font-medium">Critical</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{stats.critical}</p>
              </div>
            </div>

            {/* Filter */}
            <div className="mb-6">
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "in_progress", "resolved", "closed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filterStatus === status
                        ? "bg-green-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {status === "all" ? "All Issues" : status.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Issues List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600">
                  {filterStatus === "all" 
                    ? "No issues have been reported yet"
                    : `No ${filterStatus.replace("_", " ")} issues`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}>
                          {getIssueIcon(issue.issue_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{issue.title}</h3>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(issue.status)}`}>
                              {issue.status.replace("_", " ")}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{issue.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{issue.user_email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                            </div>
                            {issue.device_asset_number && (
                              <div className="flex items-center gap-1">
                                <Laptop className="w-4 h-4" />
                                <span>{issue.device_asset_number}</span>
                              </div>
                            )}
                            {issue.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{issue.location}</span>
                              </div>
                            )}
                          </div>

                          {issue.resolution_notes && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                              <p className="text-sm font-semibold text-green-900 mb-1">Resolution:</p>
                              <p className="text-sm text-green-800">{issue.resolution_notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            {issue.status === "pending" && (
                              <button
                                onClick={() => handleUpdateStatus(issue.id, "in_progress")}
                                disabled={updating}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium"
                              >
                                <Clock className="w-4 h-4" />
                                Start Working
                              </button>
                            )}
                            {(issue.status === "pending" || issue.status === "in_progress") && (
                              <button
                                onClick={() => setSelectedIssue(issue)}
                                disabled={updating}
                                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all font-medium"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark Resolved
                              </button>
                            )}
                            {issue.status === "resolved" && (
                              <button
                                onClick={() => handleUpdateStatus(issue.id, "closed")}
                                disabled={updating}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-all font-medium"
                              >
                                <XCircle className="w-4 h-4" />
                                Close Issue
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resolve Issue</h3>
            <p className="text-gray-700 mb-4"><strong>Issue:</strong> {selectedIssue.title}</p>
            <textarea
              placeholder="Enter resolution notes..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
              id="resolutionNotes"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const notes = (document.getElementById("resolutionNotes") as HTMLTextAreaElement).value;
                  if (notes.trim()) {
                    handleUpdateStatus(selectedIssue.id, "resolved", notes);
                  } else {
                    alert("Please enter resolution notes");
                  }
                }}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
              >
                {updating ? "Saving..." : "Save & Resolve"}
              </button>
              <button
                onClick={() => setSelectedIssue(null)}
                disabled={updating}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

