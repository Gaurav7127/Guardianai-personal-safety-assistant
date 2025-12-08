import React, { useState, useEffect } from 'react';
import { Shield, MessageCircle, BookOpen, AlertCircle, Menu, X, WifiOff, PenTool, Wrench } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import EmergencyView from './components/EmergencyView';
import GuidesView from './components/GuidesView';
import ToolsView from './components/ToolsView';
import FakeCallOverlay from './components/FakeCallOverlay';
import { AppView } from './types';
import { initializeOfflineData } from './services/storageService';

function App() {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Initialize local storage with default data
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
          <div className="space-y-6 pb-20 md:pb-0">
            {/* Hero Banner */}
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

            {/* Quick Access Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <button 
                onClick={() => setCurrentView(AppView.EMERGENCY)}
                className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center gap-2 hover:bg-red-100 transition-colors group aspect-[4/3] md:aspect-auto md:h-48"
               >
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <AlertCircle className="w-6 h-6 md:w-8 md:h-8" />
                 </div>
                 <span className="font-bold text-red-700 md:text-lg">Emergency</span>
                 <span className="text-xs text-red-400 hidden md:block">SOS, Helplines & Rapid Actions</span>
               </button>

               <button 
                onClick={() => setCurrentView(AppView.TOOLS)}
                className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex flex-col items-center justify-center gap-2 hover:bg-purple-100 transition-colors group aspect-[4/3] md:aspect-auto md:h-48"
               >
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <Wrench className="w-6 h-6 md:w-8 md:h-8" />
                 </div>
                 <span className="font-bold text-purple-700 md:text-lg">Safety Tools</span>
                 <span className="text-xs text-purple-400 hidden md:block">Fake Call & Live Monitor</span>
               </button>

               <button 
                onClick={() => setCurrentView(AppView.GUIDES)}
                className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition-colors group aspect-[4/3] md:aspect-auto md:h-48 col-span-2 md:col-span-1"
               >
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                   <BookOpen className="w-6 h-6 md:w-8 md:h-8" />
                 </div>
                 <span className="font-bold text-blue-700 md:text-lg">Guides</span>
                 <span className="text-xs text-blue-400 hidden md:block">Knowledge Base</span>
               </button>
            </div>

            {/* Daily Tip */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm md:flex md:items-start md:gap-4">
              <div className="bg-indigo-50 p-3 rounded-full inline-flex mb-3 md:mb-0 shrink-0">
                  <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                  <h3 className="font-bold text-slate-800 mb-2 md:text-lg">Daily Safety Tip</h3>
                  <p className="text-slate-600 text-sm md:text-base italic leading-relaxed">
                    "When walking alone, walk with purpose. Keep your head up, scan your surroundings, and avoid staring at your phone. Confidence deters potential threats."
                  </p>
              </div>
            </div>
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
    <div className="min-h-screen bg-slate-50 md:flex relative">
      
      {/* Global Overlays */}
      <FakeCallOverlay />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shrink-0">
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
                <p className="opacity-70">v1.2.0</p>
            </div>
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
        
        {/* Mobile Header */}
        <header className="md:hidden px-4 py-3 bg-white border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between shadow-sm">
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
          <div className="bg-slate-800 text-white px-4 py-2 text-xs md:text-sm flex items-center justify-center gap-2 sticky top-0 md:static z-10">
            <WifiOff size={14} />
            <span>You are currently offline. Accessing cached safety guides and contacts.</span>
          </div>
        )}

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8">
            <div className="max-w-5xl mx-auto h-full">
                {renderContent()}
            </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden sticky bottom-0 bg-white border-t border-slate-200 px-2 py-3 flex justify-around items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === AppView.GUIDES ? 'text-indigo-600' : 'text-slate-400'}`}
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