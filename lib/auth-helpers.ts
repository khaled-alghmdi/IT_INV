import { supabase } from "./supabase";
import { UserRole } from "./types";

/**
 * Check if current user is an admin
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("❌ [isUserAdmin] No user logged in");
      return false;
    }

    console.log("🔍 [isUserAdmin] Checking admin status for:", user.email, "| User ID:", user.id);

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("❌ [isUserAdmin] 406 ERROR SOURCE - Error fetching role:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        user_id: user.id,
        user_email: user.email
      });
      return false;
    }

    if (!data) {
      console.log("⚠️ [isUserAdmin] No role found for user");
      return false;
    }

    console.log("✅ [isUserAdmin] User role:", data.role);
    return data.role === "admin";
  } catch (error) {
    console.error("❌ [isUserAdmin] Catch block error:", error);
    return false;
  }
};

/**
 * Get current user's role
 */
export const getUserRole = async (): Promise<UserRole> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("❌ [getUserRole] No user logged in");
      return "user";
    }

    console.log("🔍 [getUserRole] Fetching role for:", user.email, "| User ID:", user.id);

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("❌ [getUserRole] 406 ERROR SOURCE - Error fetching role:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        user_id: user.id,
        user_email: user.email
      });
      return "user";
    }

    if (!data) {
      console.log("⚠️ [getUserRole] No role found, returning 'user'");
      return "user";
    }

    console.log("✅ [getUserRole] User role:", data.role);
    return data.role as UserRole;
  } catch (error) {
    console.error("❌ [getUserRole] Catch block error:", error);
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

