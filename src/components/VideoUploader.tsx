import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloudIcon, AlertCircleIcon } from 'lucide-react';
import { VideoFile } from '../types/video';
import SharedArrayBufferTest from './SharedArrayBufferTest';

interface VideoUploaderProps {
  onVideoUpload: (file: VideoFile) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUpload }) => {
  const [error, setError] = React.useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    // Check if it's a valid video file
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file (MP4, WebM, etc.)');
      return;
    }
    
    // Check file size (limit to 100MB for browser processing)
    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit for browser processing');
      return;
    }
    
    const videoFile: VideoFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    };
    
    onVideoUpload(videoFile);
  }, [onVideoUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.mov']
    },
    maxFiles: 1
  });
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6">
        <SharedArrayBufferTest />
      </div>
      
      <div
        {...getRootProps()}
        className={`w-full max-w-2xl p-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[300px] ${
          isDragActive 
            ? 'border-primary-400 bg-primary-900/20' 
            : 'border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600'
        }`}
      >
        <input {...getInputProps()} />
        
        <UploadCloudIcon 
          className={`h-16 w-16 mb-4 ${isDragActive ? 'text-primary-400' : 'text-gray-500'}`} 
          strokeWidth={1.5} 
        />
        
        <h2 className="text-xl font-medium mb-2">
          {isDragActive ? 'Drop your video here' : 'Upload your video'}
        </h2>
        
        <p className="text-center text-gray-400 mb-4 max-w-md">
          Drag and drop your video file here, or click to select a file.
          Your video is processed locally in your browser for complete privacy.
        </p>
        
        <div className="bg-gray-700/50 px-4 py-2 rounded-full text-sm text-gray-300">
          MP4, WebM, MOV up to 100MB
        </div>
        
        {error && (
          <div className="mt-4 text-error-400 flex items-center gap-2 bg-error-900/20 px-4 py-2 rounded-lg">
            <AlertCircleIcon className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
        <h3 className="font-medium mb-2">Privacy Guaranteed</h3>
        <p className="text-gray-400 text-sm max-w-lg">
          Your video never leaves your device. All processing happens locally in your browser
          using WebAssembly and ONNX Runtime. No data is stored or shared.
        </p>
      </div>
    </div>
  );
};

export default VideoUploader;