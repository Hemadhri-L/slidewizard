"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";

export default function Dashboard() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPresentations();
  }, []);

  // ══════════════════════════════════════════════════════════
  // LOGIC (Unchanged)
  // ══════════════════════════════════════════════════════════

  const fetchPresentations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("presentations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) {
      setPresentations([]);
      setLoading(false);
      return;
    }

    const validPresentations = [];

    for (const ppt of data) {
      const { data: fileCheck } = await supabase.storage
        .from("presentations")
        .list(ppt.user_id, {
          search: ppt.ppt_url.split("/").pop(),
        });

      if (fileCheck && fileCheck.length > 0) {
        validPresentations.push(ppt);
      } else {
        await supabase.from("presentations").delete().eq("id", ppt.id);
      }
    }

    setPresentations(validPresentations);
    setLoading(false);
  };

  const downloadFile = async (filePath, title) => {
    const { data } = await supabase.storage
      .from("presentations")
      .createSignedUrl(filePath, 60);

    if (!data?.signedUrl) return;

    const response = await fetch(data.signedUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const deleteFile = async (filePath, id) => {
    const confirmDelete = confirm("Delete this presentation?");
    if (!confirmDelete) return;

    setDeletingId(id);

    const { error: storageError } = await supabase.storage
      .from("presentations")
      .remove([filePath]);

    if (storageError) {
      alert("Failed to delete file");
      setDeletingId(null);
      return;
    }

    const { error: dbError } = await supabase
      .from("presentations")
      .delete()
      .eq("id", id);

    if (dbError) {
      alert("Failed to delete record");
      setDeletingId(null);
      return;
    }

    setPresentations((prev) => prev.filter((ppt) => ppt.id !== id));
    setDeletingId(null);
  };

  const getGradient = (title) => {
    const gradients = [
      "from-violet-600 to-indigo-600",
      "from-pink-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-600",
      "from-blue-600 to-cyan-500",
    ];
    return gradients[title.length % gradients.length];
  };

  // ══════════════════════════════════════════════════════════
  // MOBILE-OPTIMIZED UI
  // ══════════════════════════════════════════════════════════

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative overflow-x-hidden pb-20">
      
      {/* ── Background Glows (Mobile Adjusted) ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-fade-down">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Your presentation library
            </p>
          </div>
          
          {/* Create Button - Full width on mobile */}
          <Link 
            href="/"
            className="group relative w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/25 overflow-hidden active:scale-95 transition-all duration-200"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative flex items-center justify-center gap-2 font-semibold">
              <span className="text-lg">✨</span> Create New PPT
            </span>
          </Link>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 animate-pulse">
            <div className="w-12 h-12 rounded-full border-2 border-t-purple-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin" />
            <p className="mt-4 text-sm text-gray-500">Loading library...</p>
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && presentations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-3xl opacity-50">
              📂
            </div>
            <h3 className="text-lg font-semibold text-gray-200 mb-2">It's empty here</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto mb-6">
              Create your first AI presentation to see it here.
            </p>
            <Link
              href="/"
              className="text-sm text-purple-400 font-medium hover:text-purple-300 transition-colors"
            >
              Start Generating →
            </Link>
          </div>
        )}

        {/* ── Responsive Grid ── */}
        {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {!loading && presentations.map((ppt, i) => (
            <div
              key={ppt.id}
              className="group relative bg-[#13131f] border border-white/5 rounded-2xl overflow-hidden shadow-xl active:scale-[0.98] transition-all duration-300 hover:border-white/20"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* ── Visual Preview Area ── */}
              <div className={`h-36 w-full bg-gradient-to-br ${getGradient(ppt.title)} relative`}>
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <svg className="w-12 h-12 text-white/90 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm0 2v14h14V5H5zm3 3h8v2H8V8zm0 4h8v2H8v-2z" />
                  </svg>
                </div>

                {/* Date Tag */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 backdrop-blur-md text-[10px] font-medium text-white/90 border border-white/10">
                  {new Date(ppt.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* ── Card Body ── */}
              <div className="p-4">
                <h3 className="text-base font-bold text-white mb-1 truncate leading-tight">
                  {ppt.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Ready for download
                </p>

                {/* ── Action Buttons ── */}
                <div className="flex gap-3">
                  {/* Download Button (Primary) */}
                  <button
                    onClick={() => downloadFile(ppt.ppt_url, ppt.title)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:bg-purple-600 active:border-purple-500 transition-colors text-sm font-medium text-gray-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>

                  {/* Delete Button (Secondary/Icon) */}
                  <button
                    onClick={() => deleteFile(ppt.ppt_url, ppt.id)}
                    disabled={deletingId === ppt.id}
                    className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 active:bg-red-500 active:text-white transition-colors"
                    aria-label="Delete"
                  >
                    {deletingId === ppt.id ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-down {
          animation: fade-down 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}