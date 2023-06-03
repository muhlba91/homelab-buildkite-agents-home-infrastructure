/**
 * Defines data for a Buildkite organization.
 */
export type BuildkiteOrganizationData = {
  readonly token: string;
  readonly doppler?: BuildkiteOrganizationDopplerData;
  readonly minio: BuildkiteOrganizationAWSData;
  readonly gcp: BuildkiteOrganizationGCPData;
};

/**
 * Defines Doppler data for a Buildkite organization.
 */
export type BuildkiteOrganizationDopplerData = {
  readonly token: string;
};

/**
 * Defines AWS data for a Buildkite organization.
 */
export type BuildkiteOrganizationAWSData = {
  readonly accessKey: string;
  readonly secretAccessKey: string;
  readonly region: string;
  readonly endpoint?: string;
  readonly bucket?: string;
};

/**
 * Defines GCP data for a Buildkite organization.
 */
export type BuildkiteOrganizationGCPData = {
  readonly key: string;
  readonly accessKey?: string;
  readonly secretAccessKey?: string;
  readonly bucket?: string;
};
