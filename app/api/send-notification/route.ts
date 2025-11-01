import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userEmail, deviceInfo } = await request.json();

    if (!userEmail || !deviceInfo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create notification in database
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_email: userEmail,
        title: "Device Assigned to You",
        message: `A device has been assigned to you!\n\nDevice Details:\n• Asset Number: ${deviceInfo.asset_number}\n• Serial Number: ${deviceInfo.serial_number}\n• Device Type: ${deviceInfo.device_type}\n• Brand/Model: ${deviceInfo.brand} ${deviceInfo.model}`,
        type: "device_assignment",
        device_id: deviceInfo.id,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
      throw notificationError;
    }

    // You can also send email here using a service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Supabase Edge Functions
    
    // For now, we'll use in-app notifications
    // If you want email, we can add that next!

    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      notification,
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification", details: error.message },
      { status: 500 }
    );
  }
}

