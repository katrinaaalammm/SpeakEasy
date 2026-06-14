import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, BarChart2, History, BrainCircuit, Settings, Key, Check, ExternalLink, HelpCircle, X, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import { TrainingMode } from '../../types';
import { getApiKey, saveApiKey } from '../../services/geminiService';

interface MenuScreenProps {
  onSelectMode: (mode: TrainingMode) => void;
  onViewHistory: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onSelectMode, onViewHistory }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [apiStatus, setApiStatus] = useState<'custom' | 'system' | 'fallback'>('fallback');
  const [saveMessage, setSaveMessage] = useState('');

  // Determine current API key source
  const checkApiStatus = () => {
    const customKey = localStorage.getItem('speak_easy_api_key');
    if (customKey && customKey.trim()) {
      setApiStatus('custom');
    } else if (process.env.API_KEY && process.env.API_KEY.trim()) {
      setApiStatus('system');
    } else {
      setApiStatus('fallback');
    }
  };

  useEffect(() => {
    const customKey = localStorage.getItem('speak_easy_api_key') || '';
    setApiKeyInput(customKey);
    checkApiStatus();
  }, []);

  const handleSave = () => {
    saveApiKey(apiKeyInput);
    checkApiStatus();
    setSaveMessage('API key saved details safely!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleClear = () => {
    setApiKeyInput('');
    saveApiKey('');
    checkApiStatus();
    setSaveMessage('API key deleted. Reverted to default.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return (
    <div className="w-full min-h-screen text-white flex flex-col justify-center items-center p-8 text-center relative animate-fade-in">
      
      {/* Top Bar API Status and Control */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-xs font-medium">
          <span className={`w-2.5 h-2.5 rounded-full ${
            apiStatus === 'custom' ? 'bg-green-400 animate-pulse' :
            apiStatus === 'system' ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'
          }`} />
          <span>
            {apiStatus === 'custom' && 'Gemini: Custom Key Active'}
            {apiStatus === 'system' && 'Gemini: Pre-configured Active'}
            {apiStatus === 'fallback' && 'Gemini: Sandbox Demo Mode'}
          </span>
        </div>
        
        <button 
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors border border-slate-700/50 hover:border-slate-600 shadow-md group"
          title="Gemini API Settings"
        >
          <Settings className="w-5 h-5 text-slate-300 group-hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>

      <BrainCircuit size={64} className="text-white mb-4 animate-pulse" />
      <h1 className="text-4xl font-bold mb-2">Speech Training Camp</h1>
      <p className="text-white/80 mb-12 max-w-md">Choose a training mode to practice spontaneous speaking and get AI performance analytics!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
        {/* Mode Buttons */}
        <button 
          onClick={() => onSelectMode('discussion')}
          className="flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-xl font-bold transition-all hover:scale-105 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 hover:border-blue-500/50 shadow-xl group text-center"
        >
          <span className="p-3 bg-blue-600/35 group-hover:bg-blue-600 rounded-lg transition-colors">
            <Users className="w-6 h-6 text-blue-300" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg">Group Discussion</span>
            <span className="text-xs font-normal text-white/50 mt-1">Simulate team debate and conversation prompts</span>
          </div>
        </button>

        <button 
          onClick={() => onSelectMode('speech')}
          className="flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-xl font-bold transition-all hover:scale-105 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 hover:border-green-500/50 shadow-xl group text-center"
        >
          <span className="p-3 bg-green-600/35 group-hover:bg-green-600 rounded-lg transition-colors">
            <MessageSquare className="w-6 h-6 text-green-300" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg">Public Speaking</span>
            <span className="text-xs font-normal text-white/50 mt-1">Deliver continuous impromptu or prepared speeches</span>
          </div>
        </button>

        <button 
          onClick={() => onSelectMode('presentation')}
          className="flex flex-col items-center justify-center gap-3 px-6 py-8 rounded-xl font-bold transition-all hover:scale-105 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/40 hover:border-purple-500/50 shadow-xl group text-center"
        >
          <span className="p-3 bg-purple-600/35 group-hover:bg-purple-600 rounded-lg transition-colors">
            <BarChart2 className="w-6 h-6 text-purple-300" />
          </span>
          <div className="flex flex-col">
            <span className="text-lg">Presentation</span>
            <span className="text-xs font-normal text-white/50 mt-1">Present on dynamic slide or business-based topics</span>
          </div>
        </button>
      </div>

      <button 
        onClick={onViewHistory} 
        className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105 bg-slate-800/80 border border-slate-700 hover:bg-slate-700 shadow"
      >
        <History className="w-5 h-5 text-slate-300" /> View Training History
      </button>

      {/* Settings Dialog Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-left shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold">API Key Configuration</h2>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              This app uses Google's <strong>Gemini AI</strong> to dynamically brainstorm custom topics, write interactive comments from artificial classmates, and review live speech reports.
            </p>

            {/* General FAQs */}
            <div className="space-y-4 mb-6 border-y border-slate-800 py-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-cyan-400" /> Is an API key required to play?
                </h4>
                <p className="text-slate-400 mt-1 pl-5">
                  No! If no key is configured, the simulator automatically uses preloaded speech topics and structured offline evaluations (Sandbox Mode) so you can still practice speaking comfortably.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> How do I get my own free Gemini API key?
                </h4>
                <ol className="text-slate-400 mt-1 pl-5 list-decimal space-y-1">
                  <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a> and sign in with your Google Account.</li>
                  <li>Click <strong>"Get API key"</strong> at the top of the interface.</li>
                  <li>Click <strong>"Create API key"</strong>, copy it, and paste it below.</li>
                </ol>
              </div>
            </div>

            {/* Input Form */}
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Custom Gemini API Key (Stored safely on this device)
              </label>
              
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your AI Studio GEMINI_API_KEY here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {saveMessage && (
                <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {saveMessage}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 text-white"
                >
                  Save Secret Key
                </button>
                {apiKeyInput && (
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Clear Key
                  </button>
                )}
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-sm font-semibold transition-colors ml-auto"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default MenuScreen;