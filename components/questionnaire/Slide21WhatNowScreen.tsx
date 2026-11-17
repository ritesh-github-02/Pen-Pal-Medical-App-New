"use client";

import React, { useRef, useEffect, useState } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface Slide21WhatNowScreenProps {
  variant?: "auto" | "desktop" | "mobile";
  isSpanish?: boolean;
  medicationName?: string;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

const BULLETS = [
  {
    en: "The test can help you learn the truth about your child’s past reaction.",
    es: "La prueba puede ayudarle a conocer la verdad sobre la reacción pasada de su hijo.",
  },
  {
    en: "The test may help your child get better medicine in the future.",
    es: "La prueba puede ayudar a que su hijo reciba mejores medicamentos en el futuro.",
  },
];

const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s21-stage {
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
  ${scope} .s21-badge {
    position: static !important;
    min-width: 160px !important;
    height: 46px !important;
    padding: 0 22px !important;
    margin: 0 auto !important;
  }
  ${scope} .s21-badge-title {
    font-size: 18px !important;
  }
  ${scope} .s21-copy-block {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    margin: 0 auto !important;
  }
  ${scope} .s21-heading,
  ${scope} .s21-bullet {
    font-size: 15px !important;
    line-height: 1.4 !important;
  }
  ${scope} .s21-figure {
    position: static !important;
    width: 100% !important;
    max-width: 320px !important;
    height: 168px !important;
    margin: 0 auto !important;
  }
  ${scope} .s21-bottom-bar {
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 0 0 0 !important;
    width: 100% !important;
    max-width: 360px !important;
  }
  ${scope} .s21-audio-controls { position: static !important; order: 1 !important; margin: 0 auto !important; }
  ${scope} .s21-nav-center { position: static !important; order: 2 !important; transform: none !important; width: 100% !important; gap: 14px !important; justify-content: space-between !important; }
  ${scope} .s21-btn-nav { flex: 1 1 0% !important; height: 44px !important; min-height: 44px !important; font-size: 16px !important; }
  ${scope} .s21-captions-panel { position: static !important; width: 100% !important; max-width: 360px !important; bottom: auto !important; }
`;

const SLIDE21_CSS = `
  .s21-root button:focus-visible,
  .s21-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s21-badge-title:focus, .s21-badge-title:focus-visible { outline: none !important; }

  .s21-root, .s21-root *, .s21-root *::before, .s21-root *::after { box-sizing: border-box; }

  .s21-root {
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

  .s21-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Top-Left Yellow Pill Badge "What Now?" ---- */
  .s21-badge {
    position: absolute;
    left: 68px;
    top: 40px;
    min-width: 170px;
    height: 52px;
    padding: 0 26px;
    background-color: #feff9f;
    border: 2px solid #2b7a85;
    border-radius: 9999px;
    box-shadow: 0 3px 6px rgba(35, 111, 122, 0.22);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }
  .s21-badge-title {
    margin: 0;
    font-size: 21px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.015em;
    white-space: nowrap;
    color: #1d2423;
    outline: none;
  }

  /* ---- 2. Intro Copy & 2 Bullets ---- */
  .s21-copy-block {
    position: absolute;
    left: 72px;
    top: 118px;
    width: 616px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 5;
  }
  .s21-heading,
  .s21-bullet {
    font-size: 19.5px;
    line-height: 1.38;
    font-weight: 500;
    color: #1d2423;
    letter-spacing: -0.01em;
    text-align: left;
  }
  .s21-heading {
    margin: 0;
  }
  .s21-bullets {
    margin: 2px 0 0 0;
    padding-left: 28px;
    list-style: disc;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .s21-bullet::marker {
    color: #1d2423;
  }

  /* ---- 3. Doctor Consultation Illustration ---- */
  .s21-figure {
    position: absolute;
    left: 192px;
    top: 270px;
    width: 376px;
    height: 186px;
    margin: 0;
    z-index: 5;
    user-select: none;
    pointer-events: none;
  }
  .s21-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* ---- Captions Drawer ---- */
  .s21-captions-panel {
    position: absolute;
    bottom: 66px;
    left: 52px;
    right: 52px;
    z-index: 25;
    background-color: #ffffff;
    border: 1.5px solid #2b7a85;
    border-radius: 10px;
    padding: 10px 14px;
    box-shadow: 0 4px 12px rgba(20, 56, 51, 0.14);
    font-size: 13.5px;
    line-height: 1.45;
    color: #1a2322;
    max-height: 108px;
    overflow-y: auto;
  }

  /* ---- 4. Unified Bottom Bar ---- */
  .s21-bottom-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 74px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .s21-nav-center {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 54px;
  }
  .s21-btn-nav {
    height: 38px;
    min-width: 74px;
    padding: 0 20px;
    border-radius: 9999px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1.6px solid #3c7c87;
    transition: background-color 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
    color: #182728;
  }
  .s21-btn-nav:active:not(:disabled) { transform: scale(0.97); }
  .s21-btn-back { background-color: #c6dce0; }
  .s21-btn-back:hover:not(:disabled) { background-color: #b4d1d6; }
  .s21-btn-next { background-color: #f9fa9a; }
  .s21-btn-next:hover:not(:disabled) { background-color: #f5f77a; }
  .s21-btn-nav:disabled { opacity: 0.48; cursor: not-allowed; }

  .s21-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .s21-icon-btn {
    background: transparent;
    border: none;
    padding: 4px;
    margin: 0;
    min-width: 40px;
    min-height: 40px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #2b7a85;
    border-radius: 8px;
    transition: transform 0.12s ease, opacity 0.15s ease;
  }
  .s21-icon-btn:hover { opacity: 0.82; transform: scale(1.04); }
  .s21-icon-btn:active { transform: scale(0.95); }
  .s21-icon-btn[aria-pressed="true"] { background-color: rgba(43, 122, 133, 0.12); }

  ${mobileLayoutCSS(".s21-root.is-mobile")}
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s21-root:not(.is-desktop)")}
  }
`;

export function Slide21WhatNowScreen({
  variant = "auto",
  isSpanish = false,
  medicationName,
  onNext,
  onBack,
  loading = false,
  navProps,
  audioSrc,
  stepId,
  locale,
  transcriptText,
}: Slide21WhatNowScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);

  // Scale-locked desktop stage
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) {
        setScale(Math.min(Math.max(0, w - 8) / STAGE_W, Math.max(0, h - 8) / STAGE_H));
      }
    };
    update();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const rawTitle = isSpanish
    ? "Si a su hijo se le ofreció una prueba formal de alergia a [name], aquí hay dos razones para considerar la prueba de alergia ahora."
    : "If your child was given formal [name] allergy testing, here are two reasons to consider allergy testing now.";

  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish ? "/audio/es/step-21.mp3" : "/audio/en/step-21.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? `¿Qué sigue ahora? ${titleText}`
      : `What Now? ${titleText}`);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            if (typeof window !== "undefined" && "speechSynthesis" in window) {
              window.speechSynthesis.cancel();
              const u = new SpeechSynthesisUtterance(effectiveTranscript);
              u.lang = (locale || (isSpanish ? "es" : "en")) === "es" ? "es-US" : "en-US";
              u.onstart = () => setIsPlaying(true);
              u.onend = () => setIsPlaying(false);
              u.onerror = () => setIsPlaying(false);
              window.speechSynthesis.speak(u);
            }
          });
      }
    }
  };

  const handleNext = () => {
    stopAudio();
    if (onNext) onNext();
    else navProps?.onNext();
  };

  const handleBack = () => {
    stopAudio();
    if (onBack) onBack();
    else navProps?.onBack();
  };

  const isLoading = loading || navProps?.loading || false;

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <div id="slide-content" ref={rootRef} className={`s21-root${variantClass}`} data-step-id={stepId || "slide21_what_now"}>
      <style>{SLIDE21_CSS}</style>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className="s21-stage"
        style={variant === "mobile" ? undefined : { transform: `scale(${scale})` }}
      >
        {/* 1. Yellow Pill Badge "What Now?" */}
        <div className="s21-badge">
          <h2
            ref={headingRef}
            tabIndex={-1}
            id="slide21-title"
            className="s21-badge-title"
          >
            {isSpanish ? "¿Qué sigue ahora?" : "What Now?"}
          </h2>
        </div>

        {/* 2. Intro Copy & 2 Bullets */}
        <div className="s21-copy-block">
          <h1 className="s21-heading">{titleText}</h1>

          <ul className="s21-bullets" aria-label={titleText}>
            {BULLETS.map((b) => {
              const text = resolveMedicineToken(
                isSpanish ? b.es : b.en,
                medicationName,
                isSpanish
              );
              return (
                <li key={b.en} className="s21-bullet">
                  {text}
                </li>
              );
            })}
          </ul>
        </div>

        {/* 3. Doctor Consultation Illustration */}
        <figure className="s21-figure" aria-hidden="true">
          <img
            src="/images/doctor-consultation-s17.png"
            alt={
              isSpanish
                ? "Madre e hija consultando con la pediatra sobre las pruebas de alergia"
                : "Mother and daughter consulting with pediatrician about allergy testing"
            }
            className="s21-image"
            draggable={false}
          />
        </figure>

        {/* Captions Drawer */}
        {captionsOpen && (
          <div
            className="s21-captions-panel"
            role="region"
            aria-label={isSpanish ? "Subtítulos de audio" : "Audio captions"}
          >
            {effectiveTranscript}
          </div>
        )}

        {/* 4. Unified Bottom Bar */}
        <div className="s21-bottom-bar">
          <div className="s21-nav-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="s21-btn-nav s21-btn-back"
              aria-label={isSpanish ? "Atrás" : "Back"}
            >
              {isSpanish ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="s21-btn-nav s21-btn-next"
              aria-label={isSpanish ? "Siguiente" : "Next"}
            >
              {isSpanish ? "Siguiente" : "Next"}
            </button>
          </div>

          <div className="s21-audio-controls">
            <button
              type="button"
              onClick={() => setCaptionsOpen((v) => !v)}
              aria-pressed={captionsOpen}
              aria-label={
                captionsOpen
                  ? isSpanish ? "Ocultar subtítulos" : "Hide captions"
                  : isSpanish ? "Mostrar subtítulos" : "Show captions"
              }
              title={isSpanish ? "Subtítulos (CC)" : "Closed Captions (CC)"}
              className="s21-icon-btn"
            >
              <svg width="36" height="34" viewBox="0 0 42 40" fill="none" aria-hidden="true">
                <path
                  d="M9 5H33C36.3137 5 39 7.68629 39 11V25C39 28.3137 36.3137 31 33 31H26.2L21 36.2L15.8 31H9C5.68629 31 3 28.3137 3 25V11C3 7.68629 5.68629 5 9 5Z"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                />
                <text
                  x="21"
                  y="23"
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="14.5"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans, Inter, sans-serif"
                  letterSpacing="0.5"
                >
                  CC
                </text>
              </svg>
            </button>

            <button
              type="button"
              onClick={handleTogglePlay}
              aria-pressed={isPlaying}
              aria-label={
                isPlaying
                  ? isSpanish ? "Pausar narración" : "Pause narration"
                  : isSpanish ? "Reproducir narración" : "Play narration"
              }
              title={isPlaying ? (isSpanish ? "Pausar" : "Pause") : (isSpanish ? "Reproducir" : "Play")}
              className="s21-icon-btn"
            >
              <svg width="44" height="36" viewBox="0 0 54 44" fill="none" aria-hidden="true">
                <path
                  d="M6 8.2C6 5.8 8.6 4.3 10.7 5.6L33.5 19.4C35.5 20.6 35.5 23.4 33.5 24.6L10.7 38.4C8.6 39.7 6 38.2 6 35.8V8.2Z"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinejoin="round"
                />
                <text
                  x="17.5"
                  y="25.2"
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="10.5"
                  fontWeight="600"
                  fontFamily="Plus Jakarta Sans, Inter, sans-serif"
                >
                  {isPlaying ? "stop" : "play"}
                </text>
                <path d="M38.5 13.5C41.8 16.5 41.8 27.5 38.5 30.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <path d="M43 9.5C48 14.5 48 29.5 43 34.5" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
                <path d="M47.5 6C53.5 12.8 53.5 31.2 47.5 38" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Slide21WhatNowScreen;
