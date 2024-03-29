import * as gcp from '@pulumi/gcp';
import { CustomResourceOptions, Output } from '@pulumi/pulumi';

/**
 * Defines a new IAM member.
 *
 * @param {string} name the name of the account
 * @param {Output<string>} member the name of the member
 * @param {string} project the GCP project
 * @param {string[]} roles the roles
 * @param {CustomResourceOptions} pulumiOptions pulumi options (optional)
 */
export const createIAMMember = (
  name: string,
  member: Output<string>,
  project: string,
  roles: readonly string[],
  {
    pulumiOptions,
  }: {
    readonly pulumiOptions?: CustomResourceOptions;
  },
) => {
  roles.forEach(
    (role) =>
      new gcp.projects.IAMMember(
        'gcp-iam-member-' + name + '-' + role.replace(/[^a-z0-9]/gi, '-'),
        {
          member: member,
          role: role,
          project: project,
        },
        pulumiOptions,
      ),
  );
};
