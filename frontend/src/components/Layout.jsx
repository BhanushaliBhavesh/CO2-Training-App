import React from 'react';
import { Home, History, User, Play, Settings } from 'lucide-react';

// Added "isFullScreen" prop here
const Layout = ({ children, activeTab, onTabChange, isFullScreen }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      {/* PHONE FRAME */}
      <div className="w-full max-w-md bg-white h-[850px] rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-gray-900 flex flex-col">
        
        {/* HEADER: Only show if NOT full screen */}
        {!isFullScreen && (
          <header className="px-6 pt-8 pb-4 bg-white z-10">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-slate-800">CO2 Trainer</h1>
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                  PRO
              </div>
            </div>
          </header>
        )}

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide relative">
          {children}
        </main>

        {/* BOTTOM NAV: Only show if NOT full screen */}
        {!isFullScreen && (
          <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex justify-between items-center z-50">
            <button onClick={() => onTabChange('dashboard')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">Home</span>
            </button>
            
            <button onClick={() => onTabChange('history')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <History size={22} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">History</span>
            </button>
            
            <div className="relative -top-8">
              <button onClick={() => onTabChange('training_select')} className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-200 ring-4 ring-white hover:scale-105 active:scale-95 transition-transform">
                <Play fill="white" size={28} className="ml-1" />
              </button>
            </div>
            
            <button onClick={() => onTabChange('settings')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <Settings size={22} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">Settings</span>
            </button>
            
            <button onClick={() => onTabChange('profile')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'}`}>
              <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              <span className="text-[10px] font-bold uppercase tracking-wide">Profile</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;