import React from 'react';
import { Users, MessageSquare, BarChart2, History, BrainCircuit } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import { TrainingMode } from '../../types';

interface MenuScreenProps {
  onSelectMode: (mode: TrainingMode) => void;
  onViewHistory: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onSelectMode, onViewHistory }) => {
  return (
    <div className="w-full min-h-screen text-white flex flex-col justify-center items-center p-8 text-center animate-fade-in">
      <BrainCircuit size={64} className="text-white mb-4" />
      <h1 className="text-4xl font-bold mb-2">Speech Training Camp</h1>
      <p className="text-white/80 mb-12">Choose a mode and start improving your communication skills!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
        {/* Mode Buttons - Styled to look like original UI-BTN but using Tailwind */}
        <button 
          onClick={() => onSelectMode('discussion')}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold transition-transform hover:scale-105 bg-blue-600/80 hover:bg-blue-500 shadow-lg"
        >
          <Users className="w-5 h-5" /> Group Discussion
        </button>

        <button 
          onClick={() => onSelectMode('speech')}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold transition-transform hover:scale-105 bg-green-600/80 hover:bg-green-500 shadow-lg"
        >
          <MessageSquare className="w-5 h-5" /> Public Speaking
        </button>

        <button 
          onClick={() => onSelectMode('presentation')}
          className="flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold transition-transform hover:scale-105 bg-purple-600/80 hover:bg-purple-500 shadow-lg"
        >
          <BarChart2 className="w-5 h-5" /> Presentation
        </button>
      </div>

      <button 
        onClick={onViewHistory} 
        className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg font-bold transition-transform hover:scale-105 bg-gray-600/80 hover:bg-gray-500"
      >
        <History className="w-5 h-5" /> View Training History
      </button>
    </div>
  );
};

export default MenuScreen;