import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-accent-500 to-accent-600 text-white
    hover:from-accent-400 hover:to-accent-500
    focus:ring-accent-500 shadow-glow-sm hover:shadow-glow
  `,
  secondary: `
    bg-dark-700/80 text-dark-200 border border-dark-600
    hover:bg-dark-600/80 hover:border-dark-500 hover:text-white
    focus:ring-dark-500
  `,
  ghost: `
    bg-transparent text-dark-300
    hover:bg-dark-700/50 hover:text-white
    focus:ring-dark-500
  `,
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center rounded-xl font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
