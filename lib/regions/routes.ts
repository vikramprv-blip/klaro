import { getAllRegions, getRegion, type RegionCode } from "./config";

export function isValidRegion(value?: string | null): value is RegionCode {
  return !!getRegion(value);
}

export function getRegionDashboardPath(region: RegionCode) {
  return `/${region}/dashboard`;
}

export function getRegionLandingPath(region: RegionCode) {
  return `/${region}`;
}

export function getRegionStaticParams() {
  return getAllRegions().map((region) => ({ region: region.slug }));
}
