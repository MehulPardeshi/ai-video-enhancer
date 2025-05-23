import React from 'react';
import { GithubIcon, HeartIcon } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 py-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold mb-2">AI Video Enhancer</h2>
            <p className="text-gray-400 text-sm max-w-md">
              Enhance your videos with AI super-resolution right in your browser.
              No login, no data storage, complete privacy.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub repository"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="h-4 w-4 text-error-500 mx-1" />
              <span>and React</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} AI Video Enhancer. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            {' • '}
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;