import { withModuleFederation } from '../../shared/nx/utils';
import { composePlugins } from '@nx/webpack';
import { optimize } from 'webpack';

export default composePlugins(
    withModuleFederation(
        {
            name: 'host',
            shared: (library: string, config) => {
                console.log(library, config);
                return config;
            },
        }),  (config) => {
            config.plugins?.push(new optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }));
            return config;
        });
