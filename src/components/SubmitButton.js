import React from 'react';

const SubmitButton = ({ 
  isSubmitting, 
  isProcessing, 
  isValid, 
  dirty, 
  errors, 
  touched,
  cartItems,
  className = '' 
}) => {
  const hasErrors = Object.keys(errors).some(field => touched[field] && errors[field]);
  const hasCartErrors = cartItems.some(item => !item.selectedSize || !item.selectedColor);
  const isDisabled = isSubmitting || isProcessing || !isValid || !dirty || hasCartErrors;

  const getButtonText = () => {
    if (isSubmitting || isProcessing) return 'Processing...';
    if (!dirty) return 'Please fill out the form';
    if (!isValid) return 'Please fix errors above';
    if (hasCartErrors) return 'Please select size and color for all items';
    return 'Place Order';
  };

  const getButtonClasses = () => {
    const baseClasses = `cursor-pointer w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 mt-4 ${className}`;
    
    if (isDisabled) {
      return `${baseClasses} bg-gray-400 text-gray-200 cursor-not-allowed btn-disabled`;
    }
    
    return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`;
  };

  return (
    <div className="space-y-2">
      <button
        type="submit"
        disabled={isDisabled}
        className={getButtonClasses()}
      >
        {getButtonText()}
      </button>
      
      {isDisabled && !isSubmitting && !isProcessing && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {!dirty && 'Fill out the form to continue'}
            {dirty && !isValid && hasErrors && 'Fix the errors above to continue'}
            {dirty && !isValid && !hasErrors && 'Complete all required fields'}
            {isValid && hasCartErrors && 'Select size and color for all items'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubmitButton;
