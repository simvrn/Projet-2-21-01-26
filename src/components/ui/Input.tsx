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
            className="label"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-lg
            text-noir-900 placeholder-noir-400
            focus:outline-none focus:ring-1 focus:ring-gold-400/30 focus:border-gold-400/40
            hover:border-noir-500
            transition-all duration-200
            disabled:bg-noir-100 disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500' : 'border-noir-300'}
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
