// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support .cjs files (needed by Firebase packages)
config.resolver.sourceExts.push('cjs');

// 🚫 Disable package.json "exports" field resolution
config.resolver.unstable_enablePackageExports = false;

module.exports = config;