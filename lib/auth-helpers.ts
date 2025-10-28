import { supabase } from "./supabase";
import { UserRole } from "./types";

/**
 * Check if current user is an admin
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("❌ No user logged in");
      return false;
    }

    console.log("🔍 Checking admin status for:", user.email);

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("❌ Error fetching role:", error);
      return false;
    }

    if (!data) {
      console.log("⚠️ No role found for user");
      return false;
    }

    console.log("✅ User role:", data.role);
    return data.role === "admin";
  } catch (error) {
    console.error("❌ Error checking admin status:", error);
    return false;
  }
};

/**
 * Get current user's role
 */
export const getUserRole = async (): Promise<UserRole> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return "user";

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error || !data) return "user";

    return data.role as UserRole;
  } catch (error) {
    console.error("Error getting user role:", error);
    return "user";
  }
};

/**
 * Update a user's role (admin only)
 */
export const updateUserRole = async (
  userId: string,
  email: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if current user is admin
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { success: false, error: "Unauthorized: Admin access required" };
    }

    // Update or insert role
    const { error } = await supabase
      .from("user_roles")
      .upsert(
        {
          user_id: userId,
          email: email,
          role: newRole,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

