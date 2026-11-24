"use client";

import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { generateAssessmentPDF } from "@/lib/generate-pdf";
import { formatAssessmentData } from "@/lib/format-assessment";
import { toPng } from "html-to-image";
import { submitAnswer } from "./actions";

// ============================================================================
// Constants (matches reference tablet aspect 827x577 = 1.433)
// ============================================================================
const STAGE_W = 760;
const STAGE_H = 530;

export interface Slide18SummaryScreenProps {
  variant?: "auto" | "desktop" | "mobile";
  isSpanish?: boolean;
  answers: Record<string, any>;
  activeToken?: string | null;
  participantId?: string | null;
  onBack?: () => void;
  onPrint?: () => void;
  onNavigateToSuccess?: () => void;
  onNext?: () => void;
  onFinish?: () => void;
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
  ${scope} .s18-stage {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100% !important;
    border-radius: 0 !important;
    transform: none !important;
    overflow: visible !important;
    background-color: transparent !important;
  }
  ${scope} .s18-capture-surface {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: space-between !important;
    padding: 14px 16px calc(12px + env(safe-area-inset-bottom, 0px)) 16px !important;
    gap: 18px !important;
    box-sizing: border-box !important;
  }
  ${scope} .s18-badge {
    position: static !important;
    min-width: auto !important;
    height: auto !important;
    padding: 10px 22px !important;
    margin: 0 auto !important;
  }
  ${scope} .s18-badge-title {
    font-size: 18px !important;
  }
  ${scope} .s18-steps-list {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    margin: 0 auto !important;
  }
  ${scope} .s18-step-line {
    font-size: 13.5px !important;
  }
  ${scope} .s18-quote-line {
    font-size: 13px !important;
  }
  ${scope} .s18-table-container {
    position: static !important;
    width: 100% !important;
    max-width: 360px !important;
    max-height: none !important;
    overflow: visible !important;
    margin: 0 auto !important;
  }
  ${scope} .s18-table-label,
  ${scope} .s18-table-value {
    font-size: 12px !important;
    padding: 6px 8px !important;
  }
  ${scope} .s18-bottom-bar {
    position: static !important;
    height: auto !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 14px !important;
    padding: 6px 0 0 0 !important;
    width: 100% !important;
    max-width: 380px !important;
  }
  ${scope} .s18-audio-controls { position: static !important; order: 1 !important; margin: 0 auto !important; }
  ${scope} .s18-actions-center {
    position: static !important;
    order: 2 !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    width: 100% !important;
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
  }
  ${scope} .s18-btn-action {
    width: auto !important;
    min-width: 0 !important;
    flex: 0 1 auto !important;
    height: 40px !important;
    min-height: 40px !important;
    font-size: clamp(12px, 3.2vw, 13.5px) !important;
    padding: 0 13px !important;
  }
  ${scope} .s18-btn-finish {
    grid-column: auto !important;
    height: 40px !important;
    min-height: 40px !important;
    font-size: clamp(12.5px, 3.4vw, 14px) !important;
    padding: 0 16px !important;
  }
  ${scope} .s18-captions-panel { position: static !important; width: 100% !important; max-width: 360px !important; bottom: auto !important; }
`;

const SLIDE18_CSS = `
  .s18-root button:focus-visible,
  .s18-root [tabindex="0"]:focus-visible {
    outline: 3px solid #143833 !important;
    outline-offset: 2px !important;
  }
  .s18-badge-title:focus, .s18-badge-title:focus-visible { outline: none !important; }

  .s18-root, .s18-root *, .s18-root *::before, .s18-root *::after { box-sizing: border-box; }

