import { redirect } from "next/navigation";
import { getRegion } from "@/lib/regions/config";

export default async function RegionDashboardRedirect({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const regionConfig = getRegion(region);

  if (!regionConfig) {
    redirect("/");
  }

  redirect(`/dashboard?region=${regionConfig.slug}`);
}
