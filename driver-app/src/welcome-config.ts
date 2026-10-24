// Public presentation only. Never accept origins, links, permissions or trip rules here.
export const WELCOME_LANGUAGES = ["ar", "fr", "nl", "en"] as const;
export type WelcomeLanguage = (typeof WELCOME_LANGUAGES)[number];
export type WelcomeText = Record<WelcomeLanguage, string>;
export type WelcomeSettings = {
  version: number;
  enabled: boolean;
  motion: boolean;
  title: WelcomeText;
  subtitle: WelcomeText;
  poster_data: string | null;
};
export const MAX_WELCOME_IMAGE_BYTES = 160 * 1024;
export const MAX_WELCOME_JSON_BYTES = 240 * 1024;
export const DEFAULT_WELCOME: WelcomeSettings = {
  version: 0,
  enabled: true,
  motion: true,
  poster_data: null,
  title: {
    ar: "كل يوم يبدأ معك.",
    fr: "Chaque journée commence avec vous.",
    nl: "Elke werkdag begint bij u.",
    en: "Every day starts with you.",
  },
  subtitle: {
    ar: "أهلاً بك في مساحة السائق.",
    fr: "Bienvenue dans votre espace chauffeur.",
    nl: "Welkom in uw chauffeursruimte.",
    en: "Welcome to your driver workspace.",
  },
};
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function localized(value: unknown, limit: number): value is WelcomeText {
  return (
    record(value) &&
    Object.keys(value).length === 4 &&
    WELCOME_LANGUAGES.every(
      (k) =>
        typeof value[k] === "string" &&
        value[k].length <= limit &&
        !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value[k] as string),
    )
  );
}
export function validWelcomePoster(value: unknown): value is string | null {
  if (value === null) return true;
  if (
    typeof value !== "string" ||
    value.length > Math.ceil(MAX_WELCOME_IMAGE_BYTES / 3) * 4 + 40
  )
    return false;
  return /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(
    value,
  );
}
export function parseWelcome(value: unknown): WelcomeSettings | null {
  if (
    !record(value) ||
    Object.keys(value).sort().join(",") !==
      "enabled,motion,poster_data,subtitle,title,version"
  )
    return null;
  if (
    !Number.isSafeInteger(value.version) ||
    (value.version as number) < 0 ||
    (value.version as number) > 2147483646 ||
    typeof value.enabled !== "boolean" ||
    typeof value.motion !== "boolean" ||
    !localized(value.title, 120) ||
    !localized(value.subtitle, 220) ||
    !validWelcomePoster(value.poster_data)
  )
    return null;
  return value as WelcomeSettings;
}
export function welcomePayload(value: WelcomeSettings) {
  const { version: _version, ...payload } = value;
  return payload;
}
export function sameWelcomeContent(a: WelcomeSettings, b: WelcomeSettings) {
  return (
    a.enabled === b.enabled &&
    a.motion === b.motion &&
    a.poster_data === b.poster_data &&
    WELCOME_LANGUAGES.every(
      (k) => a.title[k] === b.title[k] && a.subtitle[k] === b.subtitle[k],
    )
  );
}
