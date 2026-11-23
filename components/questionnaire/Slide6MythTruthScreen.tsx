"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resolveMedicineToken } from "@/lib/token-engine";

export interface Slide6MythTruthScreenProps {
  isSpanish?: boolean;
  medicationName?: string;
  variant?: "auto" | "desktop" | "mobile";
  revealedCards?: number[];
  onRevealedChange?: (revealed: number[]) => void;
  onNext?: () => void;
  onBack?: () => void;
  loading?: boolean;
  audioSrc?: string;
  stepId?: string;
  locale?: string;
  transcriptText?: string;
}

/** Fixed design stage, scaled to fit the tablet frame (matches reference tablet aspect 827x577 = 1.433). */
const STAGE_W = 760;
const STAGE_H = 530;

interface MythTruthItem {
  id: number;
  mythEn: string;
  mythEs: string;
  truthEn: string;
  truthEs: string;
}

const MYTHS: MythTruthItem[] = [
  {
    id: 1,
    mythEn:
      "Myth 1 - If a child gets a rash when taking [name], it means they are allergic to [name].",
    mythEs:
      "Mito 1 - Si un niño tiene sarpullido al tomar [name], significa que es alérgico a [name].",
    truthEn:
      "Truth - A rash does not always mean an allergy. Rashes are common in kids, especially when they are sick. The underlying illness may have caused the rash.",
    truthEs:
      "Verdad - Un sarpullido no siempre significa alergia. Los sarpullidos son comunes en los niños, especialmente cuando están enfermos. La enfermedad subyacente puede haber causado el sarpullido.",
  },
  {
    id: 2,
    mythEn:
      "Myth 2 - If a child gets a belly ache or has diarrhea while taking [name], it means they are allergic to [name].",
    mythEs:
      "Mito 2 - Si un niño tiene dolor de estómago o diarrea mientras toma [name], significa que es alérgico a [name].",
    truthEn: "Truth - Belly aches and diarrhea are common side effects of antibiotics.",
    truthEs: "Verdad - Los dolores de estómago y la diarrea son efectos secundarios comunes de los antibióticos.",
  },
  {
    id: 3,
    mythEn: "Myth 3 - If a parent is allergic to penicillin, their child will be too.",
    mythEs: "Mito 3 - Si uno de los padres es alérgico a la penicilina, su hijo también lo será.",
    truthEn: "Truth - A penicillin allergy is not passed down from a parent to child.",
    truthEs: "Verdad - La alergia a la penicilina no se transmite de padres a hijos.",
  },
  {
    id: 4,
    mythEn: "Myth 4 - If a child has a [name] allergy, they will always have it.",
    mythEs: "Mito 4 - Si un niño tiene alergia a [name], siempre la tendrá.",
    truthEn: "Truth - A child may outgrow their allergy to [name].",
    truthEs: "Verdad - Un niño puede superar su alergia a [name].",
  },
];

const TITLE_EN =
  "Why are so many kids thought to have a penicillin allergy when they don't? Click each box to reveal the truth!";
const TITLE_ES =
  "¿Por qué se piensa que tantos niños tienen alergia a la penicilina cuando no es así? ¡Haga clic en cada cuadro para revelar la verdad!";

/** The "Myth 1 -" / "Truth -" prefixes are already shown by the status tag. */
const stripPrefix = (text: string) =>
  text
    .replace(/^(myth|mito)\s*\d+\s*[-–—:]\s*/i, "")
    .replace(/^(truth|verdad)\s*[-–—:]\s*/i, "");

/**
 * Stacked phone layout. Declared once and reused for both the media query and
 * the explicit `variant="mobile"` mode instead of duplicating the rules.
 */
