import React, { useEffect } from 'react';

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
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const isDevelopment = import.meta.env.DEV;
  
  // Don't show ads in development or if no client ID
  if (!clientId || isDevelopment) {
    return (
      <div className={`ad-placeholder bg-gray-100 border-2 border-dashed border-gray-300 p-4 text-center text-gray-500 rounded-lg ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-sm">Ad Space (Development Mode)</span>
        </div>
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
      />
    </div>
  );
};

export default AdUnit; 