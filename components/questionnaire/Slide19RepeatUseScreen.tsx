"use client";

import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface Slide19RepeatUseScreenProps {
  variant?: "auto" | "desktop" | "mobile";
  isSpanish?: boolean;
  selected?: string;
  reactionDetailSelected?: string;
  onSelect: (val: string) => void;
  onReactionDetailSelect: (detail: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  transcriptText?: string;
  stepId?: string;
  locale?: string;
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export interface RepeatOption {
  value: string;
  labelEn: string;
  labelEs: string;
  variant?: "compact" | "wide";
}

export const REPEAT_OPTIONS: RepeatOption[] = [
  { value: "Yes", labelEn: "Yes", labelEs: "Sí", variant: "compact" },
  { value: "No", labelEn: "No", labelEs: "No", variant: "compact" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé", variant: "wide" },
];

export const REPEAT_DETAIL_OPTIONS = [
  {
    value: "Yes, and they did not have a reaction",
    labelEn: "Yes, and they did not have a reaction",
    labelEs: "Sí, y no tuvieron reacción",
  },
  {
    value: "Yes, and they had a reaction",
    labelEn: "Yes, and they had a reaction",
    labelEs: "Sí, y tuvieron reacción",
  },
  {
    value: "Unsure",
    labelEn: "Unsure / I don't know",
    labelEs: "No estoy seguro/ No lo sé",
  },
];

function isRepeatSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (
    optValue === "Unsure" &&
    (currentSelected.toLowerCase().includes("unsure") ||
      currentSelected.toLowerCase().includes("know"))
  ) {
    return true;
  }
  return false;
}

function isDetailSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (
    optValue === "Unsure" &&
    (currentSelected.toLowerCase().includes("unsure") ||
      currentSelected.toLowerCase().includes("know"))
  ) {
    return true;
  }
  return false;
}

const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s19-stage {
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
    gap: 14px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    background-color: transparent !important;
  }
  ${scope} .s19-heading {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    font-size: 17.5px !important;
    line-height: 1.35 !important;
    text-align: center !important;
    margin: 0 auto !important;
  }
  ${scope} .s19-card {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    min-height: auto !important;
    padding: 16px 14px !important;
    margin: 0 auto !important;
  }
  ${scope} .s19-options-row {
    flex-wrap: wrap !important;
    gap: 10px !important;
  }
  ${scope} .s19-nurse {
    position: static !important;
    width: 104px !important;
    height: 212px !important;
    margin: 0 auto !important;
  }
  ${scope} .s19-bottom-bar {
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 0 0 0 !important;
    width: 100% !important;
    max-width: 360px !important;
  }
  ${scope} .s19-audio-controls { position: static !important; order: 1 !important; margin: 0 auto !important; }
  ${scope} .s19-nav-center { position: static !important; order: 2 !important; transform: none !important; width: 100% !important; gap: 14px !important; justify-content: space-between !important; }
  ${scope} .s19-btn-nav { flex: 1 1 0% !important; height: 44px !important; min-height: 44px !important; font-size: 16px !important; }
  ${scope} .s19-captions-panel { position: static !important; width: 100% !important; max-width: 360px !important; bottom: auto !important; }
`;

const SLIDE19_CSS = `
  .s19-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s19-root button:focus-visible,
  .s19-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s19-heading:focus, .s19-heading:focus-visible { outline: none !important; }

  .s19-root, .s19-root *, .s19-root *::before, .s19-root *::after { box-sizing: border-box; }

  .s19-root {
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

  .s19-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Left-aligned Bold Heading ---- */
  .s19-heading {
    position: absolute;
    left: 64px;
    top: 72px;
    width: 640px;
    margin: 0;
    padding: 0;
    font-size: 21.5px;
    line-height: 1.35;
    font-weight: 700;
    color: #1d2423;
    letter-spacing: -0.015em;
    text-align: left;
    outline: none;
    z-index: 5;
  }

  /* ---- 2. Sage-Teal Card ---- */
  .s19-card {
    position: absolute;
    left: 64px;
    top: 150px;
    width: 478px;
    min-height: 124px;
    background-color: #8bb6b0;
    border-radius: 14px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }

  .s19-options-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: 100%;
  }

  .s19-option-btn {
    min-height: 36px;
    padding: 7px 14px;
    border-radius: 6px;
    background-color: #ffffff;
    border: 1.3px solid #2b7a85;
    color: #1d2423;
    font-size: 14.5px;
    font-weight: 500;
    line-height: 1.2;
    text-align: center;
    white-space: nowrap;
    box-shadow: 0 2px 3px rgba(0, 0, 0, 0.14);
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .s19-option-btn--compact {
    min-width: 44px;
    padding: 7px 12px;
  }
  .s19-option-btn--wide {
    padding: 7px 14px;
  }
  .s19-option-btn:hover {
    background-color: #f3f9f8;
    border-color: #1c5249;
    transform: translateY(-1px);
  }
  .s19-option-btn:active { transform: scale(0.98); }

  .s19-option-btn--selected {
    background-color: #ffd41d !important;
    border-color: #1c5249 !important;
    color: #142724 !important;
    font-weight: 600;
  }

  .s19-detail-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(20, 58, 52, 0.25);
    border-radius: 8px;
    padding: 5px 10px;
    margin-top: 10px;
    font-size: 12.5px;
    color: #143833;
  }
  .s19-detail-badge-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .s19-change-btn {
    background: none;
    border: none;
    color: #1f4d45;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
    font-size: 12.5px;
    flex-shrink: 0;
  }

  /* ---- 3. Nurse Anna (Right, Pointing Left) ---- */
  .s19-nurse {
    position: absolute;
    left: 548px;
    top: 162px;
    width: 134px;
    height: 274px;
    z-index: 6;
    user-select: none;
    pointer-events: none;
  }
  .s19-nurse img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* ---- Captions Drawer ---- */
  .s19-captions-panel {
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
  .s19-bottom-bar {
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
  .s19-nav-center {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 54px;
  }
  .s19-btn-nav {
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
  .s19-btn-nav:active:not(:disabled) { transform: scale(0.97); }
  .s19-btn-back { background-color: #c6dce0; }
  .s19-btn-back:hover:not(:disabled) { background-color: #b4d1d6; }
  .s19-btn-next { background-color: #f9fa9a; }
  .s19-btn-next:hover:not(:disabled) { background-color: #f5f77a; }
  .s19-btn-nav:disabled { opacity: 0.48; cursor: not-allowed; }

  .s19-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .s19-icon-btn {
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
  .s19-icon-btn:hover { opacity: 0.82; transform: scale(1.04); }
  .s19-icon-btn:active { transform: scale(0.95); }
  .s19-icon-btn[aria-pressed="true"] { background-color: rgba(43, 122, 133, 0.12); }

  /* ---- Modal 20: Repeat Exposure Detail ---- */
  .s19-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);
  }
  .s19-modal-card {
    background-color: #f7f4ec;
    border: 1.5px solid #d8d2c2;
    border-radius: 18px;
    padding: 1.5rem 1.65rem 1.25rem 1.65rem;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: s19FadeIn 0.18s ease-out;
  }
  @keyframes s19FadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .s19-modal-heading {
    font-size: 1.12rem;
    font-weight: 700;
    line-height: 1.35;
    color: #142724;
    margin: 0;
    text-align: center;
    outline: none;
  }
  .s19-modal-options {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    width: 100%;
  }
  .s19-modal-row {
    display: flex;
    gap: 0.65rem;
    width: 100%;
  }
  .s19-modal-btn {
    min-height: 44px;
    padding: 0.55rem 0.85rem;
    border-radius: 8px;
    background-color: #ffffff;
    border: 1.5px solid #236f7a;
    color: #142724;
    font-size: 0.86rem;
    font-weight: 700;
    line-height: 1.25;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.15s ease;
    outline: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: inherit;
  }
  .s19-modal-btn--full { width: 100%; }
  .s19-modal-btn--half { flex: 1 1 0%; }
  .s19-modal-btn:hover {
    background-color: #f2f8f6;
    border-color: #1c5249;
    transform: translateY(-1px);
  }
  .s19-modal-btn--selected {
    background-color: #ffd41d !important;
    border-color: #1c5249 !important;
    color: #142724 !important;
  }

  ${mobileLayoutCSS(".s19-root.is-mobile")}
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s19-root:not(.is-desktop)")}
  }
`;

export function Slide19RepeatUseScreen({
  variant = "auto",
  isSpanish = false,
  selected,
  reactionDetailSelected,
  onSelect,
  onReactionDetailSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  transcriptText,
  stepId,
  locale,
  navProps,
}: Slide19RepeatUseScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish ? "/audio/es/step-6-5.mp3" : "/audio/en/step-6-5.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "¿Ha recibido su hijo penicilina desde la reacción?"
      : "Has your child received penicillin since the reaction?");

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

  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => modalHeadingRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  const handleMainOption = (val: string) => {
    onSelect(val);
    if (val === "Yes") {
      setModalOpen(true);
    } else {
      onReactionDetailSelect("");
    }
  };

  const handleNextClick = () => {
    stopAudio();
    if (onNext) onNext();
    else if (navProps?.onNext) navProps.onNext(selected);
  };

  const handleBackClick = () => {
    stopAudio();
    if (onBack) onBack();
    else if (navProps?.onBack) navProps.onBack();
  };

  const isLoading = loading || navProps?.loading || false;
  const isNextEnabled = !!selected && !isLoading;

  const handleArrowKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % REPEAT_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + REPEAT_OPTIONS.length) % REPEAT_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = REPEAT_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = REPEAT_OPTIONS[nextIndex];
      handleMainOption(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const selectedDetailObj = REPEAT_DETAIL_OPTIONS.find((d) =>
    isDetailSelected(d.value, reactionDetailSelected)
  );
  const selectedDetailLabel = isSpanish
    ? selectedDetailObj?.labelEs || reactionDetailSelected
    : selectedDetailObj?.labelEn || reactionDetailSelected;

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <div id="slide-content" ref={rootRef} className={`s19-root${variantClass}`} data-step-id={stepId || "screen6_5_yetagain"}>
      <style>{SLIDE19_CSS}</style>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className="s19-stage"
        style={variant === "mobile" ? undefined : { transform: `scale(${scale})` }}
      >
        {/* 1. Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide19-title"
          className="s19-heading"
        >
          {isSpanish
            ? "¿Ha recibido su hijo penicilina desde la reacción?"
            : "Has your child received penicillin since the reaction?"}
        </h1>

        {/* 2. Sage-Teal Card */}
        <div className="s19-card">
          <div
            role="radiogroup"
            aria-labelledby="slide19-title"
            className="s19-options-row"
          >
            {REPEAT_OPTIONS.map((opt, index) => {
              const isChecked = isRepeatSelected(opt.value, selected);
              const label = isSpanish ? opt.labelEs : opt.labelEn;
              const sizeClass =
                opt.variant === "compact"
                  ? " s19-option-btn--compact"
                  : " s19-option-btn--wide";

              return (
                <button
                  key={opt.value}
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isChecked}
                  tabIndex={isChecked || (!selected && index === 0) ? 0 : -1}
                  onClick={() => handleMainOption(opt.value)}
                  onKeyDown={(e) => handleArrowKeyDown(e, index)}
                  className={`s19-option-btn${sizeClass}${isChecked ? " s19-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {selected === "Yes" && reactionDetailSelected && (
            <div className="s19-detail-badge">
              <span className="s19-detail-badge-text">
                <strong>{isSpanish ? "Detalle: " : "Detail: "}</strong>
                {selectedDetailLabel}
              </span>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="s19-change-btn"
              >
                {isSpanish ? "Cambiar" : "Change"}
              </button>
            </div>
          )}
        </div>

        {/* 3. Nurse Anna (Right, Pointing Left) */}
        <div className="s19-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-s16.png"
            alt=""
            draggable={false}
          />
        </div>

        {/* Captions Drawer */}
        {captionsOpen && (
          <div
            className="s19-captions-panel"
            role="region"
            aria-label={isSpanish ? "Subtítulos de audio" : "Audio captions"}
          >
            {effectiveTranscript}
          </div>
        )}

        {/* 4. Unified Bottom Bar */}
        <div className="s19-bottom-bar">
          <div className="s19-nav-center">
            <button
              type="button"
              onClick={handleBackClick}
              disabled={isLoading}
              className="s19-btn-nav s19-btn-back"
              aria-label={isSpanish ? "Atrás" : "Back"}
            >
              {isSpanish ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNextClick}
              disabled={!isNextEnabled}
              className="s19-btn-nav s19-btn-next"
              aria-label={isSpanish ? "Siguiente" : "Next"}
            >
              {isSpanish ? "Siguiente" : "Next"}
            </button>
          </div>

          <div className="s19-audio-controls">
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
              className="s19-icon-btn"
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
              className="s19-icon-btn"
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

      {/* MODAL 20: Repeat Exposure Detail */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-20-heading"
          className="s19-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="s19-modal-card">
            <h2
              id="modal-20-heading"
              ref={modalHeadingRef}
              tabIndex={-1}
              className="s19-modal-heading"
            >
              {isSpanish
                ? "¿Ha tomado su hijo penicilina (amoxicilina) nuevamente desde la reacción?"
                : "Has your child taken penicillin (amoxicillin) again since the reaction?"}
            </h2>

            <div className="s19-modal-options">
              {(() => {
                const opt1 = REPEAT_DETAIL_OPTIONS[0];
                const isChecked1 = isDetailSelected(opt1.value, reactionDetailSelected);
                const label1 = isSpanish ? opt1.labelEs : opt1.labelEn;
                return (
                  <button
                    type="button"
                    onClick={() => {
                      onReactionDetailSelect(opt1.value);
                      setModalOpen(false);
                    }}
                    className={`s19-modal-btn s19-modal-btn--full${isChecked1 ? " s19-modal-btn--selected" : ""}`}
                  >
                    {label1}
                  </button>
                );
              })()}

              <div className="s19-modal-row">
                {REPEAT_DETAIL_OPTIONS.slice(1).map((opt) => {
                  const isChecked = isDetailSelected(opt.value, reactionDetailSelected);
                  const label = isSpanish ? opt.labelEs : opt.labelEn;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onReactionDetailSelect(opt.value);
                        setModalOpen(false);
                      }}
                      className={`s19-modal-btn s19-modal-btn--half${isChecked ? " s19-modal-btn--selected" : ""}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide19RepeatUseScreen;
