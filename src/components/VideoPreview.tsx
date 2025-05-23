import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontalIcon } from 'lucide-react';

interface VideoPreviewProps {
  originalUrl: string;
  enhancedUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  originalUrl, 
  enhancedUrl,
  videoRef
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const enhancedVideoRef = useRef<HTMLVideoElement>(null);
  
  // Handle slider movement
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(newPosition);
  };
  
  // Handle touch movement
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const newPosition = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(newPosition);
  };
  
  // Set up and clean up event listeners
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);
  
  // Sync video playback
  useEffect(() => {
    const original = videoRef.current;
    const enhanced = enhancedVideoRef.current;
    
    if (!original || !enhanced) return;
    
    const syncVideos = () => {
      if (original.paused) {
        enhanced.pause();
      } else {
        enhanced.currentTime = original.currentTime;
        enhanced.play();
      }
    };
    
    original.addEventListener('play', syncVideos);
    original.addEventListener('pause', syncVideos);
    original.addEventListener('seeked', syncVideos);
    
    return () => {
      original.removeEventListener('play', syncVideos);
      original.removeEventListener('pause', syncVideos);
      original.removeEventListener('seeked', syncVideos);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden"
    >
      {/* Original video (shown on left side) */}
      <video
        ref={videoRef}
        src={originalUrl}
        className="absolute inset-0 w-full h-full object-contain"
        loop
        muted
      />
      
      {/* Enhanced video (shown on right side) */}
      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ width: `${100 - sliderPosition}%`, left: `${sliderPosition}%` }}
      >
        <video
          ref={enhancedVideoRef}
          src={enhancedUrl}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ left: `-${sliderPosition}%`, width: '100vw' }}
          loop
          muted
        />
      </div>
      
      {/* Comparison slider */}
      <div 
        className="absolute inset-y-0" 
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute inset-y-0 w-px bg-white" />
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
        >
          <SlidersHorizontalIcon className="h-5 w-5 text-white" />
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
        Original
      </div>
      
      <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
        Enhanced
      </div>
    </div>
  );
};

export default VideoPreview;