import { withModuleFederation } from '../../shared/nx-webpack-utils';
import { composePlugins } from '@nx/webpack';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'system-log',
            exposes: {
                './Module': './src/modules/system-log/src/app/app.module.ts',
            }
        }),  (config) => {
                            config.plugins?.push(new optimize.LimitChunkCountPlugin({
                                maxChunks: 1,
                            }) as any);
                            return config;
                        });

export default config;
