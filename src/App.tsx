import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Brain, Activity, HelpCircle, ShieldCheck } from 'lucide-react';
import CameraView from './components/CameraView.tsx';
import TranslationPanel from './components/TranslationPanel.tsx';
import { GestureType } from './utils/gestureLogic.ts';

interface HistoryItem {
  id: string;
  gesture: GestureType;
  time: Date;
}

export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleGestureDetected = useCallback((gesture: GestureType) => {
    // Add to history with simple debouncing (don't add same consecutive within short time)
    setHistory(prev => {
      const last = prev[0];
      if (last && last.gesture === gesture && (new Date().getTime() - last.time.getTime() < 3000)) {
        return prev;
      }
      return [{
        id: Math.random().toString(36).substr(2, 9),
        gesture,
        time: new Date()
      }, ...prev];
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">SignSpeak</span>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ml-2 border border-indigo-100">AI CORE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <a href="#how" className="hover:text-indigo-600 transition-colors">How it works</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">Project Info</a>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-all text-xs font-bold uppercase tracking-wider">
              Launch Research
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-zinc-900 max-w-2xl leading-[1.1] mb-6"
          >
            Bridging communication gaps with <span className="text-indigo-600">Vision Intelligence</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-500 text-lg max-w-xl"
          >
            A real-time translation platform that converts hand gestures into accessible text, enabling 
            inclusive dialogue for everyone.
          </motion.p>
        </div>

        {/* Application Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          {/* Main Visualizer */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <CameraView onGestureDetected={handleGestureDetected} />
              
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-indigo-500/30 rounded-br-xl pointer-events-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Latency</p>
                  <p className="font-mono text-sm font-bold text-zinc-700">~14ms</p>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                <Brain className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Model</p>
                  <p className="font-mono text-sm font-bold text-zinc-700">HAND_V1</p>
                </div>
              </div>
              <div className="glass-panel p-4 rounded-xl flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Privacy</p>
                  <p className="font-mono text-sm font-bold text-zinc-700">ON-DEVICE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Translation Dashboard */}
          <div className="lg:col-span-5 h-[620px]">
            <TranslationPanel 
              history={history} 
              onClear={clearHistory}
            />
          </div>
        </div>

        <hr className="border-zinc-200 mb-16" />

        {/* Info Grid */}
        <div id="how" className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">How to gesture?</h3>
            <p className="text-zinc-500 leading-relaxed">
              Ensure your hand is clearly visible in the camera frame. Try these basic gestures:
            </p>
            <ul className="text-sm text-zinc-600 space-y-2 mt-4 list-disc pl-5">
              <li><strong>Thumb Up:</strong> Sign for "Good / Yes"</li>
              <li><strong>Open Palm:</strong> Sign for "Stop / Hello"</li>
              <li><strong>Peace Sign:</strong> Sign for "Victory"</li>
              <li><strong>Index Up:</strong> Sign for "Look / One"</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Neural Network</h3>
            <p className="text-zinc-500 leading-relaxed">
              Based on the project's CNN architecture requirements, this implementation uses 
              real-time computer vision to extract 21 points of spatial data from your hand 
              to classify intent.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Private by Design</h3>
            <p className="text-zinc-500 leading-relaxed">
              Processing happens entirely in your browser. No video data or images are 
              ever transmitted to any server, ensuring complete patient/user privacy.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-zinc-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
            SignSpeak: AI-Based Gesture to Text Converter
          </p>
          <p className="text-zinc-300 text-[10px] mt-2">
            Major Project 2025-2026 • SRU Raipur
          </p>
        </div>
      </footer>
    </div>
  );
}
