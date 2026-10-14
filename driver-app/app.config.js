module.exports = {
  expo: {
    name: 'JOUW DRIVER', slug: 'jouw-driver-native', version: '0.1.0', scheme: 'jouwdriver',
    orientation: 'portrait', userInterfaceStyle: 'dark',
    ios: {bundleIdentifier: 'be.jouwdriver.driver', supportsTablet: false},
    android: {package: 'be.jouwdriver.driver', allowBackup: false, permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION']},
    plugins: ['expo-router', '@rnmapbox/maps', 'expo-sqlite', 'expo-secure-store', ['expo-location', {locationWhenInUsePermission: 'JOUW DRIVER utilise votre position pour mesurer votre trajet et afficher la carte.', locationAlwaysAndWhenInUsePermission: 'JOUW DRIVER utilise votre position pendant une course active, même lorsque l’écran est verrouillé, pour enregistrer sa distance.', isIosBackgroundLocationEnabled: true, isAndroidBackgroundLocationEnabled: true, isAndroidForegroundServiceEnabled: true}]],
  },
};
