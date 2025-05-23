import React from 'react';
import { GithubIcon, ShieldIcon } from 'lucide-react';
import Header from './components/Header';
import VideoEnhancer from './components/VideoEnhancer';
import Footer from './components/Footer';
import AdSenseScript from './components/AdSense/AdSenseScript';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <AdSenseScript />
      
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400">
            AI Video Enhancer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Enhance your videos with AI super-resolution in your browser.
            No login, no data storage, complete privacy.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
              <ShieldIcon className="h-5 w-5 text-success-400" />
              <span className="text-sm">Privacy First</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full">
              <GithubIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm">Open Source</span>
            </div>
          </div>
        </section>
        
        <VideoEnhancer />
      </main>
      
      <Footer />
    </div>
  );
}

export default App;