module.exports = {
  expo: {
    name: 'JOUW DRIVER', slug: 'jouw-driver-native', version: '0.2.2', scheme: 'jouwdriver',
    orientation: 'portrait', userInterfaceStyle: 'automatic',
    ios: {bundleIdentifier: 'be.jouwdriver.driver', supportsTablet: false},
    android: {versionCode: 4, package: 'be.jouwdriver.driver', allowBackup: false, permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']},
    plugins: ['expo-sharing', 'expo-router', '@rnmapbox/maps', 'expo-sqlite', 'expo-secure-store', ['expo-location', {locationWhenInUsePermission: 'JOUW DRIVER utilise votre position pour mesurer votre trajet et afficher la carte.', locationAlwaysAndWhenInUsePermission: 'JOUW DRIVER utilise votre position pendant une course active, même lorsque l’écran est verrouillé, pour enregistrer sa distance et partager la dernière position avec votre société et l’administration.', isIosBackgroundLocationEnabled: true, isAndroidBackgroundLocationEnabled: true, isAndroidForegroundServiceEnabled: true}]],
  },
};
