import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET() {
  try {
    // Fetch all devices
    const { data: devices, error: devicesError } = await supabaseAdmin
      .from("devices")
      .select("*");

    if (devicesError) throw devicesError;

    // Calculate analytics
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Status distribution
    const statusDistribution = devices.reduce((acc: any, device: any) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {});

    // Device type distribution
    const deviceTypeDistribution = devices.reduce((acc: any, device: any) => {
      const type = device.device_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Brand distribution
    const brandDistribution = devices.reduce((acc: any, device: any) => {
      const brand = device.brand || "Unknown";
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {});

    // Devices by purchase month (last 6 months)
    const purchaseTimeline: any = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      purchaseTimeline[monthKey] = 0;
    }

    devices.forEach((device: any) => {
      if (device.purchase_date) {
        const purchaseDate = new Date(device.purchase_date);
        if (purchaseDate >= last6Months) {
          const monthKey = purchaseDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          if (purchaseTimeline[monthKey] !== undefined) {
            purchaseTimeline[monthKey]++;
          }
        }
      }
    });

    // Assignments by month (last 6 months)
    const assignmentTimeline: any = {};
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      assignmentTimeline[monthKey] = 0;
    }

    devices.forEach((device: any) => {
      if (device.assigned_date) {
        const assignDate = new Date(device.assigned_date);
        if (assignDate >= last6Months) {
          const monthKey = assignDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });
          if (assignmentTimeline[monthKey] !== undefined) {
            assignmentTimeline[monthKey]++;
          }
        }
      }
    });

    // User assignment stats
    const userAssignments = devices
      .filter((d: any) => d.status === "assigned" && d.assigned_to)
      .reduce((acc: any, device: any) => {
        const user = device.assigned_to;
        acc[user] = (acc[user] || 0) + 1;
        return acc;
      }, {});

    const topUsers = Object.entries(userAssignments)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([user, count]) => ({ name: user, value: count }));

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentDevices = devices.filter((d: any) => {
      const createdAt = new Date(d.created_at);
      return createdAt >= thirtyDaysAgo;
    });

    const recentAssignments = devices.filter((d: any) => {
      if (!d.assigned_date) return false;
      const assignDate = new Date(d.assigned_date);
      return assignDate >= thirtyDaysAgo;
    });

    // Key metrics
    const totalDevices = devices.length;
    const assignedDevices = devices.filter((d: any) => d.status === "assigned").length;
    const availableDevices = devices.filter((d: any) => d.status === "available").length;
    const notWorkingDevices = devices.filter((d: any) => d.status === "not_working").length;
    
    const devicesAddedThisMonth = devices.filter((d: any) => {
      const createdAt = new Date(d.created_at);
      return createdAt >= thisMonth;
    }).length;

    const devicesAddedLastMonth = devices.filter((d: any) => {
      const createdAt = new Date(d.created_at);
      return createdAt >= lastMonth && createdAt < thisMonth;
    }).length;

    const assignmentRate = totalDevices > 0 ? (assignedDevices / totalDevices) * 100 : 0;

    // Prepare response
    const analytics = {
      summary: {
        totalDevices,
        assignedDevices,
        availableDevices,
        notWorkingDevices,
        devicesAddedThisMonth,
        devicesAddedLastMonth,
        assignmentRate: Math.round(assignmentRate),
        recentActivityCount: recentDevices.length,
        recentAssignments: recentAssignments.length,
      },
      charts: {
        statusDistribution: Object.entries(statusDistribution).map(([status, count]) => ({
          name: status,
          value: count,
        })),
        deviceTypeDistribution: Object.entries(deviceTypeDistribution)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 8)
          .map(([type, count]) => ({
            name: type,
            value: count,
          })),
        topBrands: Object.entries(brandDistribution)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 6)
          .map(([brand, count]) => ({
            name: brand,
            value: count,
          })),
        purchaseTimeline: Object.entries(purchaseTimeline).map(([month, count]) => ({
          month,
          count,
        })),
        assignmentTimeline: Object.entries(assignmentTimeline).map(([month, count]) => ({
          month,
          count,
        })),
        topUsers,
      },
    };

    return NextResponse.json(analytics, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error.message },
      { status: 500 }
    );
  }
}