  .s18-root {
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

  .s18-stage {
    position: relative;
    width: ${STAGE_W}px;
    height: ${STAGE_H}px;
    flex: none;
    transform-origin: center center;
    background-color: transparent;
    overflow: hidden;
  }

  .s18-capture-surface {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: transparent;
  }

  /* Print-only elements hidden on screen */
  .s18-print-header,
  .s18-print-footer {
    display: none;
  }

  /* ---- 1. Yellow Pill Badge "Action Steps for Parents" ---- */
  .s18-badge {
    position: absolute;
    left: 68px;
    top: 28px;
    min-width: 304px;
    height: 50px;
    padding: 0 28px;
    background-color: #feff9f;
    border: 2px solid #2b7a85;
    border-radius: 9999px;
    box-shadow: 0 3px 6px rgba(35, 111, 122, 0.22);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
  }
  .s18-badge-title {
    margin: 0;
    font-size: 20.5px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.015em;
    white-space: nowrap;
    color: #1d2423;
    outline: none;
  }

  /* ---- 2. Numbered Steps 1–3 ---- */
  .s18-steps-list {
    position: absolute;
    left: 74px;
    top: 94px;
    width: 616px;
    display: flex;
    flex-direction: column;
    gap: 5px;
    z-index: 5;
  }
  .s18-step-line {
    font-size: 14.5px;
    font-weight: 700;
    color: #1d2423;
    line-height: 1.36;
    margin: 0;
    text-align: left;
  }
  .s18-step-line--hanging {
    padding-left: 18px;
    text-indent: -18px;
  }
  .s18-quote-line {
    font-size: 13.8px;
    font-weight: 500;
    color: #1d2423;
    line-height: 1.38;
    margin: 0 0 2px 0;
    text-align: left;
  }
  .s18-quote-text {
    font-style: italic;
  }

  /* ---- 3. 2-Column Alternating Summary Table ---- */
  .s18-table-container {
    position: absolute;
    left: 74px;
    top: 244px;
    width: 612px;
    max-height: 208px;
    overflow-y: auto;
    border: 1px solid #c3d2d0;
    border-radius: 4px;
    background-color: #ffffff;
    z-index: 5;
  }
  .s18-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .s18-table tr {
    border-bottom: 1px solid #c3d2d0;
  }
  .s18-table tr:last-child {
    border-bottom: none;
  }
  .s18-table-label {
    width: 45%;
    color: #2f2d2a;
    font-size: 12.6px;
    font-weight: 500;
    line-height: 1.24;
    padding: 5px 10px;
    border-right: 1px solid #c3d2d0;
    vertical-align: middle;
  }
  .s18-table-value {
    width: 55%;
    color: #2f2d2a;
    font-size: 12.6px;
    font-weight: 450;
    line-height: 1.24;
    padding: 5px 10px;
    vertical-align: middle;
  }
  /* Alternating rows matching reference screenshot */
  .s18-table tbody tr:nth-child(odd) .s18-table-label {
    background-color: #c9dedd;
  }
  .s18-table tbody tr:nth-child(odd) .s18-table-value {
    background-color: #edf5f4;
  }
  .s18-table tbody tr:nth-child(even) .s18-table-label,
  .s18-table tbody tr:nth-child(even) .s18-table-value {
    background-color: #ffffff;
  }

  /* ---- Captions Drawer ---- */
  .s18-captions-panel {
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

  /* ---- 4. Bottom Bar: Print + Save as Picture + CC/Play ---- */
  .s18-bottom-bar {
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
  .s18-actions-center {
    position: absolute;
    left: 48px;
    right: 162px;
    bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
  }
  .s18-btn-action {
    height: 38px;
    min-width: 84px;
    padding: 0 20px;
    border-radius: 9999px;
    font-family: inherit;
    font-size: 14.5px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background-color: #c6dce0;
    border: 1.6px solid #3c7c87;
    color: #182728;
    white-space: nowrap;
    transition: background-color 0.15s ease, transform 0.1s ease, opacity 0.15s ease;
  }
  .s18-btn-action:hover:not(:disabled) {
    background-color: #b4d1d6;
  }
  .s18-btn-finish {
    background-color: #f9fa9a;
    font-weight: 600;
  }
  .s18-btn-finish:hover:not(:disabled) {
    background-color: #f5f77a;
  }
  .s18-btn-action:active:not(:disabled) {
    transform: scale(0.97);
  }
  .s18-btn-action:disabled {
    opacity: 0.7;
    cursor: wait;
  }
  .s18-btn-spinner {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .s18-audio-controls {
    position: absolute;
    right: 52px;
    bottom: 18px;
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .s18-icon-btn {
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
  .s18-icon-btn:hover { opacity: 0.82; transform: scale(1.04); }
  .s18-icon-btn:active { transform: scale(0.95); }
  .s18-icon-btn[aria-pressed="true"] { background-color: rgba(43, 122, 133, 0.12); }

  ${mobileLayoutCSS(".s18-root.is-mobile")}
  @media (max-width: 767px) {
    ${mobileLayoutCSS(".s18-root:not(.is-desktop)")}
  }

  /* ---- Clinical Print Layout ---- */
  /* ---- Clinical Print Layout ---- */
  @media print {
    @page {
      size: portrait;
      margin: 10mm 14mm;
    }
    .s18-bottom-bar,
    .s18-captions-panel,
    .no-print {
      display: none !important;
    }
    .s18-root,
    .s18-root.is-mobile,
    .s18-root.is-auto,
    .s18-root.is-desktop,
    .s18-root:not(.is-desktop) {
      position: static !important;
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      background: #ffffff !important;
      overflow: visible !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .s18-stage,
    .s18-root.is-mobile .s18-stage,
    .s18-root.is-auto .s18-stage,
    .s18-root.is-desktop .s18-stage,
    .s18-root:not(.is-desktop) .s18-stage {
      position: static !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      transform: none !important;
      overflow: visible !important;
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
    }
    .s18-capture-surface,
    .s18-root.is-mobile .s18-capture-surface,
    .s18-root.is-auto .s18-capture-surface,
    .s18-root.is-desktop .s18-capture-surface,
    .s18-root:not(.is-desktop) .s18-capture-surface {
      position: static !important;
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      min-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      box-sizing: border-box !important;
    }
    .s18-print-header,
    .s18-root.is-mobile .s18-print-header,
    .s18-root.is-auto .s18-print-header,
    .s18-root:not(.is-desktop) .s18-print-header {
      display: flex !important;
      flex-direction: row !important;
      justify-content: space-between !important;
      align-items: flex-start !important;
      gap: 24px !important;
      border-bottom: 2px solid #142724 !important;
      padding-bottom: 8px !important;
      margin-bottom: 14px !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
    .s18-print-brand,
    .s18-root.is-mobile .s18-print-brand,
    .s18-root.is-auto .s18-print-brand,
    .s18-root:not(.is-desktop) .s18-print-brand {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-start !important;
      text-align: left !important;
      gap: 3px !important;
      flex: 1 1 auto !important;
      min-width: 0 !important;
      max-width: 58% !important;
    }
    .s18-print-logo {
      display: block !important;
      font-size: 18pt !important;
      font-weight: 900 !important;
      color: #142724 !important;
      line-height: 1.1 !important;
      letter-spacing: -0.02em !important;
    }
    .s18-print-tagline {
      display: block !important;
      font-size: 8.5pt !important;
      font-weight: 600 !important;
      color: #3b5a54 !important;
      line-height: 1.35 !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
      text-align: left !important;
    }
    .s18-print-meta,
    .s18-root.is-mobile .s18-print-meta,
    .s18-root.is-auto .s18-print-meta,
    .s18-root:not(.is-desktop) .s18-print-meta {
      display: flex !important;
      flex-direction: column !important;
      align-items: flex-end !important;
      text-align: right !important;
      gap: 3px !important;
      flex: 0 0 auto !important;
      min-width: 0 !important;
      max-width: 40% !important;
    }
    .s18-print-doc-type {
      display: block !important;
      font-size: 8.5pt !important;
      font-weight: 700 !important;
      color: #142724 !important;
      line-height: 1.35 !important;
      text-align: right !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: break-word !important;
    }
    .s18-print-date {
      display: block !important;
      font-size: 8pt !important;
      color: #557871 !important;
      text-align: right !important;
      white-space: nowrap !important;
    }
    .s18-badge,
    .s18-root.is-mobile .s18-badge,
    .s18-root.is-auto .s18-badge,
    .s18-root:not(.is-desktop) .s18-badge {
      position: static !important;
      display: inline-flex !important;
      max-width: 100% !important;
      min-width: auto !important;
      height: auto !important;
      background-color: #feff9f !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      border: 2px solid #2b7a85 !important;
      border-radius: 9999px !important;
      padding: 6px 20px !important;
      box-shadow: none !important;
      margin-bottom: 12px !important;
    }
    .s18-badge-title {
      font-size: 13.5pt !important;
      font-weight: 700 !important;
      color: #1d2423 !important;
      line-height: 1.2 !important;
    }
    .s18-steps-list,
    .s18-root.is-mobile .s18-steps-list,
    .s18-root.is-auto .s18-steps-list,
    .s18-root:not(.is-desktop) .s18-steps-list {
      position: static !important;
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 0 14px 0 !important;
      padding: 0 !important;
      gap: 5px !important;
    }
    .s18-step-line {
      font-size: 10pt !important;
      line-height: 1.4 !important;
      color: #1d2423 !important;
      margin: 0 !important;
    }
    .s18-quote-line {
      font-size: 9.5pt !important;
      line-height: 1.35 !important;
      color: #1d2423 !important;
      margin: 0 !important;
    }
    .s18-table-container,
    .s18-root.is-mobile .s18-table-container,
    .s18-root.is-auto .s18-table-container,
    .s18-root:not(.is-desktop) .s18-table-container {
      position: static !important;
      width: 100% !important;
      max-width: 100% !important;
      max-height: none !important;
      overflow: visible !important;
      margin: 0 0 14px 0 !important;
      padding: 0 !important;
      page-break-inside: avoid !important;
    }
    .s18-table {
      width: 100% !important;
      table-layout: fixed !important;
      border-collapse: collapse !important;
    }
    .s18-table tbody tr:nth-child(odd) .s18-table-label {
      background-color: #c9dedd !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .s18-table tbody tr:nth-child(odd) .s18-table-value {
      background-color: #edf5f4 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .s18-table-label {
      width: 38% !important;
      font-size: 8.5pt !important;
      padding: 6px 10px !important;
      line-height: 1.35 !important;
    }
    .s18-table-value {
      width: 62% !important;
      font-size: 8.5pt !important;
      padding: 6px 10px !important;
      line-height: 1.35 !important;
    }
    .s18-print-footer,
    .s18-root.is-mobile .s18-print-footer,
    .s18-root.is-auto .s18-print-footer,
    .s18-root:not(.is-desktop) .s18-print-footer {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      width: 100% !important;
      max-width: 100% !important;
      border-top: 1px solid #90b3ab !important;
      padding-top: 8px !important;
      margin-top: 12px !important;
      font-size: 8.5pt !important;
      color: #3b5a54 !important;
    }
    .s18-print-footer-text { margin: 0 !important; }
    .s18-print-footer-tag { font-weight: 700 !important; color: #142724 !important; }
  }
`;

export function Slide18SummaryScreen({
  variant = "auto",
  isSpanish = false,
  answers,
  activeToken,
  participantId,
  onPrint,
  onNext,
  onFinish,
  audioSrc,
  stepId = "screen7_summary",
  locale,
  transcriptText,
}: Slide18SummaryScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const summaryTitleRef = useRef<HTMLHeadingElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [scale, setScale] = useState(1);
  const [isSavingPicture, setIsSavingPicture] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
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
    const timer = setTimeout(() => summaryTitleRef.current?.focus(), 50);
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

  // Unified clinical data formatting across Slide 18, Report Page, and PDF
  const formatted = formatAssessmentData(answers, isSpanish);
  const symptomsFormatted = formatted.symptoms;
  const ageFormatted = formatted.age;
  const onsetFormatted = formatted.onset;
  const medicalCareFormatted = formatted.medicalCare;
  const resolutionFormatted = formatted.resolution;
  const repeatUseFormatted = formatted.repeatUse;
  const effectiveMedName = formatted.medicationName;
  const tableRows = formatted.summaryTableRows;

  const effectiveAudioSrc =
    audioSrc || (isSpanish ? "/audio/es/step-7.mp3" : "/audio/en/step-7.mp3");

  const effectiveTranscript =
    transcriptText ||
    (isSpanish
      ? "Pasos a seguir para los padres. Hable con el médico de su hijo sobre la alergia en su próxima visita, comparta fotos de la reacción y entregue esta tabla al médico."
      : "Action Steps for Parents. Talk to your child's doctor about the allergy at their next visit, share pictures of your child's reaction with the doctor, and give the table below to your child's doctor.");

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

  const handleSaveAsPicture = async () => {
    if (isSavingPicture) return;
    setIsSavingPicture(true);

    try {
      const element = cardRef.current;
      if (!element) return;

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: "#fcfdf3",
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList.contains("no-print")) {
            return false;
          }
          return true;
        },
      });

      const filename = isSpanish
        ? `PEN-PAL-Resumen-Acciones-${effectiveMedName || "Alergia"}.png`
        : `PEN-PAL-Action-Steps-${effectiveMedName || "Allergy"}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Persist summary view/save status in the background
      submitAnswer("screen7_summary", "completed", 0).catch(() => {});
    } catch (err) {
      console.error("Failed to capture PNG screenshot:", err);
      generateAssessmentPDF({
        locale: isSpanish ? "es" : "en",
        answers,
        participantId: participantId || activeToken,
        medicationName: effectiveMedName,
        symptoms: symptomsFormatted,
        age: ageFormatted,
        onset: onsetFormatted,
        medicalCare: medicalCareFormatted,
        resolution: resolutionFormatted,
        repeatUse: repeatUseFormatted,
        summarySections: tableRows.map((r, i) => ({
          id: `row-${i}`,
          label: r.label,
          value: r.value,
        })),
        steps: [
          isSpanish
            ? "Hable con el médico de su hijo sobre la alergia en su próxima visita."
            : "Talk to your child's doctor about the allergy at their next visit.",
          isSpanish
            ? "Comparta fotos de la reacción de su hijo con el médico."
            : "Share pictures of your child's reaction with the doctor.",
          isSpanish
            ? `Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó ${effectiveMedName}.`
            : `Give the table below to your child's doctor. This says what happened when your child took ${effectiveMedName}.`,
        ],
      });
    } finally {
      setIsSavingPicture(false);
    }
  };

  const variantClass =
    variant === "mobile"
      ? " is-mobile"
      : variant === "desktop"
      ? " is-desktop"
      : "";

  return (
    <div id="slide-content" ref={rootRef} className={`s18-root${variantClass}`} data-step-id={stepId || "screen7_summary"}>
      <style>{SLIDE18_CSS}</style>

      <audio
        ref={audioRef}
        src={effectiveAudioSrc}
        preload="none"
        onEnded={() => setIsPlaying(false)}
      />

      <div
        className="s18-stage"
        style={variant === "mobile" ? undefined : { transform: `scale(${scale})` }}
      >
        <div className="s18-capture-surface" ref={cardRef}>
          {/* Printable Clinical Header (Visible ONLY when printing) */}
          <div className="s18-print-header" aria-hidden="true">
            <div className="s18-print-brand">
              <span className="s18-print-logo">PEN-PAL</span>
              <span className="s18-print-tagline">
                {isSpanish
                  ? "Estudio Clínico sobre Alergia a la Penicilina en Pediatría"
                  : "Pediatric Penicillin Allergy Evaluation Study"}
              </span>
            </div>
            <div className="s18-print-meta">
              <span className="s18-print-doc-type">
                {isSpanish ? "Guía de Discusión Médica y Resumen" : "Doctor Discussion Guide & Summary"}
              </span>
              <span className="s18-print-date">
                {new Date().toLocaleDateString(isSpanish ? "es-US" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* 1. Yellow Pill Badge "Action Steps for Parents" */}
          <div className="s18-badge">
            <h1
              ref={summaryTitleRef}
              tabIndex={-1}
              id="slide18-title"
              className="s18-badge-title"
            >
              {isSpanish ? "Pasos a seguir para los padres" : "Action Steps for Parents"}
            </h1>
          </div>

          {/* 2. Numbered Steps 1–3 */}
          <div className="s18-steps-list">
            <p className="s18-step-line">
              {isSpanish
                ? "1. Hable con el médico de su hijo sobre la alergia en su próxima visita."
                : "1. Talk to your child's doctor about the allergy at their next visit."}
            </p>
            <p className="s18-quote-line">
              {isSpanish ? "Esto es lo que puede decir: " : "Here’s what you can say: "}
              <span className="s18-quote-text">
                {isSpanish
                  ? "«Leí sobre las alergias a la penicilina en niños. ¿Podríamos hablar sobre verificar si mi hijo realmente tiene una alergia?»"
                  : "“I read about penicillin allergies in kids. Could we talk about checking to see if my child really has an allergy?”"}
              </span>
            </p>

            <p className="s18-step-line">
              {isSpanish
                ? "2. Comparta fotos de la reacción de su hijo con el médico."
                : "2. Share pictures of your child’s reaction with the doctor."}
            </p>

            <p className="s18-step-line s18-step-line--hanging">
              {isSpanish
                ? `3. Entregue la siguiente tabla al médico de su hijo. Esto describe lo que ocurrió cuando su hijo tomó ${effectiveMedName}.`
                : `3. Give the table below to your child’s doctor. This says what happened when your child took ${effectiveMedName}.`}
            </p>
          </div>

          {/* 3. 2-Column Alternating Summary Table */}
          <div className="s18-table-container">
            <table className="s18-table" aria-label={isSpanish ? "Resumen de la reacción" : "Reaction Summary"}>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="s18-table-label">{row.label}</td>
                    <td className="s18-table-value">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Printable Footer (Visible ONLY when printing) */}
          <div className="s18-print-footer" aria-hidden="true">
            <p className="s18-print-footer-text">
              {isSpanish
                ? "Entregue esta hoja a su pediatra o médico para evaluar el historial de alergia a la penicilina."
                : "Please bring this sheet to your child's pediatrician or doctor to discuss penicillin allergy evaluation."}
            </p>
            <span className="s18-print-footer-tag">PEN-PAL Medical Study</span>
          </div>

          {/* Captions Drawer */}
          {captionsOpen && (
            <div
              className="s18-captions-panel no-print"
              role="region"
              aria-label={isSpanish ? "Subtítulos de audio" : "Audio captions"}
            >
              {effectiveTranscript}
            </div>
          )}

          {/* 4. Bottom Bar: Print + Save as Picture + Finish + CC / Play */}
          <div className="s18-bottom-bar no-print">
            <div className="s18-actions-center">
              <button
                type="button"
                onClick={onPrint || (() => window.print())}
                className="s18-btn-action"
                aria-label={isSpanish ? "Imprimir hoja de resumen" : "Print summary sheet"}
                title={isSpanish ? "Imprimir" : "Print"}
              >
                {isSpanish ? "Imprimir" : "Print"}
              </button>

              <button
                type="button"
                onClick={handleSaveAsPicture}
                disabled={isSavingPicture}
                className="s18-btn-action"
                aria-label={isSpanish ? "Guardar resumen como imagen PNG" : "Save summary as picture PNG"}
                title={isSpanish ? "Guardar como imagen" : "Save as Picture"}
              >
                {isSavingPicture && (
                  <Loader2 className="s18-btn-spinner animate-spin" aria-hidden="true" />
                )}
                <span>
                  {isSavingPicture
                    ? isSpanish ? "Guardando..." : "Saving..."
                    : saveSuccess
                    ? isSpanish ? "¡Guardado!" : "Saved!"
                    : isSpanish ? "Guardar como imagen" : "Save as Picture"}
                </span>
              </button>

              {(onFinish || onNext) && (
                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    (onFinish || onNext)?.();
                  }}
                  className="s18-btn-action s18-btn-finish"
                  aria-label={isSpanish ? "Finalizar e ir a la encuesta final" : "Finish and go to final survey"}
                  title={isSpanish ? "Finalizar" : "Finish"}
                >
                  {isSpanish ? "Finalizar" : "Finish"}
                </button>
              )}
            </div>

            <div className="s18-audio-controls">
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
                className="s18-icon-btn"
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
                className="s18-icon-btn"
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
    </div>
  );
}

export default Slide18SummaryScreen;
