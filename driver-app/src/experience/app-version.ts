import {nativeApplicationVersion, nativeBuildVersion} from 'expo-application';
import Constants from 'expo-constants';
import {Platform} from 'react-native';

export function appVersionLabel(versionLabel: string) {
  const platform = Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : undefined;
  const version = nativeApplicationVersion ?? Constants.expoConfig?.version;
  const build = nativeBuildVersion;
  const release = version ? `${versionLabel} ${version}${build ? ` (${build})` : ''}` : build;
  return [platform, release].filter(Boolean).join(' · ');
}