const mobileLayout = (scope: string) => `
  ${scope} {
    height: 100dvh !important;
    max-height: 100dvh !important;
    min-height: 0 !important;
    flex: 1 1 auto !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    padding: clamp(0.75rem, 3vw, 1.25rem) clamp(0.75rem, 3.5vw, 1.25rem) calc(clamp(0.75rem, 3vw, 1.25rem) + env(safe-area-inset-bottom, 0px)) clamp(0.75rem, 3.5vw, 1.25rem) !important;
    gap: clamp(0.625rem, 2vw, 1rem) !important;
    box-sizing: border-box !important;
  }
  ${scope} .s6-stage {
    order: 1 !important;
    position: relative !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    flex: 1 0 auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    align-items: stretch !important;
    transform: none !important;
    gap: clamp(0.625rem, 2vw, 1rem) !important;
    box-sizing: border-box !important;
    overflow: visible !important;
  }
  ${scope} .s6-heading {
    width: 100% !important;
    font-size: clamp(1.1875rem, 3vw + 0.5rem, 1.375rem) !important;
    line-height: 1.35 !important;
    margin: 0 0 clamp(0.25rem, 1vw, 0.5rem) 0 !important;
    text-align: left !important;
    text-wrap: balance !important;
    flex: 0 0 auto !important;
  }
  ${scope} .s6-cards {
    gap: clamp(0.5rem, 1.5vw + 0.2rem, 0.75rem) !important;
    flex: 1 1 auto !important;
    min-height: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    width: 100% !important;
    overflow: visible !important;
  }
  ${scope} .s6-card {
    flex: 1 0 auto !important;
    min-height: 3.5rem !important;
    max-height: none !important;
    height: auto !important;
    padding: clamp(0.625rem, 2vw + 0.25rem, 0.875rem) clamp(0.75rem, 2.5vw, 1rem) !important;
    gap: clamp(0.5rem, 2vw, 0.75rem) !important;
    border-radius: 0.75rem !important;
    box-sizing: border-box !important;
    align-items: center !important;
  }
  ${scope} .s6-card:hover {
    transform: none !important;
  }
  ${scope} .s6-card:active {
    transform: translateY(0) !important;
  }
  ${scope} .s6-card-tag {
    font-size: clamp(0.8125rem, 0.6vw + 0.7rem, 0.875rem) !important;
    padding: 0.25rem 0.625rem !important;
    flex-shrink: 0 !important;
    white-space: nowrap !important;
  }
  ${scope} .s6-card-text {
    font-size: clamp(1rem, 1.2vw + 0.75rem, 1.125rem) !important;
    line-height: 1.35 !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
    flex: 1 1 auto !important;
  }
  ${scope} .s6-card-icon {
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }
  ${scope} .s6-bottom-bar {
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
  ${scope} .s6-audio-controls {
    position: static !important;
    order: 1 !important;
    margin: 0 auto !important;
  }
  ${scope} .s6-nav-center {
    position: static !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }
  ${scope} .s6-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }
  ${scope} .s6-captions-panel {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    bottom: auto !important;
  }
  ${scope} .s6-audio {
    order: 2 !important;
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0.25rem auto 0 auto !important;
    width: 100% !important;
    z-index: 25 !important;
    flex: 0 0 auto !important;
  }
  ${scope} .s6-audio [role="toolbar"] {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 0.5rem !important;
  }
  ${scope} .slide-nav,
  ${scope} .s6-nav {
    order: 3 !important;
    position: static !important;
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    align-items: center !important;
    margin: 0.25rem auto 0 auto !important;
    width: 100% !important;
    flex: 0 0 auto !important;
    z-index: 25 !important;
  }
  ${scope} .slide-nav-container {
    display: flex !important;
    flex-wrap: wrap !important;
    margin: 0 auto !important;
    justify-content: center !important;
    align-items: center !important;
    width: 100% !important;
    gap: clamp(0.5rem, 2.5vw, 1rem) !important;
  }
  ${scope} .slide-nav-btn {
    min-width: 65px !important;
    min-height: 34px !important;
    height: 34px !important;
    padding: 0 20px !important;
    white-space: nowrap !important;
    flex: 0 1 auto !important;
    font-size: 15px !important;
  }
  @media (max-width: 22em) {
    ${scope} {
      padding: 0.625rem 0.5rem calc(0.625rem + env(safe-area-inset-bottom, 0px)) 0.5rem !important;
      gap: 0.5rem !important;
    }
    ${scope} .s6-stage {
      gap: 0.5rem !important;
    }
    ${scope} .s6-heading {
      font-size: 1.0625rem !important;
      margin: 0 0 0.25rem 0 !important;
    }
    ${scope} .s6-cards {
      gap: 0.375rem !important;
    }
    ${scope} .s6-card {
      min-height: 3rem !important;
      height: auto !important;
      flex: 1 0 auto !important;
      padding: 0.5rem 0.5rem !important;
      gap: 0.375rem !important;
      border-radius: 0.5rem !important;
    }
    ${scope} .s6-card-tag {
      padding: 0.2rem 0.4rem !important;
      font-size: 0.75rem !important;
    }
    ${scope} .s6-card-text {
      font-size: 0.9375rem !important;
      line-height: 1.3 !important;
    }
    ${scope} .slide-nav-container {
      gap: 0.375rem !important;
    }
    ${scope} .slide-nav-btn {
      min-width: 80px !important;
      height: 36px !important;
      min-height: 36px !important;
      padding: 0 16px !important;
      font-size: 14px !important;
    }
  }
`;

