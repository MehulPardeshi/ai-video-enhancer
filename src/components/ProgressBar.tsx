import React from 'react';

interface ProgressBarProps {
  progress: number;
  total: number;
  label?: string;
  detail?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  total, 
  label = 'Processing...', 
  detail 
}) => {
  const percentage = Math.min(Math.round((progress / total) * 100), 100);
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-sm text-gray-400">{detail || `${percentage}%`}</div>
      </div>
      
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary-600 to-secondary-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] opacity-50" />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;