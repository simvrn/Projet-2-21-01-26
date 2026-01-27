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
          bg-surface-card backdrop-blur-sm rounded-lg border border-gold-400/8
          ${hover ? 'transition-all duration-500 ease-out hover:border-gold-400/15 hover:-translate-y-0.5' : ''}
          ${glow ? 'border-gold-400/15 shadow-glow-sm' : ''}
          ${paddingStyles[padding]}
          ${className}
        `}
        style={{
          boxShadow: glow
            ? '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 40px rgba(196, 172, 120, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
            : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.02)',
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
