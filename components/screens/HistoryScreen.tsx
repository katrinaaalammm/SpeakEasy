import React from 'react';
import { ArrowLeft, Calendar, Trophy, MessageSquare } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import { HistoryItem } from '../../types';

interface HistoryScreenProps {
  history: HistoryItem[];
  onBack: () => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack }) => {
  return (
    <div className="min-h-screen p-6 w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in">
      <div className="w-full flex items-center justify-between mb-8">
         <h2 className="text-3xl font-bold">Training History</h2>
         <Button variant="secondary" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
      </div>

      <div className="w-full bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        {history.length === 0 ? (
          <div className="p-12 text-center text-white/40">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No training sessions recorded yet.</p>
            <p className="text-sm">Complete a session to see your progress here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {history.map((item) => (
              <div key={item.id} className="p-6 hover:bg-white/5 transition-colors flex items-center justify-between">
                <div className="flex items-start gap-4">
                   <div className={`p-3 rounded-xl ${
                       item.mode === 'discussion' ? 'bg-blue-500/20 text-blue-400' : 
                       item.mode === 'speech' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                   }`}>
                       <MessageSquare className="w-6 h-6" />
                   </div>
                   <div>
                       <h4 className="font-bold text-lg text-white">{item.topic}</h4>
                       <div className="flex items-center gap-3 text-sm text-white/50 mt-1">
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                           <span className="capitalize px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-xs">{item.mode}</span>
                       </div>
                   </div>
                </div>
                
                <div className="text-right">
                    <div className="text-3xl font-bold text-white/90">{item.overallScore}</div>
                    <div className="text-xs text-white/50 uppercase">Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
