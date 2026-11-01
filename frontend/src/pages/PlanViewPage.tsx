import React, { useState } from 'react';
import { 
  Sparkles, DollarSign, Calendar, Users, ShieldAlert, Lightbulb, 
  CheckCircle2, RefreshCw, Edit3, Save, ArrowLeft, Clock, 
  MapPin, Check, ChevronRight, Layers, Tag
} from 'lucide-react';
import { EventItem, FullEventPlan } from '../types';
import { api } from '../services/api';

interface PlanViewPageProps {
  event: EventItem;
  onBack: () => void;
  onOpenBudget: () => void;
  onOpenTimeline: () => void;
  onOpenVendors: () => void;
  onOpenChat: () => void;
}

export const PlanViewPage: React.FC<PlanViewPageProps> = ({
  event,
  onBack,
  onOpenBudget,
  onOpenTimeline,
  onOpenVendors,
  onOpenChat,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'overview' | 'budget' | 'timeline' | 'vendors' | 'ideas' | 'risks'>('all');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<FullEventPlan | undefined>(event.ai_plan);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Editable states
  const [isEditingOverview, setIsEditingOverview] = useState(false);
  const [overviewConcept, setOverviewConcept] = useState(currentPlan?.overview?.concept || '');
  const [overviewTheme, setOverviewTheme] = useState(currentPlan?.overview?.theme || '');
  const [overviewFormat, setOverviewFormat] = useState(currentPlan?.overview?.recommended_format || '');

  const handleRegeneratePlan = async () => {
    setIsRegenerating(true);
    try {
      const regenerated = await api.generatePlan(event.id);
      setCurrentPlan(regenerated);
      setOverviewConcept(regenerated.overview.concept);
      setOverviewTheme(regenerated.overview.theme);
      setOverviewFormat(regenerated.overview.recommended_format);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to regenerate plan:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSaveOverview = async () => {
    if (!currentPlan) return;
    const updatedPlan: FullEventPlan = {
      ...currentPlan,
      overview: {
        ...currentPlan.overview,
        concept: overviewConcept,
        theme: overviewTheme,
        recommended_format: overviewFormat,
      },
    };
    try {
      await api.updateEvent(event.id, { ai_plan: updatedPlan });
      setCurrentPlan(updatedPlan);
      setIsEditingOverview(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const plan = currentPlan || event.ai_plan;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-purple-200 text-slate-600 hover:text-slate-900 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                {event.event_type}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">{event.event_date}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-1">
              {event.event_name}
            </h1>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center animate-in fade-in">
              <Check className="w-3.5 h-3.5 mr-1" /> Plan Saved
            </span>
          )}

          <button
            onClick={handleRegeneratePlan}
            disabled={isRegenerating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-brand-800 font-semibold text-xs sm:text-sm border border-purple-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
          </button>

          <button
            onClick={onOpenChat}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-soft transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', label: 'Complete Blueprint' },
          { id: 'overview', label: 'Concept & Format' },
          { id: 'budget', label: 'Budget Allocations' },
          { id: 'timeline', label: 'Milestone Timeline' },
          { id: 'vendors', label: 'Vendor Requirements' },
          { id: 'ideas', label: 'Curated Ideas' },
          { id: 'risks', label: 'Risk Mitigation' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeSection === tab.id
                ? 'bg-brand-600 text-white shadow-soft font-bold'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-purple-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION A: EVENT OVERVIEW */}
      {(activeSection === 'all' || activeSection === 'overview') && plan?.overview && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-brand-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Event Overview & Theme Concept</h3>
                <p className="text-xs text-slate-500">Curated vision statement and recommended format</p>
              </div>
            </div>
            
            <div>
              {isEditingOverview ? (
                <button
                  onClick={handleSaveOverview}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingOverview(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-brand-700 text-xs font-semibold hover:bg-purple-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {isEditingOverview ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Concept Vision</label>
                <textarea
                  rows={2}
                  value={overviewConcept}
                  onChange={(e) => setOverviewConcept(e.target.value)}
                  className="w-full p-3 text-sm rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Theme Title</label>
                  <input
                    type="text"
                    value={overviewTheme}
                    onChange={(e) => setOverviewTheme(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Recommended Format</label>
                  <input
                    type="text"
                    value={overviewFormat}
                    onChange={(e) => setOverviewFormat(e.target.value)}
                    className="w-full p-3 text-sm rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-[#FAF8FF] p-6 rounded-2xl border border-purple-100 space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Artistic Concept</span>
                <p className="text-base text-slate-800 leading-relaxed font-serif">
                  "{plan.overview.concept}"
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {plan.overview.description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Theme</span>
                  <p className="text-sm font-bold text-brand-900 mt-0.5">{plan.overview.theme}</p>
                </div>

                <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Run of Show</span>
                  <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">{plan.overview.recommended_format}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION B: BUDGET BREAKDOWN */}
      {(activeSection === 'all' || activeSection === 'budget') && plan?.budget_breakdown && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Budget Breakdown & Cost-Saving Advisory</h3>
                <p className="text-xs text-slate-500">
                  Reconciled mathematically to {event.currency} {event.total_budget.toLocaleString()} (100%)
                </p>
              </div>
            </div>

            <button
              onClick={onOpenBudget}
              className="flex items-center space-x-2 text-xs font-bold text-brand-700 hover:text-brand-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              <span>Manage Expenses & Tracking</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {plan.budget_breakdown.map((item, idx) => (
              <div 
                key={idx}
                className="bg-[#FAF8FF] p-5 rounded-2xl border border-purple-100/90 shadow-xs hover:shadow-soft transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{item.category}</h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-brand-800">
                    {item.percentage}%
                  </span>
                </div>

                <div className="text-lg font-bold font-serif text-slate-900">
                  {event.currency} {item.estimated_cost.toLocaleString()}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.explanation}
                </p>

                {item.cost_saving_suggestions && (
                  <div className="pt-2 border-t border-purple-100/60 text-[11px] text-emerald-800 bg-emerald-50/70 p-2.5 rounded-xl">
                    <span className="font-bold block mb-0.5">Cost-Saving Tip:</span>
                    {item.cost_saving_suggestions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION C: EVENT TIMELINE */}
      {(activeSection === 'all' || activeSection === 'timeline') && plan?.timeline && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Milestone Planning Timeline</h3>
                <p className="text-xs text-slate-500">Reverse-engineered from {event.event_date}</p>
              </div>
            </div>

            <button
              onClick={onOpenTimeline}
              className="flex items-center space-x-2 text-xs font-bold text-brand-700 hover:text-brand-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              <span>Open Calendar & Tasks</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {plan.timeline.map((task, idx) => {
              const priorityColors = {
                URGENT: 'bg-rose-50 text-rose-700 border-rose-200',
                HIGH: 'bg-amber-50 text-amber-700 border-amber-200',
                MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
                LOW: 'bg-slate-100 text-slate-600 border-slate-200',
              }[task.priority] || 'bg-purple-50 text-brand-700 border-purple-200';

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#FAF8FF] border border-purple-100 gap-3 hover:border-brand-200 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors}`}>
                        {task.priority}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{task.task}</h4>
                    </div>
                    <p className="text-xs text-slate-600">{task.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-slate-500 self-end sm:self-auto">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      <span>Due: <strong>{task.due_date}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION D: VENDOR CHECKLIST */}
      {(activeSection === 'all' || activeSection === 'vendors') && plan?.vendor_checklist && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">Vendor Specifications & Procurement</h3>
                <p className="text-xs text-slate-500">Category requirements, selection criteria, and price ranges</p>
              </div>
            </div>

            <button
              onClick={onOpenVendors}
              className="flex items-center space-x-2 text-xs font-bold text-brand-700 hover:text-brand-900 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
            >
              <span>Open Vendor Directory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.vendor_checklist.map((v, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8FF] p-5 rounded-2xl border border-purple-100 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-800 bg-purple-100/70 px-2.5 py-0.5 rounded-full">
                    {v.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Deadline: {v.booking_deadline || 'Standard lead-time'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Selection Criteria</span>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{v.selection_criteria}</p>
                </div>
                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Price Guide:</span>
                  <span className="font-bold text-slate-900">{v.estimated_price_range}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION E: PERSONALIZED IDEAS */}
      {(activeSection === 'all' || activeSection === 'ideas') && plan?.personalized_ideas && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-purple-50">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Personalized Ideas & Guest Experience</h3>
              <p className="text-xs text-slate-500">Tailored concepts based on your style and cultural preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Activities */}
            <div className="bg-[#FAF8FF] p-5 rounded-2xl border border-purple-100 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center text-brand-800">
                <Sparkles className="w-4 h-4 mr-1.5" /> Special Activities
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {plan.personalized_ideas.activities?.map((act, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Decorations */}
            <div className="bg-[#FAF8FF] p-5 rounded-2xl border border-purple-100 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center text-brand-800">
                <Sparkles className="w-4 h-4 mr-1.5" /> Decor Accents
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {plan.personalized_ideas.decorations?.map((dec, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <span>{dec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guest Experiences */}
            <div className="bg-[#FAF8FF] p-5 rounded-2xl border border-purple-100 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center text-brand-800">
                <Sparkles className="w-4 h-4 mr-1.5" /> Guest Touches
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {plan.personalized_ideas.guest_experiences?.map((exp, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* SECTION F: RISK MANAGEMENT */}
      {(activeSection === 'all' || activeSection === 'risks') && plan?.risk_management && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-purple-50">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Risk Assessment & Mitigation Matrix</h3>
              <p className="text-xs text-slate-500">Contingencies for weather, vendor backups, and guest changes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan.risk_management.map((risk, idx) => {
              const sevColors = {
                HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
                MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
                LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              }[risk.severity] || 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={idx}
                  className="bg-[#FAF8FF] p-5 rounded-2xl border border-purple-100 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{risk.risk_factor}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevColors}`}>
                      {risk.severity} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{risk.impact_description}</p>
                  <div className="pt-2 border-t border-purple-100/70 text-xs text-brand-900 bg-purple-50/70 p-2.5 rounded-xl">
                    <span className="font-bold block mb-0.5">Mitigation Action:</span>
                    {risk.mitigation_strategy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

