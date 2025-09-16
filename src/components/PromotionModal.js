import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import promotionsAPI from '../APIs/promotions/indes';

const PromotionModal = ({ isOpen, onClose }) => {
  const [promotions, setPromotions] = useState([]);
  const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Fetch promotions on component mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await promotionsAPI.getPromotions();
        if (response.data && response.data.promotions) {
          // Filter only active promotions
          const activePromotions = response.data.promotions.filter(promo => promo.isActive);
          setPromotions(activePromotions);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchPromotions();
    }
  }, [isOpen]);

  // Animation states
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure DOM is ready for animation
      setTimeout(() => setIsAnimating(true), 50);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  // Cycle through promotions every 5 seconds
  useEffect(() => {
    if (promotions.length > 1 && isOpen) {
      const interval = setInterval(() => {
        setCurrentPromotionIndex((prevIndex) => 
          (prevIndex + 1) % promotions.length
        );
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [promotions.length, isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  // Show loading state with fade animation
  if (isLoading) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all duration-300 ease-in-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        onClick={handleOverlayClick}
      >
        <div className={`relative bg-white rounded-lg border border-black shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto flex flex-col sm:flex-row overflow-hidden transition-all duration-300 ease-in-out transform ${
          isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-auto">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              <span className="ml-3 text-gray-600">Loading promotions...</span>
            </div>
          </div>
          <div className="flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-auto bg-gray-100 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const currentPromotion = promotions[currentPromotionIndex];

  if (!currentPromotion) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-md transition-all duration-300 ease-in-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
      onClick={handleOverlayClick}
    >
      {/* Modal Container - Responsive Two Panel Layout */}
      <div className={`relative bg-white rounded-lg border border-black shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl mx-auto flex flex-col sm:flex-row overflow-hidden transition-all duration-300 ease-in-out transform ${
        isAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* Left Panel - Text and Buttons */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center z-10 transition-colors duration-200"
          >
            <XMarkIcon className="w-4 h-4 text-gray-600" />
          </button>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6 pr-8">
            {currentPromotion.mainText}
          </h2>

          {/* Subtitle */}
          <p className="text-gray-800 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base lg:text-lg">
            {currentPromotion.subText}
          </p>

          {/* Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <button
              onClick={() => {
                onClose();
                // Navigate to store or perform action
                console.log('User clicked SHOP NOW');
              }}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg border-2 font-medium text-sm sm:text-base transition-colors duration-200 bg-black text-white border-black hover:bg-gray-800"
            >
              SHOP NOW
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-lg border-2 font-medium text-sm sm:text-base transition-colors duration-200 bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
            >
              MAYBE LATER
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
            Limited time offer • Terms and conditions apply
          </p>

          {/* Promotion Counter */}
          {promotions.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {promotions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentPromotionIndex ? 'bg-black' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Image */}
        <div className="flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-auto">
          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop"
            alt="Promotion background"
            className="w-full h-full object-cover"
          />
          {/* Close button on image side */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-6 h-6 bg-white bg-opacity-80 hover:bg-opacity-100 rounded flex items-center justify-center transition-colors duration-200"
          >
            <XMarkIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;
