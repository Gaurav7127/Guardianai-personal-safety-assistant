
import React, { useState, useEffect, useRef } from 'react';
import { Phone, AlertTriangle, Shield, Ambulance, Flame, Bell, MapPin, Plus, Trash2, Send, UserPlus, Mic, MicOff, Settings, Activity, X, Zap, Volume2, Search } from 'lucide-react';
import { getStoredContacts, getStoredActions, getTrustedContacts, addTrustedContact, removeTrustedContact, getSOSCodeWord, saveSOSCodeWord } from '../services/storageService';
import { SafetyContact, EmergencyAction, TrustedContact } from '../types';

// Add type definition for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const EmergencyView: React.FC = () => {
  const [contacts, setContacts] = useState<SafetyContact[]>([]);
  const [actions, setActions] = useState<EmergencyAction[]>([]);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  
  // Form State
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  
  // SOS State
  const [sosStatus, setSosStatus] = useState<'IDLE' | 'LOCATING' | 'READY'>('IDLE');
  const [sosUrl, setSosUrl] = useState('');

  // Voice SOS State
  const [isListening, setIsListening] = useState(false);
  const [codeWord, setCodeWord] = useState('help');
  const [lastHeard, setLastHeard] = useState(''); // Feedback for user
  const [isEditingCodeWord, setIsEditingCodeWord] = useState(false);
  
  // Siren State
  const [isSirenActive, setIsSirenActive] = useState(false);
  
  // Refs for stale closure prevention and Audio
  const recognitionRef = useRef<any>(null);
  const codeWordRef = useRef(codeWord);
  const isListeningRef = useRef(isListening);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    setContacts(getStoredContacts());
    setActions(getStoredActions());
    setTrustedContacts(getTrustedContacts());
    
    const savedWord = getSOSCodeWord();
    setCodeWord(savedWord);
    codeWordRef.current = savedWord;

    return () => {
      stopListening();
      stopSiren();
    };
  }, []);

  // Update refs when state changes
  useEffect(() => {
    codeWordRef.current = codeWord;
  }, [codeWord]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // --- Voice Recognition Logic ---
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser. Please use Chrome, Safari, or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const fullTranscript = (finalTranscript || interimTranscript).toLowerCase().trim();
      
      if (fullTranscript) {
          setLastHeard(`${fullTranscript} (${getTimestamp()})`); // Update UI for feedback
          console.log("Heard:", fullTranscript);

          const target = codeWordRef.current.toLowerCase();
          
          // Check if the target word is in the transcript
          if (fullTranscript.includes(target)) {
            stopListening();
            triggerVoiceSOS();
          }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === 'not-allowed') {
        setIsListening(false);
        alert("Microphone access denied. Please allow microphone permissions.");
      }
    };

    recognition.onend = () => {
        // Auto-restart if it was supposed to be listening
        if (isListeningRef.current && recognitionRef.current) {
            try {
                console.log("Restarting recognition...");
                recognition.start();
            } catch (e) {
                console.log("Restart prevented or failed");
            }
        }
    };

    try {
        recognition.start();
        recognitionRef.current = recognition;
        setIsListening(true);
    } catch(e) {
        console.error("Failed to start recognition", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setLastHeard('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const triggerVoiceSOS = () => {
    // 1. Vibration (if supported)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);

    // 2. Direct Share
    shareLocation('sms');
  };

  const handleSaveCodeWord = () => {
    if (codeWord.trim().length > 0) {
      saveSOSCodeWord(codeWord);
      setIsEditingCodeWord(false);
      // Restart listening if active to apply new word logic
      if (isListening) {
        stopListening();
        setTimeout(startListening, 500);
      }
    }
  };

  // --- Siren Logic (Web Audio API) ---
  const toggleSiren = () => {
    if (isSirenActive) {
      stopSiren();
    } else {
      startSiren();
    }
  };

  const startSiren = () => {
    setIsSirenActive(true);
    
    // Create Audio Context
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Siren effect: Modulate frequency
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.5);
    
    // Loop the frequency ramp
    // Note: A true loop requires interval or LFO, simpler approach for reliable React component:
    // We'll just set a high volume interval loop in JS to modulate pitch
    
    gain.gain.value = 1.0;
    osc.start();
    
    oscillatorRef.current = osc;
    gainNodeRef.current = gain;

    // Modulate pitch every 600ms
    const interval = setInterval(() => {
        if (oscillatorRef.current && audioContextRef.current) {
            const time = audioContextRef.current.currentTime;
            oscillatorRef.current.frequency.cancelScheduledValues(time);
            oscillatorRef.current.frequency.setValueAtTime(500, time);
            oscillatorRef.current.frequency.linearRampToValueAtTime(1200, time + 0.4);
        }
    }, 600);
    
    // Store interval to clear it later (attaching to the ref object for convenience/hack or better use a ref var)
    (oscillatorRef.current as any)._interval = interval;
  };

  const stopSiren = () => {
    setIsSirenActive(false);
    if (oscillatorRef.current) {
        clearInterval((oscillatorRef.current as any)._interval);
        try { oscillatorRef.current.stop(); } catch(e) {}
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
  };

  // --- Trusted Contacts Logic ---
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: TrustedContact = {
      id: Date.now().toString(),
      name: newContactName,
      phone: newContactPhone
    };

    const updatedList = addTrustedContact(newContact);
    setTrustedContacts(updatedList);
    setNewContactName('');
    setNewContactPhone('');
    setIsAddingContact(false);
  };

  const handleDeleteContact = (id: string) => {
    const updatedList = removeTrustedContact(id);
    setTrustedContacts(updatedList);
  };

  // --- Location Sharing Logic ---
  const shareLocation = async (type: 'sms' | 'whatsapp') => {
    if (trustedContacts.length === 0) {
      alert("Please add a Trusted Contact first.");
      setIsAddingContact(true);
      return;
    }

    setSosStatus('LOCATING');
    setSosUrl('');

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setSosStatus('IDLE');
      return;
    }

    // For WhatsApp web on desktop
    let newWindow: Window | null = null;
    if (type === 'whatsapp' && !/Mobi|Android/i.test(navigator.userAgent)) {
         newWindow = window.open('', '_blank');
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        const message = `SOS! I feel unsafe. Here is my current location: ${mapsLink}`;
        
        const primaryContact = trustedContacts[0].phone;

        let url = '';
        if (type === 'sms') {
             // Detect iOS to use standard delimiter
             const ua = navigator.userAgent.toLowerCase();
             const isiOS = /iphone|ipad|ipod/.test(ua);
             const delimiter = isiOS ? '&' : '?';
             url = `sms:${primaryContact}${delimiter}body=${encodeURIComponent(message)}`;
        } else {
             url = `https://wa.me/${primaryContact}?text=${encodeURIComponent(message)}`;
        }
        
        setSosUrl(url);
        setSosStatus('READY');
        
        // Attempt auto-redirect
        if (type === 'sms') {
             window.location.href = url;
        } else {
             if (newWindow) {
                 newWindow.location.href = url;
             } else {
                 window.open(url, '_blank');
             }
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        if (newWindow) newWindow.close();

        let errorMessage = "Unable to retrieve location.";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location unavailable.";
                break;
            case error.TIMEOUT:
                errorMessage = "Location request timed out.";
                break;
        }
        
        alert(errorMessage);
        setSosStatus('IDLE');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 30000 // Allow cached location up to 30s old for speed
      }
    );
  };

  const handleManualRedirect = () => {
    if (sosUrl) {
      window.location.href = sosUrl;
      setTimeout(() => setSosStatus('IDLE'), 1000);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-6 h-6" />;
      case 'Phone': return <Phone className="w-6 h-6" />;
      case 'Ambulance': return <Ambulance className="w-6 h-6" />;
      case 'Flame': return <Flame className="w-6 h-6" />;
      default: return <AlertTriangle className="w-6 h-6" />;
    }
  };

  const openNearbyMaps = (query: string) => {
      window.open(`https://www.google.com/maps/search/${query}+near+me`, '_blank');
  };

  return (
    <>
      {/* Flashing Background for Siren */}
      {isSirenActive && (
          <div className="fixed inset-0 z-[60] bg-red-600 animate-pulse pointer-events-none opacity-30 mix-blend-overlay"></div>
      )}

      <div className="space-y-6 pb-20 md:pb-0 relative z-10">

      {/* 1. Panic Siren (New Feature) */}
      <div className={`rounded-xl shadow-lg border-2 transition-all overflow-hidden ${isSirenActive ? 'bg-red-600 border-red-700 animate-pulse' : 'bg-white border-slate-200'}`}>
          <div className="p-4 flex items-center justify-between">
              <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isSirenActive ? 'text-white' : 'text-slate-800'}`}>
                      <Zap className={isSirenActive ? "text-yellow-300 fill-yellow-300" : "text-slate-400"} />
                      Panic Siren
                  </h3>
                  <p className={`text-xs ${isSirenActive ? 'text-red-100' : 'text-slate-500'}`}>
                      Play loud alarm & strobe light to deter attackers.
                  </p>
              </div>
              <button 
                  onClick={toggleSiren}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 transition-transform active:scale-95 ${
                      isSirenActive 
                      ? 'bg-white border-red-200 text-red-600' 
                      : 'bg-red-600 border-red-100 text-white hover:bg-red-700'
                  }`}
              >
                  {isSirenActive ? <Volume2 size={32} /> : <Volume2 size={32} />}
              </button>
          </div>
      </div>

      {/* 2. Voice SOS Trigger */}
      <div className={`rounded-xl shadow-sm border overflow-hidden transition-all duration-500 ${isListening ? 'bg-red-50 border-red-200 shadow-red-100' : 'bg-white border-slate-200'}`}>
        <div className={`p-4 text-white flex justify-between items-center ${isListening ? 'bg-red-600' : 'bg-slate-700'}`}>
             <h3 className="font-bold flex items-center gap-2">
                 {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />} 
                 Voice SOS Guard
             </h3>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingCodeWord(!isEditingCodeWord)}
                  className="p-1 hover:bg-white/20 rounded-full"
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
             </div>
        </div>
        
        <div className="p-5">
           <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full">
                 <div className="flex items-center justify-between mb-2">
                     <p className="font-bold text-slate-800">
                       Status: {isListening ? <span className="text-red-600">ARMED & LISTENING</span> : <span className="text-slate-500">DISARMED</span>}
                     </p>
                 </div>
                 
                 <p className="text-sm text-slate-500 mb-2">
                    {isListening 
                      ? `Say "${codeWord.toUpperCase()}" clearly to trigger SOS location share.`
                      : "Enable to let the app listen for your code word in the background."}
                 </p>

                 {/* Feedback Section */}
                 {isListening && (
                     <div className="bg-white/50 border border-slate-200 rounded-md p-2 flex items-center gap-2 text-sm text-slate-600 animate-in fade-in">
                         <Activity size={14} className={lastHeard ? "text-green-500" : "text-slate-400"} />
                         <span>Last heard:</span>
                         <span className="font-mono font-bold text-slate-800 truncate">{lastHeard || "Listening..."}</span>
                     </div>
                 )}
                 
                 {isEditingCodeWord && (
                   <div className="mt-3 flex gap-2 animate-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        value={codeWord} 
                        onChange={(e) => setCodeWord(e.target.value)}
                        className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full md:w-48"
                        placeholder="Secret word"
                      />
                      <button 
                        onClick={handleSaveCodeWord}
                        className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-md font-bold"
                      >
                        Save
                      </button>
                   </div>
                 )}
              </div>
              
              <button 
                onClick={toggleListening}
                className={`w-full md:w-auto px-8 py-4 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                  isListening 
                    ? 'bg-white text-red-600 border-2 border-red-500 hover:bg-red-50' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" /> DISARM
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" /> ARM VOICE GUARD
                  </>
                )}
              </button>
           </div>
        </div>
      </div>
      
      {/* 3. Trusted Contacts */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
             <h3 className="font-bold flex items-center gap-2">
                 <MapPin className="w-5 h-5" /> Trusted Contacts
             </h3>
             <button 
                onClick={() => setIsAddingContact(!isAddingContact)}
                className="text-xs bg-indigo-500 hover:bg-indigo-400 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
             >
                 {isAddingContact ? <span className="flex items-center gap-1">Close</span> : <span className="flex items-center gap-1"><Plus size={14}/> Add</span>}
             </button>
        </div>
        
        <div className="p-4">
             {/* Add Contact Form */}
             {isAddingContact && (
                 <form onSubmit={handleAddContact} className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in slide-in-from-top-2">
                     <div className="grid grid-cols-2 gap-2 mb-2">
                         <input 
                             type="text" 
                             placeholder="Name (e.g., Mom)" 
                             value={newContactName}
                             onChange={e => setNewContactName(e.target.value)}
                             className="p-2 text-sm border border-slate-300 rounded-md"
                             required
                         />
                         <input 
                             type="tel" 
                             placeholder="Phone (e.g., 9876543210)" 
                             value={newContactPhone}
                             onChange={e => setNewContactPhone(e.target.value)}
                             className="p-2 text-sm border border-slate-300 rounded-md"
                             required
                         />
                     </div>
                     <button type="submit" className="w-full bg-indigo-600 text-white text-sm font-medium py-2 rounded-md hover:bg-indigo-700">
                         Save Contact
                     </button>
                 </form>
             )}

             {/* Contacts List */}
             {trustedContacts.length === 0 ? (
                 <div className="text-center py-6 text-slate-400 text-sm">
                     <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50"/>
                     <p>Add family or friends to share your location instantly.</p>
                 </div>
             ) : (
                 <div className="space-y-2 mb-4">
                     {trustedContacts.map(contact => (
                         <div key={contact.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div>
                                 <p className="font-bold text-slate-800 text-sm">{contact.name}</p>
                                 <p className="text-xs text-slate-500">{contact.phone}</p>
                             </div>
                             <button onClick={() => handleDeleteContact(contact.id)} className="text-slate-400 hover:text-red-500 p-2">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                     ))}
                 </div>
             )}

             {/* Share Location Buttons */}
             {trustedContacts.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button 
                        onClick={() => shareLocation('sms')}
                        disabled={sosStatus !== 'IDLE'}
                        className="flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-70"
                    >
                        <Send size={18} />
                        <span className="text-sm font-bold">SMS Location</span>
                    </button>
                    <button 
                        onClick={() => shareLocation('whatsapp')}
                        disabled={sosStatus !== 'IDLE'}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-70"
                    >
                        <Send size={18} />
                        <span className="text-sm font-bold">WhatsApp</span>
                    </button>
                </div>
             )}
        </div>
      </div>

      {/* 4. Find Nearby Help (New Feature) */}
      <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => openNearbyMaps('police+station')}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
          >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <Search size={20} />
              </div>
              <span className="text-sm font-bold text-blue-800">Nearest Police</span>
          </button>
          
          <button 
            onClick={() => openNearbyMaps('hospital')}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
              <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <Search size={20} />
              </div>
              <span className="text-sm font-bold text-red-800">Nearest Hospital</span>
          </button>
      </div>

      {/* 5. Official Helplines */}
      <div>
        <h3 className="text-slate-800 font-bold text-xl mb-4 px-1 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-600"/> Helplines (India)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.number}`}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-red-300 hover:shadow-md transition-all active:bg-red-50 group"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {getIcon(contact.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">{contact.name}</h4>
                <p className="text-xs text-slate-500">{contact.description}</p>
              </div>
              <div className="text-xl font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg">{contact.number}</div>
            </a>
          ))}
        </div>
      </div>

      {/* 6. SOS & Rapid Actions */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow-sm">
        <h2 className="text-red-700 font-bold text-xl flex items-center gap-2">
          <Bell className="w-6 h-6 animate-pulse" /> Immediate Phone SOS
        </h2>
        <p className="text-red-600 mt-2 md:text-lg">
          Press your phone's power button <span className="font-bold">5 times</span> rapidly to trigger the system default SOS.
        </p>
      </div>

      <div>
        <h3 className="text-slate-800 font-bold text-xl mb-4 px-1 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500"/> Rapid Action Cards
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, idx) => (
            <div key={idx} className="bg-slate-800 text-white p-5 rounded-xl shadow-md hover:bg-slate-700 transition-colors cursor-default">
              <div className="text-orange-400 mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm md:text-base mb-2">{action.title}</h4>
              <p className="text-xs md:text-sm text-slate-300 leading-tight">{action.action}</p>
            </div>
          ))}
        </div>
      </div>
      
      </div>

      {/* SOS Status Overlay */}
      {sosStatus !== 'IDLE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="text-center text-white p-6 w-full max-w-md">
                 <button 
                    onClick={() => setSosStatus('IDLE')}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white"
                 >
                    <X size={24} />
                 </button>

                 {sosStatus === 'LOCATING' ? (
                     <>
                        <div className="inline-block p-4 rounded-full bg-red-600 animate-pulse mb-6 shadow-[0_0_50px_rgba(220,38,38,0.6)]">
                            <Send size={40} className="ml-1" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 tracking-wide">ACTIVATING SOS...</h2>
                        <p className="text-slate-300 font-medium">Acquiring accurate location...</p>
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-0"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-150"></div>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-300"></div>
                        </div>
                     </>
                 ) : (
                     <>
                        <div className="mb-6">
                            <Activity className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2 text-green-400">LOCATION READY</h2>
                            <p className="text-slate-300 mb-6">If the SMS app didn't open automatically, tap below.</p>
                        </div>
                        
                        <button 
                            onClick={handleManualRedirect}
                            className="w-full bg-white text-red-600 font-black text-xl py-5 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Send size={24} />
                            OPEN SMS NOW
                        </button>
                     </>
                 )}
             </div>
        </div>
      )}
    </>
  );
};

export default EmergencyView;
