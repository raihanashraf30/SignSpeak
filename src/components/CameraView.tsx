import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recognizeGesture, GestureType, getGestureLabel } from '../utils/gestureLogic.ts';

interface CameraViewProps {
  onGestureDetected: (gesture: GestureType) => void;
}

export default function CameraView({ onGestureDetected }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isHandVisible, setIsHandVisible] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<GestureType>('NONE');

  // Initialize MediaPipe
  useEffect(() => {
    async function setup() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setHandLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error("MediaPipe Init Error:", err);
        setError("Failed to load AI models. Please check your connection.");
        setIsLoading(false);
      }
    }
    setup();
  }, []);

  // Setup Webcam
  useEffect(() => {
    if (!videoRef.current || isLoading) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Camera access denied. Please enable permissions.");
      }
    }
    startCamera();

    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [isLoading]);

  // Detection Loop
  useEffect(() => {
    if (!handLandmarker || !videoRef.current || !canvasRef.current) return;

    let animationId: number;
    const ctx = canvasRef.current.getContext('2d');

    const render = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const startTimeMs = performance.now();
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        processResults(results);
      }
      animationId = requestAnimationFrame(render);
    };

    const processResults = (results: HandLandmarkerResult) => {
      if (!ctx || !canvasRef.current || !videoRef.current) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.landmarks && results.landmarks.length > 0) {
        setIsHandVisible(true);
        const landmarks = results.landmarks[0];
        
        // Draw landmarks for visual feedback
        drawLandmarks(ctx, landmarks);

        // Recognize gesture
        const gesture = recognizeGesture(landmarks);
        if (gesture !== currentGesture) {
          setCurrentGesture(gesture);
          if (gesture !== 'NONE') {
            onGestureDetected(gesture);
          }
        }
      } else {
        setIsHandVisible(false);
        setCurrentGesture('NONE');
      }
    };

    const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
      ctx.fillStyle = "#6366F1";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      landmarks.forEach((point) => {
        const x = point.x * canvasRef.current!.width;
        const y = point.y * canvasRef.current!.height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      });
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [handLandmarker, currentGesture, onGestureDetected]);

  return (
    <div className="relative w-full aspect-video technical-panel bg-black overflow-hidden flex items-center justify-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Initializing AI Sensors...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-white font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.3]"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
          
          {/* HUD Overlay */}
          <div className="absolute inset-0 p-6 pointer-events-none flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`status-dot ${isHandVisible ? 'status-dot-active' : 'bg-red-500'}`} />
                <span className="font-mono text-xs uppercase tracking-tighter text-zinc-400">
                  Sensor Stat: {isHandVisible ? 'Receiving Data' : 'Waiting for Hand'}
                </span>
              </div>
              <Camera className="w-5 h-5 text-zinc-600" />
            </div>

            <div className="flex flex-col items-center gap-4">
              <AnimatePresence mode="wait">
                {isHandVisible && currentGesture !== 'NONE' && (
                  <motion.div
                    key={currentGesture}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 1.1 }}
                    className="px-6 py-3 bg-indigo-600/90 rounded-full border border-indigo-400/30 backdrop-blur-sm"
                  >
                    <span className="text-white font-bold text-lg tracking-wide uppercase">
                      {getGestureLabel(currentGesture)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-end">
              <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest leading-none">
                SignSpeak System v1.0.4<br />
                Neural Processor: GPU_ACCEL
              </div>
              <div className="w-16 h-16 border-r border-b border-zinc-700 opacity-50" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
