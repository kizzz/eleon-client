import { withModuleFederation } from '../../shared/nx-webpack-utils';
import { composePlugins } from '@nx/webpack';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'identity-querying',
            exposes: {
                './Module': './src/modules/identity-querying/src/app/app.module.ts',
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

