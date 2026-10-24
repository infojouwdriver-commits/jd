import React from "react";
import { Image, Text, View } from "react-native";
import { design } from "./tokens";
const icon = require("../../assets/app-icon.png");
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel="JOUW DRIVER"
      style={{ alignItems: "center", gap: compact ? 5 : 10 }}
    >
      <Image
        source={icon}
        accessible={false}
        style={{ width: compact ? 64 : 100, height: compact ? 64 : 100 }}
      />
      <Text
        style={{
          fontFamily: design.font.body,
          fontSize: compact ? 18 : 27,
          fontWeight: "700",
          letterSpacing: 2,
          color: design.brand.ink,
        }}
      >
        JOUW DRIVER
      </Text>
    </View>
  );
}
