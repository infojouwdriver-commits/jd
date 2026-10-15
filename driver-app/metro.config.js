const {getDefaultConfig} = require('expo/metro-config');
const path = require('node:path');
const config = getDefaultConfig(__dirname);
// query-string 7 calls a CommonJS function; upstream 0.5 exports an ESM default.
// Keep the patched 0.5 algorithm while preserving that runtime contract.
config.resolver.resolveRequest = (context, name, platform) => context.resolveRequest(
  context, name === 'decode-uri-component' ? path.join(__dirname, 'vendor/decode-uri-component/index.js') : name, platform,
);
module.exports = config;
