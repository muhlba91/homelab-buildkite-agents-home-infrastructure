import { all, Output } from '@pulumi/pulumi';

import { createBuildkiteConfigurations } from './lib/buildkite/configuration';
import {
  bucketId,
  buildkiteConfig,
  environment,
  serversConfig,
  username,
} from './lib/configuration';
import { uploadToS3 } from './lib/gcp/storage/upload';
import { createServer } from './lib/server/create';
import { createDir } from './lib/util/create_dir';
import { writeFilePulumi } from './lib/util/file';
import { createRandomPassword } from './lib/util/random';
import { createSSHKey } from './lib/util/ssh_key';
import { renderTemplate } from './lib/util/template';

export = async () => {
  createDir('outputs');

  const userPassword = createRandomPassword('server', {});
  const sshKey = createSSHKey('home', {});

  const buildkiteConfigurations = createBuildkiteConfigurations();

  const buildkiteServers = all([
    userPassword.password,
    sshKey.publicKeyOpenssh,
  ]).apply(([userPasswordPlain, sshPublicKey]) =>
    Object.entries(serversConfig).map((server) =>
      createServer(
        'buildkite',
        server[0],
        userPasswordPlain,
        sshPublicKey.trim(),
        server[1]
      )
    )
  );

  writeFilePulumiAndUploadToS3('ssh.key', sshKey.privateKeyPem, {
    permissions: '0600',
  });
  writeFilePulumiAndUploadToS3(
    'inventory.yml',
    all([buildkiteServers, buildkiteConfigurations]).apply(
      ([servers, configurations]) =>
        renderTemplate('assets/ansible.yml.j2', {
          username: username,
          servers: servers,
          environment: environment,
          buildkiteVersion: buildkiteConfig.version,
          sshPrivateKey: buildkiteConfig.sshKey,
          organizations: configurations,
        })
    ),
    {}
  );

  return {};
};

/**
 * Writes the pulumi Output to a file and uploads it to S3.
 *
 * @param {string} name the name of the file
 * @param {Output<string>} content the content
 * @param {string} permissions the permissions (default: 0644)
 */
const writeFilePulumiAndUploadToS3 = (
  name: string,
  content: Output<string>,
  { permissions = '0644' }: { readonly permissions?: string }
) => {
  const path = 'outputs/' + name;
  writeFilePulumi(path, content, {
    permissions: permissions,
  }).apply(() => {
    uploadToS3(
      bucketId,
      'buildkite/home/' + environment + '/' + name,
      path,
      {}
    );
  });
};
