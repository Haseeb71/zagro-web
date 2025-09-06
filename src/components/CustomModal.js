import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CustomModal = ({
  isOpen,
  onClose,
  title = "Are you sure?",
  subtitle = "Grab a 20% discount for your first purchase using the code BARGAIN.",
  highlightText = "BARGAIN",
  buttons = [
    { text: "BACK TO THE STORE", variant: "primary", onClick: () => {} },
    { text: "NO, THANKS", variant: "secondary", onClick: () => {} }
  ],
  disclaimer = "For first-time customers only.",
  showCloseButton = true,
  overlayClickable = true,
  rightImage = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop"
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure DOM is ready for animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (overlayClickable && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={handleOverlayClick}
    >
      {/* Modal Container - Responsive Two Panel Layout */}
      <div className={`relative bg-white rounded-lg border border-black shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto flex flex-col sm:flex-row overflow-hidden transition-all duration-300 transform ${
        isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Left Panel - Text and Buttons */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-auto">
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center z-10 transition-colors duration-200"
            >
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6 pr-8">
            {title}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-800 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg">
            {subtitle.split(highlightText).map((part, index, array) => (
              <span key={index}>
                {part}
                {index < array.length - 1 && (
                  <span className="font-bold text-black">{highlightText}</span>
                )}
              </span>
            ))}
          </p>

          {/* Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {buttons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg border-2 font-medium text-sm sm:text-base transition-colors duration-200 ${
                  button.variant === 'primary'
                    ? 'bg-black text-white border-black hover:bg-gray-800'
                    : button.variant === 'secondary'
                    ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                    : button.variant === 'success'
                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                    : button.variant === 'danger'
                    ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                    : 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700'
                }`}
              >
                {button.text}
              </button>
            ))}
          </div>

          {/* Disclaimer */}
          {disclaimer && (
            <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
              {disclaimer}
            </p>
          )}
        </div>

        {/* Right Panel - Image (Always visible, responsive) */}
        <div className="flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-auto">
          <img
            src={rightImage}
            alt="Modal background"
            className="w-full h-full object-cover"
          />
          {/* Close button on image side */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 bg-white bg-opacity-80 hover:bg-opacity-100 rounded flex items-center justify-center transition-colors duration-200"
            >
              <XMarkIcon className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;