const SLIDE6_CSS = `
.s6-root,
.s6-root *,
.s6-root *::before,
.s6-root *::after {
  box-sizing: border-box;
}

.s6-root {
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

.s6-sr-only {
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

/* Universal Focus Indicator (WCAG 2.4.7) */
.s6-root button:focus-visible,
.s6-root [tabindex="0"]:focus-visible {
  outline: 3px solid #143833 !important;
  outline-offset: 3px !important;
}

/* ---- Scale-locked desktop stage (matches Slide 5 pixel-for-pixel) ---- */
.s6-stage {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  background-color: transparent;
  overflow: hidden;
}

/* Content wrapper keeps heading and cards perfectly clear of bottom bar */
.s6-content-wrap {
  position: absolute;
  left: 52px;
  right: 52px;
  top: 36px;
  bottom: 74px;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

/* 1. Question heading (AAA contrast: #1d2423 on #fafdf3 ≈ 15.8:1) */
.s6-heading {
  flex: none;
  margin: 0 0 16px;
  padding: 0px 7px;
  color: #1d2423;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.35;
  letter-spacing: -0.015em;
  outline: none;
}

.s6-heading:focus-visible {
  outline: 2px dashed #143833;
  outline-offset: 4px;
  border-radius: 4px;
}

/* 2. Myth / truth cards */
.s6-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-height: 0;
  overflow: visible;
}

.s6-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 52px;
  padding: 12px 20px;
  border: 1.5px solid #fdff9d;
  border-radius: 14px;
  background-color: #fdff9d;
  color: #1d2423;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: background-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.18s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.12s ease;
}

.s6-card:hover {
  background-color: #fdff9d;
  border-color: #fdff9d;
  transform: translateY(-1px);
}

.s6-card:active {
  transform: translateY(0);
}

.s6-card:focus-visible {
  outline: 3px solid #143833;
  outline-offset: 2px;
}

/* Revealed truth (AAA contrast: #232323 on #bce3dc ≈ 12.6:1) */
.s6-card--revealed {
  background-color: #2a798a;
  border-color: #2a798a;
  color:white;
}

.s6-card--revealed:hover {
  background-color: #2a798a;
  border-color: #2a798a;
}

.s6-card-tag {
  display: none;
}

.s6-card-tag--truth {
  background-color: #144e57;
}

.s6-card-text {
  flex: 1 1 auto;
  margin: 0;
  font-size: 18px; /* INCREASED from 15px */
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.01em;
  overflow-wrap: anywhere;
}

.s6-card-icon {
  display: none;
}




  /* ---- 4. Bottom Bar (matches Slides 2, 3, 4, 5, 8 pixel-for-pixel) ---- */
  .s6-bottom-bar {
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

  .s6-nav-center {
    display: flex;
    align-items: center;
    gap: 54px;
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }
  .s6-btn-nav {
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
  .s6-btn-nav:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12); }
  .s6-btn-nav:active:not(:disabled) { transform: translateY(1px); }
  .s6-btn-nav:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
  .s6-btn-back { background-color: #c6dce0; color: #142724; border-color: #3c7c87; }
  .s6-btn-back:hover:not(:disabled) { background-color: #b2cfd5; }
  .s6-btn-next { background-color: #f9fa9a; color: #142724; border-color: #3c7c87; }
  .s6-btn-next:hover:not(:disabled) { background-color: #f2f380; }

  /* Audio controls — bottom-right */
  .s6-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #2b7a85;
  }
  .s6-audio-btn {
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
  .s6-audio-btn:hover { transform: scale(1.08); opacity: 0.85; }

  /* Closed Captions Panel */
  .s6-captions-panel {
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
  .s6-captions-tag {
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
  .s6-captions-text { font-size: 13.5px; line-height: 1.4; margin: 0; font-weight: 500; color: #fff; }

@media (max-width: 767px) {
  ${mobileLayout(".s6-root:not(.is-desktop)")}
}

${mobileLayout(".s6-root.is-mobile")}

@media (prefers-reduced-motion: reduce) {
  .s6-root *,
  .s6-root *::before,
  .s6-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}
`;

