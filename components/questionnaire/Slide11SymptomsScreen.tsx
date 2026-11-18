"use client";


import React, { useState, useRef, useEffect } from "react";
import AudioPlayer from "./AudioPlayer";
import { NurseAnna } from "./NurseAnna";
import { resolveMedicineToken } from "@/lib/token-engine";
import SlideNavigationButtons from "./SlideNavigationButtons";


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
  background-color: #fafdf3;
  border-radius: 24px;
  padding: 2.5rem 3rem 5rem 3rem; /* Adjusted padding for base stage */
  overflow: hidden;
  gap: 1.5rem;
}


/* Top Heading */
.s11-top-section {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  flex-shrink: 0;
}
.s11-heading {
  font-size: 24px; /* INCREASED from 1.25rem */
  line-height: 1.35;
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
  gap: 2rem;
  padding: 0;
  margin: 0 auto;
}


/* Sage Green Container Card */
.s11-card {
  flex: 1 1 auto;
  width: 100%;
  max-width: 700px;
  background-color: #84aba0;
  border-radius: 20px;
  padding: 1.5rem 1.5rem;
  box-shadow: 0 4px 14px -3px rgba(20, 60, 55, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


/* Rows of symptom chips */
.s11-chip-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
}


.s11-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.6rem 1.2rem; /* INCREASED */
  background-color: #ffffff;
  color: #142724;
  font-size: 16px; /* INCREASED from 0.88rem */
  font-weight: 600;
  border-radius: 9px;
  box-shadow: 0 1.5px 3.5px rgba(0, 0, 0, 0.12);
  border: 1.5px solid #236f7a;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  outline: none;
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
  gap: 1.5rem;
  margin-top: 0.5rem;
}


.s11-other-wrap {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
}


.s11-other-label {
  font-size: 16px; /* INCREASED */
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
  font-size: 16px; /* INCREASED */
  font-weight: 500;
  color: #ffffff !important;
  caret-color: #ffd41d;
  padding: 8px 12px;
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
  width: 150px; /* Slightly larger for the bigger canvas */
  height: auto;
}


.s11-nurse-img {
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 12px rgba(20, 50, 45, 0.12));
}


/* Audio and Nav */
.s11-audio {
  position: absolute;
  right: 3rem;
  bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 30;
}
.s11-root .slide-nav {
  position: absolute !important;
  bottom: 1.5rem !important;
  left: 0 !important;
  right: 0 !important;
  margin: 0 auto !important;
  display: flex !important;
  justify-content: center !important;
  pointer-events: none !important;
}
.s11-root .slide-nav button {
  pointer-events: auto !important;
}


/* ==========================================================
   Mobile-First Responsive Layout Override
   ========================================================== */
