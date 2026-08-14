import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Metrics
  const [wordCount, setWordCount] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const pauseIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          lastSpeechTimeRef.current = Date.now();
          
          let currentTranscript = '';
          let currentInterim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              currentTranscript += event.results[i][0].transcript + ' ';
            } else {
              currentInterim += event.results[i][0].transcript;
            }
          }

          setTranscript((prev) => prev + currentTranscript);
          setInterimTranscript(currentInterim);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
        };
        
        recognitionRef.current.onend = () => {
          // If we manually stopped it, isListening will be false. 
          // If it stopped automatically (e.g., silence), we might need to restart it if we want continuous listening,
          // but for now let's just update the state.
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current);
      }
    };
  }, []);

  const startListening = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setWordCount(0);
    setPauseCount(0);
    lastSpeechTimeRef.current = Date.now();
    
    try {
      recognitionRef.current?.start();
      setIsListening(true);
      
      // Start tracking pauses > 2 seconds
      if (pauseIntervalRef.current) clearInterval(pauseIntervalRef.current);
      pauseIntervalRef.current = setInterval(() => {
        if (Date.now() - lastSpeechTimeRef.current > 2000) {
          setPauseCount(prev => prev + 1);
          // reset the timer so we don't count the same pause continuously
          lastSpeechTimeRef.current = Date.now();
        }
      }, 1000);
      
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
      setIsListening(false);
      if (pauseIntervalRef.current) {
        clearInterval(pauseIntervalRef.current);
      }
      
      // Calculate WPM based on final transcript
      const words = transcript.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
      
    } catch (e) {
      console.error(e);
    }
  }, [transcript]);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    metrics: {
      wordCount,
      pauseCount,
      // Rough WPM calc. We'll need duration in the component for exact WPM.
    },
    supported: !!recognitionRef.current
  };
};
