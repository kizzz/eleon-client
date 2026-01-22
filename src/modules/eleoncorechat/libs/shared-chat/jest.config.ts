/* eslint-disable */
export default {
  displayName: 'shared-chat',
  preset: '../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../../coverage/shared/libs/shared-chat',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: {
          extends: '<rootDir>/tsconfig.json',
          compilerOptions: {
            outDir: './out-tsc',
            module: 'commonjs',
            target: 'es2016',
            types: ['jest', 'node'],
          },
          files: ['src/test-setup.ts'],
          include: [
            'jest.config.ts',
            'src/**/*.test.ts',
            'src/**/*.spec.ts',
            'src/**/*.d.ts',
          ],
        },
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
