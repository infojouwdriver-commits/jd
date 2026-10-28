"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CinematicText } from "./copy";

export default function Cinema({ t, rtl }: { t: CinematicText; rtl: boolean }) {
  const section = useRef<HTMLElement>(null),
    host = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0),
    [enabled, setEnabled] = useState(true),
    [reduced, setReduced] = useState(true),
    [failed, setFailed] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(mq.matches);
    change();
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    setReady(false);
    if (!enabled || reduced || failed) return;
    let cancelled = false,
      cleanup: (() => void) | undefined;
    import("./engine")
      .then(async ({ mountCinema }) => {
        if (cancelled || !host.current || !section.current) return;
        const dispose = await mountCinema(
          host.current,
          section.current,
          t,
          rtl,
          (p) => {
            if (!cancelled)
              setChapter(p < 0.23 ? 0 : p < 0.57 ? 1 : p < 0.78 ? 2 : 3);
          },
          () => setFailed(true),
        );
        if (cancelled) dispose();
        else {
          cleanup = dispose;
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [enabled, reduced, failed, t, rtl]);
  const staticMode = !enabled || reduced || failed;
  return (
    <section
      ref={section}
      id="experience"
      className={`jd-cinema ${staticMode ? "jd-static" : ""}`}
      aria-label={t.experience}
    >
      <div className="jd-stage">
        <div className="jd-narrative">
          <p className="jd-eyebrow">
            JOUW DRIVER <span> / {String(chapter + 1).padStart(2, "0")}</span>
          </p>
          <div className="jd-chapter-copy" key={chapter}>
            {chapter === 0 ? (
              <h1>
                {t.title}
                <em>{t.accent}</em>
              </h1>
            ) : (
              <h2>{t.chapters[chapter]}</h2>
            )}
            <p className="jd-lead">
              {chapter === 0 ? t.intro : t.descriptions[chapter]}
            </p>
          </div>
          <a className="jd-button" href="#platform">
            {t.discover}
            <span aria-hidden="true">↗</span>
          </a>
          <a className="jd-skip" href="#platform">
            {t.skip} ↓
          </a>
          <div className="jd-chapter-nav" aria-label={t.experience}>
            {t.chapters.map((label, i) => (
              <a
                key={label}
                href={`#chapter-${i}`}
                aria-current={chapter === i ? "step" : undefined}
                aria-label={label}
              >
                <span>0{i + 1}</span>
                <i />
              </a>
            ))}
          </div>
          <p className="jd-scroll">{staticMode ? t.fallback : t.scroll}</p>
        </div>
        <div className="jd-visual">
          <div
            className="jd-scene"
            ref={host}
            aria-label={t.demo}
            role="img"
            hidden={staticMode}
          />
          {(staticMode || !ready) && (
            <div
              className={`jd-poster ${!staticMode ? "jd-loading-poster" : ""}`}
            >
              <Image
                src="/cinematic/poster.webp"
                width={1200}
                height={1000}
                alt={t.chapters[1]}
                priority
              />
              <p>{t.fallback}</p>
            </div>
          )}
          <div className="jd-scene-label">
            <span>{t.demo}</span>
            <span aria-hidden="true">JD / ASTER</span>
          </div>
          {!reduced && (
            <button
              className="jd-motion"
              onClick={() => setEnabled((v) => !v)}
              aria-pressed={enabled && !failed}
            >
              {enabled ? t.pause : t.play}
            </button>
          )}
        </div>
      </div>
      <div className="jd-markers" aria-hidden="true">
        {t.chapters.map((_, i) => (
          <span id={`chapter-${i}`} key={i} style={{ top: `${i * 25}%` }} />
        ))}
      </div>
      <div className="jd-accessible-story">
        {t.chapters.map((title, i) => (
          <article key={title} id={i === 3 ? "demo-receipt" : undefined}>
            <h2>{title}</h2>
            <p>{t.descriptions[i]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
