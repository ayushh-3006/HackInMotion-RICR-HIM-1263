import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

// MediaPipe WASM outputs INFO logs to stderr which Emscripten routes to console.error.
// Next.js intercepts this and shows a crash overlay. We silence it globally here.
if (typeof console !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("XNNPACK delegate for CPU")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

export interface BodyLanguageMetrics {
  eyeContactScore: number;
  postureScore: number;
  expressionScore: number;
}

export class BodyLanguageAnalyzer {
  private faceLandmarker: FaceLandmarker | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private isInitialized = false;
  private lastVideoTime = -1;
  private lastTimestampMs = -1;

  public async initialize() {
    if (this.isInitialized) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
      );

      this.faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "CPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });

      this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 1,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize BodyLanguageAnalyzer:", error);
    }
  }

  public analyzeFrame(
    videoElement: HTMLVideoElement,
    timestampMs: number,
  ): BodyLanguageMetrics | null {
    if (!this.isInitialized || !this.faceLandmarker || !this.poseLandmarker)
      return null;

    // Prevent MediaPipe crash when video is not fully loaded or dimensions are zero
    if (
      videoElement.readyState < 2 ||
      videoElement.videoWidth === 0 ||
      videoElement.videoHeight === 0
    ) {
      return null;
    }

    // MediaPipe strictly requires processing only when a new frame is available
    if (videoElement.currentTime === this.lastVideoTime) {
      return null;
    }
    this.lastVideoTime = videoElement.currentTime;

    // Enforce strictly increasing integer timestamp
    let safeTimestampMs = Math.round(timestampMs);
    if (safeTimestampMs <= this.lastTimestampMs) {
      safeTimestampMs = this.lastTimestampMs + 1;
    }
    this.lastTimestampMs = safeTimestampMs;

    try {
      const faceResult = this.faceLandmarker.detectForVideo(
        videoElement,
        safeTimestampMs,
      );
      const poseResult = this.poseLandmarker.detectForVideo(
        videoElement,
        safeTimestampMs,
      );

      let eyeContactScore = 50;
      let postureScore = 50;
      let expressionScore = 50;

      // Basic heuristic calculations based on landmarks
      if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
        eyeContactScore = 85; // Proxy: face is detected and facing forward generally

        if (
          faceResult.faceBlendshapes &&
          faceResult.faceBlendshapes.length > 0
        ) {
          const blendshapes = faceResult.faceBlendshapes[0].categories;
          const smile =
            blendshapes.find((b) => b.categoryName === "mouthSmileLeft")
              ?.score || 0;
          const frown =
            blendshapes.find((b) => b.categoryName === "mouthFrownLeft")
              ?.score || 0;
          expressionScore = 50 + smile * 50 - frown * 30;
          expressionScore = Math.min(100, Math.max(0, expressionScore));
        }
      } else {
        eyeContactScore = 0;
        expressionScore = 0;
      }

      if (poseResult.landmarks && poseResult.landmarks.length > 0) {
        const leftShoulder = poseResult.landmarks[0][11];
        const rightShoulder = poseResult.landmarks[0][12];
        if (leftShoulder && rightShoulder) {
          const dy = Math.abs(leftShoulder.y - rightShoulder.y);
          postureScore = 100 - dy * 500;
          postureScore = Math.min(100, Math.max(0, postureScore));
        }
      } else {
        postureScore = 0;
      }

      return {
        eyeContactScore: Math.round(eyeContactScore),
        postureScore: Math.round(postureScore),
        expressionScore: Math.round(expressionScore),
      };
    } catch (e) {
      // Use warn instead of error to avoid Next.js error overlay for intermittent frame drops
      console.warn("Analysis error:", e);
      return null;
    }
  }
}
