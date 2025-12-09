
import React, { useState, useEffect } from 'react';
import { Shield, MessageCircle, BookOpen, AlertCircle, WifiOff, Wrench } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import EmergencyView from './components/EmergencyView';
import GuidesView from './components/GuidesView';
import ToolsView from './components/ToolsView';
import FakeCallOverlay from './components/FakeCallOverlay';
import { AppView } from './types';
import { initializeOfflineData } from './services/storageService';

// --- Define fixed heights for clarity (Used for calculating vertical padding) ---
// Header height: Header (h-14 / 56px) + Offline Banner (if shown, approx 32px)
// Bottom Nav height: 70px

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    initializeOfflineData();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.EMERGENCY:
        return <EmergencyView />;
      case AppView.GUIDES:
        return <GuidesView />;
      case AppView.TOOLS:
        return <ToolsView />;
      case AppView.HOME:
      default:
        return (
          <div className="space-y-6">
            
            {/* --- NEW HERO BANNER START ---
            */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 md:p-10 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="max-w-lg">
                <h1 className="text-2xl md:text-4xl font-bold mb-2">Welcome to GuardianAI</h1>
                <p className="text-indigo-100 text-sm md:text-base mb-4 md:mb-0">
                  Your personal AI companion for safety, awareness, and emergency response.
                  Always here, always alert.
                </p>
              </div>
              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="bg-white text-indigo-700 px-6 py-3 rounded-full font-bold text-sm md:text-base hover:bg-indigo-50 transition-colors shadow-sm whitespace-nowrap self-start md:self-center"
              >
                Start Chatting
              </button>
            </div>
             {/* --- NEW HERO BANNER END ---
             */}


            {/* Primary Action - Emergency (Keeping the rest of your original content below the banner) */}
            <button 
              onClick={() => setCurrentView(AppView.EMERGENCY)}
              className="w-full bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between hover:bg-red-100 transition-colors group shadow-sm"
            >
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                   <AlertCircle size={20} />
                 </div>
                 <div className="text-left">
                   <span className="block font-semibold text-red-700">Emergency & SOS</span>
                   <span className="text-sm text-red-400">Rapid response tools</span>
                 </div>
               </div>
               <div className="text-red-600">
                 <AlertCircle size={20} />
               </div>
            </button>

            {/* Main AI Features */}
            <div className="space-y-4">
              <button 
                onClick={() => setCurrentView(AppView.CHAT)}
                className="w-full bg-indigo-600 p-6 rounded-xl text-white shadow-md hover:bg-indigo-700 transition-all flex items-center justify-start h-24"
              >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <MessageCircle size={20} />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold text-lg">Safety Chat</span>
                      <span className="text-indigo-200 text-sm">AI Personal Assistant</span>
                    </div>
                </div>
              </button>
            </div>

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
               <button 
                onClick={() => setCurrentView(AppView.TOOLS)}
                className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-center flex-col gap-2 h-24 hover:bg-slate-50 transition-colors"
               >
                 <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                   <Wrench size={20} />
                 </div>
                 <span className="font-semibold text-slate-700 text-sm">Tools</span>
               </button>

               <button 
                onClick={() => setCurrentView(AppView.GUIDES)}
                className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-center flex-col gap-2 h-24 hover:bg-slate-50 transition-colors"
               >
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                   <BookOpen size={20} />
                 </div>
                 <span className="font-semibold text-slate-700 text-sm">Guides</span>
               </button>
            </div>

            {/* Daily Tip */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex gap-3 items-start">
               <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
               <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                 Tip: Share your live location with family when traveling late at night.
               </p>
            </div>
            
            {/* Scroll Spacer */}
            <div className="h-10"></div>
          </div>
        );
    }
  };

  const NavItem = ({ view, icon: Icon, label, colorClass = "text-slate-400", activeClass = "text-indigo-600 bg-indigo-50" }: any) => (
      <button 
        onClick={() => setCurrentView(view)}
        className={`flex items-center gap-3 p-3 rounded-xl w-full transition-all ${currentView === view ? `${activeClass} font-semibold` : `${colorClass} hover:bg-slate-50`}`}
      >
        <Icon className={`w-5 h-5 ${currentView === view ? 'scale-110' : ''}`} />
        <span className="text-sm md:text-base">{label}</span>
      </button>
  );

  return (
    <div className="h-[100dvh] bg-slate-50 md:flex relative overflow-hidden">
      
      {/* Global Overlays */}
      <FakeCallOverlay />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0 z-20">
         <div className="p-6 border-b border-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Shield className="text-white w-6 h-6" />
             </div>
             <div>
                <h1 className="font-bold text-xl tracking-tight text-slate-800 leading-none">Guardian<span className="text-indigo-600">AI</span></h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Personal Safety</span>
             </div>
         </div>
         
         <nav className="flex-1 p-4 space-y-2">
            <NavItem view={AppView.HOME} icon={Shield} label="Home" activeClass="text-indigo-600 bg-indigo-50" />
            <NavItem view={AppView.CHAT} icon={MessageCircle} label="AI Safety Chat" activeClass="text-indigo-600 bg-indigo-50" />
            <NavItem view={AppView.TOOLS} icon={Wrench} label="Safety Tools" activeClass="text-purple-600 bg-purple-50" />
            <NavItem view={AppView.GUIDES} icon={BookOpen} label="Knowledge Base" activeClass="text-blue-600 bg-blue-50" />
            <NavItem view={AppView.EMERGENCY} icon={AlertCircle} label="Emergency" colorClass="text-red-400" activeClass="text-red-600 bg-red-50" />
         </nav>

         <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-500">
                <p className="mb-2"><strong>Note:</strong> In a life-threatening emergency, always dial <strong>112</strong> directly.</p>
                <p className="opacity-70">v1.3.1</p>
            </div>
         </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-1 flex flex-col w-full h-full relative">
        
        {/* Mobile Header (Fixed Top) */}
        <div className="md:hidden flex-none z-30 bg-white">
          <header className="px-4 py-3 border-b border-slate-100 flex items-center justify-between shadow-sm h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                 <Shield className="text-white w-5 h-5" />
              </div>
              <h1 className="font-bold text-lg tracking-tight text-slate-800">Guardian<span className="text-indigo-600">AI</span></h1>
            </div>
            {currentView !== AppView.HOME && (
               <button 
                 onClick={() => setCurrentView(AppView.HOME)}
                 className="text-xs font-medium text-slate-500 hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-full"
              >
                 Back
              </button>
            )}
          </header>

          {/* Offline Banner */}
          {!isOnline && (
            <div className="bg-slate-800 text-white px-4 py-2 text-xs md:text-sm flex items-center justify-center gap-2">
              <WifiOff size={14} />
              <span>You are currently offline.</span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8 relative">
            <div className="max-w-5xl mx-auto min-h-full pb-20 md:pb-0">
                {renderContent()}
            </div>
        </main>

        {/* Mobile Bottom Navigation (Fixed Bottom) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 px-1 py-3 flex justify-around items-center z-40 h-[70px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom">
          <button 
            onClick={() => setCurrentView(AppView.HOME)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === AppView.HOME ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          
          <button 
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === AppView.CHAT ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">Chat</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.TOOLS)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === AppView.TOOLS ? 'text-purple-600' : 'text-slate-400'}`}
          >
            <Wrench className="w-5 h-5" />
            <span className="text-[10px] font-medium">Tools</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.GUIDES)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === AppView.GUIDES ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Guides</span>
          </button>

          <button 
            onClick={() => setCurrentView(AppView.EMERGENCY)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === AppView.EMERGENCY ? 'text-red-600' : 'text-slate-400'}`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-[10px] font-medium">SOS</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default App;
