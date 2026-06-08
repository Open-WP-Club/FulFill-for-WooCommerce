// Packages that use JSX/TS/ESM and must be transformed even when in node_modules.
// Use prefix-only (no trailing slash) so react-native-* sub-packages are covered too.
const TRANSFORM_ALLOWLIST =
  'react-native|@react-native|@react-native-community|@react-navigation|uuid';

module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    // pnpm virtual store: .pnpm/<pkg@ver>/node_modules/<pkg>/
    // Allow anything whose package-dir name starts with the allowlist.
    `node_modules/\\.pnpm/(?!(${TRANSFORM_ALLOWLIST}))`,
    // Hoisted / flat node_modules.
    // Exclude .pnpm dir itself (handled above) and anything starting with the allowlist.
    `node_modules/(?!(\\.pnpm|${TRANSFORM_ALLOWLIST}))`,
  ],
  moduleNameMapper: {
    'react-native-reanimated': '<rootDir>/__mocks__/react-native-reanimated.js',
  },
};
