// @ts-nocheck
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^brain$': '<rootDir>/src/brain/Brain',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': 'ts-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@commercelayer|@stripe|@babel|@testing-library|@hookform|uuid|react-markdown|vfile|vfile-message|unist-util-|unified|bail|is-plain-obj|trough|remark-|mdast-util-|micromark-|decode-named-character-reference|character-entities|property-information|hast-util-|html-void-elements))',
  ],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  testPathIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      useESM: true,
      isolatedModules: true,
      babelConfig: {
        presets: ['@babel/preset-env'],
        plugins: ['@babel/plugin-transform-modules-commonjs'],
      },
    },
  },
  // Mock import.meta
  setupFiles: ['<rootDir>/scripts/importMetaTransformer.js'],
  // Handle ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleDirectories: ['node_modules', 'src'],
};
