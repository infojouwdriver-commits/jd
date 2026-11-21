const {withEntitlementsPlist, withInfoPlist} = require('expo/config-plugins');

module.exports = function withCarPlay(config) {
  config = withInfoPlist(config, result => {
    const manifest = result.modResults.UIApplicationSceneManifest ?? {};
    const scenes = manifest.UISceneConfigurations ?? {};
    const phoneRole = 'UIWindowSceneSessionRoleApplication';
    const carRole = 'CPTemplateApplicationSceneSessionRoleApplication';
    result.modResults.UIApplicationSceneManifest = {
      ...manifest,
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        ...scenes,
        [phoneRole]: scenes[phoneRole] ?? [{
          UISceneConfigurationName: 'JOUW DRIVER',
          UISceneClassName: 'UIWindowScene',
          UISceneDelegateClassName: 'JDPhoneWindowSceneDelegate',
        }],
        [carRole]: [{
          UISceneConfigurationName: 'JOUW DRIVER Navigation',
          UISceneClassName: 'CPTemplateApplicationScene',
          UISceneDelegateClassName: 'JDDriverCarPlaySceneDelegate',
        }],
      },
    };
    return result;
  });

  return withEntitlementsPlist(config, result => {
    result.modResults['com.apple.developer.carplay-maps'] = true;
    return result;
  });
};
