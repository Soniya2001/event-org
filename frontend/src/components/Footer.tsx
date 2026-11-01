import React from 'react';
import { Sparkles, Heart, Shield, Award, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-purple-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-soft">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif tracking-tight text-white">
                EventEase <span className="text-brand-400 font-sans text-xs uppercase px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-700/50">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every celebration deserves a perfect plan. Powered by Google Gemini AI to transform your event dreams into flawless, budget-reconciled execution.
            </p>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Enterprise Secure</span>
              <span className="flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-amber-400" /> Luxury Standards</span>
            </div>
          </div>

          {/* Celebrations */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Celebrations</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Luxury Weddings & Engagements</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Milestone Birthdays & Anniversaries</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Corporate Galas & Summits</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Baby Showers & Naming Ceremonies</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Cultural & Community Festivals</span></li>
            </ul>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">AI Capabilities</h4>
            <ul className="space-y-2.5 text-sm">
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Deterministic Budget Optimizer</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Reverse-Engineered Timelines</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Vendor Comparison Matrix</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Interactive Assistant Chatbot</span></li>
              <li><span className="text-slate-400 hover:text-white transition-colors cursor-pointer">Dynamic Risk Mitigation Plans</span></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Event Planner Tips</h4>
            <p className="text-sm text-slate-400 mb-3">
              Subscribe for AI event trends, theme moodboards, and budgeting guides.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="planner@company.com" 
                className="w-full bg-slate-800 text-sm text-white px-3.5 py-2.5 rounded-l-xl border border-slate-700 focus:outline-none focus:border-brand-500"
              />
              <button className="bg-brand-600 hover:bg-brand-500 text-white px-4 rounded-r-xl text-sm font-semibold transition-colors">
                Join
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-400 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-brand-400" /> support@eventease.ai
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 space-y-4 sm:space-y-0">
          <div>
            © {new Date().getFullYear()} EventEase AI Inc. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Standards</span>
            <span className="hover:text-slate-300 cursor-pointer">API Docs</span>
          </div>
          <div className="flex items-center text-slate-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 mx-1 fill-rose-500" /> for unforgettable moments
          </div>
        </div>
      </div>
    </footer>
  );
};

