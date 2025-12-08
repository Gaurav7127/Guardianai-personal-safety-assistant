
import React, { useState, useEffect } from 'react';
import { Phone, Clock, MapPin, Play, Activity, Eye, EyeOff, Send, MessageCircle } from 'lucide-react';
import { EVENTS, emit } from '../services/eventBus';
import { FAKE_CALL_SCRIPTS } from '../constants';
import { getFakeCallConfig, saveFakeCallConfig, getTrustedContacts } from '../services/storageService';
import { TrustedContact } from '../types';

const ToolsView: React.FC = () => {
  // Fake Call State
  const [selectedScriptId, setSelectedScriptId] = useState('mom');
  const [delay, setDelay] = useState(5);
  const [isScheduled, setIsScheduled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Monitor State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{lat: number, lng: number} | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);

  useEffect(() => {
    const config = getFakeCallConfig();
    setSelectedScriptId(config.scriptId);
    setDelay(config.delaySeconds);
    setTrustedContacts(getTrustedContacts());

    return () => {
       if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Fake Call Logic
  useEffect(() => {
    let timer: any;
    if (isScheduled && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (isScheduled && countdown === 0) {
      setIsScheduled(false);
      emit(EVENTS.TRIGGER_FAKE_CALL, { scriptId: selectedScriptId });
    }
    return () => clearInterval(timer);
  }, [isScheduled, countdown, selectedScriptId]);

  const scheduleCall = () => {
    if (isScheduled) {
        setIsScheduled(false);
        return;
    }
    setCountdown(delay);
    setIsScheduled(true);
    saveFakeCallConfig({ scriptId: selectedScriptId, delaySeconds: delay });
  };

  // Monitor Logic
  const toggleMonitor = () => {
    if (isMonitoring) {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        setIsMonitoring(false);
        setWatchId(null);
        setCurrentCoords(null);
    } else {
        setIsMonitoring(true);
        if (navigator.geolocation) {
            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    setCurrentCoords({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    });
                },
                (err) => console.error(err),
                { enableHighAccuracy: true }
            );
            setWatchId(id);
        } else {
            alert("Geolocation not supported");
            setIsMonitoring(false);
        }
    }
  };

  const shareCoordinates = (type: 'sms' | 'whatsapp') => {
      if (!currentCoords) {
          alert("Waiting for GPS signal...");
          return;
      }
      
      const { lat, lng } = currentCoords;
      const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
      const message = `SOS! I feel unsafe. Here is my current location: ${mapsLink}`;
      
      // Use the first trusted contact if available, otherwise blank
      const contactNumber = trustedContacts[0]?.phone || '';

      if (type === 'sms') {
          const ua = navigator.userAgent.toLowerCase();
          const isiOS = /iphone|ipad|ipod/.test(ua);
          const delimiter = isiOS ? '&' : '?';
          window.location.href = `sms:${contactNumber}${delimiter}body=${encodeURIComponent(message)}`;
      } else {
          window.open(`https://wa.me/${contactNumber}?text=${encodeURIComponent(message)}`, '_blank');
      }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
       <div className="flex items-center justify-between">
         <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Safety Tools</h2>
         <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium whitespace-nowrap ml-2">Proactive Measures</span>
       </div>

       {/* 1. Fake Call System */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white flex items-center gap-2">
             <Phone className="w-5 h-5" />
             <h3 className="font-bold text-lg">Fake Call Simulator</h3>
          </div>
          
          <div className="p-4 md:p-6">
             <p className="text-slate-600 text-sm mb-6">
                Schedule a realistic incoming call. Useful for exiting uncomfortable situations discreetly.
             </p>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Caller Identity</label>
                    <div className="space-y-2">
                       {FAKE_CALL_SCRIPTS.map(script => (
                           <button
                             key={script.id}
                             onClick={() => setSelectedScriptId(script.id)}
                             className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${selectedScriptId === script.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                           >
                              <div className="font-bold text-sm md:text-base">{script.label}</div>
                              <div className="text-xs opacity-70 truncate">{script.audioText}</div>
                           </button>
                       ))}
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timer Delay</label>
                    <div className="flex gap-2 mb-4">
                        {[5, 10, 30, 60].map(sec => (
                            <button
                                key={sec}
                                onClick={() => setDelay(sec)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium border ${delay === sec ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {sec}s
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                        <Clock className="text-indigo-500 shrink-0" size={20} />
                        <div className="text-xs md:text-sm">
                            The call will ring <strong>{delay} seconds</strong> after you tap the button.
                        </div>
                    </div>
                 </div>
             </div>

             <button 
               onClick={scheduleCall}
               className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${isScheduled ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
             >
                 {isScheduled ? (
                     <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20"></span>
                        Cancel Call ({countdown}s)
                     </>
                 ) : (
                     <>
                        <Play fill="currentColor" size={20} /> <span className="text-base md:text-lg">SCHEDULE CALL</span>
                     </>
                 )}
             </button>
          </div>
       </div>

       {/* 2. Live Location Monitor */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white flex items-center gap-2">
             <MapPin className="w-5 h-5" />
             <h3 className="font-bold text-lg">Live Safety Monitor</h3>
          </div>

          <div className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4 mb-6">
                  <div className={`relative p-3 rounded-full transition-colors shrink-0 ${isMonitoring ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {isMonitoring && (
                          <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></span>
                      )}
                      <Activity size={24} />
                  </div>
                  <div>
                      <h4 className="font-bold text-slate-800 text-sm md:text-base">Active GPS Tracking</h4>
                      <p className="text-xs md:text-sm text-slate-600 mt-1">
                          Continuously updates your location coordinates. Useful when traveling in unknown areas.
                      </p>
                  </div>
              </div>

              {/* Radar UI */}
              <div className={`relative bg-slate-900 rounded-lg p-4 md:p-6 mb-6 overflow-hidden transition-all duration-500 ${isMonitoring ? 'opacity-100' : 'opacity-50 grayscale'}`}>
                  {isMonitoring && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-green-500/5 rounded-full animate-ping"></div>
                  )}
                  
                  <div className="relative z-10 font-mono text-sm">
                      <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-3">
                          <span className={isMonitoring ? "text-green-400 font-bold text-xs md:text-sm" : "text-red-400 text-xs md:text-sm"}>
                              {isMonitoring ? "● SIGNAL ACQUIRED" : "○ OFFLINE"}
                          </span>
                          <span className="text-slate-500 text-[10px] md:text-xs">GPS-L1</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 md:gap-4">
                          <div>
                              <div className="text-slate-500 text-[10px] md:text-xs mb-1">LATITUDE</div>
                              <div className="text-white text-base md:text-lg tracking-wider font-mono">
                                  {currentCoords ? currentCoords.lat.toFixed(6) : "00.000000"}
                              </div>
                          </div>
                          <div>
                              <div className="text-slate-500 text-[10px] md:text-xs mb-1">LONGITUDE</div>
                              <div className="text-white text-base md:text-lg tracking-wider font-mono">
                                  {currentCoords ? currentCoords.lng.toFixed(6) : "00.000000"}
                              </div>
                          </div>
                      </div>
                      
                      <div className="mt-4 pt-2 border-t border-slate-700 flex justify-between text-[10px] md:text-xs text-slate-500">
                           <span>ACCURACY: {isMonitoring ? "HIGH (<10m)" : "--"}</span>
                           <span>UPDATED: {isMonitoring ? "NOW" : "--"}</span>
                      </div>
                  </div>
              </div>

              <button 
                onClick={toggleMonitor}
                className={`w-full py-4 rounded-xl font-bold border-2 transition-all flex items-center justify-center gap-3 ${isMonitoring ? 'border-green-500 text-green-600 bg-green-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                  {isMonitoring ? (
                      <> <Eye size={20} /> <span className="text-sm md:text-base">STOP MONITORING</span></>
                  ) : (
                      <> <EyeOff size={20} /> <span className="text-sm md:text-base">ACTIVATE MONITOR</span></>
                  )}
              </button>
              
              {/* Share Live Location Options */}
              {isMonitoring && currentCoords && (
                <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-3 text-center">Share Coordinates</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => shareCoordinates('sms')}
                            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
                        >
                            <Send size={16} /> SMS
                        </button>
                        <button 
                            onClick={() => shareCoordinates('whatsapp')}
                            className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3 rounded-xl hover:bg-green-100 transition-colors font-bold text-sm"
                        >
                            <MessageCircle size={16} /> WhatsApp
                        </button>
                    </div>
                    {trustedContacts.length === 0 && (
                       <p className="text-[10px] text-center text-slate-400 mt-2">
                          Tip: Add Trusted Contacts in the Emergency tab for 1-tap sharing.
                       </p>
                    )}
                </div>
              )}
          </div>
       </div>
    </div>
  );
};

export default ToolsView;
