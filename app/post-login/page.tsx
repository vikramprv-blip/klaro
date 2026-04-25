"use client";
import { useEffect } from "react";

export default function PostLoginPage() {
  useEffect(() => {
    window.location.href = "/in/ca";
  }, []);

  return <div className="p-6 text-sm text-gray-500">Redirecting…</div>;
}
