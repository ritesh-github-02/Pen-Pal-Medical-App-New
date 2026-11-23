"use client";

import React, { useEffect, useRef, useState } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

// ============================================================================
// Types & Interfaces
// ============================================================================
export interface Slide9WhyItMattersScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  variant?: "auto" | "desktop" | "mobile";
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

const COPY = {
  title: {
    en: "Why does this matter?",
    es: "¿Por qué es importante esto?",
  },
  intro: {
    en: "When a child needs antibiotics and is believed to have an allergy to [name], they receive different antibiotics that...",
    es: "Cuando un niño necesita antibióticos y se cree que tiene alergia a [name], recibe diferentes antibióticos que...",
  },
  bullets: [
    {
      en: "Are more likely to cause diarrhea or other side effects",
      es: "Tienen más probabilidades de causar diarrea u otros efectos secundarios",
    },
    {
      en: "Cost more than [name]",
      es: "Cuestan más que [name]",
    },
    {
      en: "Taste worse than [name]",
      es: "Tienen peor sabor que [name]",
    },
    {
      en: "May make an infection harder to treat in the future",
      es: "Pueden hacer que una infección sea más difícil de tratar en el futuro",
    },
  ],
} as const;

// ============================================================================
// Shared Mobile Layout CSS
// ============================================================================
const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s9-stage {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100% !important;
    border-radius: 0 !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 14px 16px calc(10px + env(safe-area-inset-bottom, 0px)) 16px !important;
    gap: 12px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    background-color: transparent !important;
  }
  ${scope} .s9-badge {
    position: static !important;
    min-width: 220px !important;
    height: 48px !important;
    padding: 0 24px !important;
    border-radius: 9999px !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s9-heading {
    font-size: 18px !important;
  }
  ${scope} .s9-content {
    order: 2 !important;
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    margin: 0 auto !important;
    gap: 10px !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s9-intro {
    font-size: 15.5px !important;
    line-height: 1.42 !important;
    margin-bottom: 6px !important;
  }
  ${scope} .s9-bullets {
    padding-left: 8px !important;
    gap: 6px !important;
  }
  ${scope} .s9-bullet {
    font-size: 15px !important;
    line-height: 1.38 !important;
  }
  ${scope} .s9-nurse {
    order: 3 !important;
    position: static !important;
    width: 104px !important;
    height: 204px !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s9-bottom-bar {
    order: 5 !important;
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 0 0 0 !important;
    flex-shrink: 0 !important;
    width: 100% !important;
    max-width: 360px !important;
  }
  ${scope} .s9-audio-controls {
    position: static !important;
    order: 1 !important;
    margin: 0 auto !important;
  }
  ${scope} .s9-nav-center {
    position: static !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }
  ${scope} .s9-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }
  ${scope} .s9-captions-panel {
    order: 4 !important;
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    bottom: auto !important;
  }
`;

// ============================================================================
// Styles
// ============================================================================
const SLIDE9_CSS = `
  .s9-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s9-root button:focus-visible,
  .s9-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }
  .s9-heading:focus, .s9-heading:focus-visible { outline: none !important; }

  .s9-root,
  .s9-root *,
  .s9-root *::before,
  .s9-root *::after {
    box-sizing: border-box;
  }

  /* ---- Root ---- */
  .s9-root {
    position: relative;
    display: flex;
    flex: 1 1 0%;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    background-color: transparent;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
    color: #1d2423;
  }

  /* ---- Scale-locked desktop stage ---- */
  .s9-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Yellow Pill Title Badge — top-left ---- */
  .s9-badge {
    position: absolute;
    left: 68px;
    top: 46px;
    min-width: 275px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 26px;
    background-color: #fdff9d;
    border: 2px solid #2b7a85;
    border-radius: 9999px;
    box-shadow: 0 3px 6px rgba(35, 111, 122, 0.22);
    z-index: 6;
  }
  .s9-heading {
    margin: 0;
    padding: 0;
    font-size: 22px;
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #1a1f1e;
    white-space: nowrap;
    outline: none;
  }

  /* ---- 2. Nurse Anna — left side gesturing toward text ---- */
  .s9-nurse {
    position: absolute;
    left: 84px;
    top: 143px;
    width: 144px;
    height: 288px;
    pointer-events: none;
    z-index: 5;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    user-select: none;
    -webkit-user-drag: none;
  }
  .s9-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
  }

  /* ---- 3. Right Content Column (Intro + Bullet List) ---- */
  .s9-content {
    position: absolute;
    left: 222px;
    top: 138px;
    width: 478px;
    display: flex;
    flex-direction: column;
    z-index: 5;
  }
  .s9-intro {
    margin: 0 0 20px 0;
    font-size: 19.5px;
    line-height: 1.42;
    font-weight: 500;
    color: #1d2423;
    letter-spacing: -0.01em;
  }
  .s9-bullets {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0 0 0 14px;
    list-style: none;
  }
  .s9-bullet {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 19px;
    line-height: 1.42;
    font-weight: 500;
    color: #1d2423;
    letter-spacing: -0.01em;
  }
  .s9-bullet-dot {
    flex: none;
    width: 6px;
    height: 6px;
    margin-top: 10px;
    border-radius: 50%;
    background-color: #1d2423;
  }

  /* ---- 4. Bottom Bar (matches Slides 2–7 pixel-for-pixel) ---- */
  .s9-bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 74px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    padding: 0 24px;
  }

  .s9-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s9-btn-nav {
    border-radius: 9999px;
    font-weight: 600;
    border: 1.6px solid #3c7c87;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 38px;
    min-width: 74px;
    font-size: 15px;
    padding: 0 20px;
    transition: transform 0.1s ease, background-color 0.15s ease;
    font-family: inherit;
    user-select: none;
    touch-action: manipulation;
  }
  .s9-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12); }
  .s9-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s9-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s9-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s9-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s9-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s9-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  /* Audio controls — bottom-right */
  .s9-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s9-audio-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #2b7a85;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    min-width: 40px;
    min-height: 40px;
    border-radius: 8px;
    transition: transform 0.12s ease, opacity 0.15s ease;
    font-family: inherit;
  }
  .s9-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  /* Closed Captions Panel */
  .s9-captions-panel {
    position: absolute;
    bottom: 66px;
    left: 52px;
    right: 52px;
    background: #143833;
    color: #fff;
    border: 1.5px solid #bddfd8;
    border-radius: 12px;
    padding: 8px 14px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    z-index: 30;
  }
  .s9-captions-tag {
    background: #fdee8e;
    color: #1a2624;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
    letter-spacing: 0.05em;
  }
  .s9-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

  /* ================================================================
     MOBILE LAYOUT  (is-mobile class  OR  ≤767px viewport)
     ================================================================ */
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s9-root:not(.is-desktop)")}
  }
  ${mobileLayoutCSS(".s9-root.is-mobile")}

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

