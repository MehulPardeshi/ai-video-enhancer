import React from 'react';
import { WrenchIcon, ZoomInIcon } from 'lucide-react';

interface EnhancementSettingsProps {
  enhancementScale: number;
  setEnhancementScale: (scale: number) => void;
  isProcessing: boolean;
}

const EnhancementSettings: React.FC<EnhancementSettingsProps> = ({
  enhancementScale,
  setEnhancementScale,
  isProcessing
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm flex items-center gap-1">
            <ZoomInIcon className="h-4 w-4" />
            Enhancement Scale
          </label>
          <span className="text-sm font-medium text-primary-400">
            {enhancementScale}x
          </span>
        </div>
        
        <input
          type="range"
          min="1"
          max="4"
          step="1"
          value={enhancementScale}
          onChange={(e) => setEnhancementScale(parseInt(e.target.value))}
          disabled={isProcessing}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1x</span>
          <span>2x</span>
          <span>3x</span>
          <span>4x</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <WrenchIcon className="h-4 w-4" />
          Advanced Settings
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Preserve Audio</label>
            <div className="relative inline-block w-10 h-5 rounded-full bg-gray-700">
              <input
                type="checkbox"
                className="sr-only"
                checked={true}
                disabled={isProcessing}
                readOnly
              />
              <span className="block h-5 w-5 rounded-full bg-primary-500 transform translate-x-5 transition-transform" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Denoise</label>
            <div className="relative inline-block w-10 h-5 rounded-full bg-gray-700">
              <input
                type="checkbox"
                className="sr-only"
                checked={true}
                disabled={isProcessing}
                readOnly
              />
              <span className="block h-5 w-5 rounded-full bg-primary-500 transform translate-x-5 transition-transform" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-400">Maintain Framerate</label>
            <div className="relative inline-block w-10 h-5 rounded-full bg-gray-700">
              <input
                type="checkbox"
                className="sr-only"
                checked={true}
                disabled={isProcessing}
                readOnly
              />
              <span className="block h-5 w-5 rounded-full bg-primary-500 transform translate-x-5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancementSettings;