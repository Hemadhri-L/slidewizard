"use client";
import { useEffect, useState } from "react";
import PptxGenJS from "pptxgenjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";

export default function ExportPage() {
  const router = useRouter();
  const [pptData, setPptData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPreview, setCurrentPreview] = useState(-1);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("pptData");
    if (data) {
      const parsed = JSON.parse(data);
      setPptData(parsed);
      setSelectedTemplate(parsed.template || "minimal");
    } else {
      router.push("/builder");
    }
  }, [router]);

  const TEMPLATES = {
    minimal: {
      name: "Minimal",
      emoji: "⚪",
      preview: "Clean & Professional",
      colors: {
        bg: "FFFFFF", surface: "F5F5F7", surfaceAlt: "EBEBED",
        primary: "1A1A2E", secondary: "6C63FF", accent: "FF6584",
        accentAlt: "43B581", text: "2D2D3A", textMuted: "71717A",
        textLight: "A1A1AA", gradient1: "6C63FF", gradient2: "4ECDC4",
        cardBorder: "E4E4E7", coverBg: "6C63FF", coverBg2: "4ECDC4",
      },
      fonts: { heading: "Calibri", body: "Calibri" },
      dark: false,
    },
    aurora: {
      name: "Aurora", emoji: "🌌", preview: "Bold & Vibrant",
      colors: {
        bg: "12121F", surface: "1C1C30", surfaceAlt: "252540",
        primary: "FFFFFF", secondary: "8B5CF6", accent: "F472B6",
        accentAlt: "34D399", text: "E2E2F0", textMuted: "9898B0",
        textLight: "6B6B85", gradient1: "8B5CF6", gradient2: "EC4899",
        cardBorder: "2D2D48", coverBg: "8B5CF6", coverBg2: "EC4899",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: true,
    },
    ocean: {
      name: "Ocean", emoji: "🌊", preview: "Cool & Calming",
      colors: {
        bg: "FFFFFF", surface: "EFF6FF", surfaceAlt: "DBEAFE",
        primary: "0C4A6E", secondary: "0284C7", accent: "F59E0B",
        accentAlt: "06B6D4", text: "1E3A5F", textMuted: "64748B",
        textLight: "94A3B8", gradient1: "0284C7", gradient2: "06B6D4",
        cardBorder: "BAE6FD", coverBg: "0369A1", coverBg2: "0284C7",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: false,
    },
    sunset: {
      name: "Sunset", emoji: "🌅", preview: "Warm & Energetic",
      colors: {
        bg: "FFFAF5", surface: "FFF3E6", surfaceAlt: "FFE8CC",
        primary: "7C2D12", secondary: "EA580C", accent: "DC2626",
        accentAlt: "F59E0B", text: "4A1D0A", textMuted: "9A3412",
        textLight: "C2410C", gradient1: "EA580C", gradient2: "DC2626",
        cardBorder: "FDBA74", coverBg: "EA580C", coverBg2: "DC2626",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: false,
    },
    midnight: {
      name: "Midnight", emoji: "🌙", preview: "Dark & Elegant",
      colors: {
        bg: "0F172A", surface: "1E293B", surfaceAlt: "273549",
        primary: "F1F5F9", secondary: "818CF8", accent: "34D399",
        accentAlt: "F472B6", text: "CBD5E1", textMuted: "94A3B8",
        textLight: "64748B", gradient1: "818CF8", gradient2: "34D399",
        cardBorder: "334155", coverBg: "6366F1", coverBg2: "818CF8",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: true,
    },
    forest: {
      name: "Forest", emoji: "🌿", preview: "Natural & Fresh",
      colors: {
        bg: "F8FBF5", surface: "ECFCE5", surfaceAlt: "D9F8CF",
        primary: "14532D", secondary: "16A34A", accent: "CA8A04",
        accentAlt: "059669", text: "1B4332", textMuted: "4D7C0F",
        textLight: "65A30D", gradient1: "16A34A", gradient2: "059669",
        cardBorder: "BBF7D0", coverBg: "15803D", coverBg2: "16A34A",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: false,
    },
    rose: {
      name: "Rose", emoji: "🌸", preview: "Soft & Elegant",
      colors: {
        bg: "FFFBFE", surface: "FDF2F8", surfaceAlt: "FCE7F3",
        primary: "831843", secondary: "DB2777", accent: "7C3AED",
        accentAlt: "EC4899", text: "6B1E3F", textMuted: "BE185D",
        textLight: "F472B6", gradient1: "DB2777", gradient2: "BE185D",
        cardBorder: "FBCFE8", coverBg: "BE185D", coverBg2: "DB2777",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: false,
    },
    corporate: {
      name: "Corporate", emoji: "💼", preview: "Business Ready",
      colors: {
        bg: "FFFFFF", surface: "F1F5F9", surfaceAlt: "E2E8F0",
        primary: "0F172A", secondary: "1E40AF", accent: "DC2626",
        accentAlt: "2563EB", text: "1E293B", textMuted: "475569",
        textLight: "94A3B8", gradient1: "1E40AF", gradient2: "1D4ED8",
        cardBorder: "CBD5E1", coverBg: "1E3A8A", coverBg2: "1E40AF",
      },
      fonts: { heading: "Calibri", body: "Calibri" }, dark: false,
    },
  };

  const T = TEMPLATES[selectedTemplate] || TEMPLATES.minimal;
  const c = T.colors;

  const AILayout = {
    CANVAS_W: 10,
    CANVAS_H: 5.625,
    measureText(text, fontSize, fontWidthFactor = 0.55) {
      const avgCharWidth = (fontSize / 72) * fontWidthFactor;
      const lineHeight = (fontSize / 72) * 1.35;
      return { charWidth: avgCharWidth, lineHeight };
    },
    calcLines(text, fontSize, maxWidth) {
      const { charWidth } = this.measureText(text, fontSize);
      const charsPerLine = Math.floor(maxWidth / charWidth);
      if (charsPerLine <= 0) return 1;
      return Math.ceil(text.length / charsPerLine);
    },
    calcTextHeight(text, fontSize, maxWidth) {
      const lines = this.calcLines(text, fontSize, maxWidth);
      const { lineHeight } = this.measureText(text, fontSize);
      return lines * lineHeight;
    },
    analyzeContent(title, content) {
      const lines = (content || "").split("\n").filter((l) => l.trim());
      const clean = lines.map((l) => l.replace(/^[•\-*\d.)\]]+\s*/, "").trim()).filter(Boolean);
      const fullText = (title + " " + content).toLowerCase();
      const totalChars = clean.reduce((sum, l) => sum + l.length, 0);
      const avgLineLength = clean.length > 0 ? totalChars / clean.length : 0;
      const maxLineLength = clean.reduce((max, l) => Math.max(max, l.length), 0);
      const titleLength = title.length;
      const patterns = {
        hasNumbers: /\d+%|\$\d+|\d+\s*(million|billion|k|users|revenue|growth)/i.test(fullText),
        hasComparison: /\bvs\b|versus|compared|advantage|disadvantage|pros?\b|cons?\b/i.test(fullText),
        hasProcess: /step\s*\d|phase|stage|process|workflow|how to|first|then|next|finally/i.test(fullText),
        hasTimeline: /\b(19|20)\d{2}\b|Q[1-4]|timeline|history|evolution|roadmap/i.test(fullText),
        hasQuote: /["\u201C\u201D]|quote|said|according/i.test(fullText),
        isIntro: /introduction|overview|about|what is|agenda/i.test(fullText),
        isConclusion: /conclusion|summary|takeaway|recap|next step/i.test(fullText),
      };
      let type = "standard";
      if (clean.length <= 2 && patterns.hasQuote) type = "quote";
      else if (clean.length <= 2) type = "hero";
      else if (patterns.hasNumbers && clean.length <= 4) type = "metrics";
      else if (patterns.hasComparison) type = "comparison";
      else if (patterns.hasProcess) type = "process";
      else if (patterns.hasTimeline && clean.length <= 5) type = "timeline";
      else if (patterns.isIntro || patterns.isConclusion) type = "featured";
      else if (clean.length >= 6) type = "detailed";
      let density = "normal";
      if (totalChars < 100) density = "sparse";
      else if (totalChars < 250) density = "light";
      else if (totalChars > 500) density = "heavy";
      else if (totalChars > 800) density = "dense";
      const optimalBodyFont = this.calcOptimalFont(clean, density);
      const optimalTitleFont = titleLength > 50 ? 24 : titleLength > 35 ? 26 : 28;
      return {
        type, lines: clean, count: clean.length, patterns, density, totalChars,
        avgLineLength, maxLineLength, titleLength, optimalBodyFont, optimalTitleFont,
        needsCompactLayout: totalChars > 500 || clean.length > 6,
        needsLargeText: totalChars < 100 && clean.length <= 2,
      };
    },
    calcOptimalFont(lines, density) {
      if (density === "sparse") return 18;
      if (density === "light") return 16;
      if (density === "heavy") return 14;
      if (density === "dense") return 13;
      return 15;
    },
    calcLayout(analysis, hasImage, slideIndex) {
      const W = this.CANVAS_W;
      const H = this.CANVAS_H;
      const margin = {
        top: analysis.density === "dense" ? 0.5 : 0.6,
        bottom: analysis.density === "dense" ? 0.25 : 0.35,
        left: 0.55, right: 0.55,
      };
      const topBarH = 0.06;
      const titleH = analysis.titleLength > 50 ? 0.75 : 0.6;
      const titleY = margin.top;
      const accentBarY = titleY + titleH + 0.06;
      const accentBarH = 0.04;
      const bodyGap = analysis.density === "dense" ? 0.12 : 0.2;
      const bodyY = accentBarY + accentBarH + bodyGap;
      const bodyH = H - bodyY - margin.bottom;
      const bodyW = W - margin.left - margin.right;
      let imgRect = null;
      let textW = bodyW;
      if (hasImage) {
        let imgRatio;
        if (analysis.density === "sparse") imgRatio = 0.5;
        else if (analysis.density === "light") imgRatio = 0.45;
        else if (analysis.density === "heavy") imgRatio = 0.35;
        else if (analysis.density === "dense") imgRatio = 0.3;
        else imgRatio = 0.42;
        if (analysis.type === "hero") imgRatio = 0.5;
        if (analysis.type === "metrics") imgRatio = 0;
        const imgW = Math.max(2.8, Math.min(4.8, bodyW * imgRatio));
        const imgGap = 0.3;
        if (imgRatio > 0) {
          imgRect = { x: margin.left + bodyW - imgW, y: bodyY, w: imgW, h: bodyH };
          textW = bodyW - imgW - imgGap;
        }
      }
      const items = analysis.lines;
      const itemCount = Math.min(items.length, analysis.type === "detailed" ? 8 : 7);
      const useCards = itemCount <= 5 && analysis.density !== "dense";
      let cardGap, cardH;
      if (useCards) {
        cardGap = analysis.density === "dense" ? 0.06 : analysis.density === "heavy" ? 0.08 : 0.1;
        const totalGaps = (itemCount - 1) * cardGap;
        cardH = (bodyH - totalGaps) / itemCount;
        cardH = Math.min(cardH, 0.8);
        cardH = Math.max(cardH, 0.45);
      } else {
        cardGap = 0.04;
        cardH = Math.min((bodyH - (itemCount - 1) * cardGap) / itemCount, 0.48);
        cardH = Math.max(cardH, 0.35);
      }
      const totalStackH = itemCount * cardH + (itemCount - 1) * cardGap;
      const verticalOffset = Math.max(0, (bodyH - totalStackH) / 2);
      const itemRects = [];
      for (let i = 0; i < itemCount; i++) {
        itemRects.push({ x: margin.left, y: bodyY + verticalOffset + i * (cardH + cardGap), w: textW, h: cardH });
      }
      const itemFonts = items.slice(0, itemCount).map((text, i) => {
        const rect = itemRects[i];
        if (!rect) return analysis.optimalBodyFont;
        const textH = this.calcTextHeight(text, analysis.optimalBodyFont, rect.w - 0.5);
        if (textH > rect.h * 0.85) {
          const ratio = (rect.h * 0.85) / textH;
          return Math.max(12, Math.floor(analysis.optimalBodyFont * ratio));
        }
        return analysis.optimalBodyFont;
      });
      return {
        margin, topBarH,
        title: { x: margin.left, y: titleY, w: bodyW, h: titleH, fontSize: analysis.optimalTitleFont },
        accentBar: { x: margin.left, y: accentBarY, w: Math.min(1.3, bodyW * 0.15), h: accentBarH },
        body: { x: margin.left, y: bodyY, w: bodyW, h: bodyH },
        text: { x: margin.left, y: bodyY, w: textW, h: bodyH },
        image: imgRect, items: itemRects, itemFonts, useCards, cardGap, verticalOffset,
        slideNum: { x: W - margin.right - 0.4, y: H - margin.bottom + 0.05 },
      };
    },
    calcGrid(region, count) {
      const cols = count <= 2 ? count : count <= 4 ? 2 : 3;
      const rows = Math.ceil(count / cols);
      const gapX = 0.15; const gapY = 0.15;
      const cellW = (region.w - (cols - 1) * gapX) / cols;
      const cellH = (region.h - (rows - 1) * gapY) / rows;
      const totalH = rows * cellH + (rows - 1) * gapY;
      const offsetY = (region.h - totalH) / 2;
      return Array.from({ length: count }, (_, i) => ({
        x: region.x + (i % cols) * (cellW + gapX),
        y: region.y + offsetY + Math.floor(i / cols) * (cellH + gapY),
        w: cellW, h: cellH,
      }));
    },
    calcColumns(region, gap = 0.35) {
      const colW = (region.w - gap) / 2;
      return {
        left: { x: region.x, y: region.y, w: colW, h: region.h },
        right: { x: region.x + colW + gap, y: region.y, w: colW, h: region.h },
        gap,
      };
    },
    calcHorizontal(region, count) {
      const gap = 0.12;
      const itemW = (region.w - (count - 1) * gap) / count;
      return Array.from({ length: count }, (_, i) => ({
        x: region.x + i * (itemW + gap), y: region.y, w: itemW, h: region.h,
        cx: region.x + i * (itemW + gap) + itemW / 2,
      }));
    },
    clamp(rect) {
      const r = { ...rect };
      const safeL = 0.3, safeR = 0.3, safeT = 0.15, safeB = 0.2;
      if (r.x < safeL) r.x = safeL;
      if (r.y < safeT) r.y = safeT;
      if (r.x + r.w > this.CANVAS_W - safeR) r.w = this.CANVAS_W - safeR - r.x;
      if (r.y + r.h > this.CANVAS_H - safeB) r.h = this.CANVAS_H - safeB - r.y;
      return r;
    },
  };

  const fetchImageAsBase64 = async (url) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Fetch failed");
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const addImageToSlide = async (slide, imageUrl, rect) => {
    if (!imageUrl || !rect) return false;
    const { x, y, w, h } = rect;
    slide.addShape("roundRect", {
      x: x - 0.04, y: y - 0.04, w: w + 0.08, h: h + 0.08,
      fill: { color: c.surface }, rectRadius: 0.12,
      line: { color: c.cardBorder, width: 0.5 },
      shadow: { type: "outer", blur: 8, offset: 3, color: "000000", opacity: 0.1 },
    });
    try {
      const base64 = await fetchImageAsBase64(imageUrl);
      if (base64) {
        slide.addImage({ data: base64, x, y, w, h, sizing: { type: "cover", w, h }, rounding: true });
        return true;
      }
      slide.addImage({ path: imageUrl, x, y, w, h, sizing: { type: "cover", w, h } });
      return true;
    } catch {
      slide.addShape("roundRect", { x, y, w, h, fill: { color: c.surfaceAlt }, rectRadius: 0.12 });
      slide.addText("🖼️\nImage unavailable", {
        x, y, w, h, fontSize: 14, color: c.textLight,
        align: "center", valign: "middle", fontFace: T.fonts.body,
      });
      return false;
    }
  };

  const addDeco = (slide, layout, variant = 0) => {
    slide.addShape("rect", { x: 0, y: 0, w: AILayout.CANVAS_W, h: layout.topBarH, fill: { color: c.secondary } });
    slide.addShape("rect", {
      x: layout.margin.left, y: AILayout.CANVAS_H - 0.06,
      w: AILayout.CANVAS_W - layout.margin.left - layout.margin.right, h: 0.008,
      fill: { color: c.cardBorder },
    });
    const decos = [
      () => {
        slide.addShape("ellipse", { x: AILayout.CANVAS_W - 1.8, y: -0.9, w: 2.8, h: 2.8, fill: { color: c.gradient1, transparency: 94 } });
        slide.addShape("ellipse", { x: -0.6, y: AILayout.CANVAS_H - 1.2, w: 1.6, h: 1.6, fill: { color: c.gradient2, transparency: 95 } });
      },
      () => { slide.addShape("ellipse", { x: AILayout.CANVAS_W - 1.2, y: AILayout.CANVAS_H - 1.4, w: 2.2, h: 2.2, fill: { color: c.accent, transparency: 95 } }); },
      () => {
        slide.addShape("ellipse", { x: -0.8, y: -0.8, w: 2.0, h: 2.0, fill: { color: c.gradient1, transparency: 95 } });
        slide.addShape("ellipse", { x: AILayout.CANVAS_W - 1.0, y: AILayout.CANVAS_H - 1.0, w: 1.8, h: 1.8, fill: { color: c.gradient2, transparency: 96 } });
      },
      () => {
        slide.addShape("ellipse", { x: 8.2, y: -0.6, w: 2.4, h: 2.4, fill: { color: c.gradient1, transparency: 94 } });
        slide.addShape("ellipse", { x: -0.5, y: 3.8, w: 1.8, h: 1.8, fill: { color: c.accent, transparency: 95 } });
      },
    ];
    decos[variant % decos.length]();
    slide.addText("" + (variant + 2), {
      x: layout.slideNum.x, y: layout.slideNum.y, w: 0.4, h: 0.25,
      fontSize: 9, color: c.textLight, align: "right", fontFace: T.fonts.body,
    });
  };

  const addTitle = (slide, title, layout, customSize = null) => {
    slide.addText(title, {
      x: layout.title.x, y: layout.title.y, w: layout.title.w, h: layout.title.h,
      fontSize: customSize || layout.title.fontSize, bold: true, color: c.primary,
      fontFace: T.fonts.heading, valign: "bottom", lineSpacingMultiple: 1.05,
      wrap: true, shrinkText: true,
    });
    slide.addShape("rect", {
      x: layout.accentBar.x, y: layout.accentBar.y, w: layout.accentBar.w, h: layout.accentBar.h,
      fill: { color: c.secondary }, rectRadius: 0.02,
    });
  };

  const renderCover = (pptx) => {
    const slide = pptx.addSlide();
    slide.background = { fill: c.coverBg };
    const W = AILayout.CANVAS_W; const H = AILayout.CANVAS_H;
    slide.addShape("ellipse", { x: 5.2, y: -2.8, w: 7.0, h: 7.0, fill: { color: c.coverBg2, transparency: 50 } });
    slide.addShape("ellipse", { x: 7.2, y: -0.8, w: 3.5, h: 3.5, fill: { color: "FFFFFF", transparency: 92 } });
    slide.addShape("ellipse", { x: -2.0, y: 3.2, w: 4.5, h: 4.5, fill: { color: c.coverBg2, transparency: 60 } });
    const titleFontSize = pptData.topic.length > 60 ? 38 : pptData.topic.length > 40 ? 42 : 46;
    const titleH = H * 0.35; const titleY = H * 0.15;
    slide.addText(pptData.topic, {
      x: 0.8, y: titleY, w: W * 0.7, h: titleH, fontSize: titleFontSize,
      bold: true, color: "FFFFFF", fontFace: T.fonts.heading,
      lineSpacingMultiple: 1.15, wrap: true, shrinkText: true, valign: "bottom",
    });
    const divY = titleY + titleH + 0.2;
    slide.addShape("rect", { x: 0.8, y: divY, w: 2.3, h: 0.06, fill: { color: "FFFFFF", transparency: 40 }, rectRadius: 0.03 });
    slide.addText("AI-Generated Presentation", {
      x: 0.8, y: divY + 0.25, w: W * 0.7, h: 0.5, fontSize: 20, color: "FFFFFF",
      fontFace: T.fonts.body, transparency: 25, valign: "top",
    });
    slide.addText(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }), {
      x: 0.8, y: divY + 0.8, w: W * 0.7, h: 0.4, fontSize: 16, color: "FFFFFF",
      fontFace: T.fonts.body, transparency: 50, valign: "top",
    });
    slide.addShape("rect", { x: 0, y: H - 0.14, w: W, h: 0.14, fill: { color: "FFFFFF", transparency: 85 } });
  };

  const renderStandard = async (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout);
    const items = analysis.lines.slice(0, layout.items.length);
    const accentColors = [c.secondary, c.accent, c.accentAlt];
    if (layout.useCards) {
      layout.items.forEach((rect, i) => {
        if (i >= items.length) return;
        const r = AILayout.clamp(rect);
        slide.addShape("roundRect", { x: r.x, y: r.y, w: r.w, h: r.h, fill: { color: c.surface }, rectRadius: 0.1, line: { color: c.cardBorder, width: 0.5 } });
        slide.addShape("rect", { x: r.x + 0.12, y: r.y + r.h * 0.18, w: 0.055, h: r.h * 0.64, fill: { color: accentColors[i % 3] }, rectRadius: 0.025 });
        slide.addText(items[i], { x: r.x + 0.32, y: r.y, w: r.w - 0.5, h: r.h, fontSize: layout.itemFonts[i] || analysis.optimalBodyFont, color: c.text, fontFace: T.fonts.body, valign: "middle", lineSpacingMultiple: 1.2, wrap: true, shrinkText: true });
      });
    } else {
      layout.items.forEach((rect, i) => {
        if (i >= items.length) return;
        const r = AILayout.clamp(rect);
        slide.addShape("ellipse", { x: r.x + 0.06, y: r.y + r.h / 2 - 0.045, w: 0.09, h: 0.09, fill: { color: c.secondary } });
        slide.addText(items[i], { x: r.x + 0.26, y: r.y, w: r.w - 0.35, h: r.h, fontSize: layout.itemFonts[i] || analysis.optimalBodyFont, color: c.text, fontFace: T.fonts.body, valign: "middle", lineSpacingMultiple: 1.2, wrap: true, shrinkText: true });
      });
    }
    if (layout.image) await addImageToSlide(slide, data.imageUrl, layout.image);
  };

  const renderHero = async (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout, analysis.optimalTitleFont);
    const content = analysis.lines.join("\n\n");
    const hasImage = !!data.imageUrl && layout.image;
    if (hasImage) {
      slide.addText(content, { x: layout.text.x, y: layout.text.y, w: layout.text.w, h: layout.text.h, fontSize: analysis.needsLargeText ? 20 : 18, color: c.text, fontFace: T.fonts.body, lineSpacingMultiple: 1.55, wrap: true, valign: "middle", shrinkText: true });
      await addImageToSlide(slide, data.imageUrl, layout.image);
    } else {
      const padX = layout.body.w * 0.1;
      const cardX = layout.body.x + padX; const cardW = layout.body.w - padX * 2;
      slide.addShape("roundRect", { x: cardX, y: layout.body.y, w: cardW, h: layout.body.h, fill: { color: c.surface }, rectRadius: 0.15, line: { color: c.cardBorder, width: 0.5 } });
      slide.addText(content, { x: cardX + 0.4, y: layout.body.y + 0.2, w: cardW - 0.8, h: layout.body.h - 0.4, fontSize: analysis.needsLargeText ? 22 : 20, color: c.text, fontFace: T.fonts.body, lineSpacingMultiple: 1.55, align: "center", valign: "middle", wrap: true, shrinkText: true });
    }
  };

  const renderQuote = (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout, analysis.optimalTitleFont);
    slide.addText("\u201C", { x: layout.body.x, y: layout.body.y - 0.1, w: 1.0, fontSize: 72, color: c.secondary, fontFace: T.fonts.heading, transparency: 55 });
    const cardPad = 0.25; const cardX = layout.body.x + cardPad; const cardW = layout.body.w - cardPad * 2;
    const cardY = layout.body.y + 0.3; const cardH = layout.body.h - 0.7;
    slide.addShape("roundRect", { x: cardX, y: cardY, w: cardW, h: cardH, fill: { color: c.surface }, rectRadius: 0.1, line: { color: c.cardBorder, width: 0.5 } });
    const quoteText = analysis.lines[0] || "";
    const quoteFontSize = quoteText.length > 150 ? 18 : quoteText.length > 80 ? 20 : 22;
    slide.addText(quoteText, { x: cardX + 0.5, y: cardY + 0.2, w: cardW - 1.0, h: cardH - 0.4, fontSize: quoteFontSize, italic: true, color: c.primary, fontFace: T.fonts.heading, lineSpacingMultiple: 1.4, align: "center", valign: "middle", wrap: true, shrinkText: true });
    if (analysis.lines[1]) {
      slide.addText("— " + analysis.lines.slice(1).join(" "), { x: cardX + 1.5, y: cardY + cardH + 0.08, w: cardW - 1.5, h: 0.35, fontSize: 14, color: c.textMuted, fontFace: T.fonts.body, italic: true, align: "right", valign: "top", shrinkText: true });
    }
  };

  const renderMetrics = (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout);
    const items = analysis.lines.slice(0, 4);
    const cells = AILayout.calcGrid(layout.body, items.length);
    const barColors = [c.secondary, c.accent, c.accentAlt, c.gradient2];
    cells.forEach((cell, i) => {
      const r = AILayout.clamp(cell);
      slide.addShape("roundRect", { x: r.x, y: r.y, w: r.w, h: r.h, fill: { color: c.surface }, rectRadius: 0.1, line: { color: c.cardBorder, width: 0.5 } });
      slide.addShape("rect", { x: r.x + 0.2, y: r.y + 0.15, w: 0.45, h: 0.045, fill: { color: barColors[i % 4] }, rectRadius: 0.02 });
      const numMatch = items[i].match(/(\$?\d[\d,]*\.?\d*\s*[%KkMmBb+]*)/);
      const number = numMatch ? numMatch[0].trim() : "";
      const label = items[i].replace(number, "").replace(/^[\s\-:,]+|[\s\-:,]+$/g, "").trim();
      const metricFontSize = number.length > 8 ? 28 : number.length > 5 ? 32 : 36;
      slide.addText(number || "📊", { x: r.x + 0.2, y: r.y + r.h * 0.22, w: r.w - 0.4, h: r.h * 0.38, fontSize: number ? metricFontSize : 26, bold: true, color: c.secondary, fontFace: T.fonts.heading, align: "left", valign: "middle", shrinkText: true });
      slide.addText(label || items[i], { x: r.x + 0.2, y: r.y + r.h * 0.62, w: r.w - 0.4, h: r.h * 0.3, fontSize: analysis.optimalBodyFont, color: c.textMuted, fontFace: T.fonts.body, lineSpacingMultiple: 1.2, valign: "top", wrap: true, shrinkText: true });
    });
  };

  const renderComparison = (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout);
    const mid = Math.ceil(analysis.lines.length / 2);
    const leftItems = analysis.lines.slice(0, mid); const rightItems = analysis.lines.slice(mid);
    const { left, right, gap } = AILayout.calcColumns(layout.body);
    const vsSize = 0.45; const headerH = 0.4;
    const renderCol = (region, items, headerColor, label) => {
      slide.addShape("roundRect", { x: region.x, y: region.y, w: region.w, h: region.h, fill: { color: c.surface }, rectRadius: 0.1, line: { color: c.cardBorder, width: 0.5 } });
      slide.addShape("roundRect", { x: region.x, y: region.y, w: region.w, h: headerH, fill: { color: headerColor }, rectRadius: 0.1 });
      slide.addShape("rect", { x: region.x, y: region.y + headerH * 0.5, w: region.w, h: headerH * 0.5, fill: { color: headerColor } });
      slide.addText(label, { x: region.x + 0.2, y: region.y, w: region.w - 0.4, h: headerH, fontSize: 15, bold: true, color: "FFFFFF", fontFace: T.fonts.heading, valign: "middle" });
      const itemRegion = { x: region.x, y: region.y + headerH + 0.1, w: region.w, h: region.h - headerH - 0.2 };
      const itemH = Math.min(itemRegion.h / Math.max(items.length, 1), 0.55);
      const totalH = items.length * itemH; const offsetY = (itemRegion.h - totalH) / 2;
      items.forEach((item, i) => {
        const iy = itemRegion.y + offsetY + i * itemH;
        slide.addShape("ellipse", { x: region.x + 0.2, y: iy + itemH / 2 - 0.04, w: 0.08, h: 0.08, fill: { color: headerColor } });
        const fs = AILayout.calcTextHeight(item, 14, region.w - 0.7) > itemH * 0.85 ? 12 : 14;
        slide.addText(item, { x: region.x + 0.38, y: iy, w: region.w - 0.55, h: itemH, fontSize: fs, color: c.text, fontFace: T.fonts.body, valign: "middle", wrap: true, shrinkText: true });
      });
    };
    renderCol(left, leftItems, c.secondary, "Option A");
    renderCol(right, rightItems, c.accent, "Option B");
    const vsX = left.x + left.w + (gap - vsSize) / 2; const vsY = layout.body.y + layout.body.h / 2 - vsSize / 2;
    slide.addShape("ellipse", { x: vsX, y: vsY, w: vsSize, h: vsSize, fill: { color: c.bg }, line: { color: c.secondary, width: 2 }, shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.1 } });
    slide.addText("VS", { x: vsX, y: vsY, w: vsSize, h: vsSize, fontSize: 14, bold: true, color: c.secondary, fontFace: T.fonts.heading, align: "center", valign: "middle" });
  };

  const renderProcess = (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout);
    const steps = analysis.lines.slice(0, 5); const circleSize = 0.4; const circleColW = circleSize + 0.2;
    const cardsRegion = { x: layout.body.x + circleColW, y: layout.body.y, w: layout.body.w - circleColW, h: layout.body.h };
    const stepGap = 0.08;
    const stepH = Math.min((cardsRegion.h - (steps.length - 1) * stepGap) / steps.length, 0.72);
    const totalH = steps.length * stepH + (steps.length - 1) * stepGap;
    const offsetY = (cardsRegion.h - totalH) / 2;
    const stepRects = steps.map((_, i) => ({ x: cardsRegion.x, y: cardsRegion.y + offsetY + i * (stepH + stepGap), w: cardsRegion.w, h: stepH }));
    if (stepRects.length > 1) {
      const firstCY = stepRects[0].y + stepRects[0].h / 2;
      const lastCY = stepRects[stepRects.length - 1].y + stepRects[stepRects.length - 1].h / 2;
      slide.addShape("rect", { x: layout.body.x + circleSize / 2 - 0.018, y: firstCY, w: 0.036, h: lastCY - firstCY, fill: { color: c.secondary, transparency: 70 } });
    }
    stepRects.forEach((rect, i) => {
      const centerY = rect.y + rect.h / 2;
      slide.addShape("ellipse", { x: layout.body.x, y: centerY - circleSize / 2, w: circleSize, h: circleSize, fill: { color: c.secondary }, shadow: { type: "outer", blur: 4, offset: 1, color: "000000", opacity: 0.12 } });
      slide.addText("" + (i + 1), { x: layout.body.x, y: centerY - circleSize / 2, w: circleSize, h: circleSize, fontSize: 14, bold: true, color: "FFFFFF", fontFace: T.fonts.heading, align: "center", valign: "middle" });
      slide.addShape("roundRect", { x: rect.x, y: rect.y, w: rect.w, h: rect.h, fill: { color: c.surface }, rectRadius: 0.08, line: { color: c.cardBorder, width: 0.4 } });
      const fs = AILayout.calcTextHeight(steps[i], 15, rect.w - 0.4) > rect.h * 0.85 ? 13 : 15;
      slide.addText(steps[i], { x: rect.x + 0.2, y: rect.y, w: rect.w - 0.4, h: rect.h, fontSize: fs, color: c.text, fontFace: T.fonts.body, valign: "middle", lineSpacingMultiple: 1.15, wrap: true, shrinkText: true });
    });
  };

  const renderTimeline = (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout);
    const items = analysis.lines.slice(0, 4); const dotSize = 0.3;
    const lineY = layout.body.y + layout.body.h * 0.12;
    slide.addShape("rect", { x: layout.body.x, y: lineY, w: layout.body.w, h: 0.04, fill: { color: c.secondary, transparency: 50 } });
    const cardTopY = lineY + dotSize / 2 + 0.2; const cardH = layout.body.y + layout.body.h - cardTopY;
    const columns = AILayout.calcHorizontal(layout.body, items.length);
    columns.forEach((col, i) => {
      slide.addShape("ellipse", { x: col.cx - dotSize / 2, y: lineY - dotSize / 2 + 0.02, w: dotSize, h: dotSize, fill: { color: c.secondary }, line: { color: c.bg, width: 2.5 } });
      slide.addShape("roundRect", { x: col.x, y: cardTopY, w: col.w, h: cardH, fill: { color: c.surface }, rectRadius: 0.1, line: { color: c.cardBorder, width: 0.5 } });
      const dateMatch = items[i].match(/((?:19|20)\d{2}|Q[1-4]\s*\d{0,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*\d{0,4})/i);
      const date = dateMatch ? dateMatch[0] : "Phase " + (i + 1);
      const desc = items[i].replace(date, "").replace(/^[\s\-:,]+/, "").trim() || items[i];
      slide.addText(date, { x: col.x + 0.12, y: cardTopY + 0.1, w: col.w - 0.24, h: 0.32, fontSize: 14, bold: true, color: c.secondary, fontFace: T.fonts.heading, wrap: true, shrinkText: true });
      const descFS = desc.length > 80 ? 12 : 14;
      slide.addText(desc, { x: col.x + 0.12, y: cardTopY + 0.45, w: col.w - 0.24, h: cardH - 0.58, fontSize: descFS, color: c.textMuted, fontFace: T.fonts.body, lineSpacingMultiple: 1.18, valign: "top", wrap: true, shrinkText: true });
    });
  };

  const renderFeatured = async (slide, data, analysis, layout) => {
    slide.addShape("rect", { x: 0, y: layout.topBarH, w: 0.14, h: AILayout.CANVAS_H - layout.topBarH, fill: { color: c.secondary } });
    addTitle(slide, data.title, layout, analysis.optimalTitleFont);
    const textRect = layout.text;
    slide.addShape("roundRect", { x: textRect.x, y: textRect.y, w: textRect.w, h: textRect.h, fill: { color: c.surface }, rectRadius: 0.1, line: { color: c.cardBorder, width: 0.5 } });
    const items = analysis.lines.slice(0, 6); const innerPad = 0.2;
    const innerRegion = { x: textRect.x + innerPad, y: textRect.y + innerPad, w: textRect.w - innerPad * 2, h: textRect.h - innerPad * 2 };
    const itemH = Math.min(innerRegion.h / items.length, 0.58);
    const totalH = items.length * itemH; const offsetY = (innerRegion.h - totalH) / 2;
    const accentColors = [c.secondary, c.accent, c.accentAlt];
    items.forEach((line, i) => {
      const iy = innerRegion.y + offsetY + i * itemH;
      slide.addShape("ellipse", { x: innerRegion.x + 0.06, y: iy + itemH / 2 - 0.045, w: 0.09, h: 0.09, fill: { color: accentColors[i % 3] } });
      const fs = AILayout.calcTextHeight(line, 15, innerRegion.w - 0.4) > itemH * 0.85 ? 13 : 15;
      slide.addText(line, { x: innerRegion.x + 0.26, y: iy, w: innerRegion.w - 0.35, h: itemH, fontSize: fs, color: c.text, fontFace: T.fonts.body, valign: "middle", wrap: true, shrinkText: true });
    });
    if (layout.image) await addImageToSlide(slide, data.imageUrl, layout.image);
  };

  const renderDetailed = async (slide, data, analysis, layout) => {
    addTitle(slide, data.title, layout);
    const items = analysis.lines.slice(0, 8); const textRect = layout.text;
    const rowH = Math.min(textRect.h / items.length, 0.52);
    const totalH = items.length * rowH; const offsetY = (textRect.h - totalH) / 2;
    items.forEach((line, i) => {
      const iy = textRect.y + offsetY + i * rowH;
      const r = AILayout.clamp({ x: textRect.x, y: iy, w: textRect.w, h: rowH });
      if (i % 2 === 0) slide.addShape("roundRect", { x: r.x, y: r.y, w: r.w, h: r.h, fill: { color: c.surface }, rectRadius: 0.05 });
      slide.addText("" + (i + 1), { x: r.x + 0.12, y: r.y, w: 0.35, h: r.h, fontSize: 14, bold: true, color: c.secondary, fontFace: T.fonts.body, valign: "middle", align: "center" });
      const fs = AILayout.calcTextHeight(line, 15, r.w - 0.7) > r.h * 0.85 ? 13 : 15;
      slide.addText(line, { x: r.x + 0.55, y: r.y, w: r.w - 0.7, h: r.h, fontSize: fs, color: c.text, fontFace: T.fonts.body, valign: "middle", lineSpacingMultiple: 1.15, wrap: true, shrinkText: true });
    });
    if (layout.image) await addImageToSlide(slide, data.imageUrl, layout.image);
  };

  const renderEnd = (pptx) => {
    const slide = pptx.addSlide();
    const W = AILayout.CANVAS_W; const H = AILayout.CANVAS_H;
    slide.background = { fill: c.coverBg };
    slide.addShape("ellipse", { x: -1.5, y: -1.5, w: 5.0, h: 5.0, fill: { color: c.coverBg2, transparency: 50 } });
    slide.addShape("ellipse", { x: 6.5, y: 2.5, w: 5.0, h: 5.0, fill: { color: "FFFFFF", transparency: 92 } });
    const centerY = H * 0.2;
    slide.addText("Thank You!", { x: 0, y: centerY, w: W, h: H * 0.25, fontSize: 50, bold: true, color: "FFFFFF", fontFace: T.fonts.heading, align: "center", valign: "middle" });
    slide.addShape("rect", { x: W / 2 - 1.2, y: centerY + H * 0.27, w: 2.4, h: 0.06, fill: { color: "FFFFFF", transparency: 50 }, rectRadius: 0.03 });
    slide.addText(pptData.topic, { x: 0, y: centerY + H * 0.3, w: W, h: H * 0.15, fontSize: 20, color: "FFFFFF", fontFace: T.fonts.body, align: "center", valign: "middle", transparency: 25, wrap: true, shrinkText: true });
    slide.addText("Created with AI PPT Maker", { x: 0, y: H * 0.78, w: W, h: 0.4, fontSize: 14, color: "FFFFFF", fontFace: T.fonts.body, align: "center", valign: "middle", transparency: 55 });
  };

  const generatePPT = async () => {
    if (!pptData) return;
    setIsGenerating(true);
    setGenerationProgress(0);
    try {
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";
      pptx.title = pptData.topic;
      pptx.author = "AI PPT Maker";
      setGenerationProgress(10);
      renderCover(pptx);
      setGenerationProgress(20);
      const { slides } = pptData;
      for (let i = 0; i < slides.length; i++) {
        const analysis = AILayout.analyzeContent(slides[i].title, slides[i].content);
        const layout = AILayout.calcLayout(analysis, !!slides[i].imageUrl, i);
        const slide = pptx.addSlide();
        slide.background = { fill: c.bg };
        addDeco(slide, layout, i);
        switch (analysis.type) {
          case "quote": renderQuote(slide, slides[i], analysis, layout); break;
          case "hero": await renderHero(slide, slides[i], analysis, layout); break;
          case "metrics": renderMetrics(slide, slides[i], analysis, layout); break;
          case "comparison": renderComparison(slide, slides[i], analysis, layout); break;
          case "process": renderProcess(slide, slides[i], analysis, layout); break;
          case "timeline": renderTimeline(slide, slides[i], analysis, layout); break;
          case "featured": await renderFeatured(slide, slides[i], analysis, layout); break;
          case "detailed": await renderDetailed(slide, slides[i], analysis, layout); break;
          default: await renderStandard(slide, slides[i], analysis, layout); break;
        }
        setGenerationProgress(20 + Math.round(((i + 1) / slides.length) * 65));
        await new Promise((r) => setTimeout(r, 60));
      }
      setGenerationProgress(90);
      renderEnd(pptx);
      const fileName = pptData.topic.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");
      const blob = await pptx.write({ outputType: "blob" });
const { data: { user } } = await supabase.auth.getUser();
if (!user) { alert("You must be logged in"); return; }
const finalFileName = fileName + "-" + T.name + ".pptx";
const filePath = user.id + "/" + finalFileName;

// Upload to Supabase FIRST (wait for it to complete)
const pptxBlob = new Blob([blob], {
  type: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
});

const { error: uploadError } = await supabase.storage
  .from("presentations")
  .upload(filePath, pptxBlob, {
    contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    upsert: true,
  });

if (uploadError) {
  console.error("Upload error:", uploadError);
} else {
  // Save to database only after upload succeeds
  await supabase.from("presentations").insert([{
    user_id: user.id,
    title: pptData.topic,
    ppt_url: filePath,
  }]);
}

// Download directly from memory (works on both mobile & desktop)
const downloadUrl = URL.createObjectURL(pptxBlob);
const link = document.createElement("a");
link.href = downloadUrl;
link.download = finalFileName;
link.setAttribute("type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
document.body.appendChild(link);
link.click();

setTimeout(() => {
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}, 1000);
      
      setGenerationProgress(100);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      console.error("PPT Generation Error:", error);
      alert("Error generating PPT. Please check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // 🖥️ UPGRADED UI
  // ══════════════════════════════════════════════════════════════

  if (!pptData) {
    return (
      <div className="min-h-screen bg-[#06080f] flex items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute rounded-full blur-[120px] animate-pulse"
          style={{
            width: "500px", height: "500px", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 animate-spin"
              style={{ animationDuration: "3s", boxShadow: "0 0 40px -5px rgba(168,85,247,0.5)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-[#06080f] animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-sm font-semibold">Loading Presentation</p>
            <p className="text-gray-600 text-xs mt-1">Preparing your export...</p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: i * 0.15 + "s" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { slides } = pptData;
  const typeIcons = {
    hero: "🎯", quote: "💬", metrics: "📊", comparison: "⚖️",
    process: "📋", timeline: "📅", featured: "⭐", detailed: "📄", standard: "📝",
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: [
            "@keyframes export-gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }",
            ".export-animate-gradient { animation: export-gradient 3s ease infinite; }",
            "@keyframes export-slide-in { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }",
            ".export-animate-slide-in { animation: export-slide-in 0.5s cubic-bezier(0.32,0.72,0,1); }",
            "@keyframes export-glow-pulse { 0%, 100% { opacity: 0.03; transform: scale(1); } 50% { opacity: 0.06; transform: scale(1.1); } }",
            "@keyframes export-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }",
            "@keyframes export-shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }",
            "@keyframes export-fade-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }",
            ".export-scrollbar-hide::-webkit-scrollbar { display: none; }",
            ".export-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }",
            ".export-card-3d { transition: all 0.5s cubic-bezier(0.32,0.72,0,1); }",
            ".export-card-3d:hover { transform: perspective(800px) rotateY(-2deg) scale(1.03); }",
            ".export-card-3d:active { transform: perspective(800px) scale(0.97); }",
          ].join("\n"),
        }}
      />

      <div className="min-h-screen bg-[#06080f] text-white relative overflow-hidden">
        {/* ═══ ANIMATED BACKGROUND ═══ */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
              left: "5%", top: "10%",
              animation: "export-glow-pulse 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
              right: "5%", top: "50%",
              animation: "export-glow-pulse 8s ease-in-out infinite 2s",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
              left: "35%", bottom: "5%",
              animation: "export-glow-pulse 7s ease-in-out infinite 4s",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.012]"
            style={{
              backgroundImage: "linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-400/20"
              style={{
                left: (5 + i * 8) + "%",
                top: (10 + ((i * 31) % 80)) + "%",
                animation: "export-float " + (4 + (i % 4) * 2) + "s ease-in-out infinite " + (i * 0.5) + "s",
              }}
            />
          ))}
        </div>

        {/* ═══ SUCCESS TOAST ═══ */}
        {showSuccess && (
          <div className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:top-6 z-50 export-animate-slide-in">
            <div
              className="px-5 py-4 rounded-2xl flex items-center gap-3 border border-emerald-400/20 backdrop-blur-xl"
              style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.9) 0%, rgba(5,150,105,0.9) 100%)", boxShadow: "0 0 40px -8px rgba(16,185,129,0.5)" }}
            >
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-sm flex-shrink-0 backdrop-blur-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm sm:text-base">PPT Downloaded!</p>
                <p className="text-xs text-white/70 truncate">Your presentation has been saved</p>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          {/* ═══ BACK BUTTON ═══ */}
          <button
            onClick={() => router.push("/builder")}
            className="text-white/30 hover:text-white text-xs sm:text-sm flex items-center gap-2 mb-4 sm:mb-6 transition-all duration-300 group active:scale-95 p-2 -ml-2 rounded-xl hover:bg-white/[0.03]"
          >
            <div className="w-7 h-7 rounded-lg bg-white/[0.03] group-hover:bg-white/[0.06] flex items-center justify-center transition-all duration-300 border border-white/[0.04] group-hover:border-white/[0.08]">
              <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-medium">Back to Builder</span>
          </button>

          {/* ═══ HEADER ═══ */}
          <div className="mb-5 sm:mb-7" style={{ animation: "export-fade-up 0.6s ease-out" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent leading-tight truncate sm:whitespace-normal">
                  {pptData.topic}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[10px] sm:text-xs font-semibold text-white/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60" />
                    {slides.length} slides
                  </span>
                  <span className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.06] rounded-xl text-[10px] sm:text-xs font-semibold text-white/60 flex items-center gap-1.5">
                    {T.emoji} {T.name}
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-bold flex items-center gap-1.5 border"
                    style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.1) 0%, rgba(236,72,153,0.1) 100%)", borderColor: "rgba(168,85,247,0.2)", color: "rgb(196,148,255)" }}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Layout
                  </span>
                </div>
              </div>

              {/* ═══ DOWNLOAD BUTTON ═══ */}
              <button
                onClick={generatePPT}
                disabled={isGenerating}
                className={
                  "w-full sm:w-auto flex-shrink-0 group relative px-6 sm:px-8 py-3.5 rounded-2xl font-bold text-white overflow-hidden transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed border " +
                  (isGenerating
                    ? "border-white/5"
                    : "border-purple-400/20 hover:scale-[1.02] active:scale-[0.98]")
                }
                style={
                  !isGenerating
                    ? { boxShadow: "0 0 50px -12px rgba(168,85,247,0.5)" }
                    : undefined
                }
              >
                <div
                  className={"absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%] " + (isGenerating ? "" : "export-animate-gradient")}
                />
                {/* Shimmer overlay */}
                {!isGenerating && (
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                      style={{ animation: "export-shimmer 3s infinite" }}
                    />
                  </div>
                )}
                <div className="relative flex items-center justify-center gap-2.5">
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm font-bold">Generating... {generationProgress}%</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="text-sm sm:text-base font-bold">Download PPT</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* ═══ PROGRESS BAR ═══ */}
            {isGenerating && (
              <div className="mt-4" style={{ animation: "export-fade-up 0.3s ease-out" }}>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.04]">
                  <div
                    className="h-full rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{
                      width: generationProgress + "%",
                      background: "linear-gradient(90deg, #a855f7, #ec4899, #a855f7)",
                      backgroundSize: "200% 100%",
                      animation: "export-gradient 2s linear infinite",
                      boxShadow: "0 0 20px -2px rgba(168,85,247,0.5)",
                    }}
                  >
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ animation: "export-shimmer 1.5s infinite" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <p className="text-white/40 text-[10px] sm:text-xs font-medium">
                    {generationProgress < 20 && "Analyzing content structure..."}
                    {generationProgress >= 20 && generationProgress < 85 && "Computing optimal slide layouts..."}
                    {generationProgress >= 85 && generationProgress < 100 && "Adding final polish..."}
                    {generationProgress === 100 && "Complete! Downloading your presentation..."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ═══ TEMPLATE SELECTOR ═══ */}
          <div className="mb-5 sm:mb-7" style={{ animation: "export-fade-up 0.6s ease-out 0.1s both" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-[8px]">🎨</span>
              </div>
              <h2 className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest">Template</h2>
            </div>
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 export-scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
              {Object.entries(TEMPLATES).map(([key, tmpl]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={
                    "flex-shrink-0 relative p-2 sm:p-2.5 rounded-2xl transition-all duration-500 text-center min-w-[60px] sm:min-w-[76px] group " +
                    (selectedTemplate === key
                      ? "scale-105 border-purple-500/50"
                      : "border-white/[0.04] hover:border-white/[0.08] active:scale-95")
                  }
                  style={
                    selectedTemplate === key
                      ? {
                          background: "linear-gradient(135deg, rgba(168,85,247,0.12) 0%, rgba(59,130,246,0.08) 100%)",
                          border: "1px solid rgba(168,85,247,0.3)",
                          boxShadow: "0 0 30px -8px rgba(168,85,247,0.3)",
                        }
                      : {
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }
                  }
                >
                  <div
                    className="text-lg sm:text-xl mb-1 transition-transform duration-300"
                    style={selectedTemplate === key ? { animation: "export-float 2s ease-in-out infinite" } : undefined}
                  >
                    {tmpl.emoji}
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold text-white/70 leading-tight mb-1">{tmpl.name}</div>
                  <div className="flex justify-center gap-0.5">
                    <div className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "#" + tmpl.colors.secondary }} />
                    <div className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "#" + tmpl.colors.accent }} />
                    <div className="w-2 h-2 rounded-full transition-transform duration-300 group-hover:scale-110" style={{ backgroundColor: "#" + tmpl.colors.accentAlt }} />
                  </div>
                  {selectedTemplate === key && (
                    <div
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", boxShadow: "0 0 12px -2px rgba(168,85,247,0.6)" }}
                    >
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ═══ SLIDES GRID ═══ */}
          <div style={{ animation: "export-fade-up 0.6s ease-out 0.2s both" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                  <span className="text-[8px]">📑</span>
                </div>
                <h2 className="text-[10px] sm:text-xs font-bold text-white/40 uppercase tracking-widest">Slide Preview</h2>
              </div>
              <span className="text-[10px] sm:text-xs text-white/20 font-medium">{slides.length + 2} total</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
              {/* Cover Slide */}
              <div
                className={
                  "rounded-2xl overflow-hidden cursor-pointer export-card-3d ring-1 " +
                  (currentPreview === -1
                    ? "ring-purple-500/50"
                    : "ring-white/[0.04] hover:ring-white/[0.08]")
                }
                style={currentPreview === -1 ? { boxShadow: "0 0 30px -8px rgba(168,85,247,0.25)" } : undefined}
                onClick={() => setCurrentPreview(-1)}
              >
                <div className="aspect-[16/9] p-3 sm:p-3.5 flex flex-col justify-center relative overflow-hidden" style={{ backgroundColor: "#" + c.coverBg }}>
                  <div className="absolute -top-3 -right-3 w-12 sm:w-16 h-12 sm:h-16 rounded-full opacity-30" style={{ backgroundColor: "#" + c.coverBg2 }} />
                  <div className="absolute -bottom-2 -left-2 w-10 sm:w-14 h-10 sm:h-14 rounded-full opacity-20" style={{ backgroundColor: "#" + c.coverBg2 }} />
                  <div className="relative z-10">
                    <div className="text-[6px] sm:text-[8px] text-white/40 mb-1 uppercase tracking-[0.15em] font-bold">Cover</div>
                    <h3 className="text-white font-black text-[9px] sm:text-[11px] leading-tight line-clamp-2 mb-1.5">{pptData.topic}</h3>
                    <div className="w-5 sm:w-7 h-[2px] bg-white/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Content Slides */}
              {slides.map((slide, i) => {
                const analysis = AILayout.analyzeContent(slide.title, slide.content);
                return (
                  <div
                    key={i}
                    className={
                      "rounded-2xl overflow-hidden cursor-pointer export-card-3d ring-1 " +
                      (currentPreview === i
                        ? "ring-purple-500/50"
                        : "ring-white/[0.04] hover:ring-white/[0.08]")
                    }
                    style={
                      currentPreview === i
                        ? { boxShadow: "0 0 30px -8px rgba(168,85,247,0.25)" }
                        : undefined
                    }
                    onClick={() => setCurrentPreview(i)}
                  >
                    <div className="aspect-[16/9] relative overflow-hidden" style={{ backgroundColor: "#" + c.bg }}>
                      {/* Top accent bar */}
                      <div className="h-[2px] sm:h-[3px]" style={{ backgroundColor: "#" + c.secondary }}>
                        <div
                          className="h-full bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/3"
                          style={{ animation: "export-shimmer 3s infinite " + (i * 0.3) + "s" }}
                        />
                      </div>
                      <div className="p-1.5 sm:p-2 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className="text-[6px] sm:text-[8px] font-bold px-1.5 py-[2px] rounded-md"
                            style={{ color: "#" + c.secondary, backgroundColor: "#" + c.surface }}
                          >
                            {typeIcons[analysis.type]} {!isMobile && analysis.type}
                          </span>
                          <span className="text-[6px] sm:text-[8px] font-bold" style={{ color: "#" + c.textLight }}>{i + 2}</span>
                        </div>
                        <h3
                          className="font-black text-[8px] sm:text-[10px] leading-tight line-clamp-1 sm:line-clamp-2 mb-0.5"
                          style={{ color: "#" + c.primary }}
                        >
                          {slide.title}
                        </h3>
                        <div className="w-3 sm:w-4 h-[1.5px] rounded-full mb-0.5" style={{ backgroundColor: "#" + c.secondary }} />
                        <div className="flex-1 space-y-[2px] sm:space-y-[3px] overflow-hidden">
                          {analysis.lines.slice(0, isMobile ? 2 : 3).map((line, idx) => (
                            <div key={idx} className="flex items-start gap-0.5 sm:gap-1">
                              <div className="w-[3px] h-[3px] sm:w-1 sm:h-1 rounded-full mt-[3px] flex-shrink-0" style={{ backgroundColor: "#" + c.secondary }} />
                              <p className="text-[5px] sm:text-[8px] line-clamp-1 leading-tight" style={{ color: "#" + c.text }}>
                                {line.length > (isMobile ? 28 : 42) ? line.slice(0, isMobile ? 28 : 42) + "\u2026" : line}
                              </p>
                            </div>
                          ))}
                          {analysis.lines.length > (isMobile ? 2 : 3) && (
                            <p className="text-[5px] sm:text-[7px]" style={{ color: "#" + c.textLight }}>+{analysis.lines.length - (isMobile ? 2 : 3)} more</p>
                          )}
                        </div>
                        {slide.imageUrl && (
                          <div className="mt-auto pt-0.5 flex items-center gap-1">
                            <div className="w-7 sm:w-9 h-4 sm:h-5 rounded-md overflow-hidden flex-shrink-0 ring-1 ring-white/10" style={{ backgroundColor: "#" + c.surface }}>
                              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                            </div>
                            <span className="text-[5px] sm:text-[7px]" style={{ color: "#" + c.textLight }}>📷</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End Slide */}
              <div
                className={
                  "rounded-2xl overflow-hidden cursor-pointer export-card-3d ring-1 " +
                  (currentPreview === slides.length
                    ? "ring-purple-500/50"
                    : "ring-white/[0.04] hover:ring-white/[0.08]")
                }
                style={currentPreview === slides.length ? { boxShadow: "0 0 30px -8px rgba(168,85,247,0.25)" } : undefined}
                onClick={() => setCurrentPreview(slides.length)}
              >
                <div className="aspect-[16/9] p-3 sm:p-3.5 flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#" + c.coverBg }}>
                  <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full opacity-30" style={{ backgroundColor: "#" + c.coverBg2 }} />
                  <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-full opacity-10 bg-white" />
                  <div className="relative z-10 text-center">
                    <div className="text-[6px] sm:text-[8px] text-white/40 mb-0.5 uppercase tracking-[0.15em] font-bold">End</div>
                    <h3 className="text-white font-black text-[10px] sm:text-sm">Thank You!</h3>
                    <div className="w-4 sm:w-6 h-[2px] bg-white/25 rounded-full mx-auto my-1" />
                    <p className="text-white/35 text-[5px] sm:text-[8px] line-clamp-1">{pptData.topic}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ SLIDE DETAIL PANEL ═══ */}
          {currentPreview >= 0 && currentPreview < slides.length && (
            <div className="mt-4 sm:mt-5" style={{ animation: "export-fade-up 0.4s ease-out" }}>
              <div
                className="p-4 sm:p-5 rounded-2xl border backdrop-blur-xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(168,85,247,0.02) 100%)",
                  borderColor: "rgba(255,255,255,0.06)",
                }}
              >
                {/* Subtle top gradient line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                      style={{
                        background: "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.2))",
                        border: "1px solid rgba(168,85,247,0.15)",
                      }}
                    >
                      {currentPreview + 2}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-white/80">{slides[currentPreview].title}</h3>
                      <p className="text-[10px] text-white/30 font-medium">Slide {currentPreview + 2}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentPreview(-2)}
                    className="text-white/20 hover:text-white/60 transition-all duration-300 p-1.5 rounded-lg hover:bg-white/[0.04]"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                  <div>
                    {(() => {
                      const a = AILayout.analyzeContent(slides[currentPreview].title, slides[currentPreview].content);
                      return (
                        <>
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span
                              className="px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1"
                              style={{
                                background: "linear-gradient(135deg, rgba(168,85,247,0.12), rgba(59,130,246,0.08))",
                                border: "1px solid rgba(168,85,247,0.2)",
                                color: "rgb(196,148,255)",
                              }}
                            >
                              {typeIcons[a.type]} {a.type}
                            </span>
                            <span className="text-[10px] text-white/25 font-medium">{a.lines.length} items</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] text-white/20 font-medium">density: {a.density}</span>
                          </div>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto export-scrollbar-hide">
                            {a.lines.map((line, idx) => (
                              <div key={idx} className="flex items-start gap-2 group">
                                <span
                                  className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 transition-transform duration-300 group-hover:scale-150"
                                  style={{ backgroundColor: "rgba(168,85,247,0.4)" }}
                                />
                                <p className="text-[11px] sm:text-xs text-white/40 leading-relaxed group-hover:text-white/60 transition-colors duration-300">{line}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {slides[currentPreview].imageUrl && (
                    <div className="flex-shrink-0">
                      <div className="w-full sm:w-44 h-28 sm:h-32 rounded-xl overflow-hidden border border-white/[0.06] relative group">
                        <img
                          src={slides[currentPreview].imageUrl}
                          alt=""
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white/15 text-[10px] font-medium">Image unavailable</div>';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ FOOTER ═══ */}
          <div className="mt-8 sm:mt-10 text-center pb-4">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto mb-3" />
            <p className="text-white/10 text-[10px] sm:text-xs font-medium">
              AI PPT Maker &middot; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}