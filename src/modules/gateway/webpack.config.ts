import { withModuleFederation } from '../../shared/nx-webpack-utils';
import { composePlugins } from '@nx/webpack';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'gateway',
            exposes: {
                './Module': './src/modules/gateway/src/app/app.module.ts'
            }
        }),  (config) => {
                            config.plugins?.push(new optimize.LimitChunkCountPlugin({
                                maxChunks: 1,
                            }) as any);
                            return config;
                        });

export default config;
