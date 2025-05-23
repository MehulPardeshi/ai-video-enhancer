import { useState, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useFFmpeg() {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
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
  
  // Initialize FFmpeg
  useEffect(() => {
    const load = async () => {
      // Skip FFmpeg loading in development mode
      const isDevelopment = import.meta.env.DEV;
      
      if (isDevelopment) {
        console.log('🚀 Development Mode: Skipping FFmpeg (too slow for dev)');
        console.log('✅ FFmpeg will load in production deployment');
        setError('Development mode - FFmpeg disabled for faster loading');
        setIsLoading(false);
        return;
      }
      
      // Check SharedArrayBuffer availability first
      if (!checkSharedArrayBuffer()) {
        console.log('⏳ Waiting for cross-origin isolation to be enabled...');
        // Wait a bit for the serviceworker to potentially kick in
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (!checkSharedArrayBuffer()) {
          setError('SharedArrayBuffer not available - cross-origin isolation required');
          setIsLoading(false);
          return;
        }
      }
      
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);
        
        console.log('🎬 Loading video processor (FFmpeg.wasm)...');
        console.log('🌐 Cross-origin isolated:', window.crossOriginIsolated ?? 'unknown');
        console.log('🔧 COEP Policy: credentialless (more compatible than require-corp)');
        
        // Create a new instance
        const ffmpegInstance = new FFmpeg();
        setFfmpeg(ffmpegInstance);
        setLoadingProgress(10);
        
        // Try loading strategies optimized for credentialless COEP
        const loadingStrategies = [
          {
            name: 'unpkg-primary',
            timeout: 15000,
            load: async () => {
              console.log('🚀 Loading from unpkg (primary CDN)...');
              await ffmpegInstance.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm'
              });
            }
          },
          {
            name: 'jsdelivr-fallback',
            timeout: 15000,
            load: async () => {
              console.log('🔄 Trying jsdelivr CDN fallback...');
              await ffmpegInstance.load({
                coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm'
              });
            }
          },
          {
            name: 'blob-conversion',
            timeout: 20000,
            load: async () => {
              console.log('🔄 Trying blob URL conversion...');
              await ffmpegInstance.load({
                coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js', 'text/javascript'),
                wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
              });
            }
          }
        ];
        
        let loaded = false;
        let lastError = null;
        
        for (const strategy of loadingStrategies) {
          if (loaded) break;
          
          try {
            setLoadingProgress(20 + (loadingStrategies.indexOf(strategy) * 15));
            
            // Use strategy-specific timeout
            const loadPromise = strategy.load();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout after ${strategy.timeout/1000}s`)), strategy.timeout)
            );
            
            await Promise.race([loadPromise, timeoutPromise]);
            
            setLoadingProgress(100);
            setIsLoaded(true);
            loaded = true;
            console.log(`✅ Video processor loaded successfully using ${strategy.name}!`);
            
          } catch (err) {
            lastError = err;
            console.warn(`❌ ${strategy.name} failed:`, err);
            // Small delay before trying next strategy
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (!loaded) {
          throw new Error(`All loading strategies failed. Last error: ${lastError?.message}`);
        }
        
      } catch (err) {
        // Don't show scary error messages to users
        setError('FFmpeg loading failed');
        console.error('⚠️ FFmpeg loading failed:', err);
        console.log('💡 App will fall back to lightweight processing');
        console.log('🌐 Network may be slow or CDN unavailable - this is normal');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Delayed loading in production to avoid blocking the UI
    if (!import.meta.env.DEV) {
      const timer = setTimeout(load, 2000); // Reduced delay
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
  
  // Extract frames from video
  const extractFrames = useCallback(async (videoFile: File) => {
    if (!ffmpeg || !isLoaded) {
      throw new Error('Video processor is not ready yet');
    }
    
    try {
      console.log(`🎬 Processing video: ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)}MB)`);
      
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
      
      console.log(`📸 Extracted ${frames.length} frames from video`);
      
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
      console.error('Error extracting frames:', err);
      throw err;
    }
  }, [ffmpeg, isLoaded]);
  
  return {
    ffmpeg,
    isLoaded,
    isLoading,
    error,
    loadingProgress,
    extractFrames
  };
}