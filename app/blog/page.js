import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "How to Create a Presentation Using AI | SlideWizard Pro",
  description:
    "Learn how to create stunning PowerPoint presentations using AI tools like SlideWizard Pro. Step-by-step guide for students and professionals.",
};

export default function BlogPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden selection:bg-purple-500/30">
      {/* ── Background Glow Effects ── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/20 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600/20 rounded-full blur-[80px] sm:blur-[120px]" />
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
          <Link
            href="/blog"
            className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-gray-300 hover:text-white transition-colors text-xs sm:text-sm font-medium"
          >
            Blog
          </Link>
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
        </div>
      </nav>

      {/* ── Blog Content ── */}
      <div className="relative z-10 pt-32 sm:pt-40 pb-20 px-4">
        <article className="w-full max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-purple-400 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-medium text-purple-300 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Guide
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1]">
            How to Create a Presentation{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Using AI
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 mb-12 leading-relaxed border-b border-white/5 pb-10">
            Creating professional presentations used to take hours of research,
            writing, and design work. With AI-powered tools like SlideWizard
            Pro, you can generate a complete, polished PowerPoint deck in
            seconds. This step-by-step guide walks you through the entire
            process — from entering your topic to downloading a finished PPT
            file.
          </p>

          {/* ── Step 1 ── */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                1
              </span>
              Enter Your Topic
            </h2>
            <div className="pl-0 sm:pl-[52px] space-y-4">
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                The first step to creating an AI-generated presentation is
                simply typing in your topic. Whether it&apos;s &quot;Climate
                Change,&quot; &quot;Digital Marketing Strategy,&quot; or
                &quot;Introduction to Machine Learning,&quot; SlideWizard
                Pro&apos;s AI understands a wide range of subjects across
                education, business, science, and more.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                You don&apos;t need to write a detailed prompt or outline. A
                short, descriptive topic is all the AI needs to research and
                structure a full presentation for you. The more specific your
                topic, the more tailored and relevant your slides will be — but
                even broad topics produce impressive results.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                This eliminates the most time-consuming part of presentation
                creation: the blank-page problem. Instead of staring at an
                empty slide, you let AI handle the content generation from the
                very first step.
              </p>
            </div>
          </section>

          {/* ── Step 2 ── */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                2
              </span>
              Choose Slide Count
            </h2>
            <div className="pl-0 sm:pl-[52px] space-y-4">
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                After entering your topic, choose how many slides you want in
                your presentation. SlideWizard Pro offers flexible options — 5,
                8, 10, or 15 slides — so you can create anything from a quick
                pitch deck to a comprehensive lecture presentation.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                A 5-slide deck is perfect for short pitches, quick overviews,
                or classroom summaries. For more detailed presentations, such
                as business proposals, research reports, or educational
                lectures, choosing 10 or 15 slides gives the AI room to cover
                subtopics, include data points, and create a natural flow
                through your content.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                The AI automatically adjusts the depth and breadth of content
                based on your slide count, ensuring each slide has meaningful
                information without feeling overcrowded or too sparse. This
                smart scaling is one of the key advantages of using an
                AI presentation generator.
              </p>
            </div>
          </section>

          {/* ── Step 3 ── */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm font-bold">
                3
              </span>
              Download Your PPT
            </h2>
            <div className="pl-0 sm:pl-[52px] space-y-4">
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Once the AI has generated your slides, you can preview every
                slide directly in your browser. Each slide comes with a
                structured title, well-written content, and AI-selected images
                that match your topic. You can review the entire deck before
                downloading.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                When you&apos;re satisfied with the result, simply click the
                download button to export your presentation as a .pptx file.
                This file is fully compatible with Microsoft PowerPoint, Google
                Slides, and other presentation software — ready to present,
                share, or further customize as needed.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                The entire process — from typing your topic to holding a
                finished presentation — takes less than 30 seconds. No sign-up
                fees, no watermarks, no design skills required. SlideWizard Pro
                makes professional presentations accessible to everyone, from
                students working on school projects to executives preparing
                boardroom pitches.
              </p>
            </div>
          </section>

          {/* ── CTA ── */}
          <div className="mt-16 bg-white/[0.03] border border-white/10 rounded-3xl p-6 sm:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Create Your Presentation?
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6 max-w-lg mx-auto">
              Stop spending hours on slides. Let AI do the heavy lifting and
              generate a stunning presentation in seconds — completely free.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
            >
              <span>✨</span> Try SlideWizard Pro Now
            </Link>
          </div>
        </article>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} SlideWizard Pro. All rights reserved.
        </p>
      </footer>
    </main>
  );
}