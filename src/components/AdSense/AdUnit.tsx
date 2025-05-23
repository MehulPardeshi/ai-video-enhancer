import React, { useEffect, useState } from 'react';

interface AdUnitProps {
  slot: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdUnit: React.FC<AdUnitProps> = ({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  responsive = true,
  className = ""
}) => {
  const [adError, setAdError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const adsenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const isDevelopment = import.meta.env.DEV;
  
  // Validate configuration
  const isValidConfig = clientId && clientId.startsWith('ca-pub-') && adsenseEnabled;
  
  useEffect(() => {
    // Only try to push ads if everything is properly configured
    if (!isValidConfig || isDevelopment) {
      return;
    }

    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // Small delay to ensure the ad slot is in the DOM
        const timer = setTimeout(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (e) {
            console.error('AdSense push error:', e);
            setAdError('Ad failed to load');
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error('AdSense error:', e);
      setAdError('Ad configuration error');
    }
  }, [isValidConfig, isDevelopment]);
  
  // Show placeholder in development or if not configured
  if (!isValidConfig || isDevelopment || adError) {
    const placeholderText = isDevelopment 
      ? 'Ad Space (Development Mode)' 
      : !clientId 
        ? 'Ad Space (No Client ID)'
        : !adsenseEnabled
          ? 'Ad Space (AdSense Disabled)'
          : adError
            ? `Ad Space (${adError})`
            : 'Ad Space (Configure AdSense)';

    return (
      <div className={`ad-placeholder bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 rounded-lg ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-sm">{placeholderText}</span>
        </div>
        {!isDevelopment && (
          <div className="text-xs text-gray-400 mt-1">
            Configure VITE_ADSENSE_CLIENT_ID and VITE_ADSENSE_ENABLED
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
        data-ad-test={isDevelopment ? 'on' : undefined}
      />
    </div>
  );
};

export default AdUnit; 