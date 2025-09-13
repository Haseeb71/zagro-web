import React from 'react';

const ErrorSummary = ({ errors, touched, isSubmitting }) => {
  // Get all error messages for touched fields
  const errorEntries = Object.entries(errors).filter(([field, error]) => 
    touched[field] && error
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 error-message">
      <div className="flex items-start">
        <svg className="w-5 h-5 text-red-500 mr-3 mt-0.5 error-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-red-800 font-semibold text-sm mb-2">
            Please fix the following errors:
          </h3>
          <ul className="space-y-1">
            {errorEntries.map(([field, error]) => (
              <li key={field} className="text-red-700 text-sm flex items-center">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
                <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="ml-1">{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorSummary;
