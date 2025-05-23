import { useEffect } from 'react';

const AdSenseScript: React.FC = () => {
  useEffect(() => {
    const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
    const adsenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
    const isDevelopment = import.meta.env.DEV;
    
    // Only load AdSense if properly configured
    if (!clientId || !adsenseEnabled || isDevelopment) {
      console.log('AdSense disabled:', { 
        isDevelopment, 
        hasClientId: !!clientId, 
        adsenseEnabled,
        reason: !clientId ? 'No client ID' : !adsenseEnabled ? 'Disabled in config' : 'Development mode'
      });
      return;
    }

    // Validate client ID format
    if (!clientId.startsWith('ca-pub-') || clientId.length < 15) {
      console.warn('Invalid AdSense client ID format:', clientId);
      return;
    }

    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src*="googlesyndication.com"]`);
    if (existingScript) {
      console.log('AdSense script already loaded');
      return;
    }

    console.log('Loading AdSense script for client:', clientId);

    // Create and load AdSense script with proper error handling
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-ad-client', clientId);
    
    script.onerror = (error) => {
      console.error('Failed to load AdSense script:', error);
      // Remove the failed script
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    script.onload = () => {
      console.log('AdSense script loaded successfully');
      
      // Initialize adsbygoogle if it doesn't exist
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
    };

    // Add script to head with error boundary
    try {
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error adding AdSense script to DOM:', error);
    }

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector(`script[src*="googlesyndication.com"]`);
      if (scriptToRemove && scriptToRemove.parentNode) {
        try {
          scriptToRemove.parentNode.removeChild(scriptToRemove);
        } catch (error) {
          console.warn('Error removing AdSense script:', error);
        }
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AdSenseScript; 