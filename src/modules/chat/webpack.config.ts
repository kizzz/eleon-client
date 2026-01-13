import { withModuleFederation } from '../../shared/nx/utils';
import { composePlugins } from '@nx/webpack';
import { SharedLibraryConfig } from '@nx/module-federation';
import { DefinePlugin } from 'webpack';
import { optimize } from 'webpack';



const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'eleoncorechat',
            exposes: {
                './Module': './src/modules/chat/src/app/app.module.ts'
            },
        }),  (config) => {
                    config.plugins?.push(new optimize.LimitChunkCountPlugin({
                        maxChunks: 1,
                    }) as any);
                    return config;
                });

export default config;
