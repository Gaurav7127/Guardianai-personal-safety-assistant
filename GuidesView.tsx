import React, { useState, useEffect } from 'react';
import { BookOpen, MapPin, Globe, Gavel, Brain, X, ChevronRight } from 'lucide-react';
import { getStoredGuides } from '../services/storageService';
import { GuideSection } from '../types';

const GuidesView: React.FC = () => {
  const [guides, setGuides] = useState<GuideSection[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<GuideSection | null>(null);

  useEffect(() => {
    setGuides(getStoredGuides());
  }, []);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Travel': return <MapPin className="w-5 h-5" />;
      case 'Online': return <Globe className="w-5 h-5" />;
      case 'Legal': return <Gavel className="w-5 h-5" />;
      case 'Mental': return <Brain className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-2">
         <h2 className="text-2xl md:text-3xl font-bold text-slate-800">Safety Guides</h2>
         <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">Knowledge Base</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        {guides.map((guide, idx) => (
          <button 
            key={idx} 
            onClick={() => setSelectedGuide(guide)}
            className="text-left bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      {getIcon(guide.category)}
                  </div>
                  <span className="text-sm font-bold uppercase tracking-wider">{guide.category} Safety</span>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-400 transition-colors" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{guide.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-3">
              {guide.content}
            </p>
            <span className="text-xs text-indigo-600 font-medium mt-3 inline-block opacity-0 group-hover:opacity-100 transition-opacity">
                Read full guide &rarr;
            </span>
          </button>
        ))}
      </div>

      <div className="bg-indigo-900 text-white p-6 md:p-8 rounded-xl mt-6 shadow-lg">
        <h3 className="font-bold text-xl md:text-2xl mb-6">Self Defense Basics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex md:flex-col gap-4 md:gap-3 bg-indigo-800/50 p-4 rounded-xl">
                <div className="bg-white text-indigo-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">1</div>
                <div>
                    <h4 className="font-bold text-lg mb-1">Vulnerable Points</h4>
                    <p className="text-sm text-indigo-200 leading-relaxed">Target Eyes, Nose, Throat, Groin, and Knees. These areas cannot be strengthened and offer the best chance to stun.</p>
                </div>
            </div>
            <div className="flex md:flex-col gap-4 md:gap-3 bg-indigo-800/50 p-4 rounded-xl">
                <div className="bg-white text-indigo-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">2</div>
                <div>
                    <h4 className="font-bold text-lg mb-1">Palm Strike</h4>
                    <p className="text-sm text-indigo-200 leading-relaxed">Use the hard heel of your palm to strike upward into the nose. It's safer for your hand than a punch.</p>
                </div>
            </div>
            <div className="flex md:flex-col gap-4 md:gap-3 bg-indigo-800/50 p-4 rounded-xl">
                <div className="bg-white text-indigo-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-lg">3</div>
                <div>
                    <h4 className="font-bold text-lg mb-1">Create Distance</h4>
                    <p className="text-sm text-indigo-200 leading-relaxed">The goal is never to stay and fight. Strike to stun, then run immediately towards crowds or safety.</p>
                </div>
            </div>
        </div>
      </div>

      {/* Reading Modal */}
      {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
                  <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                              {getIcon(selectedGuide.category)}
                          </div>
                          <div>
                              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedGuide.category}</span>
                              <h3 className="text-xl md:text-2xl font-bold text-slate-900">{selectedGuide.title}</h3>
                          </div>
                      </div>
                      <button 
                        onClick={() => setSelectedGuide(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                      >
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-6 md:p-8 overflow-y-auto leading-relaxed text-slate-700 text-lg whitespace-pre-wrap">
                      {selectedGuide.content}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                      <button 
                        onClick={() => setSelectedGuide(null)}
                        className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors"
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default GuidesView;