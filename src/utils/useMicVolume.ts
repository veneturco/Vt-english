import { useState, useEffect, useRef } from "react";

interface MicVolumeOptions {
  sensitivity?: number; // default 1.2
  smoothing?: number;   // default 0.65
}

/**
 * Hook to capture and track live microphone input volume levels in real-time
 * using Web Audio API AnalyserNode.
 */
export function useMicVolume(
  isActive: boolean,
  options?: MicVolumeOptions
): {
  volume: number;
  isMicActive: boolean;
} {
  const [volume, setVolume] = useState<number>(0);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const smoothedVolumeRef = useRef<number>(0);

  const sensitivity = options?.sensitivity ?? 1.2;
  const smoothing = options?.smoothing ?? 0.65;

  useEffect(() => {
    if (!isActive) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setVolume(0);
      setIsMicActive(false);
      smoothedVolumeRef.current = 0;
      return;
    }

    let isMounted = true;

    async function startMicTracking() {
      try {
        if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;

        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.4;
        source.connect(analyser);
        analyserRef.current = analyser;

        setIsMicActive(true);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!isMounted) return;

          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }

          const rawAvg = sum / dataArray.length; // Range 0..255
          // Baseline noise gate at ~6, saturated around ~80 for expressive voice levels
          const normalized = Math.min(1, Math.max(0, (rawAvg - 6) / 75)) * sensitivity;
          const clamped = Math.min(1, Math.max(0, normalized));

          // Smooth interpolation for organic visual fluid transitions
          smoothedVolumeRef.current =
            smoothedVolumeRef.current * smoothing + clamped * (1 - smoothing);

          const rounded = Math.round(smoothedVolumeRef.current * 1000) / 1000;
          setVolume(rounded);

          animFrameRef.current = requestAnimationFrame(updateVolume);
        };

        animFrameRef.current = requestAnimationFrame(updateVolume);
      } catch (err) {
        // Microphone permission not granted or device busy; fail gracefully
        if (isMounted) {
          setIsMicActive(false);
          setVolume(0);
        }
      }
    }

    startMicTracking();

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch {}
        });
        streamRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsMicActive(false);
    };
  }, [isActive, sensitivity, smoothing]);

  return { volume, isMicActive };
}
