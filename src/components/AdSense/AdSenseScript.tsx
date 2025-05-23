import { useEffect } from 'react';

const AdSenseScript: React.FC = () => {
  useEffect(() => {
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
    const adsenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
    const isDevelopment = import.meta.env.DEV;
    
    // Don't load AdSense script in development or if not configured
    if (!clientId || !adsenseEnabled || isDevelopment) {
      console.log('AdSense disabled:', { isDevelopment, clientId: !!clientId, adsenseEnabled });
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src*="googlesyndication.com"]`);
    if (existingScript) {
      return;
    }

    // Create and load AdSense script
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onerror = () => {
      console.error('Failed to load AdSense script');
    };

    script.onload = () => {
      console.log('AdSense script loaded successfully');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector(`script[src*="googlesyndication.com"]`);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AdSenseScript; 