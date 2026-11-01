import React, { useState } from 'react';
import { 
  Sparkles, Heart, Gift, Building2, Users, Star, ArrowRight, 
  ArrowLeft, Check, Calendar, MapPin, DollarSign, Palette, 
  Utensils, Shield, Loader2, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EventItem } from '../types';

interface CreateEventWizardProps {
  onPlanGenerated: (event: EventItem) => void;
  onCancel: () => void;
}

export const CreateEventWizard: React.FC<CreateEventWizardProps> = ({ onPlanGenerated, onCancel }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form state across steps (persisted across back/forward navigation)
  const [formData, setFormData] = useState({
    // Step 1: Type
    eventType: 'Wedding',
    
    // Step 2: Basic Details
    eventName: '',
    eventDate: '',
    location: '',
    guestCount: 150,
    eventDays: 1,

    // Step 3: Budget
    totalBudget: 25000,
    currency: user?.currency || 'USD',
    budgetFlexibility: 'Moderate', // 'Strict' | 'Moderate' | 'Flexible'
    spendingPriorities: ['Venue', 'Catering'],

    // Step 4: Preferences
    theme: 'Modern Royal & Lavender Ambiance',
    decorStyle: 'Cascading Florals & Warm Ambient Lighting',
    foodPreference: 'Gourmet Multi-Cuisine Buffet',
    indoorOutdoor: 'Indoor Ballroom with Outdoor Terrace',
    culturalPreferences: 'Contemporary Fusion',
    colorPalette: 'Royal Purple, Soft Lavender, and Champagne Gold',

    // Step 5: Additional Requirements
    specialActivities: 'Live band, interactive photo booth, cocktail hour',
    accessibilityRequirements: 'Wheelchair ramp access and quiet lounge zone',
    dietaryRestrictions: 'Vegetarian, vegan, and gluten-free options clearly marked',
    additionalNotes: 'Need drone photography clearance for outdoor entrance'
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const steps = [
    { number: 1, title: 'Event Type' },
    { number: 2, title: 'Core Details' },
    { number: 3, title: 'Budget & Priorities' },
    { number: 4, title: 'Thematic Style' },
    { number: 5, title: 'Special Reqs' },
    { number: 6, title: 'Review & AI Generate' },
  ];

  const handleNext = () => {
    setError(null);
    if (currentStep === 2) {
      if (!formData.eventName.trim()) {
        setError('Please enter an event name.');
        return;
      }
      if (!formData.eventDate) {
        setError('Please select an event date.');
        return;
      }
      if (!formData.location.trim()) {
        setError('Please enter an event city/venue location.');
        return;
      }
    }
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Create the event record in DB
      const newEvent = await api.createEvent({
        event_name: formData.eventName,
        event_type: formData.eventType,
        event_date: formData.eventDate,
        location: formData.location,
        guest_count: Number(formData.guestCount),
        total_budget: Number(formData.totalBudget),
        currency: formData.currency,
        preferences: {
          event_days: formData.eventDays,
          budget_flexibility: formData.budgetFlexibility,
          spending_priorities: formData.spendingPriorities,
          theme: formData.theme,
          decor_style: formData.decorStyle,
          food_preference: formData.foodPreference,
          indoor_outdoor: formData.indoorOutdoor,
          cultural_preferences: formData.culturalPreferences,
          color_palette: formData.colorPalette,
          special_activities: formData.specialActivities,
          accessibility: formData.accessibilityRequirements,
          dietary_restrictions: formData.dietaryRestrictions,
          additional_notes: formData.additionalNotes
        }
      });

      // 2. Invoke Gemini AI Plan Generator
      await api.generatePlan(newEvent.id);

      // 3. Fetch full updated event with saved ai_plan
      const updatedEvent = await api.getEvent(newEvent.id);
      setIsGenerating(false);
      onPlanGenerated(updatedEvent);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Error generating plan. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-purple-100">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            AI Blueprint Generator
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 mt-2">
            Plan Your Next Celebration
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isCompleted = currentStep > s.number;
            const isCurrent = currentStep === s.number;
            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-soft'
                        : isCurrent
                        ? 'bg-brand-600 text-white shadow-luxury scale-105 ring-4 ring-brand-100'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : s.number}
                  </div>
                  <span className={`hidden md:block text-[11px] font-medium mt-2 max-w-[80px] text-center truncate ${
                    isCurrent ? 'text-brand-800 font-bold' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-colors duration-300 ${
                    currentStep > idx + 1 ? 'bg-emerald-400' : 'bg-purple-100'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-2 animate-in fade-in">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP CONTENTS */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-purple-100 shadow-soft">
        
        {/* STEP 1: EVENT TYPE */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">What celebration are we planning?</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Select the event category to calibrate Gemini AI's domain expertise.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { type: 'Wedding', icon: Heart, label: 'Wedding Gala', color: 'text-rose-600 bg-rose-50' },
                { type: 'Birthday', icon: Gift, label: 'Milestone Birthday', color: 'text-purple-600 bg-purple-50' },
                { type: 'Engagement', icon: Sparkles, label: 'Engagement Ceremony', color: 'text-amber-600 bg-amber-50' },
                { type: 'Corporate', icon: Building2, label: 'Corporate Event', color: 'text-blue-600 bg-blue-50' },
                { type: 'Community', icon: Users, label: 'Community Gathering', color: 'text-emerald-600 bg-emerald-50' },
                { type: 'Baby Shower', icon: Star, label: 'Baby Shower / Blessing', color: 'text-indigo-600 bg-indigo-50' },
              ].map((item) => {
                const isSelected = formData.eventType === item.type;
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    onClick={() => updateField('eventType', item.type)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center text-center group ${
                      isSelected
                        ? 'border-brand-600 bg-purple-50/50 shadow-soft scale-102'
                        : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${item.color} group-hover:scale-105 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm text-slate-800">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: BASIC DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Event Essentials</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Specify key dates, attendees, and destination.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={(e) => updateField('eventName', e.target.value)}
                  placeholder="e.g., Katherine & Liam's Grand Royal Wedding"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.eventDate}
                  onChange={(e) => updateField('eventDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event City / Destination *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., The Grand Palace, Jaipur / Napa Valley, CA"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Estimated Attendees (Guest Count)
                </label>
                <input
                  type="number"
                  min="5"
                  max="10000"
                  value={formData.guestCount}
                  onChange={(e) => updateField('guestCount', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={formData.eventDays}
                  onChange={(e) => updateField('eventDays', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Budget & Financial Framework</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Our deterministic financial engine will reconcile every dollar.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Total Planned Budget
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={formData.totalBudget}
                    onChange={(e) => updateField('totalBudget', Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800 bg-white"
                >
                  <option value="USD">USD ($) — United States Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="CAD">CAD ($) — Canadian Dollar</option>
                  <option value="AUD">AUD ($) — Australian Dollar</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Budget Flexibility
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Strict (Hard Cap)', 'Moderate (±10% Buffer)', 'Flexible (Luxury Tier)'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField('budgetFlexibility', opt)}
                      className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        formData.budgetFlexibility === opt
                          ? 'border-brand-600 bg-purple-50 text-brand-800 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-purple-200 text-slate-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PREFERENCES */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Styling & Atmospheric Preferences</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Shape the mood, color palette, and cultural touches.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Theme Concept
                </label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => updateField('theme', e.target.value)}
                  placeholder="e.g., Royal Heritage, Boho Chic, Minimalist Black Tie"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Color Palette
                </label>
                <input
                  type="text"
                  value={formData.colorPalette}
                  onChange={(e) => updateField('colorPalette', e.target.value)}
                  placeholder="e.g., Lavender, Deep Violet, and Champagne Gold"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Decoration Style
                </label>
                <input
                  type="text"
                  value={formData.decorStyle}
                  onChange={(e) => updateField('decorStyle', e.target.value)}
                  placeholder="e.g., Cascading floral chandeliers, fairy light canopy"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Culinary & Food Preferences
                </label>
                <input
                  type="text"
                  value={formData.foodPreference}
                  onChange={(e) => updateField('foodPreference', e.target.value)}
                  placeholder="e.g., South Indian Feast, French Fine Dining, Plated Course"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Indoor / Outdoor Setting
                </label>
                <input
                  type="text"
                  value={formData.indoorOutdoor}
                  onChange={(e) => updateField('indoorOutdoor', e.target.value)}
                  placeholder="e.g., Indoor ballroom with glass conservatory or open lawn"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Cultural or Traditional Elements
                </label>
                <input
                  type="text"
                  value={formData.culturalPreferences}
                  onChange={(e) => updateField('culturalPreferences', e.target.value)}
                  placeholder="e.g., Traditional Hindu Mandap / Western Vows / Persian Sofreh"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: ADDITIONAL REQUIREMENTS */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Special Requirements & Logistics</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Activities, dietary accommodations, and accessibility.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Special Activities & Entertainment
                </label>
                <input
                  type="text"
                  value={formData.specialActivities}
                  onChange={(e) => updateField('specialActivities', e.target.value)}
                  placeholder="e.g., Live acoustic trio, choreographed flashmob, fireworks display"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Accessibility & Guest Comfort
                </label>
                <input
                  type="text"
                  value={formData.accessibilityRequirements}
                  onChange={(e) => updateField('accessibilityRequirements', e.target.value)}
                  placeholder="e.g., Wheelchair access, elder seating lounge, child play zone"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Dietary Restrictions
                </label>
                <input
                  type="text"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => updateField('dietaryRestrictions', e.target.value)}
                  placeholder="e.g., Halal certified, Jain vegetarian, nut allergy safeguards"
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Additional Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={(e) => updateField('additionalNotes', e.target.value)}
                  placeholder="Any unique requests or critical vendor requirements..."
                  className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & GENERATE */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Review & AI Generation</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Gemini 2.5 Flash will synthesize your parameters into an actionable, reconciled event plan.
              </p>
            </div>

            <div className="bg-[#FAF8FF] p-6 rounded-2xl border border-purple-100 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-purple-100">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Celebration</span>
                  <p className="font-bold text-slate-900 text-base">{formData.eventName || 'Unnamed Event'}</p>
                  <p className="text-brand-700 font-medium">{formData.eventType}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Date & City</span>
                  <p className="font-bold text-slate-900">{formData.eventDate || 'Date not set'}</p>
                  <p className="text-slate-600">{formData.location || 'Location not set'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-purple-100">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Headcount</span>
                  <p className="font-bold text-slate-900">{formData.guestCount} Guests</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Planned Capital</span>
                  <p className="font-bold text-emerald-700">{formData.currency} {Number(formData.totalBudget).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Flexibility</span>
                  <p className="font-semibold text-slate-800">{formData.budgetFlexibility}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <p><span className="font-semibold text-slate-900">Theme:</span> {formData.theme}</p>
                <p><span className="font-semibold text-slate-900">Palette:</span> {formData.colorPalette}</p>
                <p><span className="font-semibold text-slate-900">Catering:</span> {formData.foodPreference}</p>
                <p><span className="font-semibold text-slate-900">Setting:</span> {formData.indoorOutdoor}</p>
              </div>
            </div>

            {isGenerating && (
              <div className="p-8 rounded-3xl bg-purple-50/70 border border-purple-100 text-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto" />
                <div>
                  <h4 className="font-serif font-bold text-slate-900 text-lg">Architecting Your Event Plan...</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Gemini AI is balancing budget allocations, reverse-engineering lead times, assembling vendor specifications, and checking risk mitigation buffers.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div className="mt-8 pt-6 border-t border-purple-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isGenerating}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-soft transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-luxury hover:shadow-glow transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>Generate AI Event Plan</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};

