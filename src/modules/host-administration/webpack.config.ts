import { withModuleFederation } from '../../shared/nx-webpack-utils';
import { composePlugins } from '@nx/webpack';
import { DefinePlugin } from 'webpack';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'host-administration',
            exposes: {
                './Module': './src/modules/host-administration/src/app/app.module.ts'
            }
        }),  (config) => {
                            config.plugins?.push(new optimize.LimitChunkCountPlugin({
                                maxChunks: 1,
                            }) as any);
                            return config;
                        });

export default config;
