import React from 'react';

const Input = React.forwardRef(({ 
  className = '', 
  label, 
  error, 
  id, 
  ...props 
}, ref) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={generatedId}
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
