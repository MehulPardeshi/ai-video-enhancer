import { useState, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// TypeScript declarations for global FFmpeg
declare global {
  interface Window {
    FFmpeg?: any;
  }
}

// FFmpeg loader with CORS fixes - v2.1 (manual deployment trigger)
export function useFFmpeg() {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [compatibilityMode, setCompatibilityMode] = useState<'ffmpeg' | 'canvas' | 'failed'>('ffmpeg');
  
  // Check SharedArrayBuffer availability
  const checkSharedArrayBuffer = () => {
    try {
      if (typeof SharedArrayBuffer === 'undefined') {
        console.log('❌ SharedArrayBuffer not available');
        console.log('🔍 Cross-origin isolation required for FFmpeg.wasm');
        console.log('🛠️ Headers needed: Cross-Origin-Embedder-Policy: credentialless, Cross-Origin-Opener-Policy: same-origin');
        return false;
      }
      console.log('✅ SharedArrayBuffer available');
      return true;
    } catch (e) {
      console.log('❌ SharedArrayBuffer check failed:', e);
      return false;
    }
  };
  
  // Alternative Canvas-based frame extraction for when FFmpeg fails
  const extractFramesWithCanvas = useCallback(async (videoFile: File) => {
    return new Promise<any[]>((resolve, reject) => {
      console.log('🎨 Using Canvas-based frame extraction (FFmpeg fallback)');
      
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const frames: any[] = [];
        const frameInterval = 1; // Extract 1 frame per second
        const duration = video.duration;
        let currentTime = 0;
        
        const extractFrame = () => {
          if (currentTime >= duration) {
            console.log(`📸 Canvas extracted ${frames.length} frames from video`);
            resolve(frames);
            return;
          }
          
          video.currentTime = currentTime;
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const reader = new FileReader();
                reader.onload = () => {
                  frames.push({
                    name: `frame_${String(frames.length + 1).padStart(4, '0')}.jpg`,
                    data: new Uint8Array(reader.result as ArrayBuffer)
                  });
                  
                  currentTime += frameInterval;
                  extractFrame();
                };
                reader.readAsArrayBuffer(blob);
              } else {
                currentTime += frameInterval;
                extractFrame();
              }
            }, 'image/jpeg', 0.8);
          };
        };
        
        extractFrame();
      };
      
      video.onerror = () => reject(new Error('Video loading failed'));
      video.src = URL.createObjectURL(videoFile);
    });
  }, []);
  
  // Initialize FFmpeg with comprehensive fallback strategy
  useEffect(() => {
    const load = async () => {
      // Skip FFmpeg loading in development mode
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        console.log('🚀 Development Mode: Using Canvas fallback for faster loading');
        setCompatibilityMode('canvas');
        setError('Development mode - Using Canvas-based frame extraction');
        setIsLoading(false);
        return;
      }
      
      // Check SharedArrayBuffer availability first
      if (!checkSharedArrayBuffer()) {
        console.log('⏳ Waiting for cross-origin isolation to be enabled...');
        // Wait a bit for the serviceworker to potentially kick in
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (!checkSharedArrayBuffer()) {
          console.log('🎨 Falling back to Canvas-based processing');
          setCompatibilityMode('canvas');
          setError('Using Canvas fallback - SharedArrayBuffer not available');
          setIsLoading(false);
          return;
        }
      }
      
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);
        
        console.log('🎬 Attempting FFmpeg.wasm initialization...');
        console.log('⚠️  Note: FFmpeg.wasm v5.x has known compatibility issues with cross-origin isolation');
        console.log('🌐 Cross-origin isolated:', window.crossOriginIsolated ?? 'unknown');
        console.log('🔧 COEP Policy: credentialless (more compatible than require-corp)');
        
        // Create a new instance with timeout detection
        const ffmpegInstance = new FFmpeg();
        setFfmpeg(ffmpegInstance);
        setLoadingProgress(10);
        
        // Set a global timeout for the entire FFmpeg loading process
        const GLOBAL_TIMEOUT = 60000; // 60 seconds total
        let loadingComplete = false;
        
        // Global timeout that triggers Canvas fallback
        const globalTimeout = setTimeout(() => {
          if (!loadingComplete) {
            console.log('⏰ FFmpeg.wasm loading exceeded global timeout (60s)');
            console.log('🔄 This is a known issue with FFmpeg.wasm v5.x in cross-origin isolated environments');
            console.log('📚 Reference: https://github.com/ffmpegwasm/ffmpeg.wasm/issues/353');
            console.log('🎨 Switching to Canvas-based frame extraction');
            
            setCompatibilityMode('canvas');
            setError('FFmpeg.wasm timeout - Using Canvas fallback');
            setLoadingProgress(100);
            setIsLoading(false);
            loadingComplete = true;
          }
        }, GLOBAL_TIMEOUT);
        
        // Try simplified loading approach - just the most reliable strategy
        try {
          console.log('🔄 Trying optimized FFmpeg.wasm loading...');
          setLoadingProgress(30);
          
          // Use the Vercel proxy which should be most reliable
          await ffmpegInstance.load({
            coreURL: '/api/proxy-ffmpeg?file=core.js',
            wasmURL: '/api/proxy-ffmpeg?file=core.wasm'
          });
          
          clearTimeout(globalTimeout);
          loadingComplete = true;
          setLoadingProgress(100);
          setIsLoaded(true);
          setCompatibilityMode('ffmpeg');
          console.log('✅ FFmpeg.wasm loaded successfully using Vercel proxy!');
          
        } catch (proxyError) {
          console.log('❌ Vercel proxy failed, trying CDN fallback...');
          setLoadingProgress(60);
          
          // Fallback to direct CDN with shorter timeout
          try {
            await Promise.race([
              ffmpegInstance.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm'
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('CDN timeout after 20s')), 20000)
              )
            ]);
            
            clearTimeout(globalTimeout);
            loadingComplete = true;
            setLoadingProgress(100);
            setIsLoaded(true);
            setCompatibilityMode('ffmpeg');
            console.log('✅ FFmpeg.wasm loaded successfully using CDN fallback!');
            
          } catch (cdnError) {
            // Both proxy and CDN failed - this is the expected outcome for cross-origin isolation issues
            if (!loadingComplete) {
              clearTimeout(globalTimeout);
              loadingComplete = true;
              
              console.log('📋 FFmpeg.wasm loading failed as expected in cross-origin isolated environment');
              console.log('🔍 This is a known limitation: https://github.com/ffmpegwasm/ffmpeg.wasm/issues/314');
              console.log('💡 Solution: FFmpeg.wasm v5.x has fundamental WebAssembly instantiation issues');
              console.log('🎨 Switching to Canvas-based frame extraction (works in all browsers)');
              
              setCompatibilityMode('canvas');
              setError('Using Canvas fallback - FFmpeg.wasm incompatible with cross-origin isolation');
              setLoadingProgress(100);
            }
          }
        }
        
      } catch (err) {
        console.log('⚠️ FFmpeg.wasm initialization failed (expected in cross-origin isolation)');
        console.log('🎨 Falling back to Canvas-based processing');
        setCompatibilityMode('canvas');
        setError('Using Canvas fallback - FFmpeg.wasm incompatible');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Delayed loading in production to avoid blocking the UI
    if (!import.meta.env.DEV) {
      const timer = setTimeout(load, 2000);
      return () => clearTimeout(timer);
    } else {
      load();
    }
    
    // Cleanup
    return () => {
      if (ffmpeg) {
        ffmpeg.terminate().catch(console.warn);
      }
    };
  }, []);
  
  // Extract frames from video - with Canvas fallback
  const extractFrames = useCallback(async (videoFile: File) => {
    if (compatibilityMode === 'canvas') {
      return await extractFramesWithCanvas(videoFile);
    }
    
    if (!ffmpeg || !isLoaded) {
      throw new Error('Video processor is not ready yet');
    }
    
    try {
      console.log(`🎬 Processing video with FFmpeg.wasm: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Write the input file to memory
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
      
      // Extract frames (1 frame per second for faster processing)
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', 'fps=1',
        '-q:v', '2', // Slightly lower quality for faster processing
        'frame_%04d.jpg'
      ]);
      
      // Get a list of the extracted frames
      const frameFiles = await ffmpeg.listDir('./');
      const frames = frameFiles
        .filter(file => file.name.startsWith('frame_') && file.name.endsWith('.jpg'))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`📸 Extracted ${frames.length} frames from video using FFmpeg.wasm`);
      
      // Read each frame
      const frameData = await Promise.all(
        frames.map(async (frame) => {
          const data = await ffmpeg.readFile(frame.name);
          return {
            name: frame.name,
            data: new Uint8Array(data as ArrayBuffer)
          };
        })
      );
      
      return frameData;
    } catch (err) {
      console.error('FFmpeg frame extraction failed, falling back to Canvas:', err);
      setCompatibilityMode('canvas');
      return await extractFramesWithCanvas(videoFile);
    }
  }, [ffmpeg, isLoaded, compatibilityMode, extractFramesWithCanvas]);
  
  return {
    ffmpeg,
    isLoaded: isLoaded || compatibilityMode === 'canvas',
    isLoading,
    error,
    loadingProgress,
    compatibilityMode,
    extractFrames
  };
}