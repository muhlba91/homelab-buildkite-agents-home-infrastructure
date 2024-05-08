import { StringMap } from '../map';

/**
 * Defines configuration data for a Buildkite.
 */
export interface BuildkiteConfig {
  readonly organizations: StringMap<BuildkiteOrganizationConfig>;
  readonly sshKey: string;
  readonly version: string;
}

/**
 * Defines configuration data for a Buildkite organization.
 */
export interface BuildkiteOrganizationConfig {
  readonly spawn?: number;
  readonly doppler?: BuildkiteOrganizationDopplerConfig;
  readonly gcp: BuildkiteOrganizationGCPConfig;
  readonly minio: BuildkiteOrganizationMinioConfig;
  readonly artifactsExpirationDays: number;
}

/**
 * Defines Doppler configuration data for a Buildkite organization.
 */
export interface BuildkiteOrganizationDopplerConfig {
  readonly token: string;
}

/**
 * Defines GCP configuration data for a Buildkite organization.
 */
export interface BuildkiteOrganizationGCPConfig {
  readonly project: string;
  readonly location: string;
  readonly roles: readonly string[];
}

/**
 * Defines Minio configuration data for a Buildkite organization.
 */
export interface BuildkiteOrganizationMinioConfig {
  readonly s3AccessKey: string;
}
