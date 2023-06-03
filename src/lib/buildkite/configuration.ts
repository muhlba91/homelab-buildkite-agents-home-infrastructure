import { AgentToken, Provider } from '@grapl/pulumi-buildkite';
import * as gcp from '@pulumi/gcp';
import { all, Output } from '@pulumi/pulumi';

import { BuildkiteOrganizationData } from '../../model/buildkite_data';
import { ServiceAccountData } from '../../model/gcp/service_account_data';
import { StringMap } from '../../model/map';
import {
  buildkiteConfig,
  commonLabels,
  defaultMinioRegion,
  environment,
  minioConfig,
} from '../configuration';
import { createHMACKey } from '../gcp/storage/key';
import { b64encode } from '../util/base64';
import { createGCPServiceAccountAndKey } from '../util/gcp/service_account_user';

/**
 * Creates the Buildkite configurations.
 *
 * @returns {StringMap<Output<BuildkiteOrganizationData>>} the generated configurations
 */
export const createBuildkiteConfigurations = (): StringMap<
  Output<BuildkiteOrganizationData>
> =>
  Object.fromEntries(
    Object.entries(buildkiteConfig.organizations).map((entry) => [
      entry[0],
      _createSecretsAndConfiguration(entry[0]),
    ])
  );

/**
 * Creates the secrets and configuration for an organization.
 *
 * @param {string} organization the organization
 * @returns {Output<BuildkiteOrganizationData>} the organization configuration
 */
const _createSecretsAndConfiguration = (
  organization: string
): Output<BuildkiteOrganizationData> => {
  const buildkiteToken = _createBuildkiteToken(organization);

  const gcpIam = _createGCPServiceAccount(organization);
  const gcpBucket = _createArtifactsBucket(organization);
  const gcpHmac = _createGCPServiceAccountHMACKey(organization, gcpIam);

  return all([
    buildkiteToken.token,
    gcpIam.key.privateKey,
    gcpBucket.name,
    gcpHmac.accessId,
    gcpHmac.secret,
  ]).apply(
    ([
      agentToken,
      gcpPrivateKey,
      gcpBucketName,
      gcpAccessKeyId,
      gcpSecretAccessKey,
    ]) => ({
      token: b64encode(agentToken),
      spawn: buildkiteConfig.organizations[organization].spawn ?? 1,
      doppler: buildkiteConfig.organizations[organization].doppler
        ? {
            token: b64encode(
              buildkiteConfig.organizations[organization].doppler?.token ?? ''
            ),
          }
        : undefined,
      gcp: {
        key: gcpPrivateKey,
        bucket: gcpBucketName,
        accessKey: b64encode(gcpAccessKeyId),
        secretAccessKey: b64encode(gcpSecretAccessKey),
      },
      minio: {
        endpoint: `https://${minioConfig.endpoint}`,
        bucket: `buildkite-agent-cache-${environment}`,
        accessKey: b64encode('buildkite-agent'),
        secretAccessKey: b64encode(
          buildkiteConfig.organizations[organization].minio.s3AccessKey
        ),
        region: defaultMinioRegion,
      },
    })
  );
};

/**
 * Creates the Buildkite token for an organization.
 *
 * @param {string} organization the organization
 * @returns {Output<BuildkiteOrganizationData>} the organization configuration
 */
const _createBuildkiteToken = (organization: string): AgentToken => {
  const buildkiteProvider = new Provider('buildkite-' + organization, {
    organization: organization,
  });
  return new AgentToken(
    'buildkite-agent-token-' + organization,
    {
      description: `Agent Token for environment ${environment}.`,
    },
    {
      provider: buildkiteProvider,
    }
  );
};

/**
 * Creates the GCP IAM configuration for an organization.
 *
 * @param {string} organization the organization
 * @returns {Output<BuildkiteOrganizationData>} the organization configuration
 */
const _createGCPServiceAccount = (organization: string): ServiceAccountData =>
  createGCPServiceAccountAndKey(
    organization,
    buildkiteConfig.organizations[organization].gcp.project,
    {
      roles: buildkiteConfig.organizations[organization].gcp.roles.map(
        (role) =>
          `projects/${buildkiteConfig.organizations[organization].gcp.project}/roles/${role}`
      ),
    }
  );

/**
 * Creates the GCP HMAC key for an organization.
 *
 * @param {string} organization the organization
 * @param {ServiceAccountData} serviceAccount the service account
 * @returns {gcp.storage.HmacKey} the HMAC key
 */
const _createGCPServiceAccountHMACKey = (
  organization: string,
  serviceAccount: ServiceAccountData
): gcp.storage.HmacKey =>
  createHMACKey(
    organization,
    buildkiteConfig.organizations[organization].gcp.project,
    serviceAccount.serviceAccount.email,
    {}
  );

/**
 * Creates the Artifacts bucket for an organization.
 *
 * @param {string} organization the organization
 * @returns {gcp.storage.Bucket} the bucket
 */
const _createArtifactsBucket = (organization: string): gcp.storage.Bucket =>
  new gcp.storage.Bucket(
    'buildkite-artifacts-' + environment + '-' + organization,
    {
      project: buildkiteConfig.organizations[organization].gcp.project,
      location: buildkiteConfig.organizations[organization].gcp.location,
      publicAccessPrevention: 'enforced',
      forceDestroy: true,
      lifecycleRules: [
        {
          condition: {
            age: buildkiteConfig.organizations[organization]
              .artifactsExpirationDays,
          },
          action: {
            type: 'Delete',
          },
        },
      ],
      labels: {
        ...commonLabels,
        purpose: 'artifacts',
      },
    },
    {}
  );
