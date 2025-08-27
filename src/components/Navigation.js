import Link from 'next/link';
import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Custom CSS for floating animation */}
      <style jsx>{`
        .floating-animation {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Navigation - Fixed Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 floating-animation hover:text-blue-700 transition-colors duration-300">
                Zagro Footwear
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/men" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Men
              </Link>
              <Link href="/women" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Women
              </Link>
              <Link href="/kids" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Kids
              </Link>
              <Link href="/collections" className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium">
                Collections
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart Button */}
              <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform bg-blue-600 rounded-full animate-pulse">
                  2
                </span>
              </button>

              {/* User Account Button */}
              <button className="p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-110 hover:bg-blue-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-100 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Home
                </Link>
                <Link href="/men" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Men
                </Link>
                <Link href="/women" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Women
                </Link>
                <Link href="/kids" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Kids
                </Link>
                <Link href="/collections" className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-300">
                  Collections
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
} 