
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, AlertCircle } from 'lucide-react';
import { sendMessageStream, initializeChat } from '../services/geminiService';
import { Message } from '../types';
import { saveChatHistory, getChatHistory } from '../services/storageService';

// Helper to parse bold text **text** -> <strong>text</strong>
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

// Helper to render message with markdown-like formatting
const renderMessageContent = (text: string) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Detect bullet points (* or -) or numbered lists (1.)
    const isList = trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed);

    if (isList) {
       // Remove the marker (*, -, or 1.)
       const cleanText = trimmed.replace(/^(\*|-|\d+\.)\s/, '');
       listItems.push(
         <li key={`li-${idx}`} className="mb-1">{parseBold(cleanText)}</li>
       );
    } else {
      // If we have accumulated list items, push them as a UL
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${idx}`} className="list-disc pl-5 mb-3 space-y-1">
            {listItems}
          </ul>
        );
        listItems = [];
      }
      
      // Render paragraph if not empty
      if (trimmed) {
        elements.push(
          <p key={`p-${idx}`} className="mb-2 leading-relaxed min-h-[1.2em]">
            {parseBold(line)}
          </p>
        );
      }
    }
  });

  // Flush remaining list items
  if (listItems.length > 0) {
    elements.push(
      <ul key="ul-end" className="list-disc pl-5 mb-3 space-y-1">
        {listItems}
      </ul>
    );
  }

  return <div className="text-sm md:text-base">{elements}</div>;
};

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load chat history or set default message
    const storedHistory = getChatHistory();
    if (storedHistory && storedHistory.length > 0) {
      setMessages(storedHistory);
    } else {
      setMessages([{
        id: 'init',
        role: 'model',
        text: "Hello. I am **GuardianAI**.\n\nI can help you with:\n* Personal Safety Advice\n* Travel Precautions\n* Self-Defense Tips\n* Emergency Steps\n\nHow can I help you stay safe today?",
        timestamp: Date.now()
      }]);
    }
    
    // Initialize AI client
    if (navigator.onLine) {
        initializeChat().catch(e => console.log("Chat init deferred:", e.message));
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
    // Save to local storage whenever messages change
    if (messages.length > 0) {
        saveChatHistory(messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!navigator.onLine) {
       const errorMessage: Message = {
           id: Date.now().toString(),
           role: 'model',
           text: "You are currently offline. I cannot process new questions, but you can browse your saved guides and chat history.",
           timestamp: Date.now()
       };
       setMessages(prev => [...prev, errorMessage]);
       return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const streamResult = await sendMessageStream(userMessage.text);
      
      const botMessageId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: botMessageId, role: 'model', text: '', timestamp: Date.now() }
      ]);

      let fullText = '';
      for await (const chunk of streamResult) {
        const chunkText = chunk.text || '';
        fullText += chunkText;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: fullText } : msg
          )
        );
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorMessage = "I'm having trouble connecting right now. If this is an emergency, please call **112** immediately.";
      
      // Specific check for missing API Key error from geminiService
      if (error.message && (error.message.includes("API Key") || error.message.includes("403"))) {
          errorMessage = "⚠️ **System Error:** API Key is missing or invalid.\n\nPlease check your settings and ensure a valid Google Gemini API Key is provided in the `GEMINI_API_KEY` environment variable.";
      }

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'model', text: errorMessage, timestamp: Date.now() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-60px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" /> Safety Assistant
        </h2>
        <div className="text-xs bg-indigo-500 px-2 py-1 rounded-full flex items-center gap-1">
            {isLoading ? (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            ) : (
                <div className={`w-2 h-2 ${navigator.onLine ? 'bg-green-400' : 'bg-red-400'} rounded-full`}></div>
            )}
            {navigator.onLine ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] md:max-w-[75%] rounded-2xl p-3 text-sm md:text-base shadow-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 opacity-70 text-xs">
                 {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                 <span>{msg.role === 'user' ? 'You' : 'Guardian'}</span>
              </div>
              {/* Use custom renderer instead of plain text */}
              {renderMessageContent(msg.text)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={navigator.onLine ? "Ask about safety, travel, or laws..." : "You are offline. Reconnect to chat."}
            disabled={!navigator.onLine}
            className="flex-1 border border-slate-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:bg-slate-100 disabled:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim() || !navigator.onLine}
            className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <AlertCircle size={10} /> AI advice. Verify info. Dial 112 for emergencies.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
