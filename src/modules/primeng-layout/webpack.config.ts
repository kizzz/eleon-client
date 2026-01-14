import { withModuleFederation } from '../../shared/nx-webpack-utils';
import { composePlugins } from '@nx/webpack';
import { SharedLibraryConfig } from '@nx/module-federation';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { optimize } from 'webpack';


const config: ReturnType<typeof composePlugins> = composePlugins(
  withModuleFederation(
    {
      name: 'primeng-layout',
      exposes: {
        './Module': './src/modules/primeng-layout/src/app/app.module.ts',
      },
      shared: (library: string, config) => {
        console.log(library, config);
        return config;
      },
    }), (config) => {
      // config.plugins?.push(new BundleAnalyzerPlugin());
      config.plugins?.push(new optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }) as any);
      config.optimization.sideEffects = false;
      return config;
    });

export default config;
