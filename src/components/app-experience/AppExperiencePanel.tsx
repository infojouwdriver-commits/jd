"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { api, ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  parseWelcome,
  WELCOME_LANGUAGES,
  sameWelcomeContent,
  type WelcomeSettings,
  type WelcomeLanguage,
} from "../../../driver-app/src/welcome-config";
import { experienceCopy } from "./copy";
import { prepareWelcomeImage } from "./prepare-image";
import "./welcome-preview.css";
const languageNames = {
  ar: "العربية",
  fr: "Français",
  nl: "Nederlands",
  en: "English",
};

export default function AppExperiencePanel() {
  const { language } = useLanguage(),
    c = experienceCopy[language];
  const router = useRouter();
  const [leaving, setLeaving] = useState<string | null>(null);
  const [draft, setDraft] = useState<WelcomeSettings | null>(null),
    [saved, setSaved] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [processing, setProcessing] = useState(false),
    [error, setError] = useState(""),
    [fieldError, setFieldError] = useState(false),
    [previewLanguage, setPreviewLanguage] = useState<WelcomeLanguage>(language);
  const flight = useRef(false),
    generation = useRef(0),
    imageInput = useRef<HTMLInputElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  function askLeave(destination: string) {
    returnFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setLeaving(destination);
  }
  const dirty = !!draft && JSON.stringify(draft) !== saved;
  const load = useCallback(async () => {
    const id = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const result = await api.get<WelcomeSettings>("/app-experience");
      const value = parseWelcome(result);
      if (!value) throw Error("Invalid configuration");
      if (id === generation.current) {
        setDraft(value);
        setSaved(JSON.stringify(value));
      }
    } catch {
      if (id === generation.current) setError("load");
    } finally {
      if (id === generation.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
    return () => {
      generation.current++;
    };
  }, [load]);
  useEffect(() => {
    if (!dirty) return;
    const leave = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, [dirty]);
  useEffect(() => {
    if (!dirty) return;
    const navigate = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as Element).closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin === location.origin &&
        url.pathname !== location.pathname
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (!flight.current) askLeave(url.pathname + url.search + url.hash);
      }
    };
    document.addEventListener("click", navigate, true);
    return () => document.removeEventListener("click", navigate, true);
  }, [dirty]);
  function patch(value: Partial<WelcomeSettings>) {
    setDraft((current) => (current ? { ...current, ...value } : current));
    setError("");
  }
  async function publish() {
    if (!draft || flight.current || processing) return;
    flight.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await api.put<WelcomeSettings>("/app-experience", draft);
      const value = parseWelcome(result);
      if (!value) throw Error("Invalid receipt");
      setDraft(value);
      setSaved(JSON.stringify(value));
      toast.success(c.saved);
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) setError("conflict");
      else {
        // A lost response may already have committed. Verify the published content before retrying.
        try {
          const result = await api.get<WelcomeSettings>("/app-experience");
          const value = parseWelcome(result);
          if (
            value &&
            value.version > draft.version &&
            sameWelcomeContent(value, draft)
          ) {
            setDraft(value);
            setSaved(JSON.stringify(value));
            toast.success(c.saved);
          } else setError("save");
        } catch {
          setError("save");
        }
      }
    } finally {
      flight.current = false;
      setBusy(false);
    }
  }
  const problem =
    error === "load"
      ? c.error
      : error === "conflict"
        ? c.conflict
        : error
          ? c.saveError
          : "";
  return (
    <section
      className="mx-auto max-w-5xl space-y-6"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div>
        <h1 className="text-2xl font-semibold">{c.heading}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {c.intro}
        </p>
      </div>
      {problem && (
        <p
          role="alert"
          className="rounded-lg border border-destructive p-4 text-sm"
        >
          {problem}
        </p>
      )}
      {loading ? (
        <p role="status" className="min-h-32">
          {c.loading}
        </p>
      ) : !draft ? (
        <Button onClick={() => void load()}>{c.retry}</Button>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <form
            noValidate
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              void publish();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{c.heading}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="welcome-enabled">{c.enabled}</Label>
                  <Switch
                    id="welcome-enabled"
                    checked={draft.enabled}
                    disabled={busy || processing}
                    onCheckedChange={(enabled) => patch({ enabled })}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="welcome-motion">{c.motion}</Label>
                  <Switch
                    id="welcome-motion"
                    checked={draft.motion}
                    disabled={busy || processing}
                    onCheckedChange={(motion) => patch({ motion })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="welcome-image">{c.image}</Label>
                  <Input
                    ref={imageInput}
                    id="welcome-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={busy || processing}
                    aria-describedby="welcome-image-help welcome-image-error"
                    aria-invalid={fieldError}
                    onChange={async (e) => {
                      const file = e.currentTarget.files?.[0];
                      if (!file) return;
                      setProcessing(true);
                      setFieldError(false);
                      try {
                        patch({ poster_data: await prepareWelcomeImage(file) });
                      } catch {
                        setFieldError(true);
                        imageInput.current?.focus();
                      } finally {
                        setProcessing(false);
                        if (imageInput.current) imageInput.current.value = "";
                      }
                    }}
                  />
                  <p
                    id="welcome-image-help"
                    className="text-sm text-muted-foreground"
                  >
                    {c.imageHint}
                  </p>
                  <p
                    id="welcome-image-error"
                    role={fieldError ? "alert" : undefined}
                    className="min-h-5 text-sm text-destructive"
                  >
                    {fieldError ? c.imageError : processing ? c.processing : ""}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy || processing}
                    onClick={() => {
                      patch({ poster_data: null });
                      setFieldError(false);
                    }}
                  >
                    {c.defaultImage}
                  </Button>
                </div>
                {WELCOME_LANGUAGES.map((lang) => (
                  <fieldset
                    key={lang}
                    className="space-y-2 rounded-lg border p-3"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <legend className="px-2 text-sm">
                      {languageNames[lang]}
                    </legend>
                    <Label htmlFor={`welcome-title-${lang}`}>{c.title}</Label>
                    <Input
                      id={`welcome-title-${lang}`}
                      lang={lang}
                      maxLength={120}
                      disabled={busy || processing}
                      value={draft.title[lang]}
                      onChange={(e) =>
                        patch({
                          title: { ...draft.title, [lang]: e.target.value },
                        })
                      }
                    />
                    <Label htmlFor={`welcome-subtitle-${lang}`}>
                      {c.subtitle}
                    </Label>
                    <Input
                      id={`welcome-subtitle-${lang}`}
                      lang={lang}
                      maxLength={220}
                      disabled={busy || processing}
                      value={draft.subtitle[lang]}
                      onChange={(e) =>
                        patch({
                          subtitle: {
                            ...draft.subtitle,
                            [lang]: e.target.value,
                          },
                        })
                      }
                    />
                  </fieldset>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="submit"
                    disabled={busy || processing || !dirty}
                    aria-busy={busy}
                    className="min-w-40"
                  >
                    {busy ? c.loading : c.publish}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy || processing}
                    onClick={() => (dirty ? askLeave("reload") : void load())}
                  >
                    {c.retry}
                  </Button>
                </div>
                <p
                  className="min-h-5 text-sm text-muted-foreground"
                  role="status"
                >
                  {dirty ? c.draft : `${c.version}: ${draft.version}`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{c.icon}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <img
                  src="/app-brand/app-icon.png"
                  width={72}
                  height={72}
                  className="rounded-2xl"
                  alt="JOUW DRIVER"
                />
                <p className="text-sm text-muted-foreground">{c.iconHint}</p>
              </CardContent>
            </Card>
          </form>
          <aside className="space-y-3">
            <h2 className="font-medium">{c.preview}</h2>
            <div className="flex flex-wrap gap-2">
              {WELCOME_LANGUAGES.map((lang) => (
                <Button
                  key={lang}
                  size="sm"
                  variant={previewLanguage === lang ? "default" : "outline"}
                  aria-pressed={previewLanguage === lang}
                  onClick={() => setPreviewLanguage(lang)}
                >
                  {languageNames[lang]}
                </Button>
              ))}
            </div>
            <div
              className={`jd-welcome-preview ${draft.motion && draft.enabled ? "has-motion" : ""}`}
            >
              <img
                className="jd-welcome-poster"
                src={draft.poster_data || "/app-brand/welcome.jpg"}
                alt=""
              />
              <div className="jd-welcome-shade" />
              <div className="jd-welcome-brand">
                <img src="/app-brand/app-icon.png" alt="" />
                <span>JOUW DRIVER</span>
              </div>
              <div
                className="jd-welcome-copy"
                dir={previewLanguage === "ar" ? "rtl" : "ltr"}
              >
                <h3>{draft.title[previewLanguage]}</h3>
                <p>{draft.subtitle[previewLanguage]}</p>
                <span>
                  {previewLanguage === "ar"
                    ? "ابدأ"
                    : previewLanguage === "nl"
                      ? "Beginnen"
                      : previewLanguage === "en"
                        ? "Get started"
                        : "Commencer"}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
      <AlertDialog
        open={leaving !== null}
        onOpenChange={(open) => {
          if (!open) setLeaving(null);
        }}
      >
        <AlertDialogContent
          dir={language === "ar" ? "rtl" : "ltr"}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocus.current?.focus();
          }}
        >
          <AlertDialogTitle>{c.draft}</AlertDialogTitle>
          <AlertDialogDescription>{c.leave}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>{c.stay}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const destination = leaving;
                setLeaving(null);
                if (destination === "reload") void load();
                else if (destination) router.push(destination);
              }}
            >
              {c.discard}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
