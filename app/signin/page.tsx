"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const session = await supabase.auth.getUser();
    const user = session.data.user;

    const signupIntent = localStorage.getItem("klaro:signup");
    if (user && signupIntent) {
      const { vertical, plan } = JSON.parse(signupIntent);

      await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          vertical,
          plan
        })
      });
    }


    const redirectIntent = localStorage.getItem("klaro:signup");

    if (redirectIntent) {
      const { vertical } = JSON.parse(redirectIntent);

      if (vertical === "ca") {
        window.location.href = "/in/ca";
      } else if (vertical === "lawyer") {
        window.location.href = "/in/lawyer";
      } else {
        window.location.href = "/";
      }
    } else {
      window.location.href = "/in/ca";
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSignin} className="w-full max-w-md space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>

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

        <button className="w-full bg-black text-white py-2 rounded-lg">
          Sign in
        </button>
      </form>
    </main>
  );
}