export function Slide6MythTruthScreen({
  isSpanish = false,
  medicationName,
  variant = "auto",
  revealedCards,
  onRevealedChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  stepId = "slide6_myths",
  locale,
  transcriptText,
}: Slide6MythTruthScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [scale, setScale] = useState(1);
  const [ownRevealed, setOwnRevealed] = useState<number[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isEs = (locale ?? "").startsWith("es") || isSpanish;
  const activeLocale = isEs ? "es" : "en";
  const medName = medicationName?.trim();

  // Mobile detection
  useEffect(() => {
    const check = () => {
      if (variant === "mobile") setIsMobile(true);
      else if (variant === "desktop") setIsMobile(false);
      else setIsMobile(window.innerWidth < 768);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [variant]);

  // Controlled by the parent when `revealedCards` is supplied; self-managed otherwise.
  const revealed = revealedCards ?? ownRevealed;

  const text = useCallback(
    (value: string) => stripPrefix(resolveMedicineToken(value, medName || (isEs ? "la amoxicilina" : "amoxicillin"), isEs)),
    [medName, isEs]
  );

  // WCAG 2.4.3 — move reading order to the new heading.
  useEffect(() => {
    const frame = requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Scale-locked stage — proportionally fills desktop tablet frame (matches Slide 5)
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

  const title = isEs ? TITLE_ES : TITLE_EN;
  const allRevealed = MYTHS.every((item) => revealed.includes(item.id));

  const plainTranscript =
    transcriptText ||
    `${title} ${MYTHS.map((item) =>
      `${text(isEs ? item.mythEs : item.mythEn)} ${text(isEs ? item.truthEs : item.truthEn)}`
    ).join(" ")}`;

  const effectiveAudioSrc =
    audioSrc ||
    (isEs
      ? "/audio/exported/screen3_5_knowledge_test_es.mp3"
      : "/audio/exported/screen3_5_knowledge_test_en.mp3");

  // Sync HTML5 audio events & cleanup
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
    setAnnouncement(
      willPlay
        ? isEs ? "Reproduciendo narración de audio" : "Audio narration playing"
        : isEs ? "Narración de audio pausada" : "Audio narration paused"
    );
    if (willPlay) {
      if (el && el.src && !el.src.endsWith(".undefined")) {
        el.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utt = new SpeechSynthesisUtterance(plainTranscript);
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
        const utt = new SpeechSynthesisUtterance(plainTranscript);
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
    setAnnouncement(
      next
        ? isEs ? "Subtítulos mostrados" : "Closed captions displayed"
        : isEs ? "Subtítulos ocultados" : "Closed captions hidden"
    );
  };

  const toggleCard = useCallback(
    (item: MythTruthItem) => {
      const isOpen = revealed.includes(item.id);
      const next = isOpen ? revealed.filter((id) => id !== item.id) : [...revealed, item.id];
      if (onRevealedChange) {
        onRevealedChange(next);
      } else {
        setOwnRevealed(next);
      }
      setAnnouncement(
        `${isEs ? `Verdad revelada para el mito ${item.id}` : `Truth revealed for myth ${item.id}`}`
      );
    },
    [revealed, onRevealedChange, isEs]
  );

  const variantClass =
    variant === "mobile" ? " is-mobile" : variant === "desktop" ? " is-desktop" : "";

  return (
    <div
      id="slide-content"
      ref={rootRef}
      className={`s6-root${variantClass}`}
      role="region"
      aria-roledescription="slide"
      aria-labelledby="s6-heading"
      lang={activeLocale}
    >
      <style dangerouslySetInnerHTML={{ __html: SLIDE6_CSS }} />

      <div className="s6-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s6-sr-only"
        aria-hidden="true"
      />

      <div className="s6-stage" style={!isMobile ? { transform: `scale(${scale})` } : undefined}>
        <div className="s6-content-wrap">
          <h1 id="s6-heading" ref={headingRef} tabIndex={-1} className="s6-heading">
            {title}
          </h1>

          <div
            className="s6-cards"
            role="group"
            aria-label={isEs ? "Mitos para revelar" : "Myths to reveal"}
          >
            {MYTHS.map((item) => {
              const isOpen = revealed.includes(item.id);
              // Resolve medication token replacements
              const resolvedMyth = resolveMedicineToken(isEs ? item.mythEs : item.mythEn, medName || (isEs ? "la amoxicilina" : "amoxicillin"), isEs);
              const resolvedTruth = resolveMedicineToken(isEs ? item.truthEs : item.truthEn, medName || (isEs ? "la amoxicilina" : "amoxicillin"), isEs);
              // Strip only the leading label prefix so we can render it bold inline
              const mythBody = resolvedMyth.replace(/^(myth|mito)\s*\d+\s*[-–—:]\s*/i, "");
              const truthBody = resolvedTruth.replace(/^(truth|verdad)\s*[-–—:]\s*/i, "");
              const statement = isOpen ? truthBody : mythBody;
              const typeLabel = isEs ? (isOpen ? "Verdad" : `Mito ${item.id}`) : isOpen ? "Truth" : `Myth ${item.id}`;
              const inlinePrefix = isOpen
                ? (isEs ? "Verdad – " : "Truth – ")
                : (isEs ? `Mito ${item.id} – ` : `Myth ${item.id} – `);

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`s6-card${isOpen ? " s6-card--revealed" : ""}`}
                  aria-expanded={isOpen}
                  aria-label={`${typeLabel}. ${statement} ${
                    isOpen
                      ? isEs
                        ? "Haga clic para volver a mostrar el mito."
                        : "Click to show the myth again."
                      : isEs
                        ? "Haga clic para revelar la verdad."
                        : "Click to reveal the truth."
                  }`}
                  onClick={() => toggleCard(item)}
                >
                  <span
                    className={`s6-card-tag${isOpen ? " s6-card-tag--truth" : ""}`}
                    aria-hidden="true"
                  >
                    {typeLabel}
                  </span>

                  <span className="s6-card-text"><span className="s6-card-prefix">{inlinePrefix}</span>{statement}</span>

                  <span className="s6-card-icon" aria-hidden="true">
                    {isOpen ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" focusable="false">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Closed Captions Panel */}
        {showCaptions && (
          <div
            className="s6-captions-panel"
            role="region"
            aria-label={isEs ? "Subtítulos de narración" : "Closed captions"}
          >
            <span className="s6-captions-tag" aria-hidden="true">CC</span>
            <p className="s6-captions-text">{plainTranscript}</p>
          </div>
        )}

        {/* 4. Bottom Navigation & Audio Controls */}
        <footer
          className="s6-bottom-bar"
          role="toolbar"
          aria-label={isEs ? "Controles de navegación y audio" : "Slide navigation and media controls"}
        >
          <nav className="s6-nav-center" aria-label={isEs ? "Navegación de diapositiva" : "Slide pagination"}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="s6-btn-nav s6-btn-back"
              aria-label={isEs ? "Ir a la diapositiva anterior" : "Go to previous slide"}
            >
              {isEs ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="s6-btn-nav s6-btn-next"
              aria-label={isEs ? "Ir a la siguiente diapositiva" : "Go to next slide"}
            >
              {loading ? "..." : isEs ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s6-audio-controls">
            <button
              type="button"
              className="s6-audio-btn"
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
              className="s6-audio-btn"
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

export default Slide6MythTruthScreen;


