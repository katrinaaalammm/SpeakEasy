import React, { useState } from 'react';
import { Play, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '../ui/UIComponents';

interface TopicScreenProps {
  onStart: (topic: string, duration: number) => void;
  onBack: () => void;
  isAiLoading: boolean;
}

const TopicScreen: React.FC<TopicScreenProps> = ({ onStart, onBack, isAiLoading }) => {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(3); // Minutes

  const handleStart = () => {
    if (topic.trim()) {
      onStart(topic, duration * 60);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full max-w-xl mx-auto text-center animate-fade-in">
      <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl w-full">
        <h2 className="text-2xl font-bold mb-2">Session Setup</h2>
        <p className="text-white/60 mb-6 text-sm">
          Enter your topic and set your target duration.
        </p>
        
        <div className="space-y-6 mb-8 text-left">
            <div>
                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Topic</label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                    placeholder="e.g., The Future of AI, Quarterly Review"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                    autoFocus
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">Duration</label>
                    <span className="text-sm font-bold text-cyan-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {duration} min
                    </span>
                </div>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>1 min</span>
                    <span>5 min</span>
                    <span>10 min</span>
                </div>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <Button 
            onClick={handleStart} 
            disabled={!topic.trim() || isAiLoading}
            isLoading={isAiLoading}
            icon={!isAiLoading ? <Play className="w-4 h-4 fill-current" /> : undefined}
            className="min-w-[160px]"
          >
            {isAiLoading ? 'Preparing...' : 'Start Training'}
          </Button>
        </div>
        
        {isAiLoading && (
            <p className="mt-4 text-xs text-cyan-400 animate-pulse">Generating keywords, questions, and scenarios...</p>
        )}
      </div>
    </div>
  );
};

export default TopicScreen;