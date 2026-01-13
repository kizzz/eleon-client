import { withModuleFederation } from '../../shared/nx/utils';
import { composePlugins } from '@nx/webpack';
import { ModuleFederationConfig, SharedLibraryConfig } from '@nx/module-federation';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'health-check',
            exposes: {
                './Module': './src/modules/health-check/src/app/app.module.ts',
            },
        }), (config) => {
            config.plugins?.push(
                // Nx 22 bundles its own webpack instance; cast avoids duplicate-typing errors.
                new optimize.LimitChunkCountPlugin({
                    maxChunks: 1,
                }) as any
            );
            return config;
        });

export default config;

