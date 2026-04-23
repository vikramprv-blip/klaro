import { notFound } from "next/navigation";
import { getRegion } from "@/lib/regions/config";

export default async function RegionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionConfig = getRegion(region);

  if (!regionConfig) notFound();

  return <>{children}</>;
}
