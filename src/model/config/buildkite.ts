import { StringMap } from '../map';

/**
 * Defines configuration data for a Buildkite.
 */
export type BuildkiteConfig = {
  readonly organizations: StringMap<BuildkiteOrganizationConfig>;
  readonly sshKey: string;
  readonly version: string;
};

/**
 * Defines configuration data for a Buildkite organization.
 */
export type BuildkiteOrganizationConfig = {
  readonly spawn?: number;
  readonly doppler?: BuildkiteOrganizationDopplerConfig;
  readonly gcp: BuildkiteOrganizationGCPConfig;
  readonly minio: BuildkiteOrganizationMinioConfig;
  readonly artifactsExpirationDays: number;
};

/**
 * Defines Doppler configuration data for a Buildkite organization.
 */
export type BuildkiteOrganizationDopplerConfig = {
  readonly token: string;
};

/**
 * Defines GCP configuration data for a Buildkite organization.
 */
export type BuildkiteOrganizationGCPConfig = {
  readonly project: string;
  readonly location: string;
  readonly roles: readonly string[];
};

/**
 * Defines Minio configuration data for a Buildkite organization.
 */
export type BuildkiteOrganizationMinioConfig = {
  readonly s3AccessKey: string;
};
