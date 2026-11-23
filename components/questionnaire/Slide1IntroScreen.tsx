"use client";

import React, { useRef, useEffect, useCallback, memo, useState } from "react";
import AudioPlayer from "./AudioPlayer";

export interface Slide1IntroScreenProps {
  title?: string;
  description?: string;
  content?: string;
  onNext?: (answer?: string) => void;
  onAnswer?: (val: string) => void;
  loading?: boolean;
  locale?: string;
  isSpanish?: boolean;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  audioSrc?: string;
  stepId?: string;
  transcriptText?: string;
  autoFocusHeading?: boolean;
  variant?: "auto" | "desktop" | "mobile";
}

/** Fixed design canvas dimensions */
const STAGE_W = 760;
const STAGE_H = 480;

const SLIDE1_COMPONENT_CSS = `
  .s1-root,
  .s1-root *,
  .s1-root *::before,
  .s1-root *::after {
    box-sizing: border-box;
  }

  .s1-root {
    position: relative;
    display: flex;
    flex: 1 1 0%;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    font-family: "Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif;
  }

  .s1-sr-only {
    position: absolute !important;
    width: 1px !important;
    height: 1px !important;
    padding: 0 !important;
    margin: -1px !important;
    overflow: hidden !important;
    clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important;
    border: 0 !important;
  }

  .s1-root button:focus-visible,
  .s1-root a:focus-visible,
  .s1-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }

  .s1-title:focus,
  .s1-title:focus-visible {
    outline: none !important;
  }

  /* ---------------- Desktop Scaled Stage ---------------- */
  .s1-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    pointer-events: auto;
  }

  /* Left column: Text & CTA Button */
  .s1-left-col {
    position: absolute;
    left: 44px;
    top: 0;
    bottom: 0;
    width: 460px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    z-index: 10;
  }

  .s1-title {
    font-size: 76px; /* Massive, bold Figma title */
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    white-space: nowrap !important;
    margin: 0 0 12px 0;
    padding: 0;
    color: #facc15; /* Exact Figma Yellow */
    font-family: "Outfit", "Plus Jakarta Sans", system-ui, sans-serif;
    -webkit-text-stroke: 2px #12403d; /* Thicker stroke */
    paint-order: stroke fill;
    text-shadow: 0 4px 0 #12403d, 0 5px 4px rgba(18, 64, 61, 0.3); /* Harder drop shadow */
  }

  .s1-subtitle {
    font-size: 26px; /* Increased from 19px */
    font-weight: 600;
    line-height: 1.3;
    color: #12403d;
    white-space: nowrap;
    margin: 0 0 24px 0;
    letter-spacing: -0.01em;
    font-family: inherit;
  }

  .s1-copy {
    font-size: 22px; /* Increased for readability */
    font-weight: 500;
    line-height: 1.5;
    color: #12403d;
    max-width: 460px;
    margin: 0 0 36px 0;
  }

  .s1-btn-start {
    min-height: 56px;
    height: 56px;
    min-width: 170px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: #fdfce8; /* Light cream */
    color: #12403d; /* Dark teal text */
    border: 2px solid #12403d; /* Dark teal border, matching Figma */
    font-weight: 700;
    font-size: 20px;
    padding: 0 36px;
    box-shadow: 0 2px 4px rgba(18, 64, 61, 0.1);
    transition: transform 0.12s ease, background-color 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
    user-select: none;
    font-family: inherit;
  }
  .s1-btn-start:hover:not(:disabled) {
    background-color: #f2f0cc;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(18, 64, 61, 0.16);
  }
  .s1-btn-start:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(18, 64, 61, 0.1);
  }
  .s1-btn-start:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }
  .s1-btn-start:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: none;
  }

  .s1-nurse-col {
    position: absolute;
    right: 20px;
    top: 20px;
    bottom: 60px;
    width: 165px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    pointer-events: none;
  }

  .s1-nurse-img {
    max-height: 400px;
    max-width: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 4px 10px rgba(18, 64, 61, 0.12));
  }

  .s1-audio-desktop {
    position: absolute;
    right: 32px;
    bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 30;
    color: #12403d;
  }
  .s1-audio-desktop button {
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
    color: #12403d !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 4px !important;
    border-radius: 8px !important;
    transition: transform 0.12s ease, opacity 0.15s ease !important;
  }
  .s1-audio-desktop button:hover {
    transform: scale(1.08) !important;
    opacity: 0.85 !important;
  }

  .s1-mobile-nav {
    display: none;
  }

  /* ---------------- Responsive Mobile Layout (< 768px) ---------------- */
  @media (max-width: 767px) {
    .s1-root:not(.is-desktop) {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      -webkit-overflow-scrolling: touch !important;
      height: 100dvh !important;
      min-height: 100% !important;
      padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px)) 20px !important;
      background-color: #fcfdf3 !important;
    }
    .s1-root:not(.is-desktop) .s1-stage {
      position: relative !important;
      width: 100% !important;
      max-width: 440px !important;
      height: auto !important;
      min-height: 100% !important;
      transform: none !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 6px 0 !important;
    }
    .s1-root:not(.is-desktop) .s1-left-col {
      display: contents !important;
    }
    .s1-root:not(.is-desktop) .s1-title {
      order: 1 !important;
      font-size: clamp(48px, 13vw, 64px) !important;
      line-height: 1 !important;
      margin: 0 0 4px 0 !important;
      text-align: center !important;
      white-space: nowrap !important;
    }
    .s1-root:not(.is-desktop) .s1-subtitle {
      order: 2 !important;
      font-size: clamp(18px, 4.5vw, 22px) !important;
      text-align: center !important;
      white-space: normal !important;
      margin: 0 0 8px 0 !important;
      max-width: 360px !important;
    }
    .s1-root:not(.is-desktop) .s1-nurse-col {
      position: relative !important;
      right: auto !important;
      top: auto !important;
      bottom: auto !important;
      width: 100% !important;
      order: 3 !important;
      margin: 8px auto 12px auto !important;
      padding: 0 !important;
    }
    .s1-root:not(.is-desktop) .s1-nurse-img {
      max-height: clamp(160px, 25vh, 220px) !important;
    }
    .s1-root:not(.is-desktop) .s1-copy {
      order: 4 !important;
      font-size: clamp(16px, 4.2vw, 18px) !important;
      line-height: 1.5 !important;
      text-align: center !important;
      margin: 0 0 16px 0 !important;
      max-width: 360px !important;
    }
    .s1-root:not(.is-desktop) .s1-left-col .s1-btn-start {
      display: none !important;
    }
    .s1-root:not(.is-desktop) .s1-audio-desktop {
      display: none !important;
    }
    .s1-root:not(.is-desktop) .s1-mobile-nav {
      order: 5 !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      max-width: 340px !important;
      gap: 16px !important;
      margin: 0 auto !important;
      flex-shrink: 0 !important;
    }
    .s1-root:not(.is-desktop) .s1-mobile-nav .s1-audio-wrapper {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: #12403d !important;
    }
    .s1-root:not(.is-desktop) .s1-mobile-nav .s1-btn-start {
      min-width: 220px !important;
      height: 52px !important;
      font-size: 18px !important;
      font-weight: 700 !important;
    }
  }

  /* ---------------- Explicit variant="mobile" ---------------- */
  .s1-root.is-mobile {
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    height: 100dvh !important;
    min-height: 100% !important;
    padding: 16px 20px calc(16px + env(safe-area-inset-bottom, 0px)) 20px !important;
    background-color: #fcfdf3 !important;
  }
  .s1-root.is-mobile .s1-stage {
    position: relative !important;
    width: 100% !important;
    max-width: 440px !important;
    height: auto !important;
    min-height: 100% !important;
    transform: none !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    gap: 12px !important;
    padding: 6px 0 !important;
  }
  .s1-root.is-mobile .s1-left-col {
    display: contents !important;
  }
  .s1-root.is-mobile .s1-title {
    order: 1 !important;
    font-size: clamp(48px, 13vw, 64px) !important;
    line-height: 1 !important;
    margin: 0 0 4px 0 !important;
    text-align: center !important;
    white-space: nowrap !important;
  }
  .s1-root.is-mobile .s1-subtitle {
    order: 2 !important;
    font-size: clamp(18px, 4.5vw, 22px) !important;
    text-align: center !important;
    white-space: normal !important;
    margin: 0 0 8px 0 !important;
    max-width: 360px !important;
  }
  .s1-root.is-mobile .s1-nurse-col {
    position: relative !important;
    right: auto !important;
    top: auto !important;
    bottom: auto !important;
    width: 100% !important;
    order: 3 !important;
    margin: 8px auto 12px auto !important;
    padding: 0 !important;
  }
  .s1-root.is-mobile .s1-nurse-img {
    max-height: clamp(160px, 25vh, 220px) !important;
  }
  .s1-root.is-mobile .s1-copy {
    order: 4 !important;
    font-size: clamp(16px, 4.2vw, 18px) !important;
    line-height: 1.5 !important;
    text-align: center !important;
    margin: 0 0 16px 0 !important;
    max-width: 360px !important;
  }
  .s1-root.is-mobile .s1-left-col .s1-btn-start {
    display: none !important;
  }
  .s1-root.is-mobile .s1-audio-desktop {
    display: none !important;
  }
  .s1-root.is-mobile .s1-mobile-nav {
    order: 5 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 340px !important;
    gap: 16px !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  .s1-root.is-mobile .s1-mobile-nav .s1-audio-wrapper {
    width: 100% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    color: #12403d !important;
  }
  .s1-root.is-mobile .s1-mobile-nav .s1-btn-start {
    min-width: 220px !important;
    height: 52px !important;
    font-size: 18px !important;
    font-weight: 700 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .s1-root *,
    .s1-root *::before,
    .s1-root *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export const Slide1IntroScreen = memo(function Slide1IntroScreen({
  title = "PEN-PAL",
  description,
  content,
  onNext,
  onAnswer,
  loading = false,
  locale = "en",
  isSpanish: isSpanishProp,
  headingRef: externalHeadingRef,
  audioSrc = "/audio/exported/screen1_intro_en.mp3",
  stepId = "screen1_intro",
  transcriptText,
  autoFocusHeading = true,
  variant = "auto",
}: Slide1IntroScreenProps) {
  const isSpanish = isSpanishProp ?? locale === "es";
  const internalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const headingRef = externalHeadingRef || internalHeadingRef;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (autoFocusHeading) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [headingRef, autoFocusHeading]);

  // Fit the fixed vector design stage into the tablet mockup frame without distorting
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
      const safeW = Math.max(0, w - 32);
      const safeH = Math.max(0, h - 32);
      
      // Scales up perfectly on large screens (No cap)
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

  const introSubtitle =
    description ||
    (isSpanish
      ? "Padres Involucrados en Alergias a la Penicilina"
      : "Parents Engaged in Penicillin Allergies");

  const rawCopy =
    content ||
    (isSpanish
      ? "¡Hola! Soy la enfermera Anna. Hablemos sobre las alergias a la penicilina en los niños."
      : "Hi! I'm nurse Anna. Let's talk about penicillin allergies in kids.");

  const mainCopy = rawCopy.replace(/\s*(Get started\.?|¡Comenzar!?)\s*$/i, "").trim();

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/screen1_intro_es.mp3"
      : "/audio/exported/screen1_intro_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "PEN-PAL. Padres Involucrados en Alergias a la Penicilina. ¡Hola! Soy la enfermera Anna. Hablemos sobre las alergias a la penicilina en los niños. ¡Comenzar!"
      : "PEN-PAL. Parents Engaged in Penicillin Allergies. Hi! I'm nurse Anna. Let's talk about penicillin allergies in kids. Get started.");

  const handleStart = useCallback(() => {
    if (loading) return;
    if (onAnswer) onAnswer("yes");
    if (onNext) onNext("yes");
  }, [loading, onAnswer, onNext]);

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  const desktopGradient = `
    radial-gradient(circle at 12% 16%, #a1aef2 0%, rgba(161, 174, 242, 0) 55%),
    radial-gradient(circle at 10% 70%, #8be6eb 0%, rgba(139, 230, 235, 0) 50%),
    radial-gradient(circle at 88% 18%, #cdf2e0 0%, rgba(205, 242, 224, 0) 50%),
    radial-gradient(circle at 90% 85%, #e6f4dd 0%, rgba(230, 244, 221, 0) 55%),
    linear-gradient(135deg, #a6bbf5 0%, #90e1ea 32%, #c2f2ce 68%, #e2f5db 100%)
  `;

  const isMobileViewport =
    variant === "mobile" ||
    (variant !== "desktop" && typeof window !== "undefined" && window.innerWidth < 768);

  const ctaLabel = isSpanish
    ? "Comenzar - Iniciar la guía PEN-PAL"
    : "Get Started - Begin the PEN-PAL guide";

  const ctaText = loading ? "..." : isSpanish ? "¡Comenzar!" : "Get Started!";

  return (
    <section
      id="slide-content"
      ref={rootRef}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide1-primary-heading"
      lang={isSpanish ? "es" : "en"}
      className={`s1-root${variantClass}`}
      style={{
        background: isMobileViewport ? "#fcfdf3" : desktopGradient,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE1_COMPONENT_CSS }} />

      <div className="s1-stage" style={{ transform: `scale(${scale})` }}>
        <div className="s1-left-col">
          <h1
            id="slide1-primary-heading"
            ref={headingRef}
            tabIndex={-1}
            className="s1-title select-none"
          >
            {title || "PEN-PAL"}
          </h1>

          <p className="s1-subtitle">{introSubtitle}</p>

          <p className="s1-copy">{mainCopy}</p>

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="s1-btn-start"
            aria-label={ctaLabel}
          >
            {ctaText}
          </button>
        </div>

        <div className="s1-nurse-col">
          <img
            src="/images/nurse-anna-s1.png?v=3"
            alt={
              isSpanish
                ? "Ilustración de la enfermera Anna sonriendo"
                : "Illustration of Nurse Anna smiling in blue scrubs"
            }
            className="s1-nurse-img"
            draggable={false}
          />
        </div>

        <footer
          className="s1-audio-desktop"
          role="toolbar"
          aria-label={
            isSpanish
              ? "Controles de audio y subtítulos"
              : "Slide audio and caption controls"
          }
        >
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId}
            locale={isSpanish ? "es" : "en"}
            transcriptText={effectiveTranscript}
            size="large"
          />
        </footer>

        <div className="s1-mobile-nav z-30">
          <div className="s1-audio-wrapper">
            <AudioPlayer
              audioSrc={effectiveAudioSrc}
              stepId={stepId}
              locale={isSpanish ? "es" : "en"}
              transcriptText={effectiveTranscript}
              size="large"
            />
          </div>

          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="s1-btn-start"
            aria-label={ctaLabel}
          >
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
});

export default Slide1IntroScreen;


