"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import AdminRoute from "@/components/AdminRoute";
import { FileText, Download, Calendar, User, Package, Shield, AlertCircle, TrendingUp } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ReportType = "operations" | "assets-users" | "user-devices" | "stock" | "warranty";

interface Device {
  id: string;
  asset_number: string;
  serial_number: string;
  device_type: string;
  brand: string | null;
  model: string | null;
  status: string;
  assigned_to: string | null;
  assigned_date: string | null;
  purchase_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface UserData {
  id: string;
  email: string;
}

export default function ReportsPage() {
  return (
    <AdminRoute>
      <ReportsContent />
    </AdminRoute>
  );
}

function ReportsContent() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("operations");
  const [devices, setDevices] = useState<Device[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [devicesResponse, usersResponse] = await Promise.all([
        supabase.from("devices").select("*").order("created_at", { ascending: false }),
        supabase.from("users").select("*")
      ]);

      if (devicesResponse.error) {
        console.error("❌ Devices fetch error:", devicesResponse.error);
        throw devicesResponse.error;
      }
      if (usersResponse.error) {
        console.error("❌ Users fetch error:", usersResponse.error);
        throw usersResponse.error;
      }

      console.log("✅ Devices fetched:", devicesResponse.data?.length || 0);
      console.log("✅ Users fetched:", usersResponse.data?.length || 0);
      
      setDevices(devicesResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error("❌ Error fetching report data:", error);
      alert("Error loading data. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Report 1: Operations Report
  const getOperationsData = () => {
    let filteredDevices = devices;

    if (dateFrom) {
      filteredDevices = filteredDevices.filter(d => 
        new Date(d.created_at) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      filteredDevices = filteredDevices.filter(d => 
        new Date(d.created_at) <= new Date(dateTo)
      );
    }

    return filteredDevices.map(d => ({
      asset_number: d.asset_number,
      operation: d.status === "assigned" ? "Delivered" : d.status === "available" ? "Available" : "Not Working",
      user: d.assigned_to || "N/A",
      date: d.assigned_date || d.created_at,
      device_type: d.device_type,
    }));
  };

  // Report 2: Assets with Users
  const getAssetsWithUsersData = () => {
    return devices
      .filter(d => d.status === "assigned" && d.assigned_to)
      .map(d => ({
        asset_number: d.asset_number,
        user_name: d.assigned_to,
        device_type: d.device_type,
        brand_model: `${d.brand || ""} ${d.model || ""}`.trim() || "N/A",
        delivery_date: d.assigned_date ? new Date(d.assigned_date).toLocaleDateString() : "N/A",
      }));
  };

  // Report 3: Devices by Specific User
  const getDevicesByUserData = () => {
    if (!selectedUser) return [];
    
    return devices
      .filter(d => d.assigned_to === selectedUser)
      .map(d => ({
        asset_number: d.asset_number,
        device_type: d.device_type,
        brand_model: `${d.brand || ""} ${d.model || ""}`.trim() || "N/A",
        serial_number: d.serial_number,
        assigned_date: d.assigned_date ? new Date(d.assigned_date).toLocaleDateString() : "N/A",
        status: d.status,
      }));
  };

  // Report 4: Devices in Stock
  const getDevicesInStockData = () => {
    return devices
      .filter(d => d.status === "available" || !d.assigned_to)
      .map(d => ({
        asset_number: d.asset_number,
        device_type: d.device_type,
        brand_model: `${d.brand || ""} ${d.model || ""}`.trim() || "N/A",
        serial_number: d.serial_number,
        status: d.status,
        purchase_date: d.purchase_date ? new Date(d.purchase_date).toLocaleDateString() : "N/A",
      }));
  };

  // Report 5: Warranty Status
  const getWarrantyStatusData = () => {
    const fourYearsAgo = new Date();
    fourYearsAgo.setFullYear(fourYearsAgo.getFullYear() - 4);

    return devices.map(d => {
      const purchaseDate = d.purchase_date ? new Date(d.purchase_date) : null;
      const inWarranty = purchaseDate ? purchaseDate > fourYearsAgo : false;
      
      return {
        asset_number: d.asset_number,
        device_type: d.device_type,
        brand_model: `${d.brand || ""} ${d.model || ""}`.trim() || "N/A",
        purchase_date: d.purchase_date ? new Date(d.purchase_date).toLocaleDateString() : "N/A",
        warranty_status: inWarranty ? "In Warranty" : "Out of Warranty",
        assigned_to: d.assigned_to || "Not Assigned",
      };
    });
  };

  // Helper function to convert image to base64
  const getImageBase64 = (imagePath: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL("C:\Users\alghm\OneDrive\Desktop\GitHub\IT_INV\public\TamerLogo_Report.png");
            resolve(dataURL);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imagePath;
    });
  };

  // PDF Export Function
  const exportToPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    try {
      // Load and add logo (using transparent background version)
      const logoBase64 = await getImageBase64("/TamerLogo_Report.png");
      doc.addImage(logoBase64, "PNG", 10, 10, 50, 16);
    } catch (error) {
      console.error("Failed to load logo, using text fallback:", error);
      // Fallback to text branding if logo fails
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(34, 197, 94);
      doc.text("INFORA", 10, 15);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Smart Asset Management", 10, 20);
    }
    
    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    let title = "";
    
    switch (selectedReport) {
      case "operations":
        title = "Operations Report";
        break;
      case "assets-users":
        title = "Assets with Users Report";
        break;
      case "user-devices":
        title = `Devices for User: ${selectedUser}`;
        break;
      case "stock":
        title = "Devices in Stock Report";
        break;
      case "warranty":
        title = "Warranty Status Report";
        break;
    }
    
    doc.text(title, pageWidth / 2, 30, { align: "center" });
    
    // Add generation date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 37, { align: "center" });
    
    // Add data table
    let tableData: any[] = [];
    let headers: string[] = [];
    
    switch (selectedReport) {
      case "operations":
        const opsData = getOperationsData();
        headers = ["Asset Number", "Operation", "User", "Date", "Device Type"];
        tableData = opsData.map(d => [
          d.asset_number,
          d.operation,
          d.user,
          new Date(d.date).toLocaleDateString(),
          d.device_type
        ]);
        break;
        
      case "assets-users":
        const assetsData = getAssetsWithUsersData();
        headers = ["Asset Number", "User Name", "Device Type", "Brand/Model", "Delivery Date"];
        tableData = assetsData.map(d => [
          d.asset_number,
          d.user_name,
          d.device_type,
          d.brand_model,
          d.delivery_date
        ]);
        break;
        
      case "user-devices":
        const userDevicesData = getDevicesByUserData();
        headers = ["Asset Number", "Device Type", "Brand/Model", "Serial Number", "Assigned Date", "Status"];
        tableData = userDevicesData.map(d => [
          d.asset_number,
          d.device_type,
          d.brand_model,
          d.serial_number,
          d.assigned_date,
          d.status
        ]);
        break;
        
      case "stock":
        const stockData = getDevicesInStockData();
        headers = ["Asset Number", "Device Type", "Brand/Model", "Serial Number", "Status", "Purchase Date"];
        tableData = stockData.map(d => [
          d.asset_number,
          d.device_type,
          d.brand_model,
          d.serial_number,
          d.status,
          d.purchase_date
        ]);
        break;
        
      case "warranty":
        const warrantyData = getWarrantyStatusData();
        headers = ["Asset Number", "Device Type", "Brand/Model", "Purchase Date", "Warranty Status", "Assigned To"];
        tableData = warrantyData.map(d => [
          d.asset_number,
          d.device_type,
          d.brand_model,
          d.purchase_date,
          d.warranty_status,
          d.assigned_to
        ]);
        break;
    }
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 45,
      theme: "striped",
      headStyles: { 
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      styles: { 
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
      doc.text(
        "Infora - Smart Asset Management",
        pageWidth - 10,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }
    
    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const reportTypes = [
    {
      id: "operations" as ReportType,
      name: "Operations Report",
      description: "Track all operations (deliveries, returns, status changes)",
      icon: TrendingUp,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "assets-users" as ReportType,
      name: "Assets with Users",
      description: "View all assigned devices with user details",
      icon: User,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "user-devices" as ReportType,
      name: "Devices by User",
      description: "Select a user to see all their devices",
      icon: Package,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "stock" as ReportType,
      name: "Devices in Stock",
      description: "View available and unassigned devices",
      icon: FileText,
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "warranty" as ReportType,
      name: "Warranty Status",
      description: "Check warranty status (4-year warranty period)",
      icon: Shield,
      color: "from-red-500 to-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-50/30 dots-background flex flex-col">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <div className="flex-1 ml-64">
          {/* Page Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[60px] z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Reports Generator</h1>
                  <p className="text-gray-600 mt-1">Generate and export various inventory reports</p>
                </div>
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold"
                  disabled={loading}
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Report Type Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Report Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTypes.map((report) => {
                  const Icon = report.icon;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        selectedReport === report.id
                          ? "border-green-500 bg-green-50 shadow-lg"
                          : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                      }`}
                    >
                      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${report.color} mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Report Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Report Filters
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedReport === "operations" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </>
                )}
                
                {selectedReport === "user-devices" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select User
                    </label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    >
                      <option value="">-- Select a User --</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Report Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">
                  {reportTypes.find(r => r.id === selectedReport)?.name}
                </h3>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Operations Report Table */}
                  {selectedReport === "operations" && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Asset Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Operation</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Device Type</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getOperationsData().length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                              <p className="text-lg font-medium">No data available</p>
                              <p className="text-sm mt-1">Try adjusting your date filters or add some devices first.</p>
                            </td>
                          </tr>
                        ) : (
                          getOperationsData().map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.asset_number}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.operation}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.user}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.device_type}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Assets with Users Report Table */}
                  {selectedReport === "assets-users" && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Asset Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">User Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Device Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Brand/Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Delivery Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getAssetsWithUsersData().map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.asset_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.user_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.device_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.brand_model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.delivery_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Devices by User Report Table */}
                  {selectedReport === "user-devices" && (
                    <>
                      {!selectedUser ? (
                        <div className="p-12 text-center">
                          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">Please select a user to view their devices</p>
                        </div>
                      ) : getDevicesByUserData().length === 0 ? (
                        <div className="p-12 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No devices assigned to this user</p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-green-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Asset Number</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Device Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Brand/Model</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Serial Number</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Assigned Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getDevicesByUserData().map((item, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.asset_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.device_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.brand_model}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.serial_number}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.assigned_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}

                  {/* Devices in Stock Report Table */}
                  {selectedReport === "stock" && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Asset Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Device Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Brand/Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Serial Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Purchase Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getDevicesInStockData().map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.asset_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.device_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.brand_model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.serial_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.status}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.purchase_date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Warranty Status Report Table */}
                  {selectedReport === "warranty" && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-green-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Asset Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Device Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Brand/Model</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Purchase Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Warranty Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Assigned To</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getWarrantyStatusData().map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.asset_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.device_type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.brand_model}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.purchase_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.warranty_status === "In Warranty"
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}>
                                {item.warranty_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.assigned_to}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

