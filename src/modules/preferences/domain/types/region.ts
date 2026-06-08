export const REGIONS = ['EU', 'US', 'APAC', 'GLOBAL'] as const;

export type Region = (typeof REGIONS)[number];

export function isRegion(value: string): value is Region {
  return (REGIONS as readonly string[]).includes(value);
}
