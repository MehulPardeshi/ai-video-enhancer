import React, { useState } from 'react';
import VideoUploader from './VideoUploader';
import VideoProcessor from './VideoProcessor';
import { VideoFile } from '../types/video';

const VideoEnhancer: React.FC = () => {
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  
  const handleVideoUpload = (file: VideoFile) => {
    setVideoFile(file);
    setProcessingStarted(false);
  };
  
  const handleReset = () => {
    setVideoFile(null);
    setProcessingStarted(false);
  };
  
  const startProcessing = () => {
    setProcessingStarted(true);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {!videoFile ? (
        <VideoUploader onVideoUpload={handleVideoUpload} />
      ) : (
        <VideoProcessor 
          videoFile={videoFile}
          onReset={handleReset}
          processingStarted={processingStarted}
          startProcessing={startProcessing}
        />
      )}
      
      <div className="mt-16 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center mb-3">
              <span className="font-bold">1</span>
            </div>
            <h3 className="font-medium mb-2">Upload Video</h3>
            <p className="text-sm text-gray-400">
              Upload your video file through our secure, browser-based interface.
            </p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center mb-3">
              <span className="font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">AI Enhancement</h3>
            <p className="text-sm text-gray-400">
              Your video is processed frame by frame using AI super-resolution.
            </p>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center mb-3">
              <span className="font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Download Result</h3>
            <p className="text-sm text-gray-400">
              Download your enhanced video with improved quality and clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEnhancer;