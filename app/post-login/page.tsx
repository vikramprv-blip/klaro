"use client";

import { useEffect } from "react";

export default function PostLoginPage() {
  useEffect(() => {
    async function run() {
      const res = await fetch("/api/me");
      const data = await res.json();

      
      if (data.user) {
        await fetch("/api/onboarding/seed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user.id }),
        });
      }

      if (!data.org) {
        window.location.href = "/pricing";
        return;
      }

      if (data.org.vertical === "ca") {
        window.location.href = "/in/ca";
      } else if (data.org.vertical === "lawyer") {
        window.location.href = "/in/lawyer";
      } else {
        window.location.href = "/";
      }
    }

    run();
  }, []);

  return <div className="p-6 text-sm text-gray-500">Setting up your workspace…</div>;
}
