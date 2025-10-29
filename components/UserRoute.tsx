"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getUserRole } from "@/lib/auth-helpers";

interface UserRouteProps {
  children: React.ReactNode;
}

const UserRoute = ({ children }: UserRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUserAccess = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      const role = await getUserRole();
      
      // Redirect admins to the main dashboard
      if (role === "admin") {
        router.push("/");
        return;
      }

      setChecking(false);
    };

    checkUserAccess();
  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-6 text-green-700 font-semibold text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserRoute;

