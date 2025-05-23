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
        
        // Use reliable CDN URLs for production - more reliable sources
        const cdnOptions = [
          // Option 1: Direct jsdelivr with exact version
          {
            name: 'jsdelivr CDN',
            coreURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm'
          },
          // Option 2: unpkg with exact version
          {
            name: 'unpkg CDN',
            coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm'
          },
          // Option 3: Alternative CDN
          {
            name: 'jsDelivr Mirror',
            coreURL: 'https://fastly.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js',
            wasmURL: 'https://fastly.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm'
          }
        ];
        
        let lastError: Error | null = null;
        
        for (let i = 0; i < cdnOptions.length; i++) {
          const { name, coreURL, wasmURL } = cdnOptions[i];
          
          try {
            console.log(`🔄 Trying CDN ${i + 1}/${cdnOptions.length}: ${name}`);
            setLoadingProgress(20 + (i * 25));
            
            // Reduced timeout to 30 seconds for faster fallback
            const loadPromise = ffmpegInstance.load({
              coreURL: await toBlobURL(coreURL, 'text/javascript'),
              wasmURL: await toBlobURL(wasmURL, 'application/wasm'),
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