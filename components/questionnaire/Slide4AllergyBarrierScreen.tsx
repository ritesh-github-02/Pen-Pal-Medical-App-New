"use client";

import React, { useRef, useEffect, useState } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

// ============================================================================
// Types & Interfaces
// ============================================================================
export interface Slide4AllergyBarrierScreenProps {
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
// Constants & Vectors (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

// Large smooth oval speech bubble on the right with curved lower-left tail
// pointing toward Nurse Anna's outstretched hands (viewBox 0 0 432 270)
const BUBBLE_PATH_DESKTOP =
  "M 226 8 " +
  "C 336 8, 422 52, 422 122 " +
  "C 422 194, 338 246, 226 246 " +
  "C 180 246, 140 237, 114 223 " +
  "Q 60 262, 10 256 " +
  "Q 46 226, 66 194 " +
  "C 14 148, 16 74, 82 36 " +
  "C 122 14, 174 8, 226 8 Z";

// Mobile portrait oval speech bubble with tail pointing down-left toward Nurse Anna
const BUBBLE_PATH_MOBILE =
  "M 180 8 " +
  "C 295 8, 354 44, 354 114 " +
  "C 354 184, 295 220, 180 220 " +
  "C 155 220, 132 218, 112 214 " +
  "Q 86 246, 64 258 " +
  "Q 76 230, 82 204 " +
  "C 28 186, 6 156, 6 114 " +
  "C 6 44, 65 8, 180 8 Z";

// ============================================================================
// Shared Mobile Layout CSS
// ============================================================================
const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s4-stage {
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
    gap: 10px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    background-color: transparent !important;
  }
  ${scope} .s4-bubble {
    order: 1 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 360px !important;
    aspect-ratio: 360 / 266 !important;
    height: auto !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s4-bubble-desktop-svg {
    display: none !important;
  }
  ${scope} .s4-bubble-mobile-svg {
    display: block !important;
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }
  ${scope} .s4-bubble-text-wrap {
    top: 43% !important;
    left: 50% !important;
    width: 80% !important;
  }
  ${scope} .s4-bubble-text {
    font-size: clamp(15px, 4.2vw, 17.5px) !important;
    line-height: 1.42 !important;
  }
  ${scope} .s4-nurse {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 112px !important;
    height: 222px !important;
    margin: -18px auto 0 12% !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s4-bottom-bar {
    order: 4 !important;
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
  ${scope} .s4-audio-controls {
    position: static !important;
    order: 1 !important;
    margin: 0 auto !important;
  }
  ${scope} .s4-nav-center {
    position: static !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }
  ${scope} .s4-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }
  ${scope} .s4-captions-panel {
    order: 3 !important;
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    bottom: auto !important;
  }
`;

// ============================================================================
// Styles
// ============================================================================
const SLIDE4_CSS = `
  .s4-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s4-root button:focus-visible,
  .s4-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }
  .s4-bubble-text:focus, .s4-bubble-text:focus-visible { outline: none !important; }

  .s4-root,
  .s4-root *,
  .s4-root *::before,
  .s4-root *::after {
    box-sizing: border-box;
  }

  /* ---- Root ---- */
  .s4-root {
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
  .s4-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Nurse Anna standing on Left gesturing toward bubble ---- */
  .s4-nurse {
    position: absolute;
    left: 51px;
    top: 179px;
    width: 141px;
    height: 281px;
    pointer-events: none;
    z-index: 5;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    user-select: none;
    -webkit-user-drag: none;
  }
  .s4-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
  }

  /* ---- 2. Large Mint-Teal Speech Bubble on Right ---- */
  .s4-bubble {
    position: absolute;
    left: 250px;
    top: 56px;
    width: 432px;
    height: 270px;
    margin: 0;
    padding: 0;
    z-index: 6;
  }
  .s4-bubble-desktop-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .s4-bubble-mobile-svg {
    display: none;
  }
  .s4-bubble-text-wrap {
    position: absolute;
    top: 47.5%;
    left: 53.5%;
    transform: translate(-50%, -50%);
    width: 78%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
  }
  .s4-bubble-text {
    margin: 0;
    padding: 0;
    width: 100%;
    font-size: 20.5px;
    line-height: 1.46;
    font-weight: 500;
    color: #1d2423;
    text-align: center;
    letter-spacing: -0.01em;
    outline: none;
  }

  /* ---- 3. Bottom Bar (matches Slides 2 & 3 pixel-for-pixel) ---- */
  .s4-bottom-bar {
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

  .s4-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s4-btn-nav {
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
  .s4-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12); }
  .s4-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s4-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s4-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s4-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s4-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s4-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  /* Audio controls — bottom-right */
  .s4-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s4-audio-btn {
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
  .s4-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  /* Closed Captions Panel */
  .s4-captions-panel {
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
  .s4-captions-tag {
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
  .s4-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

  /* ================================================================
     MOBILE LAYOUT  (is-mobile class  OR  ≤767px viewport)
     ================================================================ */
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s4-root:not(.is-desktop)")}
  }
  ${mobileLayoutCSS(".s4-root.is-mobile")}

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
// Main Component: Slide4AllergyBarrierScreen
// ============================================================================
export function Slide4AllergyBarrierScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide4_barrier",
  locale,
  transcriptText,
}: Slide4AllergyBarrierScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState<number>(1);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const variantClass = isMobile ? " is-mobile" : isDesktop ? " is-desktop" : "";

  // Focus heading on mount (WCAG 2.4.3)
  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
    return () => clearTimeout(timer);
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
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
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

  const rawText = isEs
    ? "[Name] es uno de los mejores antibióticos. Pero muchos niños no lo reciben porque se cree que son alérgicos a él."
    : "[Name] is one of the best antibiotics. But many kids do not get it because they are believed to be allergic to it.";

  const resolvedName =
    medicationName && medicationName.trim()
      ? medicationName.trim()
      : isEs
        ? "La amoxicilina"
        : "Amoxicillin";

  const capMed = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);
  const titleText = resolveMedicineToken(rawText, capMed, isEs);
  const effectiveTranscript = transcriptText || titleText;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs ? "/audio/exported/slide4_barrier_es.mp3" : "/audio/exported/slide4_barrier_en.mp3");

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
      className={`s4-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s4-screen-heading"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE4_CSS }} />

      {/* Screen Reader Live Region */}
      <div className="s4-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s4-sr-only"
        aria-hidden="true"
      />

      {/* ── Scale-locked desktop stage ── */}
      <div
        className="s4-stage"
        style={!isMobile ? { transform: `scale(${scale})` } : undefined}
      >
        {/* 1. Nurse Anna standing on Left gesturing toward bubble */}
        <div className="s4-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-s4.png"
            alt=""
            className="s4-nurse-img"
            draggable={false}
          />
        </div>

        {/* 2. Large Mint-Teal Speech Bubble on Right */}
        <figure
          className="s4-bubble"
          role="group"
          aria-label={isEs ? "Comentario de la enfermera Anna" : "Nurse Anna statement"}
        >
          {/* Desktop SVG (Tail pointing lower-left toward Nurse Anna) */}
          <svg
            className="s4-bubble-desktop-svg"
            viewBox="0 0 432 270"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            {/* Dark lower-right rim shadow matching reference */}
            <path
              d={BUBBLE_PATH_DESKTOP}
              transform="translate(2.5, 2.5)"
              fill="#193432"
              stroke="#193432"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Mint-teal fill & teal border */}
            <path
              d={BUBBLE_PATH_DESKTOP}
              fill="#ddf3f1"
              stroke="#76aca5"
              strokeWidth="3.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {/* Mobile SVG (Tail pointing down-left toward Nurse Anna below) */}
          <svg
            className="s4-bubble-mobile-svg"
            viewBox="0 0 360 266"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d={BUBBLE_PATH_MOBILE}
              transform="translate(2, 2.5)"
              fill="#193432"
              stroke="#193432"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={BUBBLE_PATH_MOBILE}
              fill="#ddf3f1"
              stroke="#76aca5"
              strokeWidth="3.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Speech Text inside oval body */}
          <div className="s4-bubble-text-wrap">
            <h1
              id="s4-screen-heading"
              ref={headingRef}
              tabIndex={-1}
              className="s4-bubble-text"
            >
              {titleText}
            </h1>
          </div>
        </figure>

        {/* Closed Captions Panel */}
        {showCaptions && (
          <div
            className="s4-captions-panel"
            role="region"
            aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
          >
            <span className="s4-captions-tag" aria-hidden="true">CC</span>
            <p className="s4-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        {/* 3. Bottom Navigation & Audio Controls */}
        <footer
          className="s4-bottom-bar"
          role="toolbar"
          aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
        >
          <nav className="s4-nav-center" aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="s4-btn-nav s4-btn-back"
              aria-label={isEs ? "Ir a la diapositiva anterior" : "Go to previous slide"}
            >
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="s4-btn-nav s4-btn-next"
              aria-label={isEs ? "Ir a la siguiente diapositiva" : "Go to next slide"}
            >
              {loading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s4-audio-controls">
            <button
              type="button"
              className="s4-audio-btn"
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
              className="s4-audio-btn"
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

export default Slide4AllergyBarrierScreen;
