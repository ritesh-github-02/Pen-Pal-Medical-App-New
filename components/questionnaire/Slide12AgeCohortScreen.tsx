"use client";

import React, { useRef, useEffect, useState } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface AgeCohortOption {
  value: string;
  titleEn: string;
  subtitleEn: string;
  titleEs: string;
  subtitleEs: string;
  imageSrc: string;
  altEn: string;
  altEs: string;
}

export const AGE_COHORTS: AgeCohortOption[] = [
  {
    value: "Baby (0-12 months)",
    titleEn: "Baby",
    subtitleEn: "(0-12 months)",
    titleEs: "Bebé",
    subtitleEs: "(0-12 meses)",
    imageSrc: "/images/cohorts/baby.png?v=8",
    altEn: "Baby aged 0 to 12 months",
    altEs: "Bebé de 0 a 12 meses",
  },
  {
    value: "Toddler (1-3 years)",
    titleEn: "Toddler",
    subtitleEn: "(1-3 years)",
    titleEs: "Niño pequeño",
    subtitleEs: "(1-3 años)",
    imageSrc: "/images/cohorts/toddler.png?v=8",
    altEn: "Toddler aged 1 to 3 years",
    altEs: "Niño pequeño de 1 a 3 años",
  },
  {
    value: "School-aged (4-12 years)",
    titleEn: "School-aged",
    subtitleEn: "(4-12 years)",
    titleEs: "Edad escolar",
    subtitleEs: "(4-12 años)",
    imageSrc: "/images/cohorts/school-aged.png?v=8",
    altEn: "School-aged child aged 4 to 12 years",
    altEs: "Niño en edad escolar de 4 a 12 años",
  },
  {
    value: "Teen (13-17 years)",
    titleEn: "Teen",
    subtitleEn: "(13-17 years)",
    titleEs: "Adolescente",
    subtitleEs: "(13-17 años)",
    imageSrc: "/images/cohorts/teen.png?v=8",
    altEn: "Teenager aged 13 to 17 years",
    altEs: "Adolescente de 13 a 17 años",
  },
  {
    value: "Adult (18+)",
    titleEn: "Adult",
    subtitleEn: "(18+)",
    titleEs: "Adulto",
    subtitleEs: "(18+)",
    imageSrc: "/images/cohorts/adult.png?v=8",
    altEn: "Adult aged 18 and older",
    altEs: "Adulto de 18 años o más",
  },
];

