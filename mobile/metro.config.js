const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Force Metro to resolve modules from the mobile directory first
// This prevents the root workspace's hoisted react (19.2.4) from being used
// instead of mobile's react (19.1.0)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Block resolution from going up to the root node_modules
config.watchFolders = [];

module.exports = config;
