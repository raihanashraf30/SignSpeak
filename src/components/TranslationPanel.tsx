import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Trash2, Languages, Clock } from 'lucide-react';
import { getGestureLabel, GestureType } from '../utils/gestureLogic.ts';

interface TranslationPanelProps {
  history: { id: string; gesture: GestureType; time: Date }[];
  onClear: () => void;
}

export default function TranslationPanel({ history, onClear }: TranslationPanelProps) {
  const currentSentence = history
    .slice(-10)
    .map(h => getGestureLabel(h.gesture).split(' / ')[0])
    .join(' ');

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Live Transcript */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-indigo-600">
            <Languages className="w-5 h-5" />
            <h2 className="font-semibold text-sm uppercase tracking-wider">Live Transcript</h2>
          </div>
          <button 
            onClick={onClear}
            className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-all"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="min-h-[120px] flex flex-col justify-center">
          {history.length > 0 ? (
            <p className="text-3xl font-medium text-zinc-800 leading-tight">
              {currentSentence}
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block w-1 h-8 bg-indigo-500 ml-2 align-middle"
              />
            </p>
          ) : (
            <div className="text-center py-4">
              <p className="text-zinc-400 italic">Perform signs to start translation...</p>
            </div>
          )}
        </div>
      </div>

      {/* History Log */}
      <div className="flex-1 glass-panel p-6 rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 text-zinc-500 mb-6 font-semibold text-sm uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Activity Log</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <AnimatePresence initial={false}>
            {[...history].reverse().map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-4 p-3 bg-white/50 border border-zinc-100 rounded-xl"
              >
                <div className="mt-1 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800 uppercase tracking-wide">
                      {getGestureLabel(item.gesture)}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
