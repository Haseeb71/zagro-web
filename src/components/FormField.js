import React, { useState, useEffect } from 'react';
import { Field, ErrorMessage } from 'formik';

const FormField = ({ 
  name, 
  type = 'text', 
  label, 
  placeholder, 
  className = '', 
  fieldClassName = '',
  showSuccess = true,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const getFieldClasses = (field, meta) => {
    const baseClasses = `w-full text-gray-900 px-3 py-2.5 border-2 rounded-lg focus:ring-2 transition-all duration-200 hover:border-gray-300 ${fieldClassName}`;
    
    if (meta.touched && meta.error) {
      return `${baseClasses} field-error border-red-500 focus:border-red-500 focus:ring-red-200`;
    } else if (meta.touched && !meta.error && showSuccess) {
      return `${baseClasses} field-success border-green-500 focus:border-green-500 focus:ring-green-200`;
    }
    
    return `${baseClasses} border-gray-200 focus:ring-blue-500 focus:border-blue-500`;
  };

  const getErrorMessageClasses = (meta) => {
    const baseClasses = "text-red-500 text-sm mt-1 flex items-center error-message";
    return meta.touched && meta.error ? baseClasses : `${baseClasses} hidden`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <Field name={name}>
        {({ field, meta }) => (
          <>
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={getFieldClasses(field, meta)}
              onBlur={(e) => {
                field.onBlur(e);
                setIsTouched(true);
              }}
              {...props}
            />
            
            <ErrorMessage name={name}>
              {(msg) => (
                <div className={getErrorMessageClasses(meta)}>
                  <svg className="w-4 h-4 mr-1 error-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {msg}
                </div>
              )}
            </ErrorMessage>
            
            {meta.touched && !meta.error && showSuccess && (
              <div className="text-green-500 text-sm mt-1 flex items-center error-message">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </>
        )}
      </Field>
    </div>
  );
};

export default FormField;
