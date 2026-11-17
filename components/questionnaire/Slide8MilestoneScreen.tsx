"use client";

import React, { useRef, useEffect, useState } from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================
export interface Slide8MilestoneScreenProps {
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

// Large smooth oval speech bubble on the left with curved lower-right tail
// pointing toward Nurse Anna's raised hand (viewBox 0 0 448 284)
const BUBBLE_PATH_DESKTOP =
  "M 216 8 " +
  "C 102 8, 10 54, 10 128 " +
  "C 10 204, 96 258, 214 258 " +
  "C 262 258, 302 248, 330 234 " +
  "Q 386 276, 438 270 " +
  "Q 400 238, 380 204 " +
  "C 434 156, 432 78, 364 38 " +
  "C 322 14, 270 8, 216 8 Z";

// Mobile portrait oval speech bubble with tail pointing down-right toward Nurse Anna
const BUBBLE_PATH_MOBILE =
  "M 180 8 " +
  "C 65 8, 6 42, 6 106 " +
  "C 6 170, 65 204, 180 204 " +
  "C 205 204, 228 202, 248 198 " +
  "Q 274 230, 296 242 " +
  "Q 284 214, 278 188 " +
  "C 332 170, 354 142, 354 106 " +
  "C 354 42, 295 8, 180 8 Z";

// ============================================================================
// Shared Mobile Layout CSS
// ============================================================================
const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s8-stage {
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
  ${scope} .s8-bubble {
    order: 1 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100% !important;
    max-width: 360px !important;
    aspect-ratio: 360 / 250 !important;
    height: auto !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s8-bubble-desktop-svg {
    display: none !important;
  }
  ${scope} .s8-bubble-mobile-svg {
    display: block !important;
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }
  ${scope} .s8-bubble-text-wrap {
    top: 42% !important;
    left: 50% !important;
    width: 82% !important;
  }
  ${scope} .s8-heading {
    font-size: clamp(15.5px, 4.3vw, 18px) !important;
    line-height: 1.42 !important;
  }
  ${scope} .s8-nurse {
    order: 2 !important;
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 112px !important;
    height: 224px !important;
    margin: -18px 12% 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s8-bottom-bar {
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
  ${scope} .s8-audio-controls {
    position: static !important;
    order: 1 !important;
    margin: 0 auto !important;
  }
  ${scope} .s8-nav-center {
    position: static !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }
  ${scope} .s8-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }
  ${scope} .s8-captions-panel {
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
const SLIDE8_CSS = `
  .s8-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s8-root button:focus-visible,
  .s8-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }
  .s8-heading:focus, .s8-heading:focus-visible { outline: none !important; }

  .s8-root,
  .s8-root *,
  .s8-root *::before,
  .s8-root *::after {
    box-sizing: border-box;
  }

  /* ---- Root ---- */
  .s8-root {
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
  .s8-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Large Mint-Teal Speech Bubble on Left ---- */
  .s8-bubble {
    position: absolute;
    left: 110px;
    top: 40px;
    width: 448px;
    height: 284px;
    margin: 0;
    padding: 0;
    z-index: 6;
  }
  .s8-bubble-desktop-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
  }
  .s8-bubble-mobile-svg {
    display: none;
  }
  .s8-bubble-text-wrap {
    position: absolute;
    top: 47%;
    left: 47.5%;
    transform: translate(-50%, -50%);
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    pointer-events: none;
  }
  .s8-heading {
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
  .s8-heading-line {
    display: block;
    text-align: center;
  }

  /* ---- 2. Nurse Anna holding bottle on Right ---- */
  .s8-nurse {
    position: absolute;
    left: 542px;
    top: 161px;
    width: 136px;
    height: 273px;
    pointer-events: none;
    z-index: 5;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    user-select: none;
    -webkit-user-drag: none;
  }
  .s8-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
  }

  /* ---- 3. Bottom Bar (matches Slides 2–6 pixel-for-pixel) ---- */
  .s8-bottom-bar {
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

  .s8-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s8-btn-nav {
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
  .s8-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12); }
  .s8-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s8-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s8-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s8-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s8-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s8-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  /* Audio controls — bottom-right */
  .s8-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s8-audio-btn {
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
  .s8-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  /* Closed Captions Panel */
  .s8-captions-panel {
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
  .s8-captions-tag {
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
  .s8-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

  /* ================================================================
     MOBILE LAYOUT  (is-mobile class  OR  ≤767px viewport)
     ================================================================ */
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s8-root:not(.is-desktop)")}
  }
  ${mobileLayoutCSS(".s8-root.is-mobile")}

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
// Main Component: Slide8MilestoneScreen (Slide 7 in flow)
// ============================================================================
export function Slide8MilestoneScreen({
  isSpanish = false,
  variant = "auto",
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide8_milestone",
  locale,
  transcriptText,
}: Slide8MilestoneScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState<number>(1);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const activeLocale = locale || (isSpanish ? "es" : "en");
  const isEs = activeLocale.startsWith("es") || isSpanish;

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

  const effectiveAudioSrc =
    audioSrc ||
    (isEs ? "/audio/exported/slide8_milestone_es.mp3" : "/audio/exported/slide8_milestone_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isEs
      ? "¡Buen trabajo! ¡Ahora ya sabe lo que es verdad sobre las alergias a la penicilina!"
      : "Great job! Now you know what is true about penicillin allergies!");

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
      className={`s8-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide8-heading"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE8_CSS }} />

      {/* Screen Reader Live Region */}
      <div className="s8-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s8-sr-only"
        aria-hidden="true"
      />

      {/* ── Scale-locked desktop stage ── */}
      <div
        className="s8-stage"
        style={!isMobile ? { transform: `scale(${scale})` } : undefined}
      >
        {/* 1. Large Mint-Teal Speech Bubble on Left */}
        <figure
          className="s8-bubble"
          role="group"
          aria-label={isEs ? "Celebración de hito" : "Milestone celebration"}
        >
          {/* Desktop SVG (Tail pointing lower-right toward Nurse Anna) */}
          <svg
            className="s8-bubble-desktop-svg"
            viewBox="0 0 448 284"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d={BUBBLE_PATH_DESKTOP}
              transform="translate(2.5, 2.5)"
              fill="#193432"
              stroke="#193432"
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={BUBBLE_PATH_DESKTOP}
              fill="#ddf3f1"
              stroke="#76aca5"
              strokeWidth="3.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>

          {/* Mobile SVG (Tail pointing down-right toward Nurse Anna below) */}
          <svg
            className="s8-bubble-mobile-svg"
            viewBox="0 0 360 250"
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

          <div className="s8-bubble-text-wrap">
            <h1 ref={headingRef} tabIndex={-1} className="s8-heading" id="slide8-heading">
              {isEs ? (
                <>
                  <span className="s8-heading-line">¡Buen trabajo! ¡Ahora ya sabe lo que</span>
                  <span className="s8-heading-line">es verdad sobre las alergias a la penicilina!</span>
                </>
              ) : (
                <>
                  <span className="s8-heading-line">Great job! Now you know what is</span>
                  <span className="s8-heading-line">true about penicillin allergies!</span>
                </>
              )}
            </h1>
          </div>
        </figure>

        {/* 2. Nurse Anna on Right holding bottle */}
        <div className="s8-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-s7.png"
            alt=""
            className="s8-nurse-img"
            draggable={false}
          />
        </div>

        {/* Closed Captions Panel */}
        {showCaptions && (
          <div
            className="s8-captions-panel"
            role="region"
            aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
          >
            <span className="s8-captions-tag" aria-hidden="true">CC</span>
            <p className="s8-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        {/* 3. Bottom Navigation & Audio Controls */}
        <footer
          className="s8-bottom-bar"
          role="toolbar"
          aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
        >
          <nav className="s8-nav-center" aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="s8-btn-nav s8-btn-back"
              aria-label={isEs ? "Ir a la diapositiva anterior" : "Go to previous slide"}
            >
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="s8-btn-nav s8-btn-next"
              aria-label={isEs ? "Ir a la siguiente diapositiva" : "Go to next slide"}
            >
              {loading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s8-audio-controls">
            <button
              type="button"
              className="s8-audio-btn"
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
              className="s8-audio-btn"
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

export default Slide8MilestoneScreen;
