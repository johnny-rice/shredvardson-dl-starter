export interface SeedConfig {
  userCount?: number;
  organizationCount?: number;
  deterministic?: boolean; // For test seeds
  locale?: string;
}

export interface SeedResult {
  success: boolean;
  created: {
    users: number;
    organizations?: number;
    [entity: string]: number | undefined;
  };
  errors: string[];
  duration: number; // ms
}

export interface SeedEntity {
  id: string;
  [field: string]: unknown;
}
