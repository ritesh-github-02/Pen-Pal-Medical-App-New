"use client";

import React, { useRef, useEffect, useState } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface LikelihoodOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const LIKELIHOOD_OPTIONS: LikelihoodOption[] = [
  {
    value: "Extremely likely",
    labelEn: "Extremely likely",
    labelEs: "Extremadamente probable",
  },
  {
    value: "Likely",
    labelEn: "Likely",
    labelEs: "Probable",
  },
  {
    value: "Unsure",
    labelEn: "Unsure",
    labelEs: "Inseguro",
  },
  {
    value: "Unlikely",
    labelEn: "Unlikely",
    labelEs: "Poco probable",
  },
  {
    value: "Extremely unlikely",
    labelEn: "Extremely unlikely",
    labelEs: "Extremadamente improbable",
  },
];

export interface Slide17bLikelihoodScreenProps {
  variant?: "auto" | "desktop" | "mobile";
  isSpanish?: boolean;
  medicationName?: string;
  selected?: string;
  onSelect?: (val: string) => void;
  onNext?: (explicitAnswer?: string) => void;
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

const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s17b-stage {
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
  ${scope} .s17b-banner {
    position: static !important;
    transform: none !important;
    width: 100% !important;
    max-width: 360px !important;
    min-height: auto !important;
    padding: 10px 18px !important;
    margin: 0 auto !important;
    border-radius: 20px !important;
  }
  ${scope} .s17b-banner-title {
    font-size: 16.5px !important;
    line-height: 1.35 !important;
  }
  ${scope} .s17b-main-content {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    margin: 4px auto !important;
  }
  ${scope} .s17b-options-col {
    position: static !important;
    width: 100% !important;
    gap: 12px !important;
  }
  ${scope} .s17b-option-row {
    padding: 8px 10px !important;
    background-color: rgba(255, 255, 255, 0.7) !important;
    border-radius: 10px !important;
  }
  ${scope} .s17b-option-label {
    font-size: 16px !important;
  }
  ${scope} .s17b-right-col {
    position: static !important;
    width: 100% !important;
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 12px !important;
    margin-top: 4px !important;
  }
  ${scope} .s17b-bubble-container {
    position: static !important;
    width: 180px !important;
    height: 110px !important;
  }
  ${scope} .s17b-bubble-text {
    font-size: 14px !important;
    padding: 8px 12px 18px 10px !important;
  }
  ${scope} .s17b-nurse-wrap {
    position: static !important;
    width: 95px !important;
    height: 180px !important;
  }
  ${scope} .s17b-bottom-bar {
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 6px 0 0 0 !important;
    width: 100% !important;
    max-width: 360px !important;
  }
  ${scope} .s17b-audio-controls { position: static !important; order: 1 !important; margin: 0 auto !important; }
  ${scope} .s17b-nav-center { position: static !important; order: 2 !important; transform: none !important; width: 100% !important; gap: 14px !important; justify-content: space-between !important; }
  ${scope} .s17b-btn-nav { flex: 1 1 0% !important; height: 44px !important; min-height: 44px !important; font-size: 16px !important; }
  ${scope} .s17b-captions-panel { position: static !important; width: 100% !important; max-width: 360px !important; bottom: auto !important; }
`;

const SLIDE17B_CSS = `
  .s17b-root button:focus-visible,
  .s17b-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s17b-banner-title:focus, .s17b-banner-title:focus-visible { outline: none !important; }

  .s17b-root, .s17b-root *, .s17b-root *::before, .s17b-root *::after { box-sizing: border-box; }

  .s17b-root {
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

  .s17b-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Top Yellow Banner (Question Title) ---- */
  .s17b-banner {
    position: absolute;
    left: 50%;
    top: 30px;
    transform: translateX(-50%);
    width: 468px;
    min-height: 56px;
    padding: 10px 28px;
    background-color: #feff9f;
    border: 2px solid #2b7a85;
    border-radius: 16px;
    box-shadow: 0 3px 6px rgba(35, 111, 122, 0.22);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    z-index: 5;
  }
  .s17b-banner-title {
    margin: 0;
    font-size: 19.5px;
    font-weight: 700;
    line-height: 1.32;
    letter-spacing: -0.01em;
    color: #142724;
    outline: none;
  }

  /* ---- 2. Left Column: 5 Likert Choice Options ---- */
  .s17b-options-col {
    position: absolute;
    left: 147px;
    top: 160px;
    width: 321px;
    display: flex;
    flex-direction: column;
    gap: 7px;
    z-index: 5;
  }

  .s17b-option-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: transparent;
    border: none;
    padding: 4px 6px;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s ease, transform 0.1s ease;
    user-select: none;
  }
  .s17b-option-row:hover {
    background-color: rgba(43, 122, 133, 0.08);
  }
  .s17b-option-row:active {
    transform: scale(0.98);
  }

  .s17b-checkbox {
    width: 25px;
    height: 25px;
    border-radius: 2px;
    border: 2px solid #7c9da3;
    background-color: #d1e2e4;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  .s17b-option-row:hover .s17b-checkbox {
    border-color: #2b7a85;
  }
  .s17b-checkbox--selected {
    background-color: #2b7a85 !important;
    border-color: #1d575f !important;
    box-shadow: 0 2px 4px rgba(43, 122, 133, 0.35);
  }
  .s17b-checkmark-icon {
    width: 15px;
    height: 15px;
    color: #ffffff;
    stroke: currentColor;
    stroke-width: 3;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .s17b-option-label {
    font-size: 19px;
    font-weight: 500;
    color: #142724;
    line-height: 1.25;
    letter-spacing: -0.01em;
    transition: color 0.15s ease;
  }
  .s17b-option-label--selected {
    font-weight: 700;
    color: #142724;
  }

  /* ---- 3. Right Column: Speech Bubble + Nurse Anna Waving ---- */
  .s17b-right-col {
    position: absolute;
    left: 418px;
    top: 120px;
    width: 280px;
    height: 345px;
    z-index: 5;
    pointer-events: none;
  }

  .s17b-bubble-container {
    position: absolute;
    top: 8px;
    width: 214px;
    height: 138px;
    left: -67px;
  }
  .s17b-bubble-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    filter: drop-shadow(0 3px 5px rgba(35, 111, 122, 0.15));
  }
  .s17b-bubble-text {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px 22px 24px 14px;
    text-align: center;
    font-size: 16.5px;
    font-weight: 700;
    line-height: 1.28;
    color: #142724;
    letter-spacing: -0.01em;
  }

  .s17b-nurse-wrap {
    position: absolute;
    right: 1px;
    bottom: 20px;
    width: 140px;
    height: 260px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .s17b-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: bottom center;
    user-select: none;
    pointer-events: none;
  }

  /* ---- Captions Drawer ---- */
  .s17b-captions-panel {
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
  .s17b-bottom-bar {
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
  .s17b-nav-center {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 54px;
  }
  .s17b-btn-nav {
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
  .s17b-btn-nav:active:not(:disabled) { transform: scale(0.97); }
  .s17b-btn-back { background-color: #c6dce0; }
  .s17b-btn-back:hover:not(:disabled) { background-color: #b4d1d6; }
  .s17b-btn-next { background-color: #f9fa9a; }
  .s17b-btn-next:hover:not(:disabled) { background-color: #f5f77a; }
  .s17b-btn-nav:disabled { opacity: 0.48; cursor: not-allowed; }

  .s17b-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .s17b-icon-btn {
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
  .s17b-icon-btn:hover { opacity: 0.82; transform: scale(1.04); }
  .s17b-icon-btn:active { transform: scale(0.96); }

  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s17b-root.is-auto")}
  }
  ${mobileLayoutCSS(".s17b-root.is-mobile")}
`;

export function Slide17bLikelihoodScreen({
  variant = "auto",
  isSpanish = false,
  medicationName = "penicillin",
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
  navProps,
  audioSrc,
  stepId = "slide17b_likelihood",
  locale,
  transcriptText,
}: Slide17bLikelihoodScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);
  const [localSelected, setLocalSelected] = useState<string | undefined>(selected);

  // Sync internal selection with incoming selected prop
  useEffect(() => {
    if (selected !== undefined) {
      setLocalSelected(selected);
    }
  }, [selected]);

  // Stage scaling
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

  const rawQuestion = isSpanish
    ? "¿Qué tan probable es que hable con el médico de su hijo sobre la prueba de alergia a [name]?"
    : "How likely are you to speak to your child's doctor about [name] allergy testing?";

  const questionTitle = resolveMedicineToken(rawQuestion, medicationName, isSpanish);

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/slide17b_likelihood_es.mp3"
      : "/audio/exported/slide17b_likelihood_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? `${questionTitle}. Extremadamente probable, Probable, Inseguro, Poco probable, Extremadamente improbable. Gracias por completar PEN-PAL.`
      : `${questionTitle}. Extremely likely, Likely, Unsure, Unlikely, Extremely unlikely. Thank you for completing PEN-PAL.`);

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

  const handleSelectOption = (value: string) => {
    setLocalSelected(value);
    if (onSelect) {
      onSelect(value);
    }
  };

  const handleNext = () => {
    stopAudio();
    if (onNext) onNext(localSelected);
    else navProps?.onNext(localSelected);
  };

  const handleBack = () => {
    stopAudio();
    if (onBack) onBack();
    else navProps?.onBack();
  };

  const isLoading = loading || navProps?.loading || false;
  const isNextEnabled = !!localSelected && !isLoading;

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
        ? " is-desktop"
        : " is-auto";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s17b-root${variantClass}`}
      data-step-id={stepId || "slide17b_likelihood"}
    >
      <style>{SLIDE17B_CSS}</style>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="none"
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          // Graceful fallback to speech synthesis when pre-rendered audio is missing
        }}
      />

      <div
        className="s17b-stage"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
        }}
      >
        {/* 1. Top Yellow Banner (Question Title) */}
        <header className="s17b-banner" aria-label={questionTitle}>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="s17b-banner-title"
            id="slide17b-title"
          >
            {questionTitle}
          </h1>
        </header>

        {/* Desktop Content Group / Mobile Main Content */}
        <div className="s17b-main-content">
          {/* 2. Left Column: 5 Likert Choice Options */}
          <div
            className="s17b-options-col"
            role="radiogroup"
            aria-labelledby="slide17b-title"
          >
            {LIKELIHOOD_OPTIONS.map((opt) => {
              const isSelected = localSelected === opt.value;
              const label = isSpanish ? opt.labelEs : opt.labelEn;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleSelectOption(opt.value)}
                  className="s17b-option-row"
                >
                  <div
                    className={`s17b-checkbox${isSelected ? " s17b-checkbox--selected" : ""}`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg
                        className="s17b-checkmark-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`s17b-option-label${isSelected ? " s17b-option-label--selected" : ""}`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 3. Right Column: Speech Bubble + Nurse Anna Waving */}
          <div className="s17b-right-col" aria-hidden="true">
            {/* Oval speech bubble with curved tail pointing toward Nurse Anna */}
            <div className="s17b-bubble-container">
              <svg
                viewBox="0 0 240 150"
                className="s17b-bubble-svg"
                aria-hidden="true"
              >
                <path
                  d="M 110 12
                     C 45 12, 10 36, 10 70
                     C 10 104, 52 126, 110 126
                     C 138 126, 164 121, 182 112
                     Q 214 136, 232 130
                     Q 216 112, 206 94
                     C 218 87, 224 78, 224 70
                     C 224 36, 175 12, 110 12 Z"
                  fill="#d8ede8"
                  stroke="#2b7a85"
                  strokeWidth="2.4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div className="s17b-bubble-text">
                {isSpanish ? (
                  <>
                    <span>Gracias</span>
                    <span>por completar</span>
                    <span>PEN-PAL.</span>
                  </>
                ) : (
                  <>
                    <span>Thank you</span>
                    <span>for completing</span>
                    <span>PEN-PAL.</span>
                  </>
                )}
              </div>
            </div>

            {/* Nurse Anna waving illustration */}
            <div className="s17b-nurse-wrap">
              <img
                src="/images/Slide18.png"
                alt=""
                className="s17b-nurse-img"
                draggable={false}
              />
            </div>
          </div>
        </div>

        {/* Captions Drawer */}
        {captionsOpen && (
          <div
            className="s17b-captions-panel"
            role="region"
            aria-label={isSpanish ? "Subtítulos" : "Closed Captions"}
          >
            {effectiveTranscript}
          </div>
        )}

        {/* 4. Unified Bottom Bar */}
        <div className="s17b-bottom-bar">
          <div className="s17b-nav-center">
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className="s17b-btn-nav s17b-btn-back"
              aria-label={isSpanish ? "Atrás" : "Back"}
            >
              {isSpanish ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!isNextEnabled}
              aria-disabled={!isNextEnabled}
              className="s17b-btn-nav s17b-btn-next"
              aria-label={isSpanish ? "Siguiente" : "Next"}
            >
              {isSpanish ? "Siguiente" : "Next"}
            </button>
          </div>

          <div className="s17b-audio-controls">
            <button
              type="button"
              onClick={() => setCaptionsOpen((v) => !v)}
              aria-pressed={captionsOpen}
              aria-label={
                captionsOpen
                  ? isSpanish
                    ? "Ocultar subtítulos"
                    : "Hide captions"
                  : isSpanish
                    ? "Mostrar subtítulos"
                    : "Show captions"
              }
              title={isSpanish ? "Subtítulos (CC)" : "Closed Captions (CC)"}
              className="s17b-icon-btn"
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
                  ? isSpanish
                    ? "Pausar narración"
                    : "Pause narration"
                  : isSpanish
                    ? "Reproducir narración"
                    : "Play narration"
              }
              title={
                isPlaying
                  ? isSpanish
                    ? "Pausar"
                    : "Pause"
                  : isSpanish
                    ? "Reproducir"
                    : "Play"
              }
              className="s17b-icon-btn"
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
                <path
                  d="M38.5 13.5C41.8 16.5 41.8 27.5 38.5 30.5"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
                <path
                  d="M43 9.5C48 14.5 48 29.5 43 34.5"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
                <path
                  d="M47.5 6C53.5 12.8 53.5 31.2 47.5 38"
                  stroke="currentColor"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Slide17bLikelihoodScreen;
