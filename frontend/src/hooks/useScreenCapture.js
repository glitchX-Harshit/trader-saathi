import { useState, useRef, useCallback } from 'react';

export function useScreenCapture() {
  const [capturing, setCapturing] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const startCapture = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false
      });
      
      setStream(mediaStream);
      setCapturing(true);
      
      // Handle user stopping share via browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        stopCapture();
      };
      
      return mediaStream;
    } catch (err) {
      console.error('Screen capture failed:', err);
      setCapturing(false);
      return null;
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setStream(null);
    setCapturing(false);
  }, [stream]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/png').split(',')[1]; // base64 without prefix
  }, []);

  const startPeriodicCapture = useCallback((callback, intervalMs = 3000) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) callback(frame);
    }, intervalMs);
  }, [captureFrame]);

  return {
    capturing,
    stream,
    videoRef,
    canvasRef,
    startCapture,
    stopCapture,
    captureFrame,
    startPeriodicCapture
  };
}
