"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/in/ca";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl,
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Sign in to Klaro</h1>

        <input
          className="w-full border rounded-lg px-3 py-2"
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="w-full rounded-lg bg-black text-white py-2">
          Sign in
        </button>

        <a className="block text-sm underline" href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
          Create an account
        </a>
      </form>
    </main>
  );
}
