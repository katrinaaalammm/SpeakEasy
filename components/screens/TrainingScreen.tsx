import React, { useRef, useState, useEffect } from 'react';
import { Camera, Square, Play, Lightbulb, User, Upload, Mic, Clock, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '../ui/UIComponents';
import { TrainingMode, SessionPhase } from '../../types';
import * as pdfjsLibModule from 'pdfjs-dist';

// Fix for pdfjs-dist import consistency (handles ESM/CommonJS differences)
// We cast to any to avoid TS errors with the dynamic check
const pdfjsLib = (pdfjsLibModule as any).default || pdfjsLibModule;

// Initialize PDF Worker
// Use unpkg for the worker source as it serves the raw file suitable for importScripts correctly with CORS
if (pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

interface TrainingScreenProps {
  mode: TrainingMode;
  topic: string;
  duration: number;
  keywords: string[];
  teammateComments: string[];
  audienceQuestions: string[];
  onEndSession: (audioUrl: string | null) => void;
}

const TrainingScreen: React.FC<TrainingScreenProps> = ({ 
  mode, 
  topic,
  duration, 
  keywords, 
  teammateComments, 
  audienceQuestions, 
  onEndSession 
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [phase, setPhase] = useState<SessionPhase>('setup');
  const [timeLeft, setTimeLeft] = useState(duration); 
  const [qaTimeLeft, setQaTimeLeft] = useState(60); 
  const [activeComment, setActiveComment] = useState<{ text: string, avatarId: number } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [streamError, setStreamError] = useState<boolean>(false);
  
  // Slides State
  const [pdfDoc, setPdfDoc] = useState<any>(null); // Use any to avoid strict type mismatch with CDN types
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [slideImages, setSlideImages] = useState<string[]>([]); // Fallback or image upload

  // Format time MM:SS
  const formatTime = (s: number) => 
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Initialize Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
        setStreamError(true);
      }
    };
    startCamera();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  // Timer Logic: Speech Phase
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === 'training' && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (phase === 'training' && timeLeft === 0) {
      startQA();
    }
    return () => clearInterval(interval);
  }, [phase, timeLeft]);

  // Timer Logic: Q&A Phase
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (phase === 'qa' && qaTimeLeft > 0) {
      interval = setInterval(() => setQaTimeLeft(prev => prev - 1), 1000);
    } else if (phase === 'qa' && qaTimeLeft === 0) {
      stopTraining();
    }
    return () => clearInterval(interval);
  }, [phase, qaTimeLeft]);

  // Discussion Mode: Teammate Comments (Faster start)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let initialTimeout: ReturnType<typeof setTimeout>;

    if (phase === 'training' && mode === 'discussion' && teammateComments.length > 0) {
      
      const triggerComment = () => {
        const randomComment = teammateComments[Math.floor(Math.random() * teammateComments.length)];
        const randomAvatar = Math.floor(Math.random() * 3) + 1; 
        setActiveComment({ text: randomComment, avatarId: randomAvatar });
        setTimeout(() => setActiveComment(null), 8000);
      };

      // First comment happens quickly (3s)
      initialTimeout = setTimeout(() => {
        triggerComment();
        // Then loop every 20-30s
        interval = setInterval(triggerComment, 25000); 
      }, 3000);
    }
    return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
    };
  }, [phase, mode, teammateComments]);

  // Handle PDF/Image Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.type === 'application/pdf') {
      setIsPdfLoading(true);
      setSlideImages([]); // clear images
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Load the document using the resolved library object
        // NOTE: We use new Uint8Array because pdfjs-dist expects TypedArray or string, not ArrayBuffer directly sometimes
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const doc = await loadingTask.promise;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setPageNum(1);
      } catch (error) {
        console.error("Error loading PDF", error);
        alert("Could not load PDF. Please try images or a simple PDF.");
      } finally {
        setIsPdfLoading(false);
      }
    } else if (file.type.startsWith('image/')) {
        const files = Array.from(e.target.files);
        const urls = files.map((f: File) => URL.createObjectURL(f));
        setSlideImages(urls);
        setPdfDoc(null);
        setNumPages(urls.length);
        setPageNum(1);
    }
  };

  // Render PDF Page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    
    const renderPage = async () => {
        try {
            const page = await pdfDoc.getPage(pageNum);
            const canvas = canvasRef.current;
            if(!canvas) return;
            
            const context = canvas.getContext('2d');
            if(!context) return;

            // Calculate scale to fit container
            const containerWidth = containerRef.current?.clientWidth || 600;
            const containerHeight = containerRef.current?.clientHeight || 400;

            const viewport = page.getViewport({ scale: 1 });
            
            // Calculate scale to fit within the container (contain)
            const widthScale = containerWidth / viewport.width;
            const heightScale = containerHeight / viewport.height;
            const scale = Math.min(widthScale, heightScale); // 'contain' logic

            const scaledViewport = page.getViewport({ scale: scale });

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            await page.render({
                canvasContext: context,
                viewport: scaledViewport
            }).promise;
        } catch (e) {
            console.error("Render error", e);
        }
    };

    renderPage();
  }, [pdfDoc, pageNum, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);

  const changeSlide = (delta: number) => {
    const newPage = pageNum + delta;
    if (newPage >= 1 && newPage <= numPages) {
      setPageNum(newPage);
    }
  };

  const startTraining = () => {
    setPhase('training');
    audioChunksRef.current = [];
    
    // Start Recording
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const audioStream = new MediaStream(stream.getAudioTracks());
      try {
        const recorder = new MediaRecorder(audioStream);
        recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        recorder.start();
        mediaRecorderRef.current = recorder;
      } catch (e) {
        console.error("MediaRecorder error", e);
      }
    }
  };

  const startQA = () => {
    setPhase('qa');
    const q = audienceQuestions.length > 0 
      ? audienceQuestions[Math.floor(Math.random() * audienceQuestions.length)]
      : "Could you elaborate on the most important takeaway from your speech?";
    setCurrentQuestion(q);
  };

  const stopTraining = () => {
    setPhase('completed');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        onEndSession(url);
      };
    } else {
        onEndSession(null);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-slate-900 overflow-hidden relative text-sm">
      
      {/* Top Bar (Compact) */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 backdrop-blur border-b border-white/5 z-20 shrink-0 h-14">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">
            {mode}
          </div>
          <h2 className="text-white font-medium truncate max-w-xs md:max-w-md text-sm">{topic}</h2>
        </div>
        
        <div className="flex items-center gap-3">
          {phase === 'training' && (
             <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-md animate-pulse">
                <Clock className="w-3 h-3" />
                <span className="font-mono font-bold text-sm">{formatTime(timeLeft)}</span>
             </div>
          )}
          {phase === 'qa' && (
             <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-md animate-pulse">
                <Clock className="w-3 h-3" />
                <span className="font-mono font-bold text-sm">Q&A {formatTime(qaTimeLeft)}</span>
             </div>
          )}
          
          {(phase === 'training' || phase === 'qa') && (
            <Button variant="danger" onClick={stopTraining} className="px-3 py-1 text-xs h-8 rounded-lg">
              <Square className="w-3 h-3 mr-1 fill-current" /> End
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Slides (Presentation Mode) - 50% Width */}
        {mode === 'presentation' && (
          <div ref={containerRef} className="w-1/2 bg-slate-950 border-r border-white/10 relative flex flex-col items-center justify-center p-4">
             {(pdfDoc || slideImages.length > 0) ? (
                <div className="relative w-full h-full flex items-center justify-center group">
                    {/* Render Area - Autosized to fit content */}
                    <div 
                        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-pointer"
                        onClick={() => changeSlide(1)}
                    >
                         {pdfDoc ? (
                             <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-2xl" />
                         ) : (
                             <img src={slideImages[pageNum - 1]} alt="Slide" className="max-w-full max-h-full object-contain shadow-2xl" />
                         )}
                    </div>
                    
                    {/* Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full flex items-center gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => {e.stopPropagation(); changeSlide(-1);}} disabled={pageNum <= 1} className="hover:text-cyan-400 disabled:opacity-30">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-mono">{pageNum} / {numPages}</span>
                        <button onClick={(e) => {e.stopPropagation(); changeSlide(1);}} disabled={pageNum >= numPages} className="hover:text-cyan-400 disabled:opacity-30">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
             ) : (
                <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                   {isPdfLoading ? (
                       <div className="animate-pulse">Loading PDF...</div>
                   ) : (
                       <>
                        <Upload className="w-10 h-10 mx-auto text-white/30 mb-3" />
                        <p className="text-white/50 mb-3 text-sm">Upload PDF or Images</p>
                        <input 
                            type="file" 
                            accept=".pdf,image/*" 
                            multiple
                            onChange={handleFileUpload} 
                            className="hidden" 
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button variant="secondary" className="pointer-events-none" icon={<FileText className="w-4 h-4" />}>
                                Select File(s)
                            </Button>
                        </label>
                       </>
                   )}
                </div>
             )}
          </div>
        )}

        {/* CENTER/RIGHT PANEL: Camera & Visual Cues - 50% Width in Presentation Mode */}
        <div className={`relative h-full ${mode === 'presentation' ? 'w-1/2' : 'w-full'} bg-black flex`}>
          
          <div className="relative flex-1 bg-black">
             <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]" 
             />
             
             {/* Visual Cues Overlay (Teleprompter style) */}
             {phase === 'training' && keywords.length > 0 && (
                 <div className="absolute top-4 right-4 w-48 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 z-30 flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1 border-b border-white/10 pb-2">
                         <Lightbulb className="w-3 h-3" /> Visual Cues
                     </div>
                     <div className="flex flex-col gap-2">
                        {keywords.map((k, i) => (
                           <div key={i} className="text-white/90 text-sm font-medium leading-tight pl-2 border-l-2 border-cyan-500/50">
                               {k}
                           </div>
                        ))}
                     </div>
                 </div>
             )}

             {streamError && (
                <div className="absolute inset-0 flex items-center justify-center text-white/50">
                <Camera className="w-12 h-12 opacity-50" />
                </div>
             )}
          </div>

          {/* Setup Overlay */}
          {phase === 'setup' && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6">
               <div className="bg-slate-800 p-6 rounded-2xl border border-white/10 shadow-2xl text-center max-w-sm w-full">
                  <h3 className="text-xl font-bold mb-2">Ready?</h3>
                  <p className="text-white/60 mb-6 text-sm">
                    {mode === 'presentation' ? 'Slides ready. Camera active.' : 'Camera and Mic active.'}
                  </p>
                  <Button variant="primary" onClick={startTraining} className="w-full py-3">
                    <Play className="w-4 h-4 fill-current" /> Start Session
                  </Button>
               </div>
            </div>
          )}

          {/* Q&A Overlay */}
          {phase === 'qa' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-slate-900/95 border border-yellow-500/30 p-6 rounded-2xl shadow-2xl z-30 animate-bounce-in">
               <div className="flex flex-col items-center text-center gap-3">
                  <div className="bg-yellow-500/20 p-3 rounded-full">
                    <User className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h4 className="text-yellow-400 font-bold uppercase text-xs tracking-wider mb-2">Audience Question</h4>
                    <p className="text-lg font-medium text-white leading-snug">{currentQuestion}</p>
                    <div className="mt-4 inline-flex items-center gap-2 text-white/50 text-xs bg-white/5 px-3 py-1 rounded-full">
                       <Mic className="w-3 h-3 animate-pulse text-red-400" /> Recording answer...
                    </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM PANEL: Virtual Environment (Discussion/Audience) */}
      <div className="h-40 bg-slate-950 border-t border-white/10 shrink-0 relative flex items-center justify-center px-4">
         
         {/* Discussion Mode: 3 Teammates */}
         {mode === 'discussion' && (
            <div className="flex justify-center gap-12 w-full max-w-4xl items-end h-full pb-2">
               {[1, 2, 3].map((id) => (
                  <div key={id} className="relative group flex flex-col items-center">
                      {/* Chat Bubble */}
                      {activeComment?.avatarId === id && (
                         <div className="absolute bottom-20 bg-white text-slate-900 p-3 rounded-xl rounded-bl-none shadow-xl w-56 text-xs font-medium animate-pop-in z-50 leading-relaxed">
                            {activeComment.text}
                         </div>
                      )}
                      {/* Avatar */}
                      <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center bg-slate-800 transition-all duration-300 ${activeComment?.avatarId === id ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'border-slate-700 opacity-60'}`}>
                         <User className="w-8 h-8 text-white/50" />
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">Teammate {id}</span>
                  </div>
               ))}
            </div>
         )}

         {/* Public Speaking/Presentation Mode: Audience */}
         {(mode === 'speech' || mode === 'presentation') && (
            <div className="w-full flex flex-col items-center justify-center">
               <p className="text-[10px] font-bold text-white/20 uppercase mb-3 tracking-widest">Virtual Audience</p>
               <div className="flex flex-wrap justify-center gap-3 opacity-50 max-w-2xl">
                  {Array.from({ length: 12 }).map((_, i) => (
                     <div key={i} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-white/5 overflow-hidden">
                        <div className="w-6 h-6 bg-slate-700 rounded-full" />
                     </div>
                  ))}
               </div>
            </div>
         )}
      </div>

      {/* CSS for Animations */}
      <style>{`
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-pop-in {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes bounce-in {
          0% { transform: translate(-50%, -60%) scale(0.9); opacity: 0; }
          50% { transform: translate(-50%, -45%) scale(1.02); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TrainingScreen;