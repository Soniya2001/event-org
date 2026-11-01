import React, { useState, useEffect } from 'react';
import { 
  Calendar, DollarSign, CheckSquare, Plus, Sparkles, MapPin, 
  Users, ArrowRight, Clock, Filter, Eye, ChevronRight, AlertCircle,
  TrendingUp, Layers, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EventItem } from '../types';
import { QuickStatsCard } from '../components/QuickStatsCard';

interface DashboardPageProps {
  onSelectEvent: (event: EventItem, tab?: string) => void;
  onOpenCreateWizard: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onSelectEvent, onOpenCreateWizard }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'Planning' | 'Completed' | 'Draft'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load your events. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (filter === 'all') return true;
    if (filter === 'Planning') return ev.status === 'Planning' || ev.status === 'Confirmed';
    if (filter === 'Completed') return ev.status === 'Completed';
    if (filter === 'Draft') return ev.status === 'Draft';
    return true;
  });

  // Calculate high-level aggregated metrics
  const totalEvents = events.length;
  const upcomingCount = events.filter(e => e.status !== 'Completed').length;
  const totalPlannedBudget = events.reduce((sum, e) => sum + (e.total_budget || 0), 0);
  const userCurrency = user?.currency || 'USD';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-brand-900 via-royal to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-luxury overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/20 blur-[90px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Event Command Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif">
              Welcome back, {user?.name || 'Celebration Host'}
            </h1>
            <p className="text-sm sm:text-base text-purple-200/90 max-w-xl">
              You have <span className="font-semibold text-white">{upcomingCount} active celebrations</span> in planning. Let's make every moment unforgettable.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateWizard}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-purple-50 text-brand-900 font-bold text-sm shadow-luxury transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              <span>Plan New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCard
          title="Total Events"
          value={totalEvents}
          subtitle="Celebrations managed"
          icon={Layers}
          colorScheme="purple"
        />
        <QuickStatsCard
          title="Active & Upcoming"
          value={upcomingCount}
          subtitle="In active planning"
          icon={Calendar}
          colorScheme="blue"
        />
        <QuickStatsCard
          title="Total Capital Planned"
          value={`${userCurrency} ${totalPlannedBudget.toLocaleString()}`}
          subtitle="Allocated across all events"
          icon={DollarSign}
          colorScheme="emerald"
        />
        <QuickStatsCard
          title="AI Assistant Status"
          value="Online"
          subtitle="Gemini 2.5 Flash ready"
          icon={Sparkles}
          colorScheme="amber"
        />
      </div>

      {/* Event Cards Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-serif">Your Celebrations</h2>
            <p className="text-xs sm:text-sm text-slate-500">Select an event to view its AI plan, budget, tasks, or vendor directory.</p>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 bg-purple-50/70 p-1.5 rounded-2xl border border-purple-100 self-start sm:self-auto">
            {(['all', 'Planning', 'Draft', 'Completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === tab
                    ? 'bg-white text-brand-800 shadow-soft font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'all' ? 'All Events' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Loading your luxury event blueprints...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">{error}</p>
              <button 
                onClick={fetchEvents}
                className="mt-2 text-xs font-bold text-amber-900 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredEvents.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-purple-100 shadow-soft max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 text-brand-600 flex items-center justify-center mx-auto shadow-xs">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-slate-800">No events found</h3>
            <p className="text-sm text-slate-500">
              {filter === 'all' 
                ? "You haven't planned any events yet. Click below to generate your first AI event plan!"
                : `No events currently match the "${filter}" filter.`}
            </p>
            <button
              onClick={onOpenCreateWizard}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-sm shadow-soft hover:shadow-luxury transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Event</span>
            </button>
          </div>
        )}

        {/* Event Cards Grid */}
        {!isLoading && !error && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => {
              const statusColors = {
                Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Planning: 'bg-brand-50 text-brand-700 border-brand-200',
                Confirmed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                Draft: 'bg-slate-100 text-slate-600 border-slate-200',
              }[ev.status] || 'bg-purple-50 text-brand-700 border-purple-200';

              return (
                <div
                  key={ev.id}
                  className="bg-white rounded-3xl p-6 border border-purple-100/90 shadow-soft hover:shadow-luxury transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors}`}>
                        {ev.status}
                      </span>
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        {ev.event_type}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectEvent(ev, 'plan')}
                      className="text-xl font-bold font-serif text-slate-900 group-hover:text-brand-700 transition-colors cursor-pointer truncate"
                    >
                      {ev.event_name}
                    </h3>

                    {/* Meta items */}
                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span>{ev.event_date || 'Date TBD'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span className="truncate">{ev.location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span>{ev.guest_count} Attendees</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-brand-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {ev.currency} {ev.total_budget.toLocaleString()} planned
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5 pt-4 border-t border-purple-50">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500 font-medium">Planning Progress</span>
                        <span className="font-bold text-brand-700">{ev.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 transition-all duration-500"
                          style={{ width: `${Math.max(5, ev.progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-6 pt-4 border-t border-purple-50 grid grid-cols-3 gap-2 text-center text-xs">
                    <button
                      onClick={() => onSelectEvent(ev, 'plan')}
                      className="py-2 px-1 rounded-xl bg-purple-50 hover:bg-brand-100 text-brand-800 font-semibold transition-colors truncate"
                    >
                      AI Blueprint
                    </button>
                    <button
                      onClick={() => onSelectEvent(ev, 'budget')}
                      className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 font-semibold transition-colors truncate"
                    >
                      Budget
                    </button>
                    <button
                      onClick={() => onSelectEvent(ev, 'timeline')}
                      className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 font-semibold transition-colors truncate"
                    >
                      Tasks
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

