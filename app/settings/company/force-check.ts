"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForceCompanySetup({ isComplete }: { isComplete: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!isComplete) {
      router.replace("/settings/company");
    }
  }, [isComplete]);

  return null;
}
