import React, { useState, useRef } from 'react';

const RatingStars = ({ rating, size = 'md', showRating = true, interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef(null);

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const handleMouseMove = (e) => {
    if (!interactive) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const starWidth = width / 5;
    const starIndex = Math.floor(x / starWidth);
    const positionInStar = (x % starWidth) / starWidth;
    
    // Calculate half-star precision
    const preciseRating = starIndex + (positionInStar > 0.5 ? 1 : 0.5);
    setHoverRating(Math.min(5, Math.max(0.5, preciseRating)));
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    setHoverRating(0);
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    if (!interactive) return;
    setIsHovering(true);
  };

  const handleClick = (starValue) => {
    if (!interactive) return;
    onRatingChange?.(starValue);
  };

  const renderStar = (index) => {
    const starValue = index + 1;
    const currentRating = isHovering ? hoverRating : rating;
    const difference = currentRating - index;
    
    if (difference >= 1) {
      // Full star
      return (
        <svg
          key={index}
          className={`${sizes[size]} text-yellow-400 transition-all duration-150 ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => handleClick(starValue)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    } else if (difference > 0) {
      // Half star
      return (
        <div key={index} className="relative">
          <svg
            className={`${sizes[size]} text-gray-300 transition-all duration-150 ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => handleClick(starValue)}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="absolute inset-0 overflow-hidden" style={{ width: `${(difference * 100)}%` }}>
            <svg
              className={`${sizes[size]} text-yellow-400 transition-all duration-150 ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`}
              fill="currentColor"
              viewBox="0 0 20 20"
              onClick={() => handleClick(starValue)}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      );
    } else {
      // Empty star
      return (
        <svg
          key={index}
          className={`${sizes[size]} text-gray-300 transition-all duration-150 ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => handleClick(starValue)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <div 
        ref={containerRef}
        className="flex items-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
      >
        {[...Array(5)].map((_, index) => renderStar(index))}
      </div>
      {showRating && (
        <span className={`${textSizes[size]} text-gray-600 font-medium ml-2`}>
          {isHovering ? hoverRating.toFixed(1) : rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
