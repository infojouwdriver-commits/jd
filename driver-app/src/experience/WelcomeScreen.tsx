import React, { useEffect, useState } from "react";
import {
  AppState,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { File, Paths } from "expo-file-system";
import {
  DEFAULT_WELCOME,
  MAX_WELCOME_JSON_BYTES,
  parseWelcome,
  type WelcomeSettings,
} from "../welcome-config";
import { fetchWelcome } from "../welcome-loader";
import { usePreferences } from "./preferences";
import { Button } from "./ui";
import { design } from "./tokens";
import { BrandMark } from "./BrandMark";
const poster = require("../../assets/welcome.jpg");
function cacheFile() {
  return new File(Paths.document, "jd-public-welcome-v1.json");
}
function cachedSettings() {
  try {
    const file = cacheFile();
    if (file.exists && file.size <= MAX_WELCOME_JSON_BYTES)
      return parseWelcome(JSON.parse(file.textSync())) ?? DEFAULT_WELCOME;
  } catch {
    /* Public presentation cache is optional; never touch trip/session storage. */
  }
  return DEFAULT_WELCOME;
}
export function useWelcomeSettings() {
  const [value, setValue] = useState<WelcomeSettings>(cachedSettings);
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    fetchWelcome(fetch, controller.signal)
      .then((next) => {
        if (!alive) return;
        setValue((current) =>
          next.version >= current.version ? next : current,
        );
        try {
          const current = cachedSettings();
          if (next.version >= current.version) {
            const file = cacheFile();
            file.write(JSON.stringify(next));
          }
        } catch {
          /* Last valid bundled image remains available. */
        }
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer));
    return () => {
      alive = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);
  return value;
}
export default function WelcomeScreen({
  settings,
  onContinue,
}: {
  settings: WelcomeSettings;
  onContinue: () => void;
}) {
  const { language, animate, rtl, t } = usePreferences();
  const [foreground, setForeground] = useState(
      AppState.currentState === "active",
    ),
    [failedPoster, setFailedPoster] = useState<string | null>(null);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) =>
      setForeground(s === "active"),
    );
    return () => sub.remove();
  }, []);
  const moving = animate && foreground && settings.motion;
  return (
    <View
      testID="welcome-screen"
      style={{ flex: 1, backgroundColor: design.brand.background }}
    >
      <Animated.View
        testID="welcome-artwork"
        accessible={false}
        style={[
          StyleSheet.absoluteFill,
          {
            animationName: moving
              ? {
                  from: { transform: [{ scale: 1 }] },
                  to: { transform: [{ scale: 1.045 }] },
                }
              : undefined,
            animationDuration: 5000,
            animationIterationCount: "infinite",
            animationDirection: "alternate",
            animationTimingFunction: "ease-in-out",
          },
        ]}
      >
        <Image
          accessible={false}
          source={
            settings.poster_data && settings.poster_data !== failedPoster
              ? { uri: settings.poster_data }
              : poster
          }
          resizeMode="cover"
          onError={() => setFailedPoster(settings.poster_data)}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Svg
        pointerEvents="none"
        accessible={false}
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <LinearGradient id="welcome-shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={design.brand.background} />
            <Stop offset=".28" stopColor={design.brand.background} />
            <Stop
              offset=".46"
              stopColor={design.brand.background}
              stopOpacity="0"
            />
            <Stop
              offset=".60"
              stopColor={design.brand.background}
              stopOpacity="0"
            />
            <Stop offset="1" stopColor={design.brand.background} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#welcome-shade)" />
      </Svg>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 24 }}
        >
          <View style={{ paddingTop: 12 }}>
            <BrandMark />
          </View>
          <View style={{ flex: 1, minHeight: 100 }} />
          <View style={{ gap: 16 }}>
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: design.font.body,
                fontSize: 27,
                fontWeight: "700",
                lineHeight: rtl ? 42 : 37,
                textAlign: "center",
                color: design.brand.ink,
              }}
            >
              {settings.title[language]}
            </Text>
            <Text
              style={{
                fontFamily: design.font.body,
                fontSize: 16,
                lineHeight: 26,
                textAlign: "center",
                color: design.brand.muted,
              }}
            >
              {settings.subtitle[language]}
            </Text>
            <Button
              label={t("welcomeContinue")}
              icon="arrow-forward"
              onPress={onContinue}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
