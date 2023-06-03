import * as gcp from '@pulumi/gcp';
import { CustomResourceOptions, Output } from '@pulumi/pulumi';

/**
 * Defines a new HMAC key.
 *
 * @param {string} name the key name
 * @param {string} project the project
 * @param {string | Output<string>} serviceAccountId the id of the service account
 * @param {CustomResourceOptions} pulumiOptions pulumi options (optional)
 * @return {gcp.storage.HmacKey} the key
 */
export const createHMACKey = (
  name: string,
  project: string,
  serviceAccountId: string | Output<string>,
  { pulumiOptions }: { readonly pulumiOptions?: CustomResourceOptions }
): gcp.storage.HmacKey =>
  new gcp.storage.HmacKey(
    'gcp-storgae-hmac-key-' + name,
    {
      project: project,
      serviceAccountEmail: serviceAccountId,
    },
    pulumiOptions
  );
