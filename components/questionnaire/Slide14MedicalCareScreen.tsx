"use client";

import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface CareOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const CARE_OPTIONS: CareOption[] = [
  { value: "Yes", labelEn: "Yes", labelEs: "Sí" },
  { value: "No", labelEn: "No", labelEs: "No" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

export const LOCATION_OPTIONS = [
  { value: "Emergency room (ER)", labelEn: "Emergency room\n(ER)", labelEs: "Sala de emergencias\n(ER)" },
  { value: "Urgent care", labelEn: "Urgent care", labelEs: "Centro de urgencias" },
  { value: "Primary care doctor", labelEn: "Primary care doctor", labelEs: "Médico de atención primaria" },
  { value: "Hospital", labelEn: "Hospital", labelEs: "Hospital" },
  { value: "Phone call with doctor", labelEn: "Phone call with doctor", labelEs: "Llamada con el médico" },
  { value: "Unsure", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro" },
];

function isCareSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure" && currentSelected.toLowerCase().includes("unsure")) return true;
  return false;
}

function isLocationSelected(optValue: string, currentLocation?: string): boolean {
  if (!currentLocation) return false;
  if (currentLocation === optValue) return true;
  if (optValue === "Unsure" && currentLocation.toLowerCase().includes("unsure")) return true;
  return false;
}

const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s14-stage {
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
  ${scope} .s14-heading {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    font-size: 17.5px !important;
    line-height: 1.35 !important;
    text-align: center !important;
    margin: 0 auto !important;
  }
  ${scope} .s14-card {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    min-height: auto !important;
    padding: 16px 14px !important;
    margin: 0 auto !important;
  }
  ${scope} .s14-options-row {
    flex-wrap: wrap !important;
    gap: 10px !important;
  }
  ${scope} .s14-nurse {
    position: static !important;
    width: 84px !important;
    height: 204px !important;
    margin: 0 auto !important;
  }
  ${scope} .s14-bottom-bar {
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 0 0 0 !important;
    width: 100% !important;
    max-width: 360px !important;
  }
  ${scope} .s14-audio-controls { position: static !important; order: 1 !important; margin: 0 auto !important; }
  ${scope} .s14-nav-center { position: static !important; order: 2 !important; transform: none !important; width: 100% !important; gap: 14px !important; justify-content: space-between !important; }
  ${scope} .s14-btn-nav { flex: 1 1 0% !important; height: 44px !important; min-height: 44px !important; font-size: 16px !important; }
  ${scope} .s14-captions-panel { position: static !important; width: 100% !important; max-width: 360px !important; bottom: auto !important; }
`;

const SLIDE14_CSS = `
  .s14-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s14-root button:focus-visible,
  .s14-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s14-heading:focus, .s14-heading:focus-visible { outline: none !important; }

  .s14-root, .s14-root *, .s14-root *::before, .s14-root *::after { box-sizing: border-box; }

  .s14-root {
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

  .s14-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Left-aligned Bold Heading ---- */
  .s14-heading {
    position: absolute;
    left: 60px;
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
  .s14-card {
    position: absolute;
    left: 60px;
    top: 150px;
    width: 492px;
    min-height: 126px;
    background-color: #8bb6b0;
    border-radius: 14px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }

  .s14-options-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: 100%;
  }

  .s14-option-btn {
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
  .s14-option-btn:hover {
    background-color: #f3f9f8;
    border-color: #1c5249;
    transform: translateY(-1px);
  }
  .s14-option-btn:active { transform: scale(0.98); }

  .s14-option-btn--selected {
    background-color: #ffd41d !important;
    border-color: #1c5249 !important;
    color: #142724 !important;
    font-weight: 600;
  }

  .s14-location-badge {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(20, 58, 52, 0.25);
    border-radius: 8px;
    padding: 5px 10px;
    margin-top: 10px;
    font-size: 13px;
    color: #143833;
  }
  .s14-location-change-btn {
    background: none;
    border: none;
    color: #1f4d45;
    font-weight: 700;
    text-decoration: underline;
    cursor: pointer;
    padding: 0;
    margin-left: 8px;
    font-size: 12.5px;
  }

  /* ---- 3. Nurse Anna (hand on heart pose) on Right ---- */
  .s14-nurse {
    position: absolute;
    left: 576px;
    top: 134px;
    width: 169px;
    height: 271px;
    pointer-events: none;
    z-index: 6;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    user-select: none;
  }
  .s14-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    user-select: none;
  }

  /* ---- 4. Bottom Bar ---- */
  .s14-bottom-bar {
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
  .s14-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s14-btn-nav {
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
  }
  .s14-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12); }
  .s14-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s14-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s14-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s14-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s14-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s14-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  .s14-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s14-audio-btn {
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
  .s14-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  .s14-captions-panel {
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
  .s14-captions-tag {
    background: #fdee8e;
    color: #1a2624;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .s14-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

  /* ---- Modal 15: Care Location Dialog ---- */
  .s14-modal-overlay {
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
  .s14-modal-card {
    background-color: #f7f4ec;
    border: 1.5px solid #2b7a85;
    border-radius: 18px;
    padding: 1.5rem 1.65rem 1.15rem 1.65rem;
    max-width: 490px;
    width: 100%;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .s14-modal-heading {
    font-size: 1.12rem;
    font-weight: 700;
    line-height: 1.3;
    color: #142724;
    margin: 0;
    text-align: center;
    outline: none;
  }
  .s14-modal-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
    width: 100%;
  }
  .s14-modal-btn {
    min-height: 44px;
    padding: 0.55rem 0.65rem;
    border-radius: 8px;
    background-color: #ffffff;
    border: 1.3px solid #2b7a85;
    color: #142724;
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: pre-line;
    font-family: inherit;
  }
  .s14-modal-btn--selected {
    background-color: #ffd41d !important;
    border-color: #1c5249 !important;
    color: #142724 !important;
  }
  .s14-modal-footer { display: flex; justify-content: flex-end; }
  .s14-modal-close-btn {
    background-color: #ffffff;
    border: 1px solid #759c92;
    border-radius: 6px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #557871;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
  }

  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s14-root:not(.is-desktop)")}
  }
  ${mobileLayoutCSS(".s14-root.is-mobile")}

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export interface Slide14MedicalCareScreenProps {
  isSpanish?: boolean;
  selected?: string;
  locationSelected?: string;
  onSelect: (val: string) => void;
  onLocationSelect: (loc: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  variant?: "auto" | "desktop" | "mobile";
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide14MedicalCareScreen({
  isSpanish = false,
  selected,
  locationSelected,
  onSelect,
  onLocationSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "screen6_4_resolution",
  locale,
  transcriptText,
  variant = "auto",
  navProps,
}: Slide14MedicalCareScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modalHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [scale, setScale] = useState<number>(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const isEs = isSpanish || (locale ? locale.startsWith("es") : false);
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const variantClass = isMobile ? " is-mobile" : isDesktop ? " is-desktop" : "";

  const effectiveAudioSrc =
    audioSrc ||
    (isEs ? "/audio/exported/screen6_4_care_es.mp3" : "/audio/exported/screen6_4_care_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isEs
      ? "¿Su hijo recibió atención médica por su reacción?"
      : "Did your child receive medical care for their reaction?");

  useEffect(() => {
    const timer = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 50);
    return () => clearTimeout(timer);
  }, []);

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
      setScale(Math.min(Math.max(0, w - 8) / STAGE_W, Math.max(0, h - 8) / STAGE_H));
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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions && !modalOpen) {
        setShowCaptions(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCaptions, modalOpen]);

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
    setLiveAnnouncement(willPlay ? "Audio narration playing" : "Audio narration paused");
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
    setLiveAnnouncement(next ? "Closed captions displayed" : "Closed captions hidden");
  };

  const handleMainOption = (val: string) => {
    onSelect(val);
    if (val === "Yes") setModalOpen(true);
    else onLocationSelect("");
  };

  const handleNextClick = () => {
    if (onNext) onNext();
    else if (navProps?.onNext) navProps.onNext(selected);
  };
  const handleBackClick = () => {
    if (onBack) onBack();
    else if (navProps?.onBack) navProps.onBack();
  };

  const isLoading = loading || navProps?.loading || false;
  const isNextEnabled = !!selected && !isLoading;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nextIndex = (index + 1) % CARE_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + CARE_OPTIONS.length) % CARE_OPTIONS.length;
    }
    if (nextIndex !== -1) {
      handleMainOption(CARE_OPTIONS[nextIndex].value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const selectedLocLabel = isEs
    ? LOCATION_OPTIONS.find((l) => isLocationSelected(l.value, locationSelected))?.labelEs || locationSelected
    : LOCATION_OPTIONS.find((l) => isLocationSelected(l.value, locationSelected))?.labelEn?.replace("\n", " ") || locationSelected;

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s14-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide14-title"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE14_CSS }} />

      <div className="s14-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s14-sr-only"
        aria-hidden="true"
      />

      {/* ── Scale-locked desktop stage ── */}
      <div
        className="s14-stage"
        style={!isMobile ? { transform: `scale(${scale})` } : undefined}
      >
        <h1 ref={headingRef} tabIndex={-1} id="slide14-title" className="s14-heading">
          {isEs
            ? "¿Su hijo recibió atención médica por su reacción?"
            : "Did your child receive medical care for their reaction?"}
        </h1>

        <div className="s14-card">
          <div role="radiogroup" aria-labelledby="slide14-title" className="s14-options-row">
            {CARE_OPTIONS.map((opt, index) => {
              const isChecked = isCareSelected(opt.value, selected);
              const label = isEs ? opt.labelEs : opt.labelEn;
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
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`s14-option-btn${isChecked ? " s14-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {selected === "Yes" && locationSelected && (
            <div className="s14-location-badge">
              <span>
                <strong>{isEs ? "Lugar: " : "Location: "}</strong>
                {selectedLocLabel}
              </span>
              <button type="button" onClick={() => setModalOpen(true)} className="s14-location-change-btn">
                {isEs ? "Cambiar" : "Change"}
              </button>
            </div>
          )}
        </div>

        <div className="s14-nurse" aria-hidden="true">
          <img src="/images/Slide14New.png?v=5" alt="" className="s14-nurse-img" draggable={false} />
        </div>

        {showCaptions && (
          <div className="s14-captions-panel" role="region" aria-label={isEs ? "Subtítulos" : "Closed captions"}>
            <span className="s14-captions-tag" aria-hidden="true">CC</span>
            <p className="s14-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        <footer className="s14-bottom-bar" role="toolbar" aria-label="Slide navigation and media controls">
          <nav className="s14-nav-center" aria-label="Slide pagination">
            <button type="button" onClick={handleBackClick} disabled={isLoading} className="s14-btn-nav s14-btn-back">
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNextClick}
              disabled={!isNextEnabled}
              aria-disabled={!isNextEnabled}
              className="s14-btn-nav s14-btn-next"
            >
              {isLoading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s14-audio-controls">
            <button type="button" className="s14-audio-btn" onClick={toggleCaptions} aria-pressed={showCaptions}
              aria-label={showCaptions ? "Hide closed captions" : "Show closed captions"}>
              <svg width="44" height="40" viewBox="0 0 40 36" fill="none" aria-hidden="true" focusable="false">
                <path
                  d="M 8.5 5.5 C 5.5 5.5 4 7.2 4 11 V 20 C 4 23.8 5.5 25.5 8.5 25.5 H 12 C 13 25.5 14 26.3 14.7 27.5 L 16.5 30.5 C 17.3 31.7 18.7 31.7 19.5 30.5 L 21.3 27.5 C 22 26.3 23 25.5 24 25.5 H 31.5 C 34.5 25.5 36 23.8 36 20 V 11 C 36 7.2 34.5 5.5 31.5 5.5 Z"
                  stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"
                  fill={showCaptions ? "currentColor" : "none"}
                />
                <text x="20" y="15.5" textAnchor="middle" dominantBaseline="central"
                  fill={showCaptions ? "#ffffff" : "currentColor"} fontSize="13" fontWeight="700"
                  fontFamily="ui-sans-serif, system-ui, sans-serif">CC</text>
              </svg>
            </button>

            <button type="button" className="s14-audio-btn" onClick={toggleAudio} aria-pressed={audioPlaying}
              aria-label={audioPlaying ? "Pause audio narration" : "Play audio narration"}>
              {audioPlaying ? (
                <svg width="54" height="40" viewBox="0 0 50 36" fill="none" aria-hidden="true" focusable="false">
                  <path d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                    stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" fill="none" />
                  <line x1="11.5" y1="13" x2="11.5" y2="23" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <line x1="16.5" y1="13" x2="16.5" y2="23" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M 33 11 C 37 13.5 37 22.5 33 25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="54" height="40" viewBox="0 0 50 36" fill="none" aria-hidden="true" focusable="false">
                  <path d="M 4.5 8.5 C 4.5 5.5 6.8 4.2 9.5 5.8 L 28 16.2 C 29.8 17.2 29.8 18.8 28 19.8 L 9.5 30.2 C 6.8 31.8 4.5 30.5 4.5 27.5 Z"
                    stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" fill="none" />
                  <text x="14.8" y="17.2" textAnchor="middle" dominantBaseline="central" fill="currentColor"
                    fontSize="8" fontWeight="700" fontFamily="ui-sans-serif, system-ui, sans-serif">play</text>
                  <path d="M 33 11 C 37 13.5 37 22.5 33 25" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M 38.5 6.5 C 44.5 10.5 44.5 25.5 38.5 29.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </footer>
      </div>

      {/* MODAL 15: Where did your child get medical care? */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-15-heading"
          className="s14-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="s14-modal-card">
            <h2 id="modal-15-heading" ref={modalHeadingRef} tabIndex={-1} className="s14-modal-heading">
              {isEs
                ? "¿Dónde recibió atención médica para la reacción?"
                : "Where did your child get medical care for the reaction?"}
            </h2>

            <div className="s14-modal-grid">
              {LOCATION_OPTIONS.map((loc) => {
                const isLocChecked = isLocationSelected(loc.value, locationSelected);
                const locLabel = isEs ? loc.labelEs : loc.labelEn;
                return (
                  <button
                    key={loc.value}
                    type="button"
                    onClick={() => {
                      onLocationSelect(loc.value);
                      setModalOpen(false);
                    }}
                    className={`s14-modal-btn${isLocChecked ? " s14-modal-btn--selected" : ""}`}
                  >
                    {locLabel}
                  </button>
                );
              })}
            </div>

            <div className="s14-modal-footer">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label={isEs ? "Cerrar" : "Close"}
                className="s14-modal-close-btn"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide14MedicalCareScreen;
