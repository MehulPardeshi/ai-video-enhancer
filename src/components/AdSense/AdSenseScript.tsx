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
    console.log('💡 Note: 400 errors are normal for new AdSense accounts');

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
      console.log('💡 If you see 400 errors, this means:');
      console.log('   • Your AdSense account needs approval');
      console.log('   • Add your domain to AdSense');
      console.log('   • Wait 24-48 hours for propagation');
      
      // Initialize adsbygoogle if it doesn't exist
      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }

      // Override console.error temporarily to suppress AdSense 400 error spam
      const originalError = console.error;
      console.error = (...args) => {
        // Filter out common AdSense 400 errors that are expected
        const message = args[0]?.toString() || '';
        if (message.includes('googleads') || message.includes('doubleclick') || message.includes('ads:1')) {
          // Suppress these expected errors in production
          return;
        }
        originalError.apply(console, args);
      };

      // Restore original console.error after 30 seconds
      setTimeout(() => {
        console.error = originalError;
      }, 30000);
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