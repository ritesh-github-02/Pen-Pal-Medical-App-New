"use client";

import React, { useState, useRef, useEffect } from "react";

export interface Slide2MedicineNamingScreenProps {
  isSpanish?: boolean;
  selected?: string;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
  variant?: "auto" | "desktop" | "mobile";
}

// Option order matches the reference image exactly:
// Penicillin → "Pink medicine" → Amoxicillin → Amoxicillin Clavulanate → Augmentin
export const MEDICINE_OPTIONS_DISPLAY = [
  { value: "Penicillin", labelEn: "Penicillin", labelEs: "Penicilina" },
  { value: "Pink medicine", labelEn: "\u201cPink medicine\u201d", labelEs: "\u201cMedicina rosa\u201d" },
  { value: "Amoxicillin", labelEn: "Amoxicillin", labelEs: "Amoxicilina" },
  { value: "Amoxicillin Clavulanate", labelEn: "Amoxicillin Clavulanate", labelEs: "Amoxicilina Clavulanato" },
  { value: "Augmentin", labelEn: "Augmentin", labelEs: "Augmentin" },
];

// ─── Desktop stage dimensions (matches reference tablet aspect 827x577 = 1.433) ──
const STAGE_W = 760;
const STAGE_H = 530;

// ─── Shared Mobile CSS Helper ────────────────────────────────────────────────
const mobileLayoutCSS = (scope: string) => `
  ${scope} {
    align-items: flex-start;
    overflow-y: auto;
    background-color: #fcfdf3;
  }
  ${scope} .s2-stage {
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
    padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px)) 14px !important;
    gap: 10px !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    background-color: transparent !important;
  }
  ${scope} .s2-banner {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    min-height: auto !important;
    border-radius: 16px !important;
    padding: 10px 14px !important;
    margin: 0 auto !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s2-heading {
    font-size: 15px !important;
    line-height: 1.35 !important;
    text-align: left !important;
  }
  ${scope} .s2-middle-row {
    display: flex !important;
    flex-direction: row !important;
    align-items: flex-end !important;
    justify-content: center !important;
    gap: 18px !important;
    width: 100% !important;
    max-width: 360px !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s2-nurse-wrap {
    position: static !important;
    width: 96px !important;
    height: 184px !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s2-bottle-wrap {
    position: static !important;
    width: 78px !important;
    height: 126px !important;
    margin-bottom: 12px !important;
    flex-shrink: 0 !important;
  }
  ${scope} .s2-checklist {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    flex-shrink: 0 !important;
    gap: 6px !important;
  }
  ${scope} .s2-option-row {
    width: 100% !important;
    height: auto !important;
    min-height: 40px !important;
    padding: 6px 12px !important;
    border-radius: 10px !important;
    border: 1.5px solid rgba(35, 111, 122, 0.2) !important;
    background-color: rgba(255, 255, 255, 0.85) !important;
    box-sizing: border-box !important;
  }
  ${scope} .s2-checkbox-box {
    width: 22px !important;
    height: 22px !important;
  }
  ${scope} .s2-option-text {
    font-size: 15px !important;
    white-space: normal !important;
  }
  ${scope} .s2-bottom-bar {
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
  ${scope} .s2-audio-controls {
    position: static !important;
    order: 1 !important;
    margin: 0 auto !important;
  }
  ${scope} .s2-nav-center {
    position: static !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }
  ${scope} .s2-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }
  ${scope} .s2-captions-panel {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    bottom: auto !important;
  }
`;

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  /* ---- Accessibility ---- */
  .s2-sr-only {
    position: absolute !important;
    width: 1px !important; height: 1px !important;
    padding: 0 !important; margin: -1px !important;
    overflow: hidden !important; clip: rect(0,0,0,0) !important;
    white-space: nowrap !important; border: 0 !important;
  }
  .s2-root button:focus-visible,
  .s2-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 3px !important;
  }
  .s2-heading:focus, .s2-heading:focus-visible { outline: none !important; }

  /* ---- Root ---- */
  .s2-root {
    position: relative;
    display: flex;
    flex: 1 1 0%;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: transparent;
    font-family: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    overflow: hidden;
    box-sizing: border-box;
  }

  /* ---- Scale-locked desktop stage (transparent so outer cream shell shows seamlessly) ---- */
  .s2-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  /* ---- Yellow banner (top-left, rounded rectangle) ---- */
  .s2-banner {
    position: absolute;
    top: 26px;
    left: 52px;
    width: 496px;
    background-color: #feff9f;
    border: 2px solid #2b7a85;
    border-radius: 22px;
    box-shadow: 0 3px 6px rgba(35, 111, 122, 0.2);
    padding: 14px 24px;
    box-sizing: border-box;
    z-index: 10;
  }
  .s2-heading {
    margin: 0;
    font-size: 21px;
    line-height: 1.42;
    font-weight: 700;
    color: #1a1f1e;
    letter-spacing: -0.01em;
  }

  /* On desktop, middle-row is transparent to layout so Nurse & Bottle position directly on .s2-stage */
  .s2-middle-row {
    display: contents;
  }

  /* ---- Nurse Anna (left, using uploaded nurse-anna-s2.png) ---- */
  .s2-nurse-wrap {
    position: absolute;
    left: 88px;
    top: 144px;
    width: 125px;
    height: 274px;
    pointer-events: none;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 5;
  }
  .s2-nurse-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
  }

  /* ---- Pink Amoxicillin Bottle (center, aligned with checklist top & bottom) ---- */
  .s2-bottle-wrap {
    position: absolute;
    left: 237px;
    top: 184px;
    width: 99px;
    height: 176px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }
  .s2-bottle-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
  }

  /* ---- Checklist (right, top & bottom aligned flush with bottle) ---- */
  .s2-checklist {
    position: absolute;
    left: 348px;
    top: 180px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 1px;
    z-index: 5;
  }
  .s2-option-row {
    display: flex;
    align-items: center;
    gap: 14px;
    height: 36px;
    min-height: 36px;
    cursor: pointer;
    user-select: none;
    padding: 0 4px;
    border-radius: 6px;
    transition: background-color 0.12s ease;
  }
  .s2-option-row:hover {
    background-color: rgba(189, 223, 216, 0.28);
  }
  .s2-option-row:focus-within {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s2-checkbox-box {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    border-radius: 2px;
    border: 1.8px solid #3c7c87;
    background-color: #dbe0e3;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    box-sizing: border-box;
  }
  .s2-checkbox-box.checked {
    background-color: #144e57;
    border-color: #143833;
    color: #fff;
  }
  .s2-option-text {
    font-size: 21px;
    line-height: 1.2;
    font-weight: 500;
    color: #1d2423;
    white-space: nowrap;
  }
  .s2-option-text.checked {
    font-weight: 700;
    color: #0a1c1a;
  }

  /* ---- Bottom bar ---- */
  .s2-bottom-bar {
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

  /* Back + Next centered with wide spacing like reference */
  .s2-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s2-btn-nav {
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
  }
  .s2-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0,0,0,0.12); }
  .s2-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s2-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s2-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s2-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s2-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s2-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  /* ---- Audio controls — bottom-right ---- */
  .s2-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s2-audio-btn {
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
  .s2-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  /* Captions panel */
  .s2-captions-panel {
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.18);
    z-index: 30;
  }
  .s2-captions-tag {
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
  .s2-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

  /* ================================================================
     MOBILE LAYOUT  (is-mobile class  OR  ≤767px viewport)
     ================================================================ */
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s2-root:not(.is-desktop)")}
  }
  ${mobileLayoutCSS(".s2-root.is-mobile")}

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
`;

export function Slide2MedicineNamingScreen({
  isSpanish = false,
  selected,
  onSelect,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide2_naming",
  locale,
  transcriptText,
  variant = "auto",
}: Slide2MedicineNamingScreenProps) {
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>("");
  const [scale, setScale] = useState<number>(1);

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const activeLocale = locale || (isSpanish ? "es" : "en");
  const isEs = activeLocale.startsWith("es") || isSpanish;

  const isMobile = variant === "mobile";
  const isDesktop = variant === "desktop";
  const variantClass = isMobile ? " is-mobile" : isDesktop ? " is-desktop" : "";

  // Scale-locked stage — proportionally fills the tablet container on desktop
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;

    const update = () => {
      if (variant === "mobile" || (variant !== "desktop" && window.innerWidth < 768)) {
        setScale(1);
        return;
      }
      const { clientWidth: w, clientHeight: h } = root;
      if (!w || !h) return;
      const safeW = Math.max(0, w - 8);
      const safeH = Math.max(0, h - 8);
      setScale(Math.min(safeW / STAGE_W, safeH / STAGE_H));
    };

    update();
    const obs = new ResizeObserver(update);
    obs.observe(root);
    window.addEventListener("resize", update);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [variant]);

  // Focus heading on mount (WCAG 2.4.3)
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

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

  const nextEnabled = !!selected && !loading;

  const handleOptionSelect = (val: string, label: string) => {
    onSelect(val);
    setLiveAnnouncement(isEs ? `Seleccionado: ${label}` : `Selected: ${label}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      const ni = (currentIndex + 1) % MEDICINE_OPTIONS_DISPLAY.length;
      const opt = MEDICINE_OPTIONS_DISPLAY[ni];
      handleOptionSelect(opt.value, isEs ? opt.labelEs : opt.labelEn);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      const pi = (currentIndex - 1 + MEDICINE_OPTIONS_DISPLAY.length) % MEDICINE_OPTIONS_DISPLAY.length;
      const opt = MEDICINE_OPTIONS_DISPLAY[pi];
      handleOptionSelect(opt.value, isEs ? opt.labelEs : opt.labelEn);
    }
  };

  const effectiveTranscript =
    transcriptText ||
    (isEs
      ? "Seleccione cómo llama a la penicilina. Tiene muchos nombres diferentes."
      : "Select what you call penicillin. It has lots of different names!");

  const effectiveAudioSrc =
    audioSrc || (isEs ? "/audio/exported/slide2_naming_es.mp3" : "/audio/exported/slide2_naming_en.mp3");

  // Sync audio element events
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
      ref={rootRef}
      id="slide-content"
      role="region"
      aria-roledescription="slide"
      aria-labelledby="slide2-heading"
      lang={isEs ? "es" : "en"}
      className={`s2-root${variantClass}`}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* SR live region */}
      <div className="s2-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden audio */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s2-sr-only"
        aria-hidden="true"
      />

      {/* ── Scale-locked stage ── */}
      <div
        className="s2-stage"
        style={!isMobile ? { transform: `scale(${scale})` } : undefined}
      >
        {/* 1. Yellow banner — top-left rounded rectangle */}
        <div className="s2-banner">
          <h1 id="slide2-heading" ref={headingRef} tabIndex={-1} className="s2-heading">
            {isEs
              ? "Seleccione cómo llama a la penicilina. ¡Tiene muchos nombres diferentes!"
              : "Select what you call penicillin. It has lots of different names!"}
          </h1>
        </div>

        {/* 2. Nurse Anna (left) + Amoxicillin Bottle (center) */}
        <div className="s2-middle-row">
          <div className="s2-nurse-wrap" aria-hidden="true">
            <img
              src="/images/nurse-anna-s2.png"
              alt=""
              className="s2-nurse-img"
              draggable={false}
            />
          </div>

          <div className="s2-bottle-wrap">
            <img
              src="/images/amoxicillin-bottle.png"
              alt={isEs ? "Frasco de medicina rosa" : "Pink medicine bottle"}
              className="s2-bottle-img"
              draggable={false}
            />
          </div>
        </div>

        {/* 3. Checklist — right, flush with bottle top & bottom */}
        <div
          className="s2-checklist"
          role="radiogroup"
          aria-label={isEs ? "Seleccione el nombre que usa para el medicamento" : "Select what you call the medicine"}
        >
          {MEDICINE_OPTIONS_DISPLAY.map((opt, idx) => {
            const isChecked = selected === opt.value;
            const label = isEs ? opt.labelEs : opt.labelEn;
            return (
              <label key={opt.value} className="s2-option-row" onKeyDown={(e) => handleKeyDown(e, idx)}>
                <input
                  type="radio"
                  name="medicine_selection"
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => handleOptionSelect(opt.value, label)}
                  className="s2-sr-only"
                />
                <span className={`s2-checkbox-box ${isChecked ? "checked" : ""}`} aria-hidden="true">
                  {isChecked && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className={`s2-option-text ${isChecked ? "checked" : ""}`}>{label}</span>
              </label>
            );
          })}
        </div>

        {/* Captions panel */}
        {showCaptions && (
          <div
            className="s2-captions-panel"
            role="region"
            aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
          >
            <span className="s2-captions-tag" aria-hidden="true">CC</span>
            <p className="s2-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        {/* 4. Bottom bar */}
        <footer
          className="s2-bottom-bar"
          role="toolbar"
          aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
        >
          <nav className="s2-nav-center" aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="s2-btn-nav s2-btn-back"
              aria-label={isEs ? "Volver a la diapositiva anterior" : "Back to previous slide"}
            >
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!nextEnabled}
              aria-disabled={!nextEnabled}
              className="s2-btn-nav s2-btn-next"
              aria-label={isEs ? "Continuar a la siguiente diapositiva" : "Next slide"}
            >
              {loading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s2-audio-controls">
            <button
              type="button"
              className="s2-audio-btn"
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
              className="s2-audio-btn"
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

export default Slide2MedicineNamingScreen;
