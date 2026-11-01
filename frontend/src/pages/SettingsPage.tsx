import React, { useState } from 'react';
import { User, Bell, DollarSign, Palette, Shield, Save, Check, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const { user, updateUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [budgetWarnings, setBudgetWarnings] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateMe({ name, currency });
      updateUser(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-100">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-purple-200 text-slate-600 hover:text-slate-900 hover:bg-purple-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
              Account & Planning Preferences
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Configure personal profile, global currency, and notification rules
            </p>
          </div>
        </div>

        {isSaved && (
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 flex items-center animate-in fade-in">
            <Check className="w-4 h-4 mr-1.5" /> Preferences Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* User Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-purple-50">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-brand-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900">User Profile</h3>
              <p className="text-xs text-slate-500">Your planner account identity</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs sm:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-purple-50">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900">Currency & Regional Formats</h3>
              <p className="text-xs text-slate-500">Default currency used across all generated plans</p>
            </div>
          </div>

          <div className="max-w-md text-xs sm:text-sm">
            <label className="block font-semibold text-slate-700 mb-1.5">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
            >
              <option value="USD">USD ($) — United States Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="CAD">CAD ($) — Canadian Dollar</option>
              <option value="AUD">AUD ($) — Australian Dollar</option>
            </select>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-soft space-y-5">
          <div className="flex items-center space-x-3 pb-3 border-b border-purple-50">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900">Smart Alert Notifications</h3>
              <p className="text-xs text-slate-500">Control budget overspend thresholds and deadline pings</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={budgetWarnings}
                onChange={(e) => setBudgetWarnings(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-800 font-medium">
                Immediate Over-Budget Alerts (Notify when actual spending crosses 100% of category allocation)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={taskReminders}
                onChange={(e) => setTaskReminders(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-800 font-medium">
                Long-Lead Milestone Warnings (Remind 7 days prior to urgent vendor booking deadlines)
              </span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-slate-800 font-medium">
                Weekly Planning Digest (Summary of completed milestones and upcoming vendor meetings)
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs sm:text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-sm shadow-luxury transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Preferences'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

