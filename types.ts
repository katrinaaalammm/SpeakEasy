export type TrainingMode = 'discussion' | 'speech' | 'presentation';

export type SessionPhase = 'setup' | 'training' | 'qa' | 'completed';

export interface Report {
  overallScore: number;
  eyeContactScore: number;
  nervousScore: number;
  gestureScore: number;
  speechRate: number; // Words Per Minute
  fillerWords: number;
  feedback: string;
}

export interface HistoryItem {
  id: number;
  date: string;
  mode: TrainingMode;
  topic: string;
  overallScore: number;
}

export interface SessionContent {
  keywords: string[];
  teammateComments: string[]; // For discussion mode
  audienceQuestions: string[]; // For Q&A phase
}
