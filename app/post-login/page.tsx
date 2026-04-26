"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PostLoginPage() {
  useEffect(() => {
    async function redirect() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/signin";
        return;
      }

      // Check if organization exists
      const orgRes = await fetch("/api/onboarding/check");
      const orgData = await orgRes.json();

      if (!orgData.hasOrg) {
        // New user — go to onboarding
        window.location.href = "/onboarding";
        return;
      }

      // Check if company settings exist
      const settingsRes = await fetch("/api/company-settings/check");
      const settingsData = await settingsRes.json();

      if (!settingsData.hasSettings) {
        // Has org but no company profile — go to company setup
        window.location.href = "/settings/company?setup=true";
        return;
      }

      // Fully onboarded — go to dashboard
      const vertical = orgData.vertical || "ca";
      window.location.href = vertical === "lawyer" ? "/in/lawyer" : "/in/ca";
    }

    redirect();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-sm text-gray-500 animate-pulse">Setting up your workspace…</div>
    </div>
  );
}
