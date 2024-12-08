// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.sourceExts.push('cjs');

defaultConfig.resolver.assetExts.push('cjs');

defaultConfig.resolver.extraNodeModules = {
  ...defaultConfig.resolver.extraNodeModules,
  '@firebase/app': require.resolve('@firebase/app'),
  '@firebase/auth': require.resolve('@firebase/auth'),
  '@firebase/firestore': require.resolve('@firebase/firestore'),
};

module.exports = defaultConfig;
