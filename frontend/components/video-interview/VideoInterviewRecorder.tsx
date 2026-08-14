'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Square, AlertCircle } from 'lucide-react';
import { BodyLanguageAnalyzer, BodyLanguageMetrics } from '@/lib/BodyLanguageAnalyzer';

interface VideoInterviewRecorderProps {
  onRecordingComplete: (audioBlob: Blob, sampledFrames: string[], metrics: BodyLanguageMetrics[]) => void;
  isAiSpeaking: boolean;
}

export function VideoInterviewRecorder({ onRecordingComplete, isAiSpeaking }: VideoInterviewRecorderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const analyzerRef = useRef<BodyLanguageAnalyzer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const framesRef = useRef<string[]>([]);
  const metricsRef = useRef<BodyLanguageMetrics[]>([]);
  const lastSampleTimeRef = useRef<number>(0);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        
        const updateAudioLevel = () => {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();

        analyzerRef.current = new BodyLanguageAnalyzer();
        await analyzerRef.current.initialize();

      } catch (err) {
        setError("Please allow camera and microphone access to use this feature.");
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const processVideoFrames = () => {
    if (!videoRef.current || !canvasRef.current || !analyzerRef.current) return;
    
    const timestampMs = performance.now();
    const metrics = analyzerRef.current.analyzeFrame(videoRef.current, timestampMs);
    
    if (metrics && isRecording) {
      metricsRef.current.push(metrics);
    }

    if (isRecording && timestampMs - lastSampleTimeRef.current > 3000) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const base64Frame = canvasRef.current.toDataURL('image/jpeg', 0.5);
        framesRef.current.push(base64Frame);
        lastSampleTimeRef.current = timestampMs;
      }
    }

    if (isRecording) {
      requestAnimationFrame(processVideoFrames);
    }
  };

  const startRecording = () => {
    if (!stream) return;
    setIsRecording(true);
    framesRef.current = [];
    metricsRef.current = [];
    audioChunksRef.current = [];
    lastSampleTimeRef.current = performance.now();

    // Use video/webm since the stream contains video. Whisper API accepts webm.
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: 'video/webm' });
      onRecordingComplete(blob, framesRef.current, metricsRef.current);
    };
    mediaRecorderRef.current.start(1000); // Request data every second to prevent empty blobs
    requestAnimationFrame(processVideoFrames);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-lg border border-slate-700">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-3">
          <AlertCircle className="w-10 h-10" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="hidden"
          />

          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>

            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <div className="flex gap-2">
                {isRecording && (
                  <div className="px-3 py-1 bg-red-500/80 backdrop-blur text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    REC
                  </div>
                )}
                {isAiSpeaking && (
                  <div className="px-3 py-1 bg-indigo-500/80 backdrop-blur text-white text-xs font-bold rounded-full flex items-center gap-2">
                    AI Speaking...
                  </div>
                )}
              </div>
              
              <div className="flex gap-1 items-end h-4">
                {[1, 2, 3, 4, 5].map((bar) => (
                  <div
                    key={bar}
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(4, (audioLevel / 255) * 16 * (bar / 3))}px` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg transition-all"
              >
                <Camera className="w-5 h-5" />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg transition-all"
              >
                <Square className="w-5 h-5" />
                Stop Recording
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
