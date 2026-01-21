import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-dark-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 bg-dark-800/80 border rounded-xl
            text-dark-100 placeholder-dark-400
            focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500
            hover:border-dark-500
            transition-all duration-200
            disabled:bg-dark-900 disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-dark-600'}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
