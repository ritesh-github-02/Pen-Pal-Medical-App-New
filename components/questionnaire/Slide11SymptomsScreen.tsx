"use client";


import React, { useState, useRef, useEffect } from "react";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";


const STAGE_W = 896;
const STAGE_H = 620;


/* ==========================================================
   Slide11SymptomsScreen – Scaled & Optimized Styles
   ========================================================== */


const SLIDE11_CSS = `
.s11-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: transparent;
}


.s11-root,
.s11-root *,
.s11-root *::before,
.s11-root *::after {
  box-sizing: border-box;
}


.s11-root {
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex: none;
  transform-origin: center center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 24px;
  padding: 1.75rem 2rem 5rem 2rem;
  overflow: hidden;
  gap: 1.25rem;
}


/* Top Heading */
.s11-top-section {
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  padding: 0;
  flex-shrink: 0;
}
.s11-heading {
  font-size: 23px;
  line-height: 1.32;
  font-weight: 700;
  color: #142724;
  letter-spacing: -0.015em;
  margin: 0;
  outline: none;
}
.s11-heading:focus-visible {
  box-shadow: 0 0 0 2px #236f7a;
}


/* Middle Content: Sage Green Card (Left) + Nurse Anna (Right) */
.s11-middle {
  flex-shrink: 0;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 0;
  margin: 0 auto;
}


/* Sage Green Container Card */
.s11-card {
  flex: 1 1 auto;
  width: 100%;
  max-width: 672px;
  background-color: #84aba0;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 4px 14px -3px rgba(20, 60, 55, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}


/* Rows of symptom chips */
.s11-chips-group {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: 100%;
}

.s11-chip-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 0.65rem;
}


.s11-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.52rem 0.9rem;
  background-color: #ffffff;
  color: #142724;
  font-size: 17.5px;
  font-weight: 600;
  border-radius: 9px;
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.12);
  border: 1.5px solid #236f7a;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  outline: none;
  white-space: nowrap;
  flex-shrink: 0;
}


.s11-chip:hover {
  background-color: #f3f8f6;
  border-color: #1c5249;
  transform: translateY(-1px);
  box-shadow: 0 2.5px 5px rgba(0, 0, 0, 0.14);
}


.s11-chip:active {
  transform: scale(0.97);
}


.s11-chip:focus-visible {
  box-shadow: 0 0 0 3px rgba(31, 77, 69, 0.4);
}


.s11-chip--checked {
  background-color: #ffd41d !important;
  color: #142724 !important;
  border-color: #1c5249 !important;
  box-shadow: 0 2px 5px rgba(10, 40, 35, 0.2) !important;
}


.s11-chip--checked:hover {
  background-color: #f7ca12 !important;
  border-color: #143e37 !important;
}


.s11-chip-edit {
  font-size: 0.85rem;
  margin-left: 0.35rem;
  background: rgba(20, 39, 36, 0.12);
  color: #142724;
  border: 1px solid rgba(20, 39, 36, 0.25);
  border-radius: 4px;
  padding: 1px 5px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}


/* Row 5: Other describe underline + Unsure chip */
.s11-row-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  margin-top: 0.25rem;
}


.s11-other-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}


.s11-other-label {
  font-size: 15px;
  font-weight: 600;
  color: #142724;
  white-space: nowrap;
}


.s11-other-input {
  flex: 1;
  background-color: rgba(16, 44, 40, 0.28);
  border: 2px solid #ffd41d !important;
  border-radius: 8px;
  outline: none;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff !important;
  caret-color: #ffd41d;
  padding: 6px 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}


.s11-other-input:focus {
  border-color: #ffd41d !important;
  outline: 2px solid #ffd41d !important;
  outline-offset: 1px !important;
  background-color: rgba(16, 44, 40, 0.42) !important;
}


/* Right Section: Nurse Anna */
.s11-right {
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}


.s11-nurse {
  width: 135px;
  height: auto;
}


.s11-nurse-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(20, 50, 45, 0.12));
}


.s11-sr-only {
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


/* ---- Bottom Bar (scaled 1.18× to compensate for 896×620 vs 760×530 stage) ---- */
.s11-bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 87px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 0 28px;
  pointer-events: none;
}


.s11-nav-center {
  display: flex;
  align-items: center;
  gap: 64px;
  position: absolute;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  pointer-events: auto;
}


.s11-btn-nav {
  border-radius: 9999px;
  font-weight: 600;
  border: 1.9px solid #3c7c87;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  min-width: 87px;
  font-size: 17.7px;
  padding: 0 24px;
  transition: transform 0.1s ease, background-color 0.15s ease;
  font-family: inherit;
  user-select: none;
  touch-action: manipulation;
}
.s11-btn-nav:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.12);
}
.s11-btn-nav:active:not(:disabled) {
  transform: translateY(1px);
}
.s11-btn-nav:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}
.s11-btn-back {
  background-color: #c6dce0;
  color: #142724;
  border-color: #3c7c87;
}
.s11-btn-back:hover:not(:disabled) {
  background-color: #b2cfd5;
}
.s11-btn-next {
  background-color: #f9fa9a;
  color: #142724;
  border-color: #3c7c87;
}
.s11-btn-next:hover:not(:disabled) {
  background-color: #f2f380;
}


/* Audio controls — bottom-right (scaled 1.18×) */
.s11-audio-controls {
  position: absolute;
  right: 61px;
  bottom: 21px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #2b7a85;
  pointer-events: auto;
}
.s11-audio-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #2b7a85;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  min-width: 47px;
  min-height: 47px;
  border-radius: 9px;
  transition: transform 0.12s ease, opacity 0.15s ease;
  font-family: inherit;
}
.s11-audio-btn:hover {
  transform: scale(1.08);
  opacity: 0.85;
}


/* Closed Captions Panel (scaled 1.18×) */
.s11-captions-panel {
  position: absolute;
  bottom: 78px;
  left: 61px;
  right: 61px;
  background: #143833;
  color: #fff;
  border: 1.8px solid #bddfd8;
  border-radius: 14px;
  padding: 9px 17px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
  z-index: 30;
}
.s11-captions-tag {
  background: #fdee8e;
  color: #1a2624;
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 5px;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}
.s11-captions-text {
  font-size: 16px;
  line-height: 1.4;
  margin: 0;
  font-weight: 500;
  color: #fff;
}


/* ==========================================================
   Mobile-First Responsive Layout Override
   ========================================================== */
@media (max-width: 767px) {
  .s11-wrapper {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    align-items: flex-start !important;
    justify-content: center !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    -webkit-overflow-scrolling: touch !important;
    background-color: #fcfdf3 !important;
  }

  .s11-root {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    min-height: 100% !important;
    border-radius: 0 !important;
    transform: none !important;
    overflow: visible !important;
    padding: 14px 16px calc(16px + env(safe-area-inset-bottom, 0px)) 16px !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 12px !important;
    background-color: transparent !important;
  }

  .s11-top-section {
    width: 100% !important;
    max-width: 360px !important;
    padding: 0 2px !important;
    margin: 0 auto !important;
  }

  .s11-heading {
    font-size: 16.5px !important;
    line-height: 1.35 !important;
    text-align: left !important;
  }

  .s11-middle {
    flex-direction: column !important;
    gap: 10px !important;
    width: 100% !important;
    max-width: 360px !important;
    margin: 0 auto !important;
    align-items: center !important;
  }

  .s11-card {
    padding: 13px 12px !important;
    gap: 10px !important;
    border-radius: 16px !important;
    max-width: 100% !important;
    width: 100% !important;
  }

  .s11-chips-group {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: wrap !important;
    gap: 7px !important;
    width: 100% !important;
    align-items: center !important;
  }

  .s11-chip-row {
    display: contents !important;
  }

  .s11-chip {
    padding: 7px 11px !important;
    font-size: 13.5px !important;
    line-height: 1.25 !important;
    white-space: normal !important;
    flex-shrink: 1 !important;
    text-align: center !important;
    max-width: 100% !important;
  }

  .s11-row-bottom {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
    margin-top: 2px !important;
  }

  .s11-other-wrap {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 5px !important;
  }

  .s11-other-label {
    font-size: 13.5px !important;
  }

  .s11-other-input {
    font-size: 14px !important;
    padding: 8px 10px !important;
  }

  .s11-nurse {
    width: 80px !important;
    margin: 0 auto !important;
  }

  .s11-bottom-bar {
    position: static !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 4px 0 0 0 !important;
    flex-shrink: 0 !important;
    width: 100% !important;
    max-width: 360px !important;
    margin: 0 auto !important;
    pointer-events: auto !important;
  }

  .s11-audio-controls {
    position: static !important;
    right: auto !important;
    bottom: auto !important;
    order: 1 !important;
    margin: 0 auto !important;
    gap: 10px !important;
  }

  .s11-audio-btn {
    min-width: 40px !important;
    min-height: 40px !important;
    padding: 4px !important;
  }

  .s11-audio-btn svg {
    width: 40px !important;
    height: 34px !important;
  }

  .s11-nav-center {
    position: static !important;
    left: auto !important;
    bottom: auto !important;
    order: 2 !important;
    transform: none !important;
    width: 100% !important;
    gap: 14px !important;
    justify-content: space-between !important;
  }

  .s11-btn-nav {
    flex: 1 1 0% !important;
    height: 44px !important;
    min-height: 44px !important;
    font-size: 16px !important;
  }

  .s11-captions-panel {
    position: static !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    width: 100% !important;
    max-width: 360px !important;
    margin: 0 auto !important;
    padding: 8px 12px !important;
    font-size: 13.5px !important;
  }
}
`;


