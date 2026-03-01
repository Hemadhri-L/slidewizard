"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";

function BuilderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const mode = searchParams.get("mode");
  const topic = searchParams.get("topic") || "Untitled Presentation";
  const slideCount = Number(searchParams.get("slides")) || 5;

  const [tone, setTone] = useState("Professional");
  const [selectedTemplate, setSelectedTemplate] = useState("aurora");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const templates = [
    {
      id: "aurora",
      name: "Aurora",
      preview: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
      icon: "🌈",
    },
    {
      id: "minimal",
      name: "Minimal",
      preview: "bg-gradient-to-br from-gray-100 to-white",
      textColor: "text-gray-800",
      icon: "⚪",
    },
    {
      id: "midnight",
      name: "Midnight",
      preview: "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]",
      icon: "🌙",
    },
    {
      id: "beige",
      name: "Beige",
      preview: "bg-gradient-to-br from-[#f5f1e8] to-[#e8e0d0]",
      textColor: "text-gray-800",
      icon: "📜",
    },
    {
      id: "bold",
      name: "Bold",
      preview: "bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700",
      icon: "⚡",
    },
    {
      id: "nature",
      name: "Nature",
      preview: "bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700",
      icon: "🌿",
    },
  ];

  const [slides, setSlides] = useState(() => {
    if (mode === "upload") {
      try {
        const uploadedData = localStorage.getItem("uploadedPPT");
        if (uploadedData) {
          const parsed = JSON.parse(uploadedData);
          if (parsed.slides && parsed.slides.length > 0) {
            return parsed.slides;
          }
        }
      } catch (e) {
        console.error("Failed to load uploaded slides:", e);
      }
    }
    return Array.from({ length: slideCount }, (_, i) => ({
      title: `Slide ${i + 1}`,
      content: "Click Generate AI Slides to create content...",
      imageUrl: null,
    }));
  });

  useEffect(() => {
    if (mode === "upload") {
      setIsUploadMode(true);
      try {
        localStorage.removeItem("uploadedPPT");
      } catch (e) {
        /* ignore */
      }
    }
  }, [mode]);

  const generateSlides = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          slideCount: slides.length,
          tone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate slides");
      }

      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setSlides(data);
        setActiveSlide(0);
        setIsUploadMode(false);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      setError(err.message);
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteSlide = (index) => {
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== index);
    setSlides(updated);
    if (activeSlide >= updated.length) {
      setActiveSlide(updated.length - 1);
    }
  };

  const duplicateSlide = (index) => {
    const newSlide = {
      ...slides[index],
      title: slides[index].title + " (Copy)",
    };
    const updated = [...slides];
    updated.splice(index + 1, 0, newSlide);
    setSlides(updated);
  };

  const moveSlide = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSlides(updated);
    setActiveSlide(newIndex);
  };

  const goToExport = () => {
    localStorage.setItem(
      "pptData",
      JSON.stringify({ slides, topic, template: selectedTemplate })
    );
    router.push("/export");
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes builder-float {
              0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.6; }
              50% { transform: translateY(-80px) translateX(20px); opacity: 0.3; }
            }
            @keyframes builder-glow-pulse {
              0%, 100% { opacity: 0.03; transform: scale(1); }
              50% { opacity: 0.06; transform: scale(1.1); }
            }
            @keyframes builder-slide-down {
              from { opacity: 0; transform: translateY(-12px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes builder-slide-up {
              from { opacity: 0.7; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes builder-shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
            @keyframes builder-border-glow {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 0.8; }
            }
            .builder-scrollbar-thin::-webkit-scrollbar { width: 4px; }
            .builder-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
            .builder-scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 100px; }
            .builder-scrollbar-thin::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
            .builder-scrollbar-hide::-webkit-scrollbar { display: none; }
            .builder-scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            .builder-anim-float { animation: builder-float 10s infinite linear; }
            .builder-anim-slide-down { animation: builder-slide-down 0.5s ease-out; }
            .builder-anim-slide-up { animation: builder-slide-up 0.3s ease-out; }
          `,
        }}
      />

      <div className="min-h-screen bg-[#06080f] text-white flex relative overflow-hidden">
        {/* ═══ ANIMATED BACKGROUND ═══ */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{
              background: "radial-gradient(circle, #a855f7 0%, transparent 70%)",
              left: "10%",
              top: "20%",
              animation: "builder-glow-pulse 6s ease-in-out infinite",
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
              right: "10%",
              top: "40%",
              animation: "builder-glow-pulse 8s ease-in-out infinite 2s",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{
              background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
              left: "40%",
              bottom: "10%",
              animation: "builder-glow-pulse 7s ease-in-out infinite 4s",
            }}
          />

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* Particles */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-400/20 builder-anim-float"
              style={{
                left: (7 + i * 6.5) + "%",
                top: (5 + ((i * 37) % 90)) + "%",
                animationDuration: (8 + (i % 5) * 3) + "s",
                animationDelay: (i * 0.7) + "s",
              }}
            />
          ))}
        </div>

        {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══ LEFT SIDEBAR ═══ */}
        <div
          className={
            "fixed lg:relative z-50 lg:z-auto h-full w-72 lg:w-72 border-r border-white/[0.06] bg-[#080b16]/95 backdrop-blur-xl flex flex-col transition-transform duration-500 " +
            (sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0")
          }
        >
          {/* Sidebar Header */}
          <div className="p-5 border-b border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Slides</h3>
                  <p className="text-[10px] text-gray-500 font-medium">
                    {slides.length} total
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Slide Thumbnails */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 builder-scrollbar-thin">
            {slides.map((slide, index) => (
              <div
                key={index}
                onClick={() => {
                  setActiveSlide(index);
                  setSidebarOpen(false);
                }}
                className={
                  "relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 group " +
                  (activeSlide === index
                    ? "ring-2 ring-purple-500/70 scale-[1.02]"
                    : "ring-1 ring-white/[0.06] hover:ring-white/[0.12] opacity-60 hover:opacity-100")
                }
                style={
                  activeSlide === index
                    ? {
                        boxShadow: "0 0 30px -5px rgba(168,85,247,0.3)",
                        transform: "perspective(800px) rotateY(-2deg) scale(1.02)",
                      }
                    : undefined
                }
              >
                {/* Slide number */}
                <div className="absolute top-2 left-2 z-10">
                  <div
                    className={
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold backdrop-blur-md transition-all duration-300 " +
                      (activeSlide === index
                        ? "bg-purple-500/80 text-white shadow-lg shadow-purple-500/30"
                        : "bg-black/40 text-gray-400")
                    }
                  >
                    {index + 1}
                  </div>
                </div>

                {activeSlide === index && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 z-[1]" />
                )}

                <div className="aspect-video bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-3 relative z-[2]">
                  <p className="text-[11px] font-bold truncate mt-4 text-white/90">
                    {slide.title}
                  </p>
                  <p className="text-[9px] mt-1.5 line-clamp-2 text-gray-500 leading-relaxed">
                    {slide.content}
                  </p>
                  {slide.imageUrl && (
                    <div className="mt-2 w-full h-7 rounded-lg overflow-hidden ring-1 ring-white/10">
                      <img
                        src={slide.imageUrl}
                        alt=""
                        className="w-full h-full object-cover opacity-50"
                      />
                    </div>
                  )}
                </div>

                {activeSlide === index && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{ animation: "builder-shimmer 2s infinite" }}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Add slide */}
            <button
              onClick={() => {
                setSlides([
                  ...slides,
                  {
                    title: "Slide " + (slides.length + 1),
                    content: "",
                    imageUrl: null,
                  },
                ]);
                setActiveSlide(slides.length);
              }}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/[0.06] hover:border-purple-500/40 hover:bg-purple-500/[0.03] transition-all duration-500 flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/[0.03] group-hover:bg-purple-500/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                <svg
                  className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-medium text-gray-600 group-hover:text-purple-400 transition-colors duration-300">
                Add Slide
              </span>
            </button>
          </div>
        </div>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          {/* ═══ TOP BAR ═══ */}
          <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#080b16]/80 backdrop-blur-2xl">
            <div className="p-3 sm:p-4 md:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  {/* Mobile sidebar toggle */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all duration-300"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold truncate max-w-[180px] sm:max-w-xs md:max-w-md bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                      {topic}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        {slides.length} slides
                      </span>
                      <span className="w-1 h-1 rounded-full bg-gray-700" />
                      <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                        {tone}
                      </span>
                      {isUploadMode && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span className="text-[10px] sm:text-xs text-purple-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                            Imported
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={generateSlides}
                    disabled={isGenerating}
                    className={
                      "flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-500 " +
                      (isGenerating
                        ? "bg-gray-800/50 cursor-not-allowed opacity-60 border border-white/5"
                        : "bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 hover:from-purple-500 hover:via-violet-500 hover:to-blue-500 hover:scale-[1.02] active:scale-[0.98] border border-purple-400/20")
                    }
                    style={
                      !isGenerating
                        ? { boxShadow: "0 0 40px -10px rgba(168,85,247,0.5)" }
                        : undefined
                    }
                  >
                    {isGenerating ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">AI...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        <span className="hidden sm:inline">
                          {isUploadMode
                            ? "Regenerate with AI"
                            : "Generate AI Slides"}
                        </span>
                        <span className="sm:hidden">Generate</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={goToExport}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 sm:px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-2xl text-xs sm:text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 border border-emerald-400/20"
                    style={{
                      boxShadow: "0 0 40px -10px rgba(16,185,129,0.4)",
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Export PPT</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ UPLOAD BANNER ═══ */}
          {isUploadMode && (
            <div className="mx-3 sm:mx-5 mt-4 builder-anim-slide-down">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-500/[0.08] via-violet-500/[0.05] to-blue-500/[0.08] border border-purple-500/20 rounded-2xl flex items-start gap-3 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 animate-pulse" />
                <div className="relative w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📄</span>
                </div>
                <div className="flex-1 min-w-0 relative">
                  <p className="text-sm font-bold text-purple-200">
                    Imported from uploaded PPT
                  </p>
                  <p className="text-xs text-purple-300/60 mt-1.5 leading-relaxed">
                    Your slides have been extracted and loaded below. Edit them
                    freely, pick a template, then hit{" "}
                    <strong className="text-purple-300/80">Export PPT</strong>{" "}
                    to redesign. Or click{" "}
                    <strong className="text-purple-300/80">
                      Regenerate with AI
                    </strong>{" "}
                    for fresh content.
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadMode(false)}
                  className="relative text-purple-400/60 hover:text-purple-300 flex-shrink-0 p-1 rounded-lg hover:bg-purple-500/10 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS PANEL ═══ */}
          <div className="border-b border-white/[0.06]">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <svg
                    className="w-3.5 h-3.5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Design Settings
                </span>
              </div>
              <svg
                className={
                  "w-4 h-4 text-gray-500 transition-transform duration-300 " +
                  (settingsOpen ? "rotate-180" : "")
                }
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              className={
                "overflow-hidden transition-all duration-500 " +
                (settingsOpen
                  ? "max-h-[500px] opacity-100"
                  : "max-h-0 opacity-0")
              }
            >
              <div className="px-3 sm:px-5 pb-5 space-y-6">
                {/* Templates */}
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center text-[8px]">
                      🎨
                    </span>
                    Template Style
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-2 builder-scrollbar-hide -mx-1 px-1">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={
                          "min-w-[100px] sm:min-w-[130px] md:min-w-[150px] rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden flex-shrink-0 hover:scale-[1.03] active:scale-[0.98] " +
                          (selectedTemplate === template.id
                            ? "ring-2 ring-purple-500/70 scale-[1.03]"
                            : "ring-1 ring-white/[0.06] opacity-50 hover:opacity-80")
                        }
                        style={
                          selectedTemplate === template.id
                            ? {
                                boxShadow:
                                  "0 0 30px -8px rgba(168,85,247,0.4)",
                                transform:
                                  "perspective(600px) rotateY(-3deg) scale(1.03)",
                              }
                            : undefined
                        }
                      >
                        <div
                          className={
                            "h-16 sm:h-20 md:h-24 " +
                            template.preview +
                            " relative"
                          }
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl sm:text-2xl drop-shadow-lg">
                              {template.icon}
                            </span>
                          </div>
                          <div className="absolute bottom-0 inset-x-0 p-1.5 sm:p-2 bg-black/50 backdrop-blur-md">
                            <span className="text-[10px] sm:text-xs font-bold">
                              {template.name}
                            </span>
                          </div>
                          {selectedTemplate === template.id && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/40">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center text-[8px]">
                      🎭
                    </span>
                    Presentation Tone
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { name: "Professional", icon: "💼" },
                      { name: "Creative", icon: "🎨" },
                      { name: "Academic", icon: "🎓" },
                      { name: "Startup", icon: "🚀" },
                      { name: "Casual", icon: "😊" },
                    ].map((t) => (
                      <button
                        key={t.name}
                        onClick={() => setTone(t.name)}
                        className={
                          "flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] " +
                          (tone === t.name
                            ? "bg-gradient-to-r from-purple-600/40 to-blue-600/40 ring-1 ring-purple-400/30 text-white"
                            : "bg-white/[0.03] hover:bg-white/[0.06] ring-1 ring-white/[0.06] text-gray-400 hover:text-gray-300")
                        }
                        style={
                          tone === t.name
                            ? {
                                boxShadow:
                                  "0 0 20px -5px rgba(168,85,247,0.3)",
                              }
                            : undefined
                        }
                      >
                        <span className="text-sm">{t.icon}</span>
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Error ═══ */}
          {error && (
            <div className="mx-3 sm:mx-5 mt-4 builder-anim-slide-down">
              <div className="p-4 bg-red-500/[0.08] border border-red-500/20 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-red-300/80 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400/60 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/10 transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* ═══ SLIDE EDITOR ═══ */}
          <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto builder-scrollbar-thin">
            <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={
                    "rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-700 " +
                    (activeSlide === index
                      ? "ring-1 ring-purple-500/40 builder-anim-slide-up"
                      : "ring-1 ring-white/[0.04] hover:ring-white/[0.08]")
                  }
                  style={
                    activeSlide === index
                      ? {
                          boxShadow:
                            "0 0 60px -15px rgba(168,85,247,0.15)",
                        }
                      : undefined
                  }
                >
                  {/* Slide Header */}
                  <div
                    className={
                      "flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 transition-all duration-500 border-b border-white/[0.04] " +
                      (activeSlide === index
                        ? "bg-gradient-to-r from-purple-500/[0.06] via-gray-800/60 to-blue-500/[0.06]"
                        : "bg-white/[0.02]")
                    }
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={
                          "w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-500 " +
                          (activeSlide === index
                            ? "bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/30"
                            : "bg-white/[0.04] text-gray-500")
                        }
                      >
                        {index + 1}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {slide.imageUrl ? (
                          <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
                            With Image
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                            Text Only
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(index, -1);
                        }}
                        disabled={index === 0}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-20 transition-all duration-300 hover:scale-110 active:scale-90"
                        title="Move Up"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSlide(index, 1);
                        }}
                        disabled={index === slides.length - 1}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-white/[0.06] disabled:opacity-20 transition-all duration-300 hover:scale-110 active:scale-90"
                        title="Move Down"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      <div className="w-px h-4 bg-white/[0.06] mx-1 hidden sm:block" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateSlide(index);
                        }}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-blue-500/10 transition-all duration-300 text-gray-500 hover:text-blue-400 hover:scale-110 active:scale-90"
                        title="Duplicate"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(index);
                        }}
                        disabled={slides.length <= 1}
                        className="p-1 sm:p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-300 text-gray-500 hover:text-red-400 disabled:opacity-20 hover:scale-110 active:scale-90"
                        title="Delete"
                      >
                        <svg
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Slide Body */}
                  <div
                    className={
                      "p-4 sm:p-5 md:p-6 space-y-4 transition-all duration-500 " +
                      (activeSlide === index
                        ? "bg-gradient-to-b from-gray-900/40 via-gray-900/20 to-gray-900/40"
                        : "bg-white/[0.01]")
                    }
                  >
                    {/* Title */}
                    <input
                      className="text-base sm:text-lg md:text-xl font-black bg-transparent w-full outline-none placeholder-gray-700 border-b-2 border-white/[0.04] focus:border-purple-500/50 pb-3 transition-all duration-500 text-white/90"
                      value={slide.title}
                      placeholder="Enter slide title..."
                      onChange={(e) => {
                        const updated = [...slides];
                        updated[index].title = e.target.value;
                        setSlides(updated);
                      }}
                    />

                    {/* Content */}
                    <textarea
                      rows={4}
                      className="w-full bg-white/[0.02] text-gray-400 rounded-2xl p-3 sm:p-4 outline-none text-sm sm:text-base resize-none border border-white/[0.04] focus:border-purple-500/30 focus:bg-white/[0.03] transition-all duration-500 placeholder-gray-700 leading-relaxed"
                      placeholder="Enter slide content with bullet points..."
                      value={slide.content}
                      onChange={(e) => {
                        const updated = [...slides];
                        updated[index].content = e.target.value;
                        setSlides(updated);
                      }}
                    />

                    {/* Image */}
                    {slide.imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden group ring-1 ring-white/[0.06]">
                        <img
                          src={slide.imageUrl}
                          className="w-full h-44 sm:h-56 md:h-64 lg:h-72 object-cover transition-transform duration-700 group-hover:scale-105"
                          alt={"Image for " + slide.title}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-6 rounded-2xl">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = [...slides];
                              updated[index].imageUrl = null;
                              setSlides(updated);
                            }}
                            className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 px-4 py-2 bg-red-500/90 hover:bg-red-500 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 backdrop-blur-sm border border-red-400/20"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Remove Image
                          </button>
                        </div>

                        <div className="absolute top-3 left-3 px-2.5 py-1.5 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10">
                          <span className="text-[9px] sm:text-[10px] font-bold text-gray-300">
                            {isUploadMode
                              ? "📷 Extracted"
                              : "📷 AI Generated"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-28 sm:h-32 rounded-2xl border-2 border-dashed border-white/[0.04] hover:border-purple-500/20 flex flex-col items-center justify-center gap-2 text-gray-600 transition-all duration-500 hover:bg-purple-500/[0.02] group">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center group-hover:bg-purple-500/[0.05] transition-all duration-300">
                          <svg
                            className="w-5 h-5 text-gray-700 group-hover:text-purple-500/50 transition-colors duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium">
                          Image will appear after generation
                        </span>
                      </div>
                    )}
                  </div>

                  {activeSlide === index && (
                    <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
                  )}
                </div>
              ))}

              {/* Add Slide - Mobile */}
              <button
                onClick={() => {
                  setSlides([
                    ...slides,
                    {
                      title: "Slide " + (slides.length + 1),
                      content: "",
                      imageUrl: null,
                    },
                  ]);
                  setActiveSlide(slides.length);
                }}
                className="lg:hidden w-full py-5 rounded-2xl border-2 border-dashed border-white/[0.04] hover:border-purple-500/30 hover:bg-purple-500/[0.02] transition-all duration-500 flex items-center justify-center gap-3 text-gray-500 hover:text-purple-400 group"
              >
                <div className="w-10 h-10 rounded-2xl bg-white/[0.02] group-hover:bg-purple-500/10 flex items-center justify-center transition-all duration-300">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span className="text-sm font-semibold">Add New Slide</span>
              </button>

              <div className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Builder() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#06080f] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div
              className="absolute rounded-full blur-[120px] animate-pulse"
              style={{
                width: "500px",
                height: "500px",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 animate-spin"
                style={{
                  animationDuration: "3s",
                  boxShadow: "0 0 40px -5px rgba(168,85,247,0.5)",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-xl bg-[#06080f] animate-spin"
                  style={{
                    animationDuration: "3s",
                    animationDirection: "reverse",
                  }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-300 text-sm font-semibold">
                Loading Builder
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Preparing your workspace...
              </p>
            </div>

            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: i * 0.15 + "s" }}
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}