import {
  MAX_WELCOME_IMAGE_BYTES,
  parseWelcome,
  type WelcomeSettings,
} from "../../driver-app/src/welcome-config.ts";
export {
  parseWelcome,
  DEFAULT_WELCOME,
} from "../../driver-app/src/welcome-config.ts";

// A data URL must contain actual raster bytes, not an HTML/SVG document with a renamed MIME.
export function welcomeImageValid(settings: WelcomeSettings): boolean {
  if (settings.poster_data === null) return true;
  const [prefix, base64] = settings.poster_data.split(",");
  const bytes = Buffer.from(base64, "base64");
  if (
    bytes.length < 24 ||
    bytes.length > MAX_WELCOME_IMAGE_BYTES ||
    bytes.toString("base64") !== base64
  )
    return false;
  if (prefix === "data:image/png;base64")
    return bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (prefix === "data:image/jpeg;base64")
    return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return (
    prefix === "data:image/webp;base64" &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  );
}
export function parseWelcomeSave(value: unknown) {
  const settings = parseWelcome(value);
  return settings && welcomeImageValid(settings) ? settings : null;
}
