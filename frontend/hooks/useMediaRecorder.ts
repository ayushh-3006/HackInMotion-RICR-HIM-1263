import { useState, useRef, useCallback, useEffect } from "react";

export type MediaRecorderState =
  | "idle"
  | "requesting_permission"
  | "recording"
  | "paused"
  | "processing"
  | "error";

export interface MediaError {
  name: string;
  message: string;
}

const getSupportedMimeType = (): string => {
  if (typeof MediaRecorder === "undefined") return "";

  const types = [
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
    "audio/webm",
    "audio/ogg",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
};

export function useMediaRecorder() {
  const [state, setState] = useState<MediaRecorderState>("idle");
  const [error, setError] = useState<MediaError | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstart = null;
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
      mediaRecorderRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    setState("requesting_permission");
    setError(null);
    audioChunksRef.current = [];

    // Check for secure context
    if (window.isSecureContext === false) {
      const err = {
        name: "InsecureContextError",
        message: "Media devices require a secure context (HTTPS or localhost).",
      };
      setError(err);
      setState("error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        setError({
          name: "RecordingError",
          message: "An error occurred during recording.",
        });
        setState("error");
        cleanup();
      };

      mediaRecorder.start(200); // collect data every 200ms
      setState("recording");
    } catch (err: any) {
      console.error("Error accessing media devices:", err);
      let errorMessage = "Failed to access media devices.";

      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        errorMessage =
          "Microphone permission denied. Please allow access in your browser settings.";
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        errorMessage =
          "No recording hardware detected. Please connect a microphone.";
      } else if (
        err.name === "NotReadableError" ||
        err.name === "TrackStartError"
      ) {
        errorMessage =
          "Hardware is in use by another app (e.g., Zoom/Teams) or blocked by the system.";
      }

      setError({ name: err.name, message: errorMessage });
      setState("error");
      cleanup();
    }
  }, [cleanup]);

  const stopRecording = useCallback((): Promise<{
    blob: Blob;
    mimeType: string;
  }> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current || state !== "recording") {
        reject(new Error("No active recording."));
        return;
      }

      setState("processing");

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        cleanup();
        setState("idle");
        resolve({ blob, mimeType });
      };

      mediaRecorderRef.current.stop();
    });
  }, [state, cleanup]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    state,
    error,
    startRecording,
    stopRecording,
  };
}