@media (max-width: 767px) {
  .s11-wrapper {
    position: relative !important;
    height: auto !important;
    min-height: 100dvh !important;
    overflow: visible !important;
  }
 
  .s11-root {
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    min-height: 100dvh !important;
    border-radius: 0 !important;
    transform: none !important;
    overflow-y: auto !important;
    padding: 14px 16px calc(10px + env(safe-area-inset-bottom, 0px)) 16px !important;
    justify-content: flex-start !important;
    gap: 1rem !important;
  }


  .s11-heading {
    font-size: 18px !important;
    text-align: left !important;
  }


  .s11-middle {
    flex-direction: column !important;
    gap: 1rem !important;
  }


  .s11-card {
    padding: 0.85rem 1rem !important;
    gap: 0.6rem !important;
    border-radius: 14px !important;
  }


  .s11-chip-row {
    gap: 0.45rem !important;
  }


  .s11-chip {
    padding: 0.45rem 0.75rem !important;
    font-size: 14px !important;
  }


  .s11-row-bottom {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.8rem !important;
  }


  .s11-other-wrap {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.4rem !important;
  }


  .s11-other-label {
    font-size: 14px !important;
  }


  .s11-other-input {
    font-size: 14px !important;
    padding: 8px !important;
  }


  .s11-nurse {
    width: 120px !important;
  }


  .s11-audio {
    position: static !important;
    margin: 1rem auto !important;
    justify-content: center !important;
  }


  .s11-root .slide-nav {
    position: static !important;
    margin-top: 0.5rem !important;
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
      <div id="slide-content" className="s11-root" style={{ transform: `scale(${scale})` }}>
        <style dangerouslySetInnerHTML={{ __html: SLIDE11_CSS }} />


        <div className="s11-top-section">
          <h1 ref={headingRef} tabIndex={-1} className="s11-heading">
            {titleText}
          </h1>
        </div>


        <div className="s11-middle">
          <div className="s11-card" role="group" aria-label={titleText}>
            <div className="s11-chip-row">{ROW_1.map(renderChip)}</div>
            <div className="s11-chip-row">{ROW_2.map(renderChip)}</div>
            <div className="s11-chip-row">{ROW_3.map(renderChip)}</div>
            <div className="s11-chip-row">{ROW_4.map(renderChip)}</div>


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


        <div className="s11-audio">
          <AudioPlayer
            audioSrc={effectiveAudioSrc}
            stepId={stepId || "screen6_1_symptoms"}
            locale={locale || (isSpanish ? "es" : "en")}
            transcriptText={effectiveTranscript}
          />
        </div>


        <SlideNavigationButtons
          onBack={onBack}
          onNext={onNext}
          isSpanish={isSpanish}
          loading={loading}
          nextDisabled={!isNextEnabled || loading}
          variant="flow"
        />
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
            className="bg-[#fffef2] rounded-3xl p-6 md:p-8 max-w-[480px] w-full shadow-2xl border-[1.5px] border-[#142724] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex flex-wrap gap-3">
                {["Hives", "Blisters", "Red, fine or bumpy rash"].map(opt => (
                  <button key={opt} ref={opt === "Hives" ? rashFirstBtnRef : null} onClick={() => toggleRashDetail(opt)} className={`px-4 py-2 rounded-lg border-[1.5px] font-semibold text-sm transition-all ${activeRashDetails.includes(opt) ? "bg-[#ffd41d] border-[#1c5249] shadow-inner" : "bg-white border-[#236f7a] hover:bg-[#f3f8f6]"}`}>
                    {isSpanish ? (opt === "Hives" ? "Ronchas" : opt === "Blisters" ? "Ampollas" : "Sarpullido rojo") : opt}
                  </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-3">
                {["Flushing", "Pus-filled pimples"].map(opt => (
                  <button key={opt} onClick={() => toggleRashDetail(opt)} className={`px-4 py-2 rounded-lg border-[1.5px] font-semibold text-sm transition-all ${activeRashDetails.includes(opt) ? "bg-[#ffd41d] border-[#1c5249] shadow-inner" : "bg-white border-[#236f7a] hover:bg-[#f3f8f6]"}`}>
                    {isSpanish ? (opt === "Flushing" ? "Enrojecimiento" : "Granos con pus") : opt}
                  </button>
                ))}
             </div>
             <div className="flex flex-wrap gap-3 mt-2">
               <button onClick={() => toggleRashDetail("Unsure")} className={`px-4 py-2 rounded-lg border-[1.5px] font-semibold text-sm transition-all ${activeRashDetails.includes("Unsure") ? "bg-[#ffd41d] border-[#1c5249] shadow-inner" : "bg-white border-[#236f7a] hover:bg-[#f3f8f6]"}`}>
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
            className="bg-[#fffef2] rounded-3xl p-6 md:p-8 max-w-[440px] w-full shadow-2xl border border-[#e5ded0] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="flex gap-3">
                {["Face swelling", "Throat swelling"].map(opt => (
                  <button key={opt} ref={opt === "Face swelling" ? swellingFirstBtnRef : null} onClick={() => toggleSwellingDetail(opt)} className={`flex-1 px-4 py-2 rounded-lg border-[1.5px] font-semibold text-sm transition-all ${activeSwellingDetails.includes(opt) ? "bg-[#ffd41d] border-[#1c5249] shadow-inner" : "bg-white border-[#236f7a] hover:bg-[#f3f8f6]"}`}>
                    {isSpanish ? (opt === "Face swelling" ? "Inflamación de la cara" : "Inflamación de la garganta") : opt}
                  </button>
                ))}
             </div>
             <div className="flex gap-3">
                {["Lip swelling", "Tongue swelling"].map(opt => (
                  <button key={opt} onClick={() => toggleSwellingDetail(opt)} className={`flex-1 px-4 py-2 rounded-lg border-[1.5px] font-semibold text-sm transition-all ${activeSwellingDetails.includes(opt) ? "bg-[#ffd41d] border-[#1c5249] shadow-inner" : "bg-white border-[#236f7a] hover:bg-[#f3f8f6]"}`}>
                    {isSpanish ? (opt === "Lip swelling" ? "Inflamación de los labios" : "Inflamación de la lengua") : opt}
                  </button>
                ))}
             </div>
             <div className="flex gap-3">
               <button onClick={() => toggleSwellingDetail("Unsure")} className={`px-4 py-2 rounded-lg border-[1.5px] font-semibold text-sm transition-all ${activeSwellingDetails.includes("Unsure") ? "bg-[#ffd41d] border-[#1c5249] shadow-inner" : "bg-white border-[#236f7a] hover:bg-[#f3f8f6]"}`}>
                  {isSpanish ? "No estoy seguro/No lo sé" : "Unsure/I don't know"}
               </button>
             </div>           
             <div className="flex items-center gap-3 mt-2">
               <label className="text-sm font-semibold text-[#142724] whitespace-nowrap">
                 {isSpanish ? "Otro: Describa" : "Other: Please describe"}
               </label>
               <input
                 type="text"
                 value={swellingOtherText}
                 onChange={(e) => handleSwellingOtherChange(e.target.value)}
                 className="flex-1 bg-transparent border-b-2 border-[#142724] outline-none text-sm font-medium px-1 py-1 focus:border-[#0b1f1c]"
               />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default Slide11SymptomsScreen;




 


