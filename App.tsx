import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import MenuScreen from './components/screens/MenuScreen';
import TopicScreen from './components/screens/TopicScreen';
import TrainingScreen from './components/screens/TrainingScreen';
import ReportScreen from './components/screens/ReportScreen';
import HistoryScreen from './components/screens/HistoryScreen';
import { generateSessionContent, generateFeedback } from './services/geminiService';
import { TrainingMode, Report, HistoryItem, SessionContent } from './types';
import { Loader2 } from 'lucide-react';

type Screen = 'menu' | 'topic' | 'training' | 'loading_report' | 'report' | 'history';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [mode, setMode] = useState<TrainingMode>('speech');
  const [topic, setTopic] = useState<string>('');
  const [duration, setDuration] = useState<number>(180); // Default 3 minutes
  
  // Session Data
  const [sessionContent, setSessionContent] = useState<SessionContent>({ keywords: [], teammateComments: [], audienceQuestions: [] });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  
  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('speech_trainer_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleSelectMode = (selectedMode: TrainingMode) => {
    setMode(selectedMode);
    setScreen('topic');
  };

  const handleStartSession = async (selectedTopic: string, selectedDuration: number) => {
    setTopic(selectedTopic);
    setDuration(selectedDuration);
    setIsAiLoading(true);
    
    // Call Gemini for keywords/prompts
    const content = await generateSessionContent(selectedTopic, mode);
    setSessionContent(content);
    
    setIsAiLoading(false);
    setScreen('training');
  };

  const handleEndSession = async (url: string | null) => {
    setAudioUrl(url);
    setScreen('loading_report'); // Immediate feedback to user
    
    // Simulate Analysis Metrics (In a real app, this would be ML based)
    // We add a slight delay to simulate processing
    setTimeout(async () => {
        const simulatedMetrics = {
          eyeContactScore: Math.floor(65 + Math.random() * 30), // 65-95
          nervousScore: Math.floor(Math.random() * 30), // 0-30
          gestureScore: Math.floor(50 + Math.random() * 40), // 50-90
          speechRate: Math.floor(110 + Math.random() * 50), // 110-160 WPM
          fillerWords: Math.floor(Math.random() * 8), // 0-8
        };

        const overallScore = Math.round(
          (simulatedMetrics.eyeContactScore + 
          (100 - simulatedMetrics.nervousScore) + 
          simulatedMetrics.gestureScore) / 3
        );

        // Generate AI Feedback based on metrics
        const feedbackText = await generateFeedback(topic, simulatedMetrics);

        const newReport: Report = {
          overallScore,
          ...simulatedMetrics,
          feedback: feedbackText
        };

        setReport(newReport);
        
        // Save to History
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          mode,
          topic,
          overallScore
        };
        
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem('speech_trainer_history', JSON.stringify(updatedHistory));

        setScreen('report');
    }, 1500);
  };

  return (
    <Layout>
      {screen === 'menu' && (
        <MenuScreen 
          onSelectMode={handleSelectMode} 
          onViewHistory={() => setScreen('history')} 
        />
      )}
      
      {screen === 'topic' && (
        <TopicScreen 
          onStart={handleStartSession} 
          onBack={() => setScreen('menu')}
          isAiLoading={isAiLoading}
        />
      )}

      {screen === 'training' && (
        <TrainingScreen 
          mode={mode}
          topic={topic}
          duration={duration}
          keywords={sessionContent.keywords}
          teammateComments={sessionContent.teammateComments}
          audienceQuestions={sessionContent.audienceQuestions}
          onEndSession={handleEndSession}
        />
      )}

      {screen === 'loading_report' && (
        <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in">
           <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
           <h2 className="text-2xl font-bold">Analyzing your performance...</h2>
           <p className="text-white/60 mt-2">Generating feedback on eye contact, pacing, and clarity.</p>
        </div>
      )}

      {screen === 'report' && report && (
        <ReportScreen 
          report={report}
          topic={topic}
          audioUrl={audioUrl}
          onHome={() => setScreen('menu')}
          onRetry={() => setScreen('topic')}
        />
      )}

      {screen === 'history' && (
        <HistoryScreen 
          history={history}
          onBack={() => setScreen('menu')}
        />
      )}
    </Layout>
  );
}