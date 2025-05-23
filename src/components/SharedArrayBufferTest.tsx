import React, { useEffect, useState } from 'react';

interface TestResult {
  test: string;
  result: string;
  status: 'pass' | 'fail' | 'info';
}

const SharedArrayBufferTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const newResults: TestResult[] = [];

    // Test 1: SharedArrayBuffer availability
    newResults.push({ test: 'SharedArrayBuffer Test', result: '=== SHARED ARRAY BUFFER TEST ===', status: 'info' });
    
    if (typeof SharedArrayBuffer !== 'undefined') {
      newResults.push({ test: 'SharedArrayBuffer', result: '✅ SharedArrayBuffer is available', status: 'pass' });
      
      try {
        const sab = new SharedArrayBuffer(1024);
        newResults.push({ test: 'Create SAB', result: '✅ Can create SharedArrayBuffer instance', status: 'pass' });
      } catch (e) {
        newResults.push({ test: 'Create SAB', result: `❌ Cannot create SharedArrayBuffer: ${(e as Error).message}`, status: 'fail' });
      }
    } else {
      newResults.push({ test: 'SharedArrayBuffer', result: '❌ SharedArrayBuffer is NOT available', status: 'fail' });
    }

    // Test 2: Cross-origin isolation
    newResults.push({ test: 'Cross-Origin Isolation', result: '=== CROSS-ORIGIN ISOLATION TEST ===', status: 'info' });
    
    if (typeof window.crossOriginIsolated !== 'undefined') {
      if (window.crossOriginIsolated) {
        newResults.push({ test: 'Cross-Origin Isolated', result: '✅ Page is cross-origin isolated', status: 'pass' });
      } else {
        newResults.push({ test: 'Cross-Origin Isolated', result: '❌ Page is NOT cross-origin isolated', status: 'fail' });
      }
    } else {
      newResults.push({ test: 'Cross-Origin Isolated', result: '⚠️ crossOriginIsolated property not available', status: 'fail' });
    }

    // Test 3: Browser info
    newResults.push({ test: 'Browser Info', result: '=== BROWSER INFO ===', status: 'info' });
    newResults.push({ test: 'User Agent', result: `User Agent: ${navigator.userAgent}`, status: 'info' });
    newResults.push({ test: 'Platform', result: `Platform: ${navigator.platform}`, status: 'info' });
    newResults.push({ test: 'Hardware Concurrency', result: `Hardware Concurrency: ${navigator.hardwareConcurrency || 'unknown'}`, status: 'info' });

    // Test 4: Headers (simplified)
    newResults.push({ test: 'Headers', result: '=== HEADERS TEST ===', status: 'info' });
    fetch(window.location.href)
      .then(response => {
        const coep = response.headers.get('Cross-Origin-Embedder-Policy');
        const coop = response.headers.get('Cross-Origin-Opener-Policy');
        
        setResults(prev => [
          ...prev,
          { 
            test: 'COEP Header', 
            result: coep ? `✅ Cross-Origin-Embedder-Policy: ${coep}` : '❌ Cross-Origin-Embedder-Policy header missing', 
            status: coep ? 'pass' : 'fail' 
          },
          { 
            test: 'COOP Header', 
            result: coop ? `✅ Cross-Origin-Opener-Policy: ${coop}` : '❌ Cross-Origin-Opener-Policy header missing', 
            status: coop ? 'pass' : 'fail' 
          }
        ]);
      })
      .catch(e => {
        setResults(prev => [
          ...prev,
          { test: 'Headers Fetch', result: `❌ Could not check headers: ${(e as Error).message}`, status: 'fail' }
        ]);
      });

    setResults(newResults);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="mb-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
      >
        🧪 Run SharedArrayBuffer Diagnostics
      </button>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">🧪 SharedArrayBuffer Diagnostics</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-2 rounded text-sm font-mono ${
              result.status === 'pass'
                ? 'bg-green-900/50 text-green-300'
                : result.status === 'fail'
                ? 'bg-red-900/50 text-red-300'
                : 'bg-blue-900/50 text-blue-300'
            }`}
          >
            {result.result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedArrayBufferTest; 