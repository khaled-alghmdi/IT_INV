"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getUserRole } from "@/lib/auth-helpers";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardDrive, Users as UsersIcon, FileText, ArrowRight, Activity, BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalDevices: 0,
    assignedDevices: 0,
    availableDevices: 0,
    notWorkingDevices: 0,
    totalUsers: 0,
    pendingRequests: 0,
    pendingIssues: 0,
  });
  const [recentDevices, setRecentDevices] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
      fetchDashboardData();
    }
  }, [checkingRole]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch devices
      const { data: devices, error: devicesError } = await supabase
        .from("devices")
        .select("*")
        .order("created_at", { ascending: false });

      if (devicesError) throw devicesError;

      // Fetch users count
      const { data: users, error: usersError } = await supabase
        .from("user_roles")
        .select("*");

      if (usersError) console.error("Error fetching users:", usersError);

      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from("device_requests")
        .select("*")
        .eq("status", "pending");

      if (requestsError) console.error("Error fetching requests:", requestsError);

      // Fetch pending issues
      const { data: issues, error: issuesError } = await supabase
        .from("issue_reports")
        .select("*")
        .eq("status", "pending");

      if (issuesError) console.error("Error fetching issues:", issuesError);

      // Calculate stats
      setStats({
        totalDevices: devices?.length || 0,
        assignedDevices: devices?.filter((d) => d.status === "assigned").length || 0,
        availableDevices: devices?.filter((d) => d.status === "available").length || 0,
        notWorkingDevices: devices?.filter((d) => d.status === "not_working").length || 0,
        totalUsers: users?.length || 0,
        pendingRequests: requests?.length || 0,
        pendingIssues: issues?.length || 0,
      });

      // Get 5 most recent devices
      setRecentDevices(devices?.slice(0, 5) || []);

      // Fetch analytics data
      fetchAnalytics();

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const exportToExcel = () => {
    if (!analytics) return;

    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      ["═════════════════════════════════════════════════════════════"],
      ["█  TAMER PHARMACEUTICAL INDUSTRIES  █"],
      ["═════════════════════════════════════════════════════════════"],
      ["📊 IT INVENTORY ANALYTICS REPORT"],
      ["📅 Generated:", new Date().toLocaleString()],
      ["═════════════════════════════════════════════════════════════"],
      [],
      ["📊 SUMMARY METRICS", ""],
      ["─────────────────────────────────────", "─────────────"],
      ["Metric", "Value"],
      ["─────────────────────────────────────", "─────────────"],
      ["📦 Total Devices", analytics.summary.totalDevices],
      ["✅ Assigned Devices", analytics.summary.assignedDevices],
      ["🟢 Available Devices", analytics.summary.availableDevices],
      ["❌ Not Working Devices", analytics.summary.notWorkingDevices],
      ["📈 Devices Added This Month", analytics.summary.devicesAddedThisMonth],
      ["📊 Assignment Rate", `${analytics.summary.assignmentRate}%`],
      ["─────────────────────────────────────", "─────────────"],
      [],
      ["© Tamer Pharmaceutical Industries - IT Asset Management System"],
    ];
    const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWS['!cols'] = [{ width: 40 }, { width: 18 }];
    summaryWS['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      { s: { r: 5, c: 0 }, e: { r: 5, c: 1 } },
      { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },
      { s: { r: 18, c: 0 }, e: { r: 18, c: 1 } },
    ];
    XLSX.utils.book_append_sheet(wb, summaryWS, "📊 Summary");

    // Device Types sheet
    const typesData = [
      ["═════════════════════════════════════════════════════════════"],
      ["█  TAMER PHARMACEUTICAL INDUSTRIES  █"],
      ["═════════════════════════════════════════════════════════════"],
      ["💻 DEVICE TYPE DISTRIBUTION"],
      [],
      ["Device Type", "Count", "Percentage"],
      ["─────────────────────────", "─────────", "─────────────"],
      ...analytics.charts.deviceTypeDistribution.map((item: any) => {
        const total = analytics.charts.deviceTypeDistribution.reduce((sum: number, i: any) => sum + i.value, 0);
        const percentage = ((item.value / total) * 100).toFixed(1);
        return [item.name, item.value, `${percentage}%`];
      }),
      ["─────────────────────────", "─────────", "─────────────"],
      [],
      ["© Tamer Pharmaceutical Industries"],
    ];
    const typesWS = XLSX.utils.aoa_to_sheet(typesData);
    typesWS['!cols'] = [{ width: 30 }, { width: 12 }, { width: 15 }];
    typesWS['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
      { s: { r: typesData.length - 1, c: 0 }, e: { r: typesData.length - 1, c: 2 } },
    ];
    XLSX.utils.book_append_sheet(wb, typesWS, "💻 Device Types");

    XLSX.writeFile(wb, `Tamer_IT_Inventory_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    if (!analytics) return;

    const doc = new jsPDF();

    try {
      const img = new Image();
      img.src = '/TamerLogo_Report.png';
      
      await new Promise((resolve) => {
        img.onload = () => {
          doc.addImage(img, 'PNG', 14, 10, 50, 15);
          resolve(true);
        };
        img.onerror = () => resolve(true);
      });
    } catch (error) {
      console.error("Error loading logo:", error);
    }

    doc.setFontSize(12);
    doc.setTextColor(22, 163, 74);
    doc.text("Tamer Consumer", doc.internal.pageSize.getWidth() / 2, 18, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(22, 163, 74);
    doc.text("IT Inventory Analytics Report", 14, 35);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Summary", 14, 55);

    autoTable(doc, {
      startY: 60,
      head: [['Metric', 'Value']],
      body: [
        ['Total Devices', analytics.summary.totalDevices.toString()],
        ['Assigned Devices', analytics.summary.assignedDevices.toString()],
        ['Available Devices', analytics.summary.availableDevices.toString()],
        ['Not Working Devices', analytics.summary.notWorkingDevices.toString()],
        ['Devices Added This Month', analytics.summary.devicesAddedThisMonth.toString()],
        ['Assignment Rate', `${analytics.summary.assignmentRate}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Device Type Distribution", 14, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Device Type', 'Count']],
      body: analytics.charts.deviceTypeDistribution.map((item: any) => [item.name, item.value.toString()]),
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 253, 244] },
    });

    doc.save(`Tamer_IT_Inventory_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_working":
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600 mt-1">Overview of your IT inventory system</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Devices */}
                    <Link
                      href="/devices"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-3 rounded-lg">
                          <HardDrive className="w-6 h-6 text-green-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Devices</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalDevices}</p>
                      <div className="mt-3 flex gap-3 text-xs">
                        <span className="text-blue-600">Assigned: {stats.assignedDevices}</span>
                        <span className="text-green-600">Available: {stats.availableDevices}</span>
                        <span className="text-red-600">Issues: {stats.notWorkingDevices}</span>
                      </div>
                    </Link>

                    {/* Total Users */}
                    <Link
                      href="/users"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-lg">
                          <UsersIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        Avg devices per user: {stats.totalUsers > 0 ? (stats.assignedDevices / stats.totalUsers).toFixed(1) : "0"}
                      </p>
                    </Link>

                    {/* Pending Requests */}
                    <Link
                      href="/requests"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Pending Requests</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
                      {stats.pendingRequests > 0 && (
                        <p className="text-xs text-orange-600 font-medium mt-3">
                          Requires attention
                        </p>
                      )}
                    </Link>

                    {/* Pending Issues */}
                    <Link
                      href="/manage-issues"
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="bg-gradient-to-br from-red-100 to-rose-100 p-3 rounded-lg">
                          <FileText className="w-6 h-6 text-red-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Pending Issues</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingIssues}</p>
                      {stats.pendingIssues > 0 && (
                        <p className="text-xs text-red-600 font-medium mt-3">
                          Requires resolution
                        </p>
                      )}
                    </Link>
                  </div>
                </div>

                {/* Analytics Dashboard */}
                {analytics && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Analytics Header */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-md p-6 border border-green-100">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-green-500 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Analytics & Insights</h2>
                            <p className="text-sm text-gray-600">Real-time inventory analytics and reports</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:shadow-lg"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Excel
                          </button>
                          <button
                            onClick={exportToPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all hover:shadow-lg"
                          >
                            <Download className="w-4 h-4" />
                            Export PDF
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Total Devices</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.summary.totalDevices}</p>
                          </div>
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <HardDrive className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Added This Month</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.summary.devicesAddedThisMonth}</p>
                            <p className="text-xs text-green-600 font-medium mt-1">📈 Recent additions</p>
                          </div>
                          <div className="p-3 bg-green-100 rounded-lg">
                            <Activity className="w-6 h-6 text-green-600" />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <div>
                          <p className="text-sm text-gray-600 font-medium">Assignment Rate</p>
                          <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.summary.assignmentRate}%</p>
                          <div className="mt-3 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${analytics.summary.assignmentRate}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Recent Assignments</p>
                            <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.summary.recentAssignments}</p>
                            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                          </div>
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Device Status Distribution */}
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Device Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={analytics.charts.statusDistribution}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                              {analytics.charts.statusDistribution.map((entry: any, index: number) => {
                                const colors = ['#22c55e', '#3b82f6', '#ef4444'];
                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                              })}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Device Types */}
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Device Types</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.charts.deviceTypeDistribution.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Purchase Timeline */}
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Timeline (6 Months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analytics.charts.purchaseTimeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Assignment Timeline */}
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment Timeline (6 Months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={analytics.charts.assignmentTimeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Top Brands */}
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 6 Brands</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={analytics.charts.topBrands.slice(0, 6)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#16a34a" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Top Users */}
                      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover-lift">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Users by Devices</h3>
                        <div className="space-y-4">
                          {analytics.charts.topUsers.slice(0, 5).map((user: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">
                                  #{index + 1} {user.name}
                                </span>
                                <span className="text-sm font-bold text-green-600">{user.value} devices</span>
                              </div>
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${(user.value / analytics.charts.topUsers[0].value) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Devices */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Devices</h2>
                    <Link
                      href="/devices"
                      className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {recentDevices.length === 0 ? (
                      <div className="p-12 text-center">
                        <HardDrive className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No devices yet</p>
                        <Link
                          href="/devices"
                          className="inline-flex items-center gap-2 mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Add your first device
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Asset Number
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Brand/Model
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assigned To
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recentDevices.map((device) => (
                              <tr key={device.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {device.asset_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {device.device_type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {device.brand} {device.model}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(device.status)}`}>
                                    {device.status.replace("_", " ")}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {device.assigned_to || "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/devices"
                      className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
                    >
                      <HardDrive className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Manage Devices</h3>
                      <p className="text-sm text-green-50">Add, edit, or remove devices</p>
                      <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/users"
                      className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
                    >
                      <UsersIcon className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Manage Users</h3>
                      <p className="text-sm text-blue-50">View and assign user roles</p>
                      <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link
                      href="/requests"
                      className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl p-6 hover:shadow-lg transition-all group"
                    >
                      <FileText className="w-8 h-8 mb-3" />
                      <h3 className="font-semibold text-lg mb-1">Review Requests</h3>
                      <p className="text-sm text-orange-50">Approve or reject device requests</p>
                      <ArrowRight className="w-5 h-5 mt-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
