"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PostLoginPage() {
  useEffect(() => {
    async function redirect() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/signin";
        return;
      }

      const token = session.access_token;
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const orgRes = await fetch("/api/onboarding/check", { headers });
      const orgData = await orgRes.json();

      if (!orgData.hasOrg) {
        window.location.href = "/onboarding";
        return;
      }

      // Admin goes straight to admin dashboard
      if (orgData.vertical === "admin") {
        window.location.href = "/admin";
        return;
      }

      const settingsRes = await fetch("/api/company-settings/check", { headers });
      const settingsData = await settingsRes.json();

      if (!settingsData.hasSettings) {
        window.location.href = "/settings/company?setup=true";
        return;
      }

      const vertical = orgData.vertical || "lawyer";
      window.location.href = vertical === "ca" ? "/in/ca" : "/in/lawyer";
    }

    redirect();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </main>
  );
}
