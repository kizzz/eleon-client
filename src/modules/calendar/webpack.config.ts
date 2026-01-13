import { withModuleFederation } from '../../shared/nx/utils';
import { composePlugins } from '@nx/webpack';
import { ModuleFederationConfig, SharedLibraryConfig } from '@nx/module-federation';
import { optimize } from 'webpack';

const config: ReturnType<typeof composePlugins> = composePlugins(
    withModuleFederation(
        {
            name: 'calendar',
            exposes: {
                './Calendar': './src/modules/calendar/src/app/app.module.ts',
            },
        }), (config) => {
            config.plugins?.push(new optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }) as any);
            return config;
        });

export default config;
