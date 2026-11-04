const {withXcodeProject} = require('expo/config-plugins');

// Signing values enter only the generated app target, never CocoaPods targets.
module.exports = function withIosDistribution(config) {
  if (process.env.JD_IOS_MANUAL_SIGNING !== '1') return config;
  const team = process.env.JD_IOS_TEAM;
  const profile = process.env.JD_IOS_PROFILE;
  if (!team || !profile) throw new Error('Missing iOS distribution signing configuration');
  return withXcodeProject(config, result => {
    let matched = 0;
    for (const entry of Object.values(result.modResults.pbxXCBuildConfigurationSection())) {
      const settings = entry?.buildSettings;
      if (String(settings?.PRODUCT_BUNDLE_IDENTIFIER).replaceAll('"', '') !== config.ios.bundleIdentifier) continue;
      Object.assign(settings, {
        DEVELOPMENT_TEAM: team,
        CODE_SIGN_STYLE: 'Manual',
        CODE_SIGN_IDENTITY: '"Apple Distribution"',
        PROVISIONING_PROFILE_SPECIFIER: `"${profile}"`,
      });
      matched++;
    }
    if (!matched) throw new Error('Distribution configuration did not find the app target');
    return result;
  });
};
