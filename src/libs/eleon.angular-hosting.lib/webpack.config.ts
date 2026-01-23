import { composePlugins, withNx } from '@nx/webpack';
import { Configuration } from 'webpack';
import * as path from 'path';

export default composePlugins(
  withNx(),
  (config: Configuration) => {
    // Resolve TypeScript path mappings
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@eleon/ts-hosting.lib': path.resolve(__dirname, '../eleon.ts-hosting.lib/src/index.ts'),
      '@eleon/app-config.lib': path.resolve(__dirname, '../eleon.app-config.lib/src/index.ts'),
      '@eleon/contracts.lib': path.resolve(__dirname, '../../shared/libs/eleon.contracts.lib/src/index.ts'),
      '@eleon/angular-sdk.lib': path.resolve(__dirname, '../../shared/libs/eleon.angular-sdk.lib/src/index.ts'),
      '@eleon/logging.lib': path.resolve(__dirname, '../eleon.logging.lib/src/index.ts'),
      '@eleon/system-services.lib': path.resolve(__dirname, '../eleon.system-services.lib/src/index.ts'),
      '@eleon/identity-querying.lib': path.resolve(__dirname, '../eleon.identity-querying.lib/src/index.ts'),
      '@eleon/typescript-sdk.lib': path.resolve(__dirname, '../../shared/libs/eleon.typescript-sdk.lib/src/index.ts'),
      '@eleon/storage.lib': path.resolve(__dirname, '../eleon.storage.lib/src/index.ts'),
      '@eleon/proxy-utils.lib': path.resolve(__dirname, '../../shared/libs/eleon.proxy-utils.lib/src/index.ts'),
      '@eleon/primeng-ui.lib': path.resolve(__dirname, '../../shared/libs/eleon.primeng-ui.lib/src/index.ts'),
    };
    
    config.resolve.extensions = ['.ts', '.js', '.json'];
    config.resolve.symlinks = false;
    
    // Configure as a library build
    config.entry = path.resolve(__dirname, 'src/index.ts');
    config.output = config.output || {};
    config.output.library = {
      type: 'module',
    };
    config.output.path = path.resolve(__dirname, '../../../../bin/debug/libs/eleon.angular-hosting.lib');
    
    return config;
  }
);
