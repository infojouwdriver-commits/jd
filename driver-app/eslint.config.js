const {defineConfig} = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  {ignores: ['android/**', 'ios/**', 'dist/**', 'node_modules/**']},
  expoConfig,
]);
