const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure Metro resolves react-native-worklets (required by Reanimated 4)
config.resolver.unstable_enablePackageExports = true;
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-worklets': path.resolve(__dirname, 'node_modules/react-native-worklets'),
};

module.exports = config;
