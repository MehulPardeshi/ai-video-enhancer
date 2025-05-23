import { useState, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export function useFFmpeg() {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
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
      
      try {
        setIsLoading(true);
        setError(null);
        setLoadingProgress(0);
        
        console.log('🎬 Loading video processor (FFmpeg.wasm)...');
        
        // Create a new instance
        const ffmpegInstance = new FFmpeg();
        setFfmpeg(ffmpegInstance);
        setLoadingProgress(10);
        
        // Use working CDN URLs for production
        const cdnOptions = [
          // Option 1: jsdelivr with confirmed working version
          {
            name: 'jsdelivr (v0.12.10)',
            baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd'
          },
          // Option 2: unpkg with confirmed working version
          {
            name: 'unpkg (v0.12.10)',
            baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
          },
          // Option 3: jspm.dev with correct URL
          {
            name: 'esm.sh',
            baseURL: 'https://esm.sh/@ffmpeg/core@0.12.10/dist/umd'
          }
        ];
        
        let lastError: Error | null = null;
        
        for (let i = 0; i < cdnOptions.length; i++) {
          const { name, baseURL } = cdnOptions[i];
          
          try {
            console.log(`🔄 Trying CDN ${i + 1}/${cdnOptions.length}: ${name}`);
            setLoadingProgress(20 + (i * 25));
            
            // Reduced timeout to 30 seconds for faster fallback
            const loadPromise = ffmpegInstance.load({
              coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
              wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Loading timeout (30s)')), 30000)
            );
            
            await Promise.race([loadPromise, timeoutPromise]);
            
            setLoadingProgress(100);
            setIsLoaded(true);
            console.log(`✅ Video processor loaded successfully from ${name}!`);
            return; // Success - exit the loop
            
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`❌ CDN failed: ${name}`, err);
            
            // Continue to next CDN
            setLoadingProgress(20 + (i * 25) + 10);
            
            // Small delay before trying next CDN
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // If we get here, all CDNs failed
        throw lastError || new Error('All CDN sources failed');
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Failed to load video processor: ${errorMsg}`);
        console.error('FFmpeg loading error:', err);
        console.log('💡 This is normal - the app works without FFmpeg!');
        console.log('💡 Try the "Lightweight Mode" for video processing');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Start loading immediately in production, skip in development
    if (!import.meta.env.DEV) {
      const timer = setTimeout(load, 1000);
      return () => clearTimeout(timer);
    } else {
      // In development, just set error state immediately
      load();
    }
    
    // Cleanup
    return () => {
      if (ffmpeg) {
        ffmpeg.terminate();
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