// ============================================================================
// Main Component: Slide9WhyItMattersScreen (Slide 8 in flow)
// ============================================================================
export function Slide9WhyItMattersScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide9_why_it_matters",
  locale,
  transcriptText,
}: Slide9WhyItMattersScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState<number>(1);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const activeLocale = isEs ? "es" : "en";
  const medName = medicationName?.trim();

  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const variantClass = isMobile ? " is-mobile" : isDesktop ? " is-desktop" : "";

  // Focus heading on mount (WCAG 2.4.3)
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      headingRef.current?.focus({ preventScroll: true })
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  // Scale-locked stage — proportionally fills desktop tablet frame
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const update = () => {
      if (variant === "mobile" || (variant !== "desktop" && window.innerWidth < 768)) {
        setScale(1);
        return;
      }
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      const safeW = Math.max(0, w - 8);
      const safeH = Math.max(0, h - 8);
      setScale(Math.min(safeW / STAGE_W, safeH / STAGE_H));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [variant]);

  // Escape dismisses captions (WCAG 1.4.13)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions) {
        setShowCaptions(false);
        setLiveAnnouncement(isEs ? "Subtítulos ocultados" : "Closed captions dismissed");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCaptions, isEs]);

  const resolve = (value: string) => resolveMedicineToken(value, medName, isEs);

  const title = isEs ? COPY.title.es : COPY.title.en;
  const intro = resolve(isEs ? COPY.intro.es : COPY.intro.en);
  const bullets = COPY.bullets.map((bullet) => resolve(isEs ? bullet.es : bullet.en));

  const effectiveTranscript =
    transcriptText || `${title} ${intro} ${bullets.join(", ")}.`;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/slide9_why_it_matters_es.mp3"
      : "/audio/exported/slide9_why_it_matters_en.mp3");

  // Sync audio element events & clean up on unmount / step change
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setAudioPlaying(true);
    const onPause = () => setAudioPlaying(false);
    const onEnded = () => setAudioPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [effectiveAudioSrc, stepId]);

  const toggleAudio = () => {
    const el = audioRef.current;
    const willPlay = !audioPlaying;
    setLiveAnnouncement(
      willPlay
        ? isEs ? "Reproduciendo narración de audio" : "Audio narration playing"
        : isEs ? "Narración de audio pausada" : "Audio narration paused"
    );
    if (willPlay) {
      if (el && el.src && !el.src.endsWith(".undefined")) {
        el.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utt = new SpeechSynthesisUtterance(effectiveTranscript);
            utt.lang = isEs ? "es-US" : "en-US";
            utt.rate = 0.95;
            utt.onstart = () => setAudioPlaying(true);
            utt.onend = () => setAudioPlaying(false);
            utt.onerror = () => setAudioPlaying(false);
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utt);
          }
        });
      } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utt = new SpeechSynthesisUtterance(effectiveTranscript);
        utt.lang = isEs ? "es-US" : "en-US";
        utt.rate = 0.95;
        utt.onstart = () => setAudioPlaying(true);
        utt.onend = () => setAudioPlaying(false);
        utt.onerror = () => setAudioPlaying(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      }
    } else {
      el?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setAudioPlaying(false);
    }
  };

  const toggleCaptions = () => {
    const next = !showCaptions;
    setShowCaptions(next);
    setLiveAnnouncement(
      next
        ? isEs ? "Subtítulos mostrados" : "Closed captions displayed"
        : isEs ? "Subtítulos ocultados" : "Closed captions hidden"
    );
  };

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s9-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s9-heading"
      lang={activeLocale}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE9_CSS }} />

      {/* Screen Reader Live Region */}
      <div className="s9-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s9-sr-only"
        aria-hidden="true"
      />

      {/* ── Scale-locked desktop stage ── */}
      <div
        className="s9-stage"
        style={!isMobile ? { transform: `scale(${scale})` } : undefined}
      >
        {/* 1. Yellow Pill Title Badge */}
        <div className="s9-badge">
          <h1 id="s9-heading" ref={headingRef} tabIndex={-1} className="s9-heading">
            {title}
          </h1>
        </div>

        {/* 2. Nurse Anna — left side gesturing toward text */}
        <div className="s9-nurse" aria-hidden="true">
          <img
            src="/images/Slide8New.png?v=3"
            alt=""
            className="s9-nurse-img"
            draggable={false}
          />
        </div>

        {/* 3. Right Content Column */}
        <div className="s9-content">
          <p className="s9-intro">{intro}</p>

          <ul className="s9-bullets">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="s9-bullet">
                <span className="s9-bullet-dot" aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Closed Captions Panel */}
        {showCaptions && (
          <div
            className="s9-captions-panel"
            role="region"
            aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
          >
            <span className="s9-captions-tag" aria-hidden="true">CC</span>
            <p className="s9-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        {/* 4. Bottom Navigation & Audio Controls */}
        <footer
          className="s9-bottom-bar"
          role="toolbar"
          aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
        >
          <nav className="s9-nav-center" aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="s9-btn-nav s9-btn-back"
              aria-label={isEs ? "Ir a la diapositiva anterior" : "Go to previous slide"}
            >
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="s9-btn-nav s9-btn-next"
              aria-label={isEs ? "Ir a la siguiente diapositiva" : "Go to next slide"}
            >
              {loading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s9-audio-controls">
            <button
              type="button"
              className="s9-audio-btn"
              onClick={toggleCaptions}
              aria-pressed={showCaptions}
              aria-label={
                showCaptions
                  ? isEs ? "Ocultar subtítulos" : "Hide closed captions"
                  : isEs ? "Mostrar subtítulos" : "Show closed captions"
              }
              title={
                showCaptions
                  ? isEs ? "Ocultar subtítulos" : "Hide closed captions"
                  : isEs ? "Mostrar subtítulos" : "Show closed captions"
              }
            >
              <svg
                width="44"
                height="40"
                viewBox="0 0 40 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M 8.5 5.5 C 5.5 5.5 4 7.2 4 11 V 20 C 4 23.8 5.5 25.5 8.5 25.5 H 12 C 13 25.5 14 26.3 14.7 27.5 L 16.5 30.5 C 17.3 31.7 18.7 31.7 19.5 30.5 L 21.3 27.5 C 22 26.3 23 25.5 24 25.5 H 31.5 C 34.5 25.5 36 23.8 36 20 V 11 C 36 7.2 34.5 5.5 31.5 5.5 Z"
                  stroke="currentColor"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill={showCaptions ? "currentColor" : "none"}
                />
                <text
                  x="20"
                  y="15.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={showCaptions ? "#ffffff" : "currentColor"}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  letterSpacing="0.3px"
                >
                  CC
                </text>
              </svg>
            </button>

            <button
              type="button"
              className="s9-audio-btn"
              onClick={toggleAudio}
              aria-pressed={audioPlaying}
              aria-label={
                audioPlaying
                  ? isEs ? "Pausar narración de audio" : "Pause audio narration"
                  : isEs ? "Reproducir narración de audio" : "Play audio narration"
              }
              title={
                audioPlaying
                  ? isEs ? "Pausar narración de audio" : "Pause audio narration"
                  : isEs ? "Reproducir narración de audio" : "Play audio narration"
              }
            >
              {audioPlaying ? (
                <svg
                  width="54"
                  height="40"
                  viewBox="0 0 50 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <line x1="11.5" y1="13" x2="11.5" y2="23" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <line x1="16.5" y1="13" x2="16.5" y2="23" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M 33 11 C 37 13.5 37 22.5 33 25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                </svg>
              ) : (
                <svg
                  width="54"
                  height="40"
                  viewBox="0 0 50 36"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                    stroke="currentColor"
                    strokeWidth="2.1"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <text
                    x="14.8"
                    y="17.2"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="currentColor"
                    fontSize="8"
                    fontWeight="700"
                    fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                    letterSpacing="0.1px"
                  >
                    play
                  </text>
                  <path d="M 33 11 C 37 13.5 37 22.5 33 25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Slide9WhyItMattersScreen;
