import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EventItem } from './types';
import { Sparkles, Loader2 } from 'lucide-react';

// Route-level Code Splitting for maximum efficiency and sub-second Time To Interactive (TTI)
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CreateEventWizard = lazy(() => import('./pages/CreateEventWizard').then(m => ({ default: m.CreateEventWizard })));
const PlanViewPage = lazy(() => import('./pages/PlanViewPage').then(m => ({ default: m.PlanViewPage })));
const BudgetPage = lazy(() => import('./pages/BudgetPage').then(m => ({ default: m.BudgetPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then(m => ({ default: m.TimelinePage })));
const VendorsPage = lazy(() => import('./pages/VendorsPage').then(m => ({ default: m.VendorsPage })));
const AIAssistantDrawer = lazy(() => import('./pages/AIAssistantDrawer').then(m => ({ default: m.AIAssistantDrawer })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner animate-pulse">
      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
    </div>
    <p className="text-xs uppercase tracking-widest font-semibold text-purple-600">
      Loading celebration workspace...
    </p>
  </div>
);

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<string>(user ? 'dashboard' : 'landing');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Helper to open an event with a specific tab
  const handleSelectEvent = (event: EventItem, tab: string = 'plan') => {
    setSelectedEvent(event);
    setCurrentView(tab);
  };

  const handlePlanGenerated = (newEvent: EventItem) => {
    setIsWizardOpen(false);
    setSelectedEvent(newEvent);
    setCurrentView('plan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] font-sans selection:bg-purple-200 selection:text-purple-900">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openCreateWizard={() => setIsWizardOpen(true)}
      />

      {/* Main View Router wrapped in ErrorBoundary and Suspense */}
      <main id="main-content" tabIndex={-1} role="main" className="flex-1 focus:outline-none">
        <ErrorBoundary>
          <Suspense fallback={<PageLoadingFallback />}>
            
            {/* Landing Page */}
            {currentView === 'landing' && (
              <LandingPage
                onStartPlanning={() => {
                  if (user) {
                    setIsWizardOpen(true);
                  } else {
                    setCurrentView('auth-register');
                  }
                }}
                onLogin={() => setCurrentView('auth-login')}
              />
            )}

            {/* Authentication View (Login) */}
            {currentView === 'auth-login' && (
              <AuthPage
                initialMode="login"
                onSuccess={() => setCurrentView('dashboard')}
                onCancel={() => setCurrentView('landing')}
              />
            )}

            {/* Authentication View (Register) */}
            {currentView === 'auth-register' && (
              <AuthPage
                initialMode="register"
                onSuccess={() => {
                  setCurrentView('dashboard');
                  setIsWizardOpen(true);
                }}
                onCancel={() => setCurrentView('landing')}
              />
            )}

            {/* Main Dashboard */}
            {currentView === 'dashboard' && (
              <DashboardPage
                onSelectEvent={handleSelectEvent}
                onOpenCreateWizard={() => setIsWizardOpen(true)}
              />
            )}

            {/* AI Plan Viewer */}
            {currentView === 'plan' && selectedEvent && (
              <PlanViewPage
                event={selectedEvent}
                onBack={() => setCurrentView('dashboard')}
                onOpenBudget={() => setCurrentView('budget')}
                onOpenTimeline={() => setCurrentView('timeline')}
                onOpenVendors={() => setCurrentView('vendors')}
                onOpenChat={() => setIsChatOpen(true)}
              />
            )}

            {/* Budget Management */}
            {currentView === 'budget' && selectedEvent && (
              <BudgetPage
                event={selectedEvent}
                onBack={() => setCurrentView('plan')}
              />
            )}

            {/* Timeline & Tasks */}
            {currentView === 'timeline' && selectedEvent && (
              <TimelinePage
                event={selectedEvent}
                onBack={() => setCurrentView('plan')}
                onProgressUpdate={(newProgress) => {
                  setSelectedEvent({ ...selectedEvent, progress: newProgress });
                }}
              />
            )}

            {/* Vendor Directory */}
            {currentView === 'vendors' && selectedEvent && (
              <VendorsPage
                event={selectedEvent}
                onBack={() => setCurrentView('plan')}
              />
            )}

            {/* Settings & Profile */}
            {currentView === 'settings' && (
              <SettingsPage
                onBack={() => setCurrentView(user ? 'dashboard' : 'landing')}
              />
            )}

          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Floating AI Assistant Trigger Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        aria-label="Open AI Event Assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-royal to-indigo-600 text-white shadow-luxury hover:shadow-glow transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-purple-600"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold tracking-wide pr-1">AI Event Planner</span>
      </button>

      {/* AI Assistant Chat Drawer */}
      <Suspense fallback={null}>
        <AIAssistantDrawer
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          event={selectedEvent}
          onEventUpdated={(updated) => setSelectedEvent(updated)}
        />
      </Suspense>

      {/* Create Event Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200">
          <div className="w-full max-w-4xl my-8">
            <Suspense fallback={<PageLoadingFallback />}>
              <CreateEventWizard
                onPlanGenerated={handlePlanGenerated}
                onCancel={() => setIsWizardOpen(false)}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