// ============================================================================
// Shared Mobile Layout CSS
// ============================================================================
const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s12-stage {
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
  ${scope} .s12-heading {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    font-size: 18px !important;
    line-height: 1.35 !important;
    text-align: center !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s12-cohorts-grid {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 12px 14px !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s12-cohort-col {
    flex: 0 0 46% !important;
    max-width: 47% !important;
  }
  ${scope} .s12-cohort-img-wrap {
    height: 84px !important;
    margin-bottom: 6px !important;
  }
  ${scope} .s12-cohort-btn {
    min-height: 48px !important;
    padding: 6px 8px !important;
  }
  ${scope} .s12-bottom-bar {
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
  ${scope} .s12-audio-controls {
    position: static !important;
    order: 1 !important;
    margin: 0 auto !important;
  }
  ${scope} .s12-nav-center {
    position: static !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }
  ${scope} .s12-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }
  ${scope} .s12-captions-panel {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    bottom: auto !important;
  }
`;

// ============================================================================
// Styles
// ============================================================================
const SLIDE12_CSS = `
  .s12-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s12-root button:focus-visible,
  .s12-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s12-heading:focus, .s12-heading:focus-visible { outline: none !important; }

  .s12-root,
  .s12-root *,
  .s12-root *::before,
  .s12-root *::after {
    box-sizing: border-box;
  }

  /* ---- Root ---- */
  .s12-root {
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
  .s12-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- 1. Left-aligned Bold Heading ---- */
  .s12-heading {
    position: absolute;
    left: 60px;
    top: 76px;
    width: 610px;
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

  /* ---- 2. Five Age Cohort Columns ---- */
  .s12-cohorts-grid {
    position: absolute;
    left: 48px;
    top: 178px;
    width: 664px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    z-index: 5;
  }

  .s12-cohort-col {
    flex: 1 1 0%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    cursor: pointer;
    user-select: none;
  }

  .s12-cohort-img-wrap {
    width: 100%;
    height: 152px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 14px;
    pointer-events: none;
  }

  .s12-cohort-img {
    height: 100%;
    width: auto;
    max-width: 100%;
    object-fit: contain;
    object-position: bottom center;
    display: block;
    transition: transform 0.18s ease;
  }
  .s12-cohort-col:hover .s12-cohort-img {
    transform: translateY(-3px);
  }

  /* Dark Teal Buttons matching Reference */
  .s12-cohort-btn {
    width: 100%;
    min-height: 50px;
    border-radius: 7px;
    padding: 6px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: pointer;
    background-color: #2b7783;
    border: 1.5px solid #2b7783;
    color: #ffffff;
    box-shadow: 0 3px 5px rgba(0, 0, 0, 0.16);
    transition: all 0.16s ease;
    font-family: inherit;
  }
  .s12-cohort-btn:hover {
    background-color: #23646f;
    border-color: #1c5249;
    transform: translateY(-1px);
  }
  .s12-cohort-btn:active { transform: scale(0.98); }

  /* Selected State: Yellow with dark text & teal border */
  .s12-cohort-btn--selected {
    background-color: #ffd41d !important;
    border-color: #143833 !important;
    color: #142724 !important;
    box-shadow: 0 4px 8px rgba(10, 40, 35, 0.24) !important;
  }
  .s12-cohort-btn--selected:hover {
    background-color: #f7ca12 !important;
  }

  .s12-cohort-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.25;
    color: inherit;
  }
  .s12-cohort-subtitle {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.25;
    color: inherit;
    opacity: 0.95;
  }

  /* ---- 3. Bottom Bar ---- */
  .s12-bottom-bar {
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
  .s12-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s12-btn-nav {
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
  .s12-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12); }
  .s12-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s12-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s12-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s12-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s12-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s12-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  .s12-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s12-audio-btn {
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
  .s12-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  .s12-captions-panel {
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
  .s12-captions-tag {
    background: #fdee8e;
    color: #1a2624;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .s12-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s12-root:not(.is-desktop)")}
  }
  ${mobileLayoutCSS(".s12-root.is-mobile")}

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export interface Slide12AgeCohortScreenProps {
  isSpanish?: boolean;
  selected?: string;
  medicationName?: string;
  onSelect: (val: string) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  transcriptText?: string;
  stepId?: string;
  locale?: string;
  variant?: "auto" | "desktop" | "mobile";
  navProps?: {
    onNext: (explicitAnswer?: any) => void;
    onBack: () => void;
    loading?: boolean;
    headingRef?: React.RefObject<HTMLHeadingElement | null>;
  };
}

export function Slide12AgeCohortScreen({
  isSpanish = false,
  selected,
  medicationName,
  onSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  transcriptText,
  stepId = "screen6_2_timing",
  locale,
  variant = "auto",
  navProps,
}: Slide12AgeCohortScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const slideTitleRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [scale, setScale] = useState<number>(1);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const variantClass = isMobile ? " is-mobile" : isDesktop ? " is-desktop" : "";

  useEffect(() => {
    const timer = setTimeout(() => slideTitleRef.current?.focus({ preventScroll: true }), 50);
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
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions) {
        setShowCaptions(false);
        setLiveAnnouncement(isEs ? "Subtítulos ocultados" : "Closed captions dismissed");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCaptions, isEs]);

  const rawTitle = isEs
    ? "¿Qué edad tenía su hijo cuando tuvo una reacción a [name]?"
    : "How old was your child when they had a reaction to [name]?";
  const titleText = resolveMedicineToken(rawTitle, medicationName, isEs);

  const effectiveAudioSrc =
    audioSrc || (isEs ? "/audio/es/step-6-2.mp3" : "/audio/en/step-6-2.mp3");
  const effectiveTranscript = transcriptText || titleText;

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
      nextIndex = (index + 1) % AGE_COHORTS.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nextIndex = (index - 1 + AGE_COHORTS.length) % AGE_COHORTS.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = AGE_COHORTS.length - 1;
    }
    if (nextIndex !== -1) {
      onSelect(AGE_COHORTS[nextIndex].value);
      buttonRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s12-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide12-title"
      lang={isEs ? "es" : "en"}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE12_CSS }} />

      <div className="s12-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s12-sr-only"
        aria-hidden="true"
      />

      {/* ── Scale-locked desktop stage ── */}
      <div
        className="s12-stage"
        style={!isMobile ? { transform: `scale(${scale})` } : undefined}
      >
        <h1 ref={slideTitleRef} tabIndex={-1} id="slide12-title" className="s12-heading">
          {titleText}
        </h1>

        <div role="radiogroup" aria-labelledby="slide12-title" className="s12-cohorts-grid">
          {AGE_COHORTS.map((cohort, index) => {
            const isSelected = selected === cohort.value;
            const title = isEs ? cohort.titleEs : cohort.titleEn;
            const subtitle = isEs ? cohort.subtitleEs : cohort.subtitleEn;

            return (
              <div
                key={cohort.value}
                className={`s12-cohort-col${isSelected ? " s12-cohort-col--selected" : ""}`}
                onClick={() => {
                  onSelect(cohort.value);
                  buttonRefs.current[index]?.focus();
                }}
              >
                <div className="s12-cohort-img-wrap">
                  <img src={cohort.imageSrc} alt="" aria-hidden="true" className="s12-cohort-img" draggable={false} />
                </div>

                <button
                  ref={(el) => {
                    buttonRefs.current[index] = el;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected || (!selected && index === 0) ? 0 : -1}
                  aria-label={`${title} ${subtitle}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(cohort.value);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`s12-cohort-btn${isSelected ? " s12-cohort-btn--selected" : ""}`}
                >
                  <span className="s12-cohort-title">{title}</span>
                  <span className="s12-cohort-subtitle">{subtitle}</span>
                </button>
              </div>
            );
          })}
        </div>

        {showCaptions && (
          <div className="s12-captions-panel" role="region" aria-label={isEs ? "Subtítulos" : "Closed captions"}>
            <span className="s12-captions-tag" aria-hidden="true">CC</span>
            <p className="s12-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        <footer className="s12-bottom-bar" role="toolbar" aria-label="Slide navigation and media controls">
          <nav className="s12-nav-center" aria-label="Slide pagination">
            <button type="button" onClick={handleBackClick} disabled={isLoading} className="s12-btn-nav s12-btn-back">
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={handleNextClick}
              disabled={!isNextEnabled}
              aria-disabled={!isNextEnabled}
              className="s12-btn-nav s12-btn-next"
            >
              {isLoading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s12-audio-controls">
            <button type="button" className="s12-audio-btn" onClick={toggleCaptions} aria-pressed={showCaptions}
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

            <button type="button" className="s12-audio-btn" onClick={toggleAudio} aria-pressed={audioPlaying}
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
    </div>
  );
}

export default Slide12AgeCohortScreen;
