"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function PostLoginPage() {
  const [showChooser, setShowChooser] = useState(false);

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

      // Admin goes to admin dashboard
      if (orgData.vertical === "admin") {
        window.location.href = "/admin";
        return;
      }

      // Both suites — show chooser
      if (orgData.vertical === "both") {
        setShowChooser(true);
        return;
      }

      // Single vertical
      window.location.href = orgData.vertical === "ca" ? "/in/ca" : "/in/lawyer";
    }

    redirect();
  }, []);

  if (showChooser) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome to Klaro</h1>
            <p className="text-sm text-gray-500 mt-2">Which suite would you like to open?</p>
          </div>
          <Link href="/in/ca"
            className="flex items-center gap-4 w-full border border-gray-200 rounded-xl p-5 bg-white hover:border-blue-400 hover:shadow-sm transition-all group">
            <span className="text-3xl">📊</span>
            <div>
              <p className="font-semibold text-gray-900 group-hover:text-blue-700">CA Suite</p>
              <p className="text-sm text-gray-500">GST, TDS, ITR, compliance, AI tools</p>
            </div>
          </Link>
          <Link href="/in/lawyer"
            className="flex items-center gap-4 w-full border border-gray-200 rounded-xl p-5 bg-white hover:border-gray-800 hover:shadow-sm transition-all group">
            <span className="text-3xl">⚖️</span>
            <div>
              <p className="font-semibold text-gray-900">Lawyer Suite</p>
              <p className="text-sm text-gray-500">Matters, hearings, evidence vault, HR</p>
            </div>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500">Signing you in...</p>
      </div>
    </main>
  );
}
