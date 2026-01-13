import { withModuleFederation } from '../../shared/nx/utils';
import { composePlugins } from '@nx/webpack';
import { optimize } from 'webpack';


const config: ReturnType<typeof composePlugins> = composePlugins(
  withModuleFederation(
    {
      name: 'sakai-ng-layout',
      exposes: {
        './SakaiNgLayout': './src/modules/sakai-ng-layout/src/app/app.module.ts',
      },
    }), (config) => {
      config.plugins?.push(new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }) as any);
      return config;
    });

export default config;
