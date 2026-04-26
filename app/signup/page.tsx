"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const supabase = createClient();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const vertical = params?.get("vertical") || "ca";
  const plan = params?.get("plan") || "solo";

  useEffect(() => {
    localStorage.setItem("klaro:signup", JSON.stringify({ vertical, plan }));
  }, [vertical, plan]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email to confirm signup");
    }
  }

  return (
    <form onSubmit={handleSignup} className="w-full max-w-md space-y-4 border rounded-2xl p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>

      <p className="text-sm text-gray-500">
        Plan: <b>{plan}</b> · Vertical: <b>{vertical}</b>
      </p>

      <input
        className="w-full border rounded-lg px-3 py-2"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

        {/* DPDP Consent — DPDP Rules 2025, required separate from T&C */}
        <div className="flex items-start gap-3 mt-2">
          <input type="checkbox" id="dpdp-consent" required
            className="mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer" />
          <label htmlFor="dpdp-consent" className="text-sm text-gray-600 leading-relaxed">
            I consent to Klaro processing my personal data (name, email, phone,
            business records) as described in the{" "}
            <a href="/privacy" className="underline text-blue-600 hover:text-blue-800">
              Privacy Policy
            </a>
            {" "}for CA practice management, invoicing, HR, and compliance services.
            I can withdraw this consent at any time from Settings.
          </label>
        </div>
      <button className="w-full bg-black text-white py-2 rounded-lg">
        Sign up
      </button>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading signup…</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
