import React, { useState } from 'react';
import { Sparkles, Calendar, PlusCircle, User, LogOut, Menu, X, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openCreateWizard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, openCreateWizard }) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (view: string) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-purple-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo */}
          <div 
            onClick={() => handleNav(user ? 'dashboard' : 'landing')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-brand-900 via-royal to-brand-600 bg-clip-text text-transparent font-serif tracking-tight">
                EventEase <span className="text-brand-500 font-sans text-sm font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-purple-100/70 border border-purple-200">AI</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium tracking-wider uppercase -mt-0.5">Luxury Event Intelligence</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!user ? (
              <>
                <button 
                  onClick={() => handleNav('landing')} 
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentView === 'landing' ? 'text-brand-700 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Home
                </button>
                <a 
                  href="#how-it-works" 
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  How It Works
                </a>
                <a 
                  href="#categories" 
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  Celebrations
                </a>
                <a 
                  href="#features" 
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  AI Suite
                </a>
                <a 
                  href="#faq" 
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                >
                  FAQ
                </a>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleNav('dashboard')} 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentView === 'dashboard' ? 'text-brand-700 bg-brand-50 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button 
                  onClick={() => handleNav('settings')} 
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentView === 'settings' ? 'text-brand-700 bg-brand-50 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={async () => {
                    try {
                      await demoLogin();
                      handleNav('dashboard');
                    } catch (e) {
                      handleNav('auth-login');
                    }
                  }}
                  className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-brand-800 bg-purple-100 hover:bg-purple-200/80 border border-purple-200 rounded-xl transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  <span>Demo Login</span>
                </button>
                <button
                  onClick={() => handleNav('auth-login')}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-900 hover:bg-brand-50 rounded-xl transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('auth-register')}
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 rounded-xl shadow-soft hover:shadow-luxury transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Get Started Free
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {openCreateWizard && (
                  <button
                    onClick={openCreateWizard}
                    className="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-royal hover:from-brand-700 hover:to-royal-dark rounded-xl shadow-soft hover:shadow-luxury transition-all transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Plan New Event</span>
                  </button>
                )}

                {/* Profile menu dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full border border-purple-200 hover:border-brand-400 bg-purple-50/50 hover:bg-purple-100/50 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div 
                      onMouseLeave={() => setUserDropdownOpen(false)}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-luxury border border-purple-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 py-2 border-b border-purple-50">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Currency: {user.currency || 'USD'}
                        </span>
                      </div>
                      <button
                        onClick={() => { setUserDropdownOpen(false); handleNav('dashboard'); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-brand-600" />
                        <span>All Events</span>
                      </button>
                      <button
                        onClick={() => { setUserDropdownOpen(false); handleNav('settings'); }}
                        className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-brand-600" />
                        <span>Preferences & Settings</span>
                      </button>
                      <div className="border-t border-purple-50 mt-1 pt-1">
                        <button
                          onClick={() => { setUserDropdownOpen(false); logout(); handleNav('landing'); }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-purple-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-purple-100 px-4 pt-2 pb-6 space-y-3">
          {!user ? (
            <>
              <button 
                onClick={() => handleNav('landing')} 
                className="block w-full text-left px-4 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-purple-50"
              >
                Home
              </button>
              <div className="pt-3 border-t border-purple-100 flex flex-col space-y-2">
                <button
                  onClick={() => handleNav('auth-login')}
                  className="w-full py-2.5 text-center text-sm font-semibold text-brand-700 border border-brand-200 rounded-xl"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('auth-register')}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-indigo-600 rounded-xl"
                >
                  Get Started Free
                </button>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleNav('dashboard')} 
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-purple-50"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-600" />
                <span>Dashboard</span>
              </button>
              {openCreateWizard && (
                <button 
                  onClick={() => { setMobileMenuOpen(false); openCreateWizard(); }} 
                  className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-brand-700 font-medium bg-purple-50"
                >
                  <PlusCircle className="w-4 h-4 text-brand-600" />
                  <span>Plan New Event</span>
                </button>
              )}
              <button 
                onClick={() => handleNav('settings')} 
                className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-slate-700 font-medium hover:bg-purple-50"
              >
                <Settings className="w-4 h-4 text-brand-600" />
                <span>Account Settings</span>
              </button>
              <div className="pt-2 border-t border-purple-100">
                <button 
                  onClick={() => { logout(); handleNav('landing'); }} 
                  className="flex items-center space-x-3 w-full px-4 py-2.5 rounded-xl text-rose-600 font-medium hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

