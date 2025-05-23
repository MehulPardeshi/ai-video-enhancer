import { useState, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// TypeScript declarations for global FFmpeg
declare global {
  interface Window {
    FFmpeg?: any;
  }
}

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
        
        // Try loading strategies optimized for cross-origin isolated environments
        const loadingStrategies = [
          {
            name: 'cors-friendly-esm',
            timeout: 30000,
            load: async () => {
              console.log('🌐 Using CORS-friendly CDN (esm.sh with explicit CORS headers)...');
              await ffmpegInstance.load({
                coreURL: 'https://esm.sh/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://esm.sh/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm'
              });
            }
          },
          {
            name: 'skypack-cors-enabled',
            timeout: 25000,
            load: async () => {
              console.log('📦 Using Skypack CDN (designed for cross-origin isolation)...');
              await ffmpegInstance.load({
                coreURL: 'https://cdn.skypack.dev/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://cdn.skypack.dev/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm'
              });
            }
          },
          {
            name: 'fetch-and-blob-conversion',
            timeout: 35000,
            load: async () => {
              console.log('🔄 Fetching files with explicit CORS and converting to blob URLs...');
              
              const fetchWithCors = async (url: string, type: string) => {
                const response = await fetch(url, {
                  mode: 'cors',
                  credentials: 'omit',
                  headers: {
                    'Accept': type === 'wasm' ? 'application/wasm' : 'application/javascript'
                  }
                });
                
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}: ${response.status}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                const mimeType = type === 'wasm' ? 'application/wasm' : 'application/javascript';
                const blob = new Blob([arrayBuffer], { type: mimeType });
                return URL.createObjectURL(blob);
              };
              
              const coreURL = await fetchWithCors(
                'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                'js'
              );
              const wasmURL = await fetchWithCors(
                'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm',
                'wasm'
              );
              
              await ffmpegInstance.load({ coreURL, wasmURL });
              
              // Cleanup blob URLs
              URL.revokeObjectURL(coreURL);
              URL.revokeObjectURL(wasmURL);
            }
          },
          {
            name: 'proxy-through-vercel',
            timeout: 30000,
            load: async () => {
              console.log('🔀 Using Vercel proxy to bypass CORS (if configured)...');
              await ffmpegInstance.load({
                coreURL: '/api/proxy-ffmpeg?file=core.js',
                wasmURL: '/api/proxy-ffmpeg?file=core.wasm'
              });
            }
          },
          {
            name: 'extended-timeout-standard',
            timeout: 45000,
            load: async () => {
              console.log('⏰ Standard loading with extended timeout (45s)...');
              await ffmpegInstance.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm'
              });
            }
          },
          {
            name: 'legacy-version',
            timeout: 30000,
            load: async () => {
              console.log('🕰️ Trying legacy version (0.11.6) with better cross-origin support...');
              await ffmpegInstance.load({
                coreURL: 'https://unpkg.com/@ffmpeg/core@0.11.6/dist/ffmpeg-core.js',
                wasmURL: 'https://unpkg.com/@ffmpeg/core@0.11.6/dist/ffmpeg-core.wasm'
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
          // Provide specific error message based on the pattern
          const errorMessage = lastError?.message || lastError?.toString() || 'Unknown error';
          const isTimeoutIssue = errorMessage.includes('Timeout');
          const isCorsIssue = errorMessage.includes('CORS policy') || errorMessage.includes('Access-Control-Allow-Origin') || errorMessage.includes('cross-origin');
          const isNetworkIssue = (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network Error')) && !isCorsIssue;
          const isWasmIssue = errorMessage.includes('WebAssembly') || errorMessage.includes('instantiate');
          const isModuleIssue = errorMessage.includes('failed to import') || errorMessage.includes('module script') || errorMessage.includes('MIME type');
          
          if (isCorsIssue) {
            console.error('🚫 CORS Policy Issue: Cross-origin isolation blocking CDN access');
            console.log('💡 This indicates:');
            console.log('  • Cross-origin isolated environment has strict CORS requirements');
            console.log('  • CDNs need specific headers to work with COEP: credentialless');
            console.log('  • Dynamic ES module imports are restricted in this context');
            console.log('📋 Solution: Need to bundle FFmpeg or use CORS-enabled CDNs');
            throw new Error('CORS policy blocks FFmpeg loading in cross-origin isolated environment');
          } else if (isModuleIssue) {
            console.error('📦 Module Import Issue: FFmpeg core.js import failed');
            console.log('💡 This usually indicates:');
            console.log('  • ES module loading issues in cross-origin isolated environment');
            console.log('  • Content Security Policy restrictions');
            console.log('  • MIME type or module format compatibility issues');
            console.log('📋 Files download successfully, issue is in JavaScript module loading');
            throw new Error('FFmpeg module import failed - cross-origin isolation may affect module loading');
          } else if (isWasmIssue) {
            console.error('🔧 WebAssembly Issue: Failed to instantiate FFmpeg.wasm');
            console.log('💡 This usually indicates:');
            console.log('  • WebAssembly instantiation timeout');
            console.log('  • Insufficient memory for large WASM file');
            console.log('  • Browser compatibility issue');
            console.log('📋 Files download successfully, issue is in WASM processing');
            throw new Error('WebAssembly instantiation failed - try refreshing or use Lightweight mode');
          } else if (isTimeoutIssue) {
            console.error('⏱️ Processing Timeout: FFmpeg initialization took too long');
            console.log('💡 Based on diagnostics: Files download fine, but processing times out');
            console.log('  • WebAssembly instantiation is slow');
            console.log('  • Device may need more time for large WASM');
            console.log('📋 Diagnostic tools: /ffmpeg-debug.html');
            throw new Error('FFmpeg processing timeout - files download but initialization fails');
          } else if (isNetworkIssue) {
            console.error('❌ Network Issue: Cannot reach CDN servers');
            throw new Error('Network connectivity issue - CDNs unreachable');
          } else {
            throw new Error(`All loading strategies failed. Last error: ${errorMessage}`);
          }
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