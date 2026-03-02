"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { parsePptxFile } from "../utils/parsePptx";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";
import Image from "next/image";

// ── Helper Component for Scroll Animations ──
function FadeInSection({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    });
    const currentElement = domRef.current;
    if (currentElement) observer.observe(currentElement);
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // ── Auth Check ──
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoadingSession(false);
    };
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.refresh();
  };

  const handleGenerate = () => {
    if (!topic) return;
    router.push(
      `/builder?topic=${encodeURIComponent(topic)}&slides=${slideCount}`
    );
  };

  const handleUploadClick = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pptx")) {
      setUploadError("Please upload a .pptx file (PowerPoint 2007+ format only).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File is too large. Please upload a file under 50MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress("Reading file...");

    try {
      setUploadProgress("Extracting slides...");
      const slides = await parsePptxFile(file);

      setUploadProgress("Preparing data...");
      const fileName = file.name.replace(/\.pptx$/i, "").replace(/[-_]/g, " ");
      const topicName = slides[0]?.title && slides[0].title !== "Slide 1"
        ? slides[0].title
        : fileName;

      const uploadData = { slides, topic: topicName };

      try {
        localStorage.setItem("uploadedPPT", JSON.stringify(uploadData));
      } catch (storageError) {
        console.warn("Storage full, retrying without images:", storageError);
        const slidesNoImages = slides.map((s) => ({ ...s, imageUrl: null }));
        localStorage.setItem(
          "uploadedPPT",
          JSON.stringify({ slides: slidesNoImages, topic: topicName })
        );
      }

      setUploadProgress("Redirecting...");
      router.push(
        `/builder?mode=upload&topic=${encodeURIComponent(topicName)}&slides=${slides.length}`
      );
    } catch (err) {
      console.error("Upload parse error:", err);
      setUploadError(err.message || "Failed to parse file.");
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden selection:bg-purple-500/30">
      
      {/* ── Background Glow Effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse-slow2" />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto w-full backdrop-blur-md bg-[#0a0a0f]/50 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/slidewizard-logo-new.png"
            alt="SlideWizard Logo"
            width={400}
            height={100}
            priority
            unoptimized
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* ── Blog Link ── */}
          <Link
            href="/blog"
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-medium"
          >
            Blog
          </Link>

          {!loadingSession && (
            session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs sm:text-sm font-medium backdrop-blur-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs sm:text-sm font-medium backdrop-blur-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white text-black hover:bg-gray-200 transition-all text-xs sm:text-sm font-bold shadow-lg shadow-white/10"
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </div>
      </nav>

      {/* ── Full-screen upload overlay ── */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in px-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="mb-6 relative">
                <div className="w-16 h-16 mx-auto rounded-full border-2 border-purple-500/30 flex items-center justify-center animate-spin-slow">
                  <div className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Processing PPT</h3>
              <p className="text-sm text-gray-400 mb-6">{uploadProgress}</p>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-progress" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 sm:pt-40 pb-20 px-4">
        
        {/* Hero Section */}
        <div className="w-full max-w-3xl text-center mb-16 sm:mb-20 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium text-purple-300 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            AI-Powered Presentation Generator
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-[1.1]">
             AI PPT Maker – Create Stunning Presentations<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Enter a topic or upload a boring file. Our AI writes the content, designs the slides, and finds the images for you.
          </p>

          {/* Generator Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl backdrop-blur-xl p-2 shadow-2xl shadow-purple-500/10 max-w-2xl mx-auto transform transition-all hover:scale-[1.01] duration-500">
            <div className="bg-[#0f0f16] rounded-2xl p-4 sm:p-6 border border-white/5">
              
              {/* Input */}
              <div className="relative group mb-6">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-20 group-focus-within:opacity-50 transition duration-500 blur"></div>
                <input
                  type="text"
                  placeholder="What's your presentation about?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="relative w-full bg-[#1a1a24] border border-white/10 rounded-xl px-5 py-4 text-sm sm:text-base text-white placeholder-gray-500 outline-none focus:ring-0 transition-all"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                <div className="w-full sm:w-auto">
                  <p className="text-[10px] text-gray-500 font-medium mb-2 uppercase tracking-wider">Slide Count</p>
                  <div className="flex bg-[#1a1a24] rounded-xl p-1 border border-white/5">
                    {[5, 8, 10, 15].map((num) => (
                      <button
                        key={num}
                        onClick={() => setSlideCount(num)}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          slideCount === num
                            ? "bg-white/10 text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleGenerate}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group text-sm sm:text-base"
                >
                  <span>✨</span> Generate Deck
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                <button
                  onClick={handleUploadClick}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-white/5 border border-white/10 font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group text-sm sm:text-base"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload PPT</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pptx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Error Message */}
              {uploadError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2 animate-shake">
                  <span className="text-red-400 mt-0.5">⚠️</span>
                  <p className="text-xs text-red-300 flex-1">{uploadError}</p>
                  <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-white">✕</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── SEO Content Section ── */}
        <FadeInSection delay={50}>
          <section className="w-full max-w-3xl mb-16 px-2">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 sm:p-10 space-y-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  What is SlideWizard Pro?
                </h2>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  SlideWizard Pro is a free AI PPT maker that helps students, teachers, and professionals create high-quality PowerPoint presentations instantly. Just enter your topic and our AI generates structured, ready-to-use slides in seconds.
                </p>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Why Use Our AI Presentation Generator?
                </h2>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                  Our AI presentation generator automatically writes content, structures slides, and designs layouts for you. No design skills required. Create professional presentations faster than ever.
                </p>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* ── The "Forever Free" Card ── */}
        <FadeInSection delay={100}>
          <div className="w-full max-w-4xl mb-16 px-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/40 via-teal-900/40 to-emerald-900/40 border border-emerald-500/30 p-1 sm:p-1">
              {/* Animated Shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent translate-x-[-100%] animate-shine" />
              
              <div className="bg-[#0a0f0d] rounded-[20px] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative z-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    <span className="text-emerald-400">Forever Free.</span> No Credit Card.
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base max-w-md">
                    We believe in creativity without barriers. Generate unlimited presentations, access all features, and export without watermarks. Just sign in.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="inline-flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-3xl sm:text-4xl font-bold text-white">0$</span>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Always</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* ── Sliding Feature Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-2 mb-16">
          {[
            {
              icon: "🚀",
              title: "Instant Generation",
              desc: "From topic to full presentation in less than 30 seconds. No waiting queues.",
              color: "from-orange-500 to-red-500"
            },
            {
              icon: "🎨",
              title: "Smart Design",
              desc: "Auto-layouts, beautiful themes, and AI-selected imagery that fits your context.",
              color: "from-purple-500 to-blue-500"
            },
            {
              icon: "🔄",
              title: "AI Enhancement",
              desc: "Upload boring slides and let AI rewrite and redesign them instantly.",
              color: "from-blue-500 to-cyan-500"
            }
          ].map((feature, i) => (
            <FadeInSection key={i} delay={200 + i * 150}>
              <div className="h-full group relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>

        {/* ── Blog Preview Section ── */}
        <FadeInSection delay={700}>
          <section className="w-full max-w-5xl px-2">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                From Our Blog
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Tips, guides, and insights on AI-powered presentations.
              </p>
            </div>

            <div className="max-w-lg mx-auto">
              <Link href="/blog" className="block group">
                <div className="relative bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500" />

                  {/* Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-semibold text-purple-300 uppercase tracking-wider mb-4">
                    Guide
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
                    How to Create a Presentation Using AI
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed mb-5">
                    Learn the fastest way to build professional PowerPoint slides using AI. From entering a topic to downloading a finished deck — this step-by-step guide covers everything you need.
                  </p>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                    Read More
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </section>
        </FadeInSection>

      </div>

      {/* ── CSS Animations ── */}
      <style jsx global>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }
        .animate-pulse-slow2 { animation: pulse-slow 8s ease-in-out infinite 2s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }

        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress { animation: progress 1.5s infinite linear; }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }

        @keyframes shine {
          0% { transform: translateX(-150%) skewX(-15deg); }
          50%, 100% { transform: translateX(150%) skewX(-15deg); }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </main>
  );
}