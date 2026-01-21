import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padding = 'md', hover = false, glow = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-surface-light/80 backdrop-blur-xl rounded-2xl border border-dark-700/50
          ${hover ? 'transition-all duration-300 hover:border-accent-500/30 hover:shadow-glow-sm' : ''}
          ${glow ? 'border-accent-500/30 shadow-glow-sm' : ''}
          ${paddingStyles[padding]}
          ${className}
        `}
        style={{
          boxShadow: glow
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2), 0 0 20px rgba(6, 182, 212, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
