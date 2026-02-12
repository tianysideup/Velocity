const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch both the mobile directory and the workspace root (for hoisted deps)
config.watchFolders = [workspaceRoot];

// Set the project root so Metro knows where to start
config.projectRoot = projectRoot;

// Force Metro to resolve these critical packages from mobile/node_modules
// This prevents react-native-renderer (19.1.0) / react (19.2.4) version mismatch
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules', 'react'),
  'react-native': path.resolve(projectRoot, 'node_modules', 'react-native'),
};

// Prefer mobile's node_modules, then fall back to root for hoisted packages
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Prevent Metro from walking up the directory tree for module resolution
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
