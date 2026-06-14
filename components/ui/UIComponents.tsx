import React from 'react';
import { Loader2 } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  icon, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg";
  
  const variants = {
    primary: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white ring-2 ring-cyan-500/20",
    secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white",
    ghost: "bg-transparent hover:bg-white/5 text-white/70 hover:text-white shadow-none"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// --- Progress Bar ---
interface ProgressBarProps {
  score: number;
  label: string;
  colorClass: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ score, label, colorClass }) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-white/80">{label}</span>
      <span className="text-sm font-bold text-white">{score}%</span>
    </div>
    <div className="w-full bg-slate-700/50 rounded-full h-3 backdrop-blur-sm overflow-hidden border border-white/5">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`} 
        style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
      />
    </div>
  </div>
);

// --- Circular Progress ---
interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ score, size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Color determination based on score
  let strokeColor = "#22d3ee"; // Cyan
  if (score < 60) strokeColor = "#fb923c"; // Orange
  else if (score < 80) strokeColor = "#facc15"; // Yellow

  return (
    <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke="rgba(255, 255, 255, 0.1)" 
          strokeWidth={strokeWidth} 
          fill="transparent" 
        />
        {/* Progress Circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          stroke={strokeColor} 
          strokeWidth={strokeWidth} 
          fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          className="transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white tracking-tighter">{score}</span>
        <span className="text-xs text-white/50 uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
};
