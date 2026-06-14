import React from 'react';
import { Play, RotateCcw, Home, Download } from 'lucide-react';
import { Button, CircularProgress, ProgressBar } from '../ui/UIComponents';
import { Report } from '../../types';

interface ReportScreenProps {
  report: Report;
  topic: string;
  audioUrl: string | null;
  onHome: () => void;
  onRetry: () => void;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ report, topic, audioUrl, onHome, onRetry }) => {
  return (
    <div className="h-screen w-full overflow-y-auto bg-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      <div className="min-h-full p-4 md:p-8 max-w-6xl mx-auto flex flex-col animate-fade-in">
        
        <div className="text-center mb-8 shrink-0">
          <h2 className="text-3xl font-bold mb-2">Performance Report</h2>
          <p className="text-white/60">Topic: <span className="text-white font-medium">"{topic}"</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1">
          {/* Left Column: Overall Score & Audio */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Score Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-xl">
              <h3 className="text-xl font-semibold mb-6 text-cyan-300">Overall Proficiency</h3>
              <CircularProgress score={report.overallScore} size={180} />
              
              <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  <div className="bg-white/5 rounded-xl p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold">{report.speechRate}</div>
                      <div className="text-[10px] md:text-xs text-white/50 uppercase mt-1">WPM (Pace)</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 md:p-4 text-center">
                      <div className="text-xl md:text-2xl font-bold">{report.fillerWords}</div>
                      <div className="text-[10px] md:text-xs text-white/50 uppercase mt-1">Filler Words</div>
                  </div>
              </div>
            </div>

            {/* Audio Player Card */}
            {audioUrl && (
              <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                   <Play className="w-5 h-5 text-cyan-400" /> Session Recording
                </h3>
                <audio controls src={audioUrl} className="w-full h-10 opacity-90 rounded-lg" />
                <div className="mt-4 text-right">
                    <a href={audioUrl} download={`speech-${Date.now()}.wav`} className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                        <Download className="w-3 h-3" /> Download Audio
                    </a>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Metrics & AI Feedback */}
          <div className="lg:col-span-2 space-y-6">
              
              {/* Detailed Bars */}
              <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-xl">
                  <h3 className="text-xl font-semibold mb-6">Detailed Analysis</h3>
                  <div className="space-y-6">
                      <ProgressBar score={report.eyeContactScore} label="Eye Contact" colorClass="bg-blue-500" />
                      <ProgressBar score={100 - report.nervousScore} label="Composure & Calmness" colorClass="bg-emerald-500" />
                      <ProgressBar score={report.gestureScore} label="Gesture Usage" colorClass="bg-purple-500" />
                  </div>
              </div>

              {/* AI Feedback */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 md:p-8 shadow-xl">
                  <h3 className="text-xl font-semibold mb-4 text-indigo-300 flex items-center gap-2">
                      <span className="text-2xl">🤖</span> AI Coach Feedback
                  </h3>
                  <p className="text-base md:text-lg leading-relaxed text-indigo-50 whitespace-pre-wrap">
                      "{report.feedback}"
                  </p>
              </div>

          </div>
        </div>

        <div className="flex justify-center gap-6 mt-10 mb-8 shrink-0">
          <Button variant="ghost" onClick={onHome} icon={<Home className="w-5 h-5" />}>
             Main Menu
          </Button>
          <Button variant="primary" onClick={onRetry} icon={<RotateCcw className="w-5 h-5" />}>
             Try Another Topic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportScreen;
