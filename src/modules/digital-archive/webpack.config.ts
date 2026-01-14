import { withModuleFederation } from '../../shared/nx-webpack-utils';
import { composePlugins } from '@nx/webpack';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'digital-archive',
            exposes: {
                './Module': './src/modules/digital-archive/src/app/app.module.ts',
            }
        }),  (config) => {
                            config.plugins?.push(new optimize.LimitChunkCountPlugin({
                                maxChunks: 1,
                            }) as any);
                            return config;
                        });

export default config;