export interface Slide11SymptomsScreenProps {
  isSpanish: boolean;
  medicationName?: string;
  selectedSymptoms?: string[];
  symptomsOther?: string;
  rashDetails?: string[];
  swellingDetails?: string[];
  onSelectSymptoms: (symptoms: string[]) => void;
  onSymptomsOtherChange?: (val: string) => void;
  onRashDetailsChange?: (details: string[]) => void;
  onSwellingDetailsChange?: (details: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
  audioSrc?: string;
  transcriptText?: string;
  stepId?: string;
  locale?: string;
}


interface SymptomItem {
  value: string;
  labelEn: string;
  labelEs: string;
}


const ROW_1: SymptomItem[] = [
  { value: "Rash", labelEn: "Rash", labelEs: "Sarpullido" },
  { value: "Swelling", labelEn: "Swelling", labelEs: "Inflamación" },
  { value: "Fainting or dizziness", labelEn: "Fainting or dizziness", labelEs: "Desmayos o mareos" },
  { value: "Itchiness", labelEn: "Itchiness", labelEs: "Picazón" },
];


const ROW_2: SymptomItem[] = [
  { value: "Throat tightness", labelEn: "Throat tightness", labelEs: "Opresión en la garganta" },
  { value: "Shortness of breath", labelEn: "Shortness of breath or hard time breathing", labelEs: "Dificultad para respirar" },
];


const ROW_3: SymptomItem[] = [
  { value: "Fever", labelEn: "Fever (new fever or worse fever)", labelEs: "Fiebre (nueva o peor)" },
  { value: "Belly pain", labelEn: "Belly pain", labelEs: "Dolor abdominal" },
  { value: "Diarrhea", labelEn: "Diarrhea", labelEs: "Diarrea" },
];


const ROW_4: SymptomItem[] = [
  { value: "Joint pain", labelEn: "Joint pain", labelEs: "Dolor articular" },
  { value: "Vomiting", labelEn: "Wanted to throw up or threw up", labelEs: "Ganas de vomitar o vomitó" },
  { value: "Muscle aches", labelEn: "Muscle aches", labelEs: "Dolores musculares" },
];


export function Slide11SymptomsScreen({
  isSpanish,
  medicationName,
  selectedSymptoms = [],
  symptomsOther = "",
  rashDetails = [],
  swellingDetails = [],
  onSelectSymptoms,
  onSymptomsOtherChange,
  onRashDetailsChange,
  onSwellingDetailsChange,
  onNext,
  onBack,
  loading = false,
  audioSrc,
  transcriptText,
  stepId = "screen6_1_symptoms",
  locale,
}: Slide11SymptomsScreenProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const rashFirstBtnRef = useRef<HTMLButtonElement | null>(null);
  const modalTriggerRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");

  const effectiveAudioSrc =
    audioSrc ||
    (isSpanish
      ? "/audio/exported/screen6_1_symptoms_es.mp3"
      : "/audio/exported/screen6_1_symptoms_en.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a la penicilina."
      : "Select what happened when your child was said to be allergic to penicillin.");

  const swellingTriggerRef = useRef<HTMLElement | null>(null);
  const swellingFirstBtnRef = useRef<HTMLButtonElement | null>(null);

  const [symptoms, setSymptoms] = useState<string[]>(selectedSymptoms);
  const [otherText, setOtherText] = useState<string>(symptomsOther);

  const [rashModalOpen, setRashModalOpen] = useState(false);
  const [activeRashDetails, setActiveRashDetails] = useState<string[]>(rashDetails);

  const [swellingModalOpen, setSwellingModalOpen] = useState(false);
  const [activeSwellingDetails, setActiveSwellingDetails] = useState<string[]>(swellingDetails);
  const [swellingOtherText, setSwellingOtherText] = useState<string>(() => {
    const found = (swellingDetails || []).find((d) => d.startsWith("Other:"));
    return found ? found.replace(/^Other:\s*/, "") : "";
  });

  // Escape dismisses captions (WCAG 1.4.13)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showCaptions) {
        setShowCaptions(false);
        setLiveAnnouncement(isSpanish ? "Subtítulos ocultados" : "Closed captions dismissed");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showCaptions, isSpanish]);

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
        ? isSpanish ? "Reproduciendo narración de audio" : "Audio narration playing"
        : isSpanish ? "Narración de audio pausada" : "Audio narration paused"
    );
    if (willPlay) {
      if (el && el.src && !el.src.endsWith(".undefined")) {
        el.play().catch(() => {
          if (typeof window !== "undefined" && "speechSynthesis" in window) {
            const utt = new SpeechSynthesisUtterance(effectiveTranscript);
            utt.lang = isSpanish ? "es-US" : "en-US";
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
        utt.lang = isSpanish ? "es-US" : "en-US";
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
        ? isSpanish ? "Subtítulos mostrados" : "Closed captions displayed"
        : isSpanish ? "Subtítulos ocultados" : "Closed captions hidden"
    );
  };


  // Scaling Logic
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;


    const update = () => {
      if (window.innerWidth < 768) {
        setScale(1);
        return;
      }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const safeW = Math.max(0, w - 32);
      const safeH = Math.max(0, h - 32);
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
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      headingRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    if (!rashModalOpen) return;
    const timer = setTimeout(() => {
      rashFirstBtnRef.current?.focus();
    }, 50);


    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setRashModalOpen(false);
        modalTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rashModalOpen]);


  useEffect(() => {
    if (!swellingModalOpen) return;
    const timer = setTimeout(() => {
      swellingFirstBtnRef.current?.focus();
    }, 50);


    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSwellingModalOpen(false);
        swellingTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [swellingModalOpen]);


  const toggleSymptom = (val: string, e?: React.MouseEvent<HTMLElement>) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = symptoms.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = symptoms.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setSymptoms(updated);
    onSelectSymptoms(updated);


    if (val === "Rash" && !symptoms.includes("Rash")) {
      if (e) modalTriggerRef.current = e.currentTarget;
      setTimeout(() => setRashModalOpen(true), 150);
    }


    if (val === "Swelling" && !symptoms.includes("Swelling")) {
      if (e) swellingTriggerRef.current = e.currentTarget;
      setTimeout(() => setSwellingModalOpen(true), 150);
    }
  };


  const handleOtherChange = (text: string) => {
    setOtherText(text);
    if (onSymptomsOtherChange) onSymptomsOtherChange(text);


    let updated = [...symptoms];
    if (text.trim() && !updated.includes("Other")) {
      updated = [...updated.filter((s) => s !== "Unsure"), "Other"];
      setSymptoms(updated);
      onSelectSymptoms(updated);
    } else if (!text.trim() && updated.includes("Other")) {
      updated = updated.filter((s) => s !== "Other");
      setSymptoms(updated);
      onSelectSymptoms(updated);
    }
  };


  const toggleRashDetail = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeRashDetails.includes("Unsure") ? [] : ["Unsure"];
    } else {
      const withoutUnsure = activeRashDetails.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveRashDetails(updated);
    if (onRashDetailsChange) onRashDetailsChange(updated);
  };


  const toggleSwellingDetail = (val: string) => {
    let updated: string[];
    if (val === "Unsure") {
      updated = activeSwellingDetails.includes("Unsure") ? [] : ["Unsure"];
      setSwellingOtherText("");
    } else {
      const withoutUnsure = activeSwellingDetails.filter((s) => s !== "Unsure");
      if (withoutUnsure.includes(val)) {
        updated = withoutUnsure.filter((s) => s !== val);
      } else {
        updated = [...withoutUnsure, val];
      }
    }
    setActiveSwellingDetails(updated);
    if (onSwellingDetailsChange) onSwellingDetailsChange(updated);
  };


  const handleSwellingOtherChange = (text: string) => {
    setSwellingOtherText(text);
    const withoutOther = activeSwellingDetails.filter(
      (d) => !d.startsWith("Other:") && d !== "Unsure"
    );
    const next = text.trim() ? [...withoutOther, `Other: ${text.trim()}`] : withoutOther;
    setActiveSwellingDetails(next);
    if (onSwellingDetailsChange) onSwellingDetailsChange(next);
  };


  const rawTitle = isSpanish
    ? "Seleccione lo que sucedió cuando se le dijo que su hijo era alérgico a [name]."
    : "Select what happened when your child was said to be allergic to [name].";


  const titleText = resolveMedicineToken(rawTitle, medicationName, isSpanish);
  const isNextEnabled = symptoms.length > 0 || otherText.trim().length > 0;


  const renderChip = (item: SymptomItem) => {
    const isChecked = symptoms.includes(item.value);
    const label = isSpanish ? item.labelEs : item.labelEn;


    return (
      <button
        key={item.value}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        onClick={(e) => toggleSymptom(item.value, e)}
        className={`s11-chip${isChecked ? " s11-chip--checked" : ""}`}
      >
        <span>{label}</span>
        {item.value === "Rash" && isChecked && activeRashDetails.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              modalTriggerRef.current = e.currentTarget;
              setRashModalOpen(true);
            }}
            className="s11-chip-edit"
          >
            ✎
          </span>
        )}
        {item.value === "Swelling" && isChecked && activeSwellingDetails.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              swellingTriggerRef.current = e.currentTarget;
              setSwellingModalOpen(true);
            }}
            className="s11-chip-edit"
          >
            ✎
          </span>
        )}
      </button>
    );
  };


  return (
    <div className="s11-wrapper" ref={wrapperRef}>
      <style dangerouslySetInnerHTML={{ __html: SLIDE11_CSS }} />

      {/* Screen Reader Live Region */}
      <div className="s11-sr-only" role="status" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* Hidden HTML5 Audio */}
      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="metadata"
        className="s11-sr-only"
        aria-hidden="true"
      />

      <div id="slide-content" className="s11-root" style={{ transform: `scale(${scale})` }}>


        <div className="s11-top-section">
          <h1 ref={headingRef} tabIndex={-1} className="s11-heading">
            {titleText}
          </h1>
        </div>


        <div className="s11-middle">
          <div className="s11-card" role="group" aria-label={titleText}>
            <div className="s11-chips-group">
              <div className="s11-chip-row">{ROW_1.map(renderChip)}</div>
              <div className="s11-chip-row">{ROW_2.map(renderChip)}</div>
              <div className="s11-chip-row">{ROW_3.map(renderChip)}</div>
              <div className="s11-chip-row">{ROW_4.map(renderChip)}</div>
            </div>


            <div className="s11-row-bottom">
              <div className="s11-other-wrap">
                <label htmlFor="symptoms-other-input" className="s11-other-label">
                  {isSpanish ? "Otro: Describa" : "Other: Please describe"}
                </label>
                <input
                  id="symptoms-other-input"
                  type="text"
                  value={otherText}
                  onChange={(e) => handleOtherChange(e.target.value)}
                  className="s11-other-input"
                />
              </div>


              <button
                type="button"
                role="checkbox"
                aria-checked={symptoms.includes("Unsure")}
                onClick={(e) => toggleSymptom("Unsure", e)}
                className={`s11-chip${symptoms.includes("Unsure") ? " s11-chip--checked" : ""}`}
              >
                <span>{isSpanish ? "No estoy seguro/ No lo sé" : "Unsure/I don't know"}</span>
              </button>
            </div>
          </div>


          <div className="s11-right">
            <div className="s11-nurse">
              <NurseAnna
                size="md"
                imgClassName="s11-nurse-img"
                isDecorative={true}
                locale={isSpanish ? "es" : "en"}
              />
            </div>
          </div>
        </div>


        {/* Closed Captions Panel */}
        {showCaptions && (
          <div
            className="s11-captions-panel"
            role="region"
            aria-label={isSpanish ? "Subtítulos de narración" : "Closed captions"}
          >
            <span className="s11-captions-tag" aria-hidden="true">CC</span>
            <p className="s11-captions-text">{effectiveTranscript}</p>
          </div>
        )}

        {/* Bottom Navigation & Audio Controls */}
        <footer
          className="s11-bottom-bar"
          role="toolbar"
          aria-label={isSpanish ? "Controles de navegación y audio" : "Slide navigation and media controls"}
        >
          <nav className="s11-nav-center" aria-label={isSpanish ? "Navegación de diapositiva" : "Slide pagination"}>
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="s11-btn-nav s11-btn-back"
              aria-label={isSpanish ? "Ir a la diapositiva anterior" : "Go to previous slide"}
            >
              {isSpanish ? "Atrás" : "Back"}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!isNextEnabled || loading}
              className="s11-btn-nav s11-btn-next"
              aria-label={isSpanish ? "Ir a la siguiente diapositiva" : "Go to next slide"}
            >
              {loading ? "..." : isSpanish ? "Siguiente" : "Next"}
            </button>
          </nav>

          <div className="s11-audio-controls">
            <button
              type="button"
              className="s11-audio-btn"
              onClick={toggleCaptions}
              aria-pressed={showCaptions}
              aria-label={
                showCaptions
                  ? isSpanish ? "Ocultar subtítulos" : "Hide closed captions"
                  : isSpanish ? "Mostrar subtítulos" : "Show closed captions"
              }
              title={
                showCaptions
                  ? isSpanish ? "Ocultar subtítulos" : "Hide closed captions"
                  : isSpanish ? "Mostrar subtítulos" : "Show closed captions"
              }
            >
              <svg
                width="52"
                height="47"
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
              className="s11-audio-btn"
              onClick={toggleAudio}
              aria-pressed={audioPlaying}
              aria-label={
                audioPlaying
                  ? isSpanish ? "Pausar narración de audio" : "Pause audio narration"
                  : isSpanish ? "Reproducir narración de audio" : "Play audio narration"
              }
              title={
                audioPlaying
                  ? isSpanish ? "Pausar narración de audio" : "Pause audio narration"
                  : isSpanish ? "Reproducir narración de audio" : "Play audio narration"
              }
            >
              {audioPlaying ? (
                <svg
                  width="64"
                  height="47"
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
                  width="64"
                  height="47"
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


      {/* MODALS moved outside the scaled canvas so they cover the whole screen perfectly */}
      {rashModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px]"
          onClick={() => {
            setRashModalOpen(false);
            modalTriggerRef.current?.focus();
          }}
        >
          <div
            className="relative bg-[#fffef2] rounded-[22px] sm:rounded-[28px] p-7 sm:p-10 md:p-12 max-w-[760px] max-h-[90dvh] overflow-y-auto w-full shadow-2xl border-[2px] border-[#142724] flex flex-col gap-5 sm:gap-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* <button
              type="button"
              onClick={() => {
                setRashModalOpen(false);
                modalTriggerRef.current?.focus();
              }}
              className="absolute top-4 right-5 text-xl font-bold text-[#142724]/60 hover:text-[#142724] p-1.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label={isSpanish ? "Cerrar" : "Close"}
            >
              ✕
            </button> */}

             <div className="flex flex-wrap gap-5">
                {["Hives", "Blisters", "Red, fine or bumpy rash"].map(opt => (
                  <button
                    key={opt}
                    ref={opt === "Hives" ? rashFirstBtnRef : null}
                    onClick={() => toggleRashDetail(opt)}
                    className={`px-7 py-4 rounded-xl border-[2px] font-bold text-[17px] transition-all ${
                      activeRashDetails.includes(opt)
                        ? "bg-[#ffd41d] border-[#1c5249] shadow-inner"
                        : "bg-white border-[#236f7a] hover:bg-[#f3f8f6] shadow-sm hover:translate-y-[-1px]"
                    }`}
                  >
                    {isSpanish ? (opt === "Hives" ? "Ronchas" : opt === "Blisters" ? "Ampollas" : "Sarpullido rojo") : opt}
                  </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-5">
                {["Flushing", "Pus-filled pimples"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleRashDetail(opt)}
                    className={`px-7 py-4 rounded-xl border-[2px] font-bold text-[17px] transition-all ${
                      activeRashDetails.includes(opt)
                        ? "bg-[#ffd41d] border-[#1c5249] shadow-inner"
                        : "bg-white border-[#236f7a] hover:bg-[#f3f8f6] shadow-sm hover:translate-y-[-1px]"
                    }`}
                  >
                    {isSpanish ? (opt === "Flushing" ? "Enrojecimiento" : "Granos con pus") : opt}
                  </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-5 mt-2">
               <button
                 onClick={() => toggleRashDetail("Unsure")}
                 className={`px-8 py-4 rounded-xl border-[2px] font-bold text-[17px] transition-all ${
                   activeRashDetails.includes("Unsure")
                     ? "bg-[#ffd41d] border-[#1c5249] shadow-inner"
                     : "bg-white border-[#236f7a] hover:bg-[#f3f8f6] shadow-sm hover:translate-y-[-1px]"
                 }`}
               >
                  {isSpanish ? "No estoy seguro" : "Unsure/I don't know"}
               </button>
             </div>
          </div>
        </div>
      )}


      {swellingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
          onClick={() => {
            setSwellingModalOpen(false);
            swellingTriggerRef.current?.focus();
          }}
        >
          <div
            className="relative bg-[#fffef2] rounded-[22px] sm:rounded-[28px] p-7 sm:p-10 md:p-12 max-w-[760px] max-h-[90dvh] overflow-y-auto w-full shadow-2xl border-[2px] border-[#142724] flex flex-col gap-5 sm:gap-6 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* <button
              type="button"
              onClick={() => {
                setSwellingModalOpen(false);
                swellingTriggerRef.current?.focus();
              }}
              className="absolute top-4 right-5 text-xl font-bold text-[#142724]/60 hover:text-[#142724] p-1.5 rounded-full hover:bg-black/5 transition-colors"
              aria-label={isSpanish ? "Cerrar" : "Close"}
            >
              ✕
            </button> */}

             <div className="flex flex-wrap gap-5">
                {["Face swelling", "Throat swelling"].map(opt => (
                  <button
                    key={opt}
                    ref={opt === "Face swelling" ? swellingFirstBtnRef : null}
                    onClick={() => toggleSwellingDetail(opt)}
                    className={`flex-1 min-w-[140px] px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border-[2px] font-bold text-sm sm:text-[15.5px] transition-all ${
                      activeSwellingDetails.includes(opt)
                        ? "bg-[#ffd41d] border-[#1c5249] shadow-inner"
                        : "bg-white border-[#236f7a] hover:bg-[#f3f8f6] shadow-sm hover:translate-y-[-1px]"
                    }`}
                  >
                    {isSpanish ? (opt === "Face swelling" ? "Inflamación de la cara" : "Inflamación de la garganta") : opt}
                  </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-5">
                {["Lip swelling", "Tongue swelling"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => toggleSwellingDetail(opt)}
                    className={`flex-1 min-w-[140px] px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl border-[2px] font-bold text-sm sm:text-[15.5px] transition-all ${
                      activeSwellingDetails.includes(opt)
                        ? "bg-[#ffd41d] border-[#1c5249] shadow-inner"
                        : "bg-white border-[#236f7a] hover:bg-[#f3f8f6] shadow-sm hover:translate-y-[-1px]"
                    }`}
                  >
                    {isSpanish ? (opt === "Lip swelling" ? "Inflamación de los labios" : "Inflamación de la lengua") : opt}
                  </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-5">
               <button
                 onClick={() => toggleSwellingDetail("Unsure")}
                 className={`px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl border-[2px] font-bold text-sm sm:text-[15.5px] transition-all ${
                   activeSwellingDetails.includes("Unsure")
                     ? "bg-[#ffd41d] border-[#1c5249] shadow-inner"
                     : "bg-white border-[#236f7a] hover:bg-[#f3f8f6] shadow-sm hover:translate-y-[-1px]"
                 }`}
               >
                  {isSpanish ? "No estoy seguro/No lo sé" : "Unsure/I don't know"}
               </button>
             </div>           
             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3.5 mt-2">
               <label className="text-sm sm:text-[15.5px] font-bold text-[#142724] whitespace-nowrap">
                 {isSpanish ? "Otro: Describa" : "Other: Please describe"}
               </label>
               <input
                 type="text"
                 value={swellingOtherText}
                 onChange={(e) => handleSwellingOtherChange(e.target.value)}
                 className="w-full sm:flex-1 bg-transparent border-b-2 border-[#142724] outline-none text-base font-medium px-2 py-1.5 focus:border-[#0b1f1c]"
               />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Slide11SymptomsScreen;




 


