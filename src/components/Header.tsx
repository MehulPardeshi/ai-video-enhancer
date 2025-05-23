import React from 'react';
import { GithubIcon, MenuIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center">
            <span className="font-bold text-white">VE</span>
          </div>
          <span className="font-medium hidden sm:block">Video Enhancer</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Privacy
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            About
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="GitHub repository"
          >
            <GithubIcon className="h-5 w-5" />
          </a>
          <button className="md:hidden text-gray-400 hover:text-white transition-colors">
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;