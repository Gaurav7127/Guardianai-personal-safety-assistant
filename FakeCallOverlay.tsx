
import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video, Mic, Volume2, UserPlus } from 'lucide-react';
import { EVENTS, on, off } from '../services/eventBus';
import { FAKE_CALL_SCRIPTS } from '../constants';
import { FakeCallScript } from '../types';

const FakeCallOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [callStatus, setCallStatus] = useState<'INCOMING' | 'CONNECTING' | 'ACTIVE'>('INCOMING');
  const [currentScript, setCurrentScript] = useState<FakeCallScript>(FAKE_CALL_SCRIPTS[0]);
  const [callDuration, setCallDuration] = useState(0);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const vibrationInterval = useRef<any>(null);

  // Load available voices on mount
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const getBestVoice = (gender: 'male' | 'female' = 'female') => {
    // 1. Exact Name Match (Highest Quality Priority)
    const malePriority = [
        'Google UK English Male', 
        'Microsoft David', 
        'Microsoft Mark', 
        'Daniel', 
        'Rishi', 
        'Shaun', 
        'Fred'
    ];
    const femalePriority = [
        'Google US English', 
        'Microsoft Zira', 
        'Samantha', 
        'Veena', 
        'Karen', 
        'Tessa', 
        'Google UK English Female'
    ];

    const targetList = gender === 'male' ? malePriority : femalePriority;

    for (const name of targetList) {
        const hit = availableVoices.find(v => v.name.includes(name));
        if (hit) return hit;
    }

    // 2. Gender keyword match in the voice name (e.g., "English (United States) Male")
    const keywordHit = availableVoices.find(v => v.name.toLowerCase().includes(gender));
    if (keywordHit) return keywordHit;

    // 3. Smart Fallback for Male
    if (gender === 'male') {
        // Try UK English as it defaults to male on many systems (Android/iOS) more often than US
        const ukVoice = availableVoices.find(v => v.lang === 'en-GB' && !v.name.includes('Female'));
        if (ukVoice) return ukVoice;
    }

    // 4. Default English Fallback
    return availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0] || null;
  };

  const startRingtone = () => {
    // Loop vibration pattern: 1s vibe, 1s pause
    if (navigator.vibrate) {
      navigator.vibrate([1000, 1000]);
      vibrationInterval.current = setInterval(() => {
        navigator.vibrate([1000, 1000]);
      }, 2000);
    }
  };

  const stopRingtone = () => {
    if (vibrationInterval.current) {
      clearInterval(vibrationInterval.current);
      vibrationInterval.current = null;
    }
    if (navigator.vibrate) navigator.vibrate(0);
  };

  const playVoiceScript = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Use the gender from the current script
      const gender = currentScript.gender || 'female';
      const voice = getBestVoice(gender);
      if (voice) utterance.voice = voice;
      
      // Tweaks for natural sound and gender characteristics
      utterance.rate = 0.9; // Slightly slower is often clearer
      
      // Pitch adjustment: Lower for male (0.8), Higher for female (1.1)
      // This helps even if the voice itself is gender-neutral
      utterance.pitch = gender === 'male' ? 0.8 : 1.1; 
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleTrigger = (data: { scriptId: string }) => {
      const script = FAKE_CALL_SCRIPTS.find(s => s.id === data.scriptId) || FAKE_CALL_SCRIPTS[0];
      setCurrentScript(script);
      setIsVisible(true);
      setIsActive(false);
      setCallStatus('INCOMING');
      setCallDuration(0);
      startRingtone();
    };

    on(EVENTS.TRIGGER_FAKE_CALL, handleTrigger);
    return () => {
      off(EVENTS.TRIGGER_FAKE_CALL, handleTrigger);
      stopRingtone();
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (callStatus === 'ACTIVE') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const acceptCall = () => {
    stopRingtone();
    setIsActive(true);
    setCallStatus('CONNECTING');
    
    // Simulate connection delay (1.5s) before speaking
    setTimeout(() => {
      setCallStatus('ACTIVE');
      playVoiceScript(currentScript.audioText);
    }, 1500);
  };

  const endCall = () => {
    stopRingtone();
    window.speechSynthesis.cancel();
    setIsVisible(false);
    setIsActive(false);
    setCallStatus('INCOMING');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900 text-white flex flex-col animate-in slide-in-from-bottom duration-300 font-sans">
      {/* Background Blur/Image Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-black opacity-95"></div>
      
      {/* Call Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center pt-24 pb-12 px-8">
        
        {/* Contact Info */}
        <div className="flex flex-col items-center gap-6 mb-auto">
           <div className="w-28 h-28 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full flex items-center justify-center text-4xl font-bold shadow-2xl border-4 border-slate-600/30">
              {currentScript.label[0]}
           </div>
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight">{currentScript.callerName}</h2>
              {callStatus === 'INCOMING' && (
                <p className="text-slate-300 text-lg animate-pulse">Incoming call...</p>
              )}
              {callStatus === 'CONNECTING' && (
                <p className="text-slate-400 text-sm">Connecting...</p>
              )}
              {callStatus === 'ACTIVE' && (
                <p className="text-slate-300 text-lg tracking-widest font-mono">{formatTime(callDuration)}</p>
              )}
           </div>
        </div>

        {/* Controls */}
        {isActive ? (
           /* Active Call Controls */
           <div className="w-full max-w-sm grid grid-cols-3 gap-x-4 gap-y-8 mb-16">
               <ControlBtn icon={Volume2} label="Speaker" />
               <ControlBtn icon={Video} label="FaceTime" />
               <ControlBtn icon={Mic} label="Mute" />
               <ControlBtn icon={UserPlus} label="Add Call" />
               
               {/* End Call Button - Spans full width or centered */}
               <div className="col-span-3 flex justify-center mt-8">
                   <button 
                     onClick={endCall}
                     className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all active:scale-95 ring-4 ring-red-900/20"
                   >
                       <PhoneOff size={36} fill="white" />
                   </button>
               </div>
           </div>
        ) : (
           /* Incoming Call Controls */
           <div className="w-full max-w-xs flex justify-between items-end mb-20">
               <div className="flex flex-col items-center gap-3">
                   <button 
                     onClick={endCall}
                     className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all active:scale-95"
                   >
                       <PhoneOff size={32} fill="white" />
                   </button>
                   <span className="text-sm font-medium opacity-80">Decline</span>
               </div>

               <div className="flex flex-col items-center gap-3">
                   <button 
                     onClick={acceptCall}
                     className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all active:scale-95 animate-bounce"
                   >
                       <Phone size={32} fill="white" />
                   </button>
                   <span className="text-sm font-medium opacity-80">Accept</span>
               </div>
           </div>
        )}

      </div>
    </div>
  );
};

const ControlBtn = ({ icon: Icon, label }: any) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-16 h-16 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer active:bg-white active:text-black">
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <span className="text-xs font-medium text-slate-300">{label}</span>
  </div>
);

export default FakeCallOverlay;
