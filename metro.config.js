const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow Metro to bundle GLB/GLTF 3D model files
config.resolver.assetExts.push('glb', 'gltf', 'bin');

module.exports = config;
