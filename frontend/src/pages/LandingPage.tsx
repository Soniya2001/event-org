import React, { useState } from 'react';
import { 
  Sparkles, Calendar, DollarSign, Users, CheckCircle2, ArrowRight, 
  ChevronDown, Heart, ShieldCheck, Zap, Compass, Star, Gift, 
  Building2, Music, Camera, Utensils, MessageSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onStartPlanning: () => void;
  onExploreFeatures?: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartPlanning, onLogin }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    { title: "Weddings & Engagements", icon: Heart, desc: "Traditional rituals, multi-day schedules, guest hospitality & luxury decor.", color: "from-rose-500 to-pink-600" },
    { title: "Milestone Birthdays", icon: Gift, desc: "Theme styling, entertainer booking, cake design & unforgettable guest activities.", color: "from-purple-500 to-indigo-600" },
    { title: "Corporate Summits & Galas", icon: Building2, desc: "A/V production, keynote timelines, VIP logistics & catering management.", color: "from-blue-500 to-cyan-600" },
    { title: "Baby Showers & Blessings", icon: Star, desc: "Pastel aesthetics, interactive keepsakes, photography & customized menus.", color: "from-amber-400 to-orange-500" },
    { title: "Cultural & Community Galas", icon: Music, desc: "Stage coordination, vendor management, permits & crowd flow planning.", color: "from-emerald-500 to-teal-600" },
    { title: "Anniversaries & Vow Renewals", icon: Sparkles, desc: "Intimate dining, memory wall curation, acoustic entertainment & champagne toasts.", color: "from-brand-600 to-royal" },
  ];

  const faqs = [
    {
      q: "How does EventEase AI generate realistic event budgets?",
      a: "EventEase AI uses Google Gemini along with a deterministic backend financial engine. It allocates your budget across market-calibrated categories (Venue, Catering, Decor, Photography, Entertainment, Contingency) ensuring the sum mathematically reconciles to 100% of your budget."
    },
    {
      q: "Can I customize the generated plan and tasks?",
      a: "Absolutely. Every section of the plan—tasks, budget categories, vendor criteria, and timeline milestones—is completely editable. You can regenerate specific sections or adjust numbers in real time."
    },
    {
      q: "Does EventEase AI fabricate vendor contact information?",
      a: "Never. EventEase AI acts as your intelligent planning director. It specifies selection criteria, estimated market price brackets, and booking deadlines. You add your chosen vendor quotes, and our system tracks payment milestones and cost comparisons."
    },
    {
      q: "How does the AI Assistant help during ongoing planning?",
      a: "The assistant maintains context of your specific event parameters (guest count, budget, location, date). You can ask questions like 'How can I save ₹1 lakh on decor?' or 'I want to add 50 guests. Recalculate my budget.' It proposes changes that you can inspect and approve before applying."
    },
    {
      q: "What currencies are supported?",
      a: "EventEase AI supports USD ($), EUR (€), INR (₹), GBP (£), CAD, AUD, and all global currencies with automatic symbol formatting."
    }
  ];

  return (
    <div className="bg-[#FAF8FF] overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-brand-300/30 via-purple-200/20 to-indigo-200/30 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -top-12 right-12 w-96 h-96 bg-brand-400/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Pill */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-purple-100/80 border border-purple-200/60 shadow-xs mb-8"
            >
              <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-800">
                Next-Gen Event Planning Intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif text-slate-900 tracking-tight leading-[1.15]"
            >
              Every Celebration Deserves a{' '}
              <span className="bg-gradient-to-r from-brand-700 via-royal to-indigo-600 bg-clip-text text-transparent">
                Perfect Plan.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-600 font-normal leading-relaxed"
            >
              Transform your raw idea into an actionable, luxury-caliber event plan in seconds. 
              Deterministic budget reconciliation, reverse-scheduled timelines, curated vendor checklists, 
              and a context-aware AI assistant that guides every milestone.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={onStartPlanning}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-base shadow-luxury hover:shadow-glow transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>Start Planning Free</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <a
                href="#how-it-works"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-white hover:bg-purple-50/60 text-slate-700 border border-purple-200/80 font-semibold text-base shadow-soft transition-all duration-200"
              >
                <span>Explore Features</span>
              </a>
            </motion.div>

            {/* Social Proof metrics */}
            <div className="mt-14 pt-10 border-t border-purple-100/80 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">100%</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Budget Reconciliation</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">10x</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Faster Scheduling</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">Zero</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Disorganized Chaos</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white/70 backdrop-blur-sm border-y border-purple-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Effortless 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-3">
              From Vision to Execution in Minutes
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Say goodbye to stressful spreadsheets and scattered sticky notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-gradient-to-b from-[#FAF5FF] to-white p-8 rounded-3xl border border-purple-100 shadow-soft relative overflow-hidden group hover:shadow-luxury transition-all">
              <span className="absolute top-6 right-6 text-5xl font-black text-purple-200/50 font-serif">01</span>
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Input Your Event Vision</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose your event category, specify dates, guest headcount, location, and your total budget. Customize themes, color palettes, and cultural customs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gradient-to-b from-[#FAF5FF] to-white p-8 rounded-3xl border border-purple-100 shadow-soft relative overflow-hidden group hover:shadow-luxury transition-all">
              <span className="absolute top-6 right-6 text-5xl font-black text-purple-200/50 font-serif">02</span>
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Gemini AI Architecting</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our AI synthesizes an exhaustive 6-part master plan: itemized budget allocations, lead-time prioritized tasks, vendor requirements, and contingency buffers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-b from-[#FAF5FF] to-white p-8 rounded-3xl border border-purple-100 shadow-soft relative overflow-hidden group hover:shadow-luxury transition-all">
              <span className="absolute top-6 right-6 text-5xl font-black text-purple-200/50 font-serif">03</span>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif mb-2">Execute with Confidence</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Track payments and expenses with interactive charts, manage calendar deadlines, compare vendor quotes, and chat with your AI assistant anytime.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SUPPORTED CATEGORIES */}
      <section id="categories" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              Versatile Celebrations
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-3">
              Crafted for Every Milestone
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              From intimate backyard anniversaries to 500-guest royal wedding galas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={idx}
                  onClick={onStartPlanning}
                  className="bg-white p-7 rounded-3xl border border-purple-100 shadow-soft hover:shadow-luxury transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${cat.color} flex items-center justify-center text-white mb-5 shadow-xs group-hover:scale-105 transition-transform`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 font-serif mb-2 group-hover:text-brand-700 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {cat.desc}
                  </p>
                  <div className="flex items-center text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
                    <span>Plan this celebration</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. AI FEATURE SHOWCASE */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-purple-50/50 border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 bg-purple-100/70 px-3 py-1 rounded-full border border-purple-200">
              Under The Hood
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-3">
              GenAI Power Combined with Real Business Logic
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base">
              Not just a generic conversational bot—EventEase AI executes rigorous financial mathematics and structured event management workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Feature 1: Budget Reconciliation */}
            <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-900">
                Deterministic Budget Reconciliation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Unlike simple chatbot outputs that generate numbers out of thin air, our backend enforces strict mathematical integrity: category percentages sum to 100%, contingency funds are preserved, and actual expenses dynamically update your balance in real time.
              </p>
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" /> Overspend alerts active</span>
                <span className="text-brand-700 font-semibold">Zero Math Hallucination</span>
              </div>
            </div>

            {/* Feature 2: Contextual AI Assistant */}
            <div className="bg-white p-8 rounded-3xl border border-purple-100 shadow-soft space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-900">
                Interactive Assistant with Approval Guards
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ask your dedicated AI planner to reduce decor expenses, recommend seasonal dishes, or reschedule milestones. Changes to your budget or guest count are proposed with structured review cards—nothing is updated without your explicit confirmation.
              </p>
              <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1 text-brand-600" /> User Confirmation First</span>
                <span className="text-brand-700 font-semibold">Live Event Context</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. SAMPLE TESTIMONIALS (Clearly labeled sample) */}
      <section className="py-24 bg-white border-t border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Sample User Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-3">
              Loved by Couples, Families & Organizers
            </h2>
            <p className="text-slate-500 mt-2 text-xs">
              *The following are representative sample reviews showcasing typical planning workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#FAF8FF] p-7 rounded-3xl border border-purple-100 shadow-soft">
              <div className="flex text-amber-400 space-x-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                "We were organizing a 350-guest destination wedding in Udaipur with ₹40L budget. EventEase AI broke down our allocations perfectly and saved us nearly ₹3L on decor by suggesting floral repurposing!"
              </p>
              <div>
                <p className="text-sm font-bold text-slate-900">Priya & Rohan S.</p>
                <p className="text-xs text-slate-500">Destination Wedding, 350 Guests</p>
              </div>
            </div>

            <div className="bg-[#FAF8FF] p-7 rounded-3xl border border-purple-100 shadow-soft">
              <div className="flex text-amber-400 space-x-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                "Planning our company's annual leadership summit was typically a 3-week nightmare. EventEase AI gave us the complete run-of-show schedule, A/V vendor specs, and catering buffers in under 2 minutes."
              </p>
              <div>
                <p className="text-sm font-bold text-slate-900">Marcus Chen</p>
                <p className="text-xs text-slate-500">Corporate Events Director</p>
              </div>
            </div>

            <div className="bg-[#FAF8FF] p-7 rounded-3xl border border-purple-100 shadow-soft">
              <div className="flex text-amber-400 space-x-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                "For my parents' 50th golden anniversary, the personalized activity ideas—especially the vintage rotary phone audio guestbook—were a massive hit with all three generations of our family."
              </p>
              <div>
                <p className="text-sm font-bold text-slate-900">Ananya Verma</p>
                <p className="text-xs text-slate-500">Family Anniversary Organizer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section id="faq" className="py-24 bg-[#FAF5FF] border-t border-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 bg-purple-100 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 mt-3">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-purple-100/80 shadow-soft overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="font-semibold text-slate-900 text-base sm:text-lg">
                      {faq.q}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-brand-600 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed border-t border-purple-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FINAL BOTTOM CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-900 via-royal to-indigo-950 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-500/20 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif tracking-tight">
            Ready to Plan Your Next Grand Celebration?
          </h2>
          <p className="mt-4 text-purple-200 text-base sm:text-lg max-w-xl mx-auto">
            Experience the harmony of artificial intelligence and professional event artistry. Create your first plan in less than 2 minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartPlanning}
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white text-brand-900 hover:bg-purple-50 font-bold text-base shadow-luxury transition-all transform hover:-translate-y-0.5"
            >
              Start Planning Now
            </button>
            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-900/60 hover:bg-purple-900/80 text-white border border-purple-700/60 font-semibold text-base transition-all"
            >
              Sign In to Existing Plan
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

