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
        
        // Simplified approach with most reliable CDN
        console.log('🔄 Loading FFmpeg from jsdelivr CDN...');
        setLoadingProgress(30);
        
        try {
          // Use the most reliable CDN configuration
          await ffmpegInstance.load({
            coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
            workerURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.worker.js', 'text/javascript'),
          });
          
          setLoadingProgress(100);
          setIsLoaded(true);
          console.log('✅ Video processor loaded successfully!');
          
        } catch (coreError) {
          console.warn('❌ Primary CDN failed, trying alternative...');
          setLoadingProgress(50);
          
          // Fallback to older stable version
          await ffmpegInstance.load({
            coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js', 'text/javascript'),
            wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
          });
          
          setLoadingProgress(100);
          setIsLoaded(true);
          console.log('✅ Video processor loaded with fallback version!');
        }
        
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setError(`Video processor unavailable: ${errorMsg}`);
        console.warn('⚠️ FFmpeg failed to load - using fallback processing');
        console.log('💡 This is normal - the app still works without FFmpeg!');
        console.log('💡 Videos will be processed in "Lightweight Mode"');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Start loading immediately in production, skip in development
    if (!import.meta.env.DEV) {
      const timer = setTimeout(load, 2000); // Slight delay for better UX
      return () => clearTimeout(timer);
    } else {
      // In development, just set error state immediately
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