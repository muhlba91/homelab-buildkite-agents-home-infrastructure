import { Config, getStack } from '@pulumi/pulumi';

import { BuildkiteConfig } from '../model/config/buildkite';
import { MinioConfig } from '../model/config/minio';
import { NetworkConfig } from '../model/config/network';
import { ProxmoxConfig } from '../model/config/proxmox';
import { ServerConfig } from '../model/config/server';
import { StringMap } from '../model/map';

export const environment = getStack();

export const region = 'tuxnet';

const config = new Config();
export const pveConfig = config.requireObject<ProxmoxConfig>('pve');
export const networkConfig = config.requireObject<NetworkConfig>('network');
export const serversConfig =
  config.requireObject<StringMap<ServerConfig>>('servers');
export const username = config.require<string>('username');
export const minioConfig = config.requireObject<MinioConfig>('minio');
export const buildkiteConfig =
  config.requireObject<BuildkiteConfig>('buildkite');
export const bucketId = config.require<string>('bucketId');

export const commonLabels = {
  environment: environment,
};

export const defaultMinioRegion = 'eu-west-1';
