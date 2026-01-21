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
      '@eleon/typescript-sdk.lib': path.resolve(__dirname, '../../shared/libs/eleon.typescript-sdk.lib/src/index.ts'),
      '@eleon/contracts.lib': path.resolve(__dirname, '../../shared/libs/eleon.contracts.lib/src/index.ts'),
    };
    
    config.resolve.extensions = ['.ts', '.js', '.json'];
    config.resolve.symlinks = false;
    
    // Configure as a library build
    config.entry = path.resolve(__dirname, 'src/index.ts');
    config.output = config.output || {};
    config.output.library = {
      type: 'module',
    };
    config.output.path = path.resolve(__dirname, '../../../../bin/debug/libs/eleon.app-config.lib');
    
    return config;
  }
);
