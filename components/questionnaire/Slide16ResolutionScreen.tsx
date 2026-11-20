"use client";

import React, { useState, useRef, useEffect } from "react";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface Slide16ResolutionScreenProps {
  variant?: "auto" | "desktop" | "mobile";
  isSpanish?: boolean;
  selected?: string;
  medicines?: string[];
  resolutionMedicines?: string[];
  route?: string;
  resolutionRoute?: string;
  onSelectResolution?: (val: string) => void;
  onSelect?: (val: string) => void;
  onSelectMedicines?: (meds: string[]) => void;
  onMedicinesSelect?: (meds: string[]) => void;
  onSelectRoute?: (route: string) => void;
  onRouteChange?: (route: string) => void;
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

interface ResolutionOption {
  value: string;
  labelEn: string;
  labelEs: string;
}

export const RESOLUTION_OPTIONS: ResolutionOption[] = [
  { value: "With medication", labelEn: "With medication", labelEs: "Con medicación" },
  { value: "On its own", labelEn: "On its own", labelEs: "Por sí sola" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export const MEDICATION_OPTIONS = [
  { value: "Allergy medicine (Benadryl, Zyrtec)", labelEn: "Allergy medicine\n(Benadryl, Zyrtec)", labelEs: "Medicina para la alergia\n(Benadryl, Zyrtec)" },
  { value: "Steroid medicine (Prednisone)", labelEn: "Steroid medicine\n(Prednisone)", labelEs: "Medicina esteroidea\n(Prednisona)" },
  { value: "Epinephrine (EpiPen)", labelEn: "Epinephrine\n(EpiPen)", labelEs: "Epinefrina\n(EpiPen)" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

export const ROUTE_OPTIONS = [
  { value: "Mouth", labelEn: "Mouth", labelEs: "Por la boca" },
  { value: "IV", labelEn: "IV", labelEs: "Vía intravenosa (IV)" },
  { value: "Shot", labelEn: "Shot", labelEs: "Inyección" },
  { value: "Unsure/I don't know", labelEn: "Unsure/I don't know", labelEs: "No estoy seguro/ No lo sé" },
];

function isResolutionSelected(optValue: string, currentSelected?: string): boolean {
  if (!currentSelected) return false;
  if (currentSelected === optValue) return true;
  if (optValue === "Unsure/I don't know" && currentSelected.toLowerCase().includes("unsure")) return true;
  return false;
}

const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s16-stage {
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
  ${scope} .s16-heading {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    font-size: 17.5px !important;
    line-height: 1.35 !important;
    text-align: center !important;
    margin: 0 auto !important;
  }
  ${scope} .s16-card {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    min-height: auto !important;
    padding: 16px 14px !important;
    margin: 0 auto !important;
  }
  ${scope} .s16-options-row {
    flex-direction: column !important;
    gap: 10px !important;
  }
  ${scope} .s16-option-btn {
    width: 100% !important;
    min-height: 44px !important;
    white-space: normal !important;
  }
  ${scope} .s16-nurse {
    position: static !important;
    width: 90px !important;
    height: 210px !important;
    margin: 0 auto !important;
  }
  ${scope} .s16-bottom-bar {
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 0 0 0 !important;
    width: 100% !important;
    max-width: 360px !important;
  }
  ${scope} .s16-audio-controls { position: static !important; order: 1 !important; margin: 0 auto !important; }
  ${scope} .s16-nav-center { position: static !important; order: 2 !important; transform: none !important; width: 100% !important; gap: 14px !important; justify-content: space-between !important; }
  ${scope} .s16-btn-nav { flex: 1 1 0% !important; height: 44px !important; min-height: 44px !important; font-size: 16px !important; }
  ${scope} .s16-captions-panel { position: static !important; width: 100% !important; max-width: 360px !important; bottom: auto !important; }
`;

const SLIDE16_CSS = `
  .s16-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s16-root button:focus-visible,
  .s16-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s16-heading:focus, .s16-heading:focus-visible { outline: none !important; }

  .s16-root, .s16-root *, .s16-root *::before, .s16-root *::after { box-sizing: border-box; }

  .s16-root {
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

  .s16-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Left-aligned Bold Heading ---- */
  .s16-heading {
    position: absolute;
    left: 62px;
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
  .s16-card {
    position: absolute;
    left: 62px;
    top: 152px;
    width: 476px;
    min-height: 124px;
    background-color: #8bb6b0;
    border-radius: 14px;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }

  .s16-options-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    width: 100%;
  }

  .s16-option-btn {
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
  .s16-option-btn:hover {
    background-color: #f3f9f8;
    border-color: #1c5249;
    transform: translateY(-1px);
  }
  .s16-option-btn:active { transform: scale(0.98); }

  .s16-option-btn--selected {
    background-color: #ffd41d !important;
    border-color: #1c5249 !important;
    color: #142724 !important;
    font-weight: 600;
  }

  .s16-meds-badge {
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
  .s16-meds-badge-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .s16-change-btn {
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

  /* ---- 3. Nurse Anna (Right, Hands Clasped) ---- */
  .s16-nurse {
    position: absolute;
    left: 560px;
    top: 128px;
    width: 120px;
    height: 282px;
    z-index: 6;
    user-select: none;
    pointer-events: none;
  }
  .s16-nurse img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }

  /* ---- Captions Drawer ---- */
  .s16-captions-panel {
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
  .s16-bottom-bar {
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
  .s16-nav-center {
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 54px;
  }
  .s16-btn-nav {
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
  .s16-btn-nav:active:not(:disabled) { transform: scale(0.97); }
  .s16-btn-back { background-color: #c6dce0; }
  .s16-btn-back:hover:not(:disabled) { background-color: #b4d1d6; }
  .s16-btn-next { background-color: #f9fa9a; }
  .s16-btn-next:hover:not(:disabled) { background-color: #f5f77a; }
  .s16-btn-nav:disabled { opacity: 0.48; cursor: not-allowed; }

  .s16-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .s16-icon-btn {
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
  .s16-icon-btn:hover { opacity: 0.82; transform: scale(1.04); }
  .s16-icon-btn:active { transform: scale(0.95); }
  .s16-icon-btn[aria-pressed="true"] { background-color: rgba(43, 122, 133, 0.12); }

  /* ---- Modals 17 & 18 ---- */
  .s16-modal-overlay {
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
  .s16-modal17-card,
  .s16-modal18-card {
    background-color: #f7f4ec;
    border: 1.5px solid #d8d2c2;
    border-radius: 18px;
    padding: 1.5rem 1.65rem 1.25rem 1.65rem;
    max-width: 530px;
    width: 100%;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: s16FadeIn 0.18s ease-out;
  }
  @keyframes s16FadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .s16-modal-heading {
    font-size: 1.12rem;
    font-weight: 700;
    line-height: 1.3;
    color: #142724;
    margin: 0;
    text-align: center;
    outline: none;
  }
  .s16-modal17-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    width: 100%;
  }
  .s16-med-btn,
  .s16-route-btn {
    min-height: 48px;
    padding: 0.55rem 0.75rem;
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
    white-space: pre-line;
    font-family: inherit;
  }
  .s16-med-btn:hover,
  .s16-route-btn:hover {
    background-color: #f2f8f6;
    border-color: #1c5249;
    transform: translateY(-1px);
  }
  .s16-med-btn--selected,
  .s16-route-btn--selected {
    background-color: #ffd41d !important;
    border-color: #1c5249 !important;
    color: #142724 !important;
  }
  .s16-modal17-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.25rem;
  }
  .s16-more-questions-btn {
    background-color: #f9fa9a;
    border: 1.5px solid #2b7a85;
    border-radius: 9999px;
    padding: 0.5rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 700;
    color: #142724;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }
  .s16-more-questions-btn:hover { background-color: #f5f77a; }

  .s16-modal18-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.7rem;
    width: 100%;
  }
  .s16-route-btn {
    flex: 1 1 100px;
  }

  ${mobileLayoutCSS(".s16-root.is-mobile")}
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s16-root:not(.is-desktop)")}
  }
`;

export function Slide16ResolutionScreen({
  variant = "auto",
  isSpanish = false,
  selected,
  medicines,
  resolutionMedicines,
  route,
  resolutionRoute,
  onSelectResolution,
  onSelect,
  onSelectMedicines,
  onMedicinesSelect,
  onSelectRoute,
  onRouteChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  transcriptText,
  stepId,
  locale,
  navProps,
}: Slide16ResolutionScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const modal17HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const modal18HeadingRef = useRef<HTMLHeadingElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [captionsOpen, setCaptionsOpen] = useState(false);

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish ? "/audio/es/step-6-4b.mp3" : "/audio/en/step-6-4b.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "¿Cómo desapareció la reacción de su hijo?"
      : "How did your child's reaction go away?");

  const initialMeds = medicines ?? resolutionMedicines ?? [];
  const initialRoute = route ?? resolutionRoute;
  const handleResolution = onSelectResolution ?? onSelect ?? (() => {});
  const handleMedicines = onSelectMedicines ?? onMedicinesSelect;
  const handleRoute = onSelectRoute ?? onRouteChange;

  const [modal17Open, setModal17Open] = useState(false);
  const [modal18Open, setModal18Open] = useState(false);

  const [activeMeds, setActiveMeds] = useState<string[]>(initialMeds);
  const [activeRoute, setActiveRoute] = useState<string | undefined>(initialRoute);

  useEffect(() => {
    if (medicines !== undefined || resolutionMedicines !== undefined) {
      setActiveMeds(medicines ?? resolutionMedicines ?? []);
    }
  }, [medicines, resolutionMedicines]);

  useEffect(() => {
    if (route !== undefined || resolutionRoute !== undefined) {
      setActiveRoute(route ?? resolutionRoute);
    }
  }, [route, resolutionRoute]);

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

  // Trap focus & Escape for Modal 17 (Medicines)
  useEffect(() => {
    if (!modal17Open) return;
    const timer = setTimeout(() => modal17HeadingRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal17Open(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal17Open]);

  // Trap focus & Escape for Modal 18 (Route)
  useEffect(() => {
    if (!modal18Open) return;
    const timer = setTimeout(() => modal18HeadingRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal18Open(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modal18Open]);

  const handleMainOption = (val: string) => {
    handleResolution(val);
    if (val === "With medication") {
      setTimeout(() => setModal17Open(true), 150);
    } else {
      setActiveMeds([]);
      setActiveRoute(undefined);
      if (handleMedicines) handleMedicines([]);
      if (handleRoute) handleRoute("");
    }
  };

  const toggleMed = (val: string) => {
    let updated: string[];
    if (val === "Unsure/I don't know") {
      updated = activeMeds.includes("Unsure/I don't know") ? [] : ["Unsure/I don't know"];
    } else {
      const withoutUnsure = activeMeds.filter((m) => m !== "Unsure/I don't know");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((m) => m !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveMeds(updated);
    if (handleMedicines) handleMedicines(updated);
  };

  const handleRouteSelect = (val: string) => {
    setActiveRoute(val);
    if (handleRoute) handleRoute(val);
    setModal18Open(false);
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
      nextIndex = (index + 1) % RESOLUTION_OPTIONS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + RESOLUTION_OPTIONS.length) % RESOLUTION_OPTIONS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = RESOLUTION_OPTIONS.length - 1;
    }

    if (nextIndex !== -1) {
      const nextOpt = RESOLUTION_OPTIONS[nextIndex];
      handleMainOption(nextOpt.value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  const medsSummary = activeMeds.length > 0
    ? activeMeds.map((m) => m.split(" (")[0]).join(", ")
    : "";

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <div id="slide-content" ref={rootRef} className={`s16-root${variantClass}`} data-step-id={stepId || "screen6_4b_resolution_type"}>
      <style>{SLIDE16_CSS}</style>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className="s16-stage"
        style={variant === "mobile" ? undefined : { transform: `scale(${scale})` }}
      >
        {/* 1. Heading */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          id="slide16-title"
          className="s16-heading"
        >
          {isSpanish
            ? "¿Cómo desapareció la reacción de su hijo?"
            : "How did your child's reaction go away?"}
        </h1>

        {/* 2. Sage-Teal Card */}
        <div className="s16-card">
          <div
            role="radiogroup"
            aria-labelledby="slide16-title"
            className="s16-options-row"
          >
            {RESOLUTION_OPTIONS.map((opt, index) => {
              const isChecked = isResolutionSelected(opt.value, selected);
              const label = isSpanish ? opt.labelEs : opt.labelEn;

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
                  className={`s16-option-btn${isChecked ? " s16-option-btn--selected" : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {selected === "With medication" && (activeMeds.length > 0 || activeRoute) && (
            <div className="s16-meds-badge">
              <span className="s16-meds-badge-text">
                <strong>{isSpanish ? "Medicamento: " : "Meds: "}</strong>
                {medsSummary || (isSpanish ? "Seleccionado" : "Selected")}
                {activeRoute && <span> ({activeRoute})</span>}
              </span>
              <button
                type="button"
                onClick={() => setModal17Open(true)}
                className="s16-change-btn"
              >
                {isSpanish ? "Cambiar" : "Change"}
              </button>
            </div>
          )}
        </div>

        {/* 3. Nurse Anna (Right, Hands Clasped) */}
        <div className="s16-nurse" aria-hidden="true">
          <img
            src="/images/nurse-anna-s15.png?v=6"
            alt=""
            draggable={false}
          />
        </div>

        {/* Captions Drawer */}
        {captionsOpen && (
          <div
            className="s16-captions-panel"
            role="region"
            aria-label={isSpanish ? "Subtítulos de audio" : "Audio captions"}
          >
            {effectiveTranscript}
          </div>
        )}

        {/* 4. Unified Bottom Bar */}
        <div className="s16-bottom-bar">
          <div className="s16-nav-center">
            <button
              type="button"
              onClick={handleBackClick}
              disabled={isLoading}
              className="s16-btn-nav s16-btn-back"
              aria-label={isSpanish ? "Atrás" : "Back"}
            >
              {isSpanish ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNextClick}
              disabled={!isNextEnabled}
              className="s16-btn-nav s16-btn-next"
              aria-label={isSpanish ? "Siguiente" : "Next"}
            >
              {isSpanish ? "Siguiente" : "Next"}
            </button>
          </div>

          <div className="s16-audio-controls">
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
              className="s16-icon-btn"
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
              className="s16-icon-btn"
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

      {/* MODAL 17: Medication Selection */}
      {modal17Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-17-heading"
          className="s16-modal-overlay"
          onClick={() => {
            if (handleMedicines) handleMedicines(activeMeds);
            setModal17Open(false);
          }}
        >
          <div className="s16-modal17-card" onClick={(e) => e.stopPropagation()}>
            <h2
              id="modal-17-heading"
              ref={modal17HeadingRef}
              tabIndex={-1}
              className="s16-modal-heading"
            >
              {isSpanish
                ? "¿Qué medicamento le dieron a su hijo para la reacción?"
                : "What medicine was given to your child for the reaction?"}
            </h2>

            <div className="s16-modal17-grid">
              {MEDICATION_OPTIONS.map((opt) => {
                const isChecked = activeMeds.includes(opt.value);
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="checkbox"
                    aria-checked={isChecked}
                    onClick={() => toggleMed(opt.value)}
                    className={`s16-med-btn${isChecked ? " s16-med-btn--selected" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="s16-modal17-footer">
              <button
                type="button"
                onClick={() => {
                  setModal17Open(false);
                  setTimeout(() => setModal18Open(true), 150);
                }}
                className="s16-more-questions-btn"
              >
                <span>{isSpanish ? "Más preguntas >>" : "More Questions >>"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 18: Route Administered */}
      {modal18Open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-18-heading"
          className="s16-modal-overlay"
          onClick={() => {
            if (activeRoute && handleRoute) handleRoute(activeRoute);
            setModal18Open(false);
          }}
        >
          <div className="s16-modal18-card" onClick={(e) => e.stopPropagation()}>
            <h2
              id="modal-18-heading"
              ref={modal18HeadingRef}
              tabIndex={-1}
              className="s16-modal-heading"
            >
              {isSpanish
                ? "¿Cómo recibió su hijo el medicamento?"
                : "Did your child receive the medicine by:"}
            </h2>

            <div className="s16-modal18-row">
              {ROUTE_OPTIONS.map((opt) => {
                const isChecked = activeRoute === opt.value;
                const label = isSpanish ? opt.labelEs : opt.labelEn;

                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isChecked}
                    onClick={() => handleRouteSelect(opt.value)}
                    className={`s16-route-btn${isChecked ? " s16-route-btn--selected" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Slide16ResolutionScreen;
