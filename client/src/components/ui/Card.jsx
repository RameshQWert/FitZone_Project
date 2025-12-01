import React from 'react';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  glow = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: 'bg-dark-400/50 border border-white/10',
    glass: 'glass-card',
    gradient: 'gradient-border bg-dark-400/50',
    solid: 'bg-dark-400',
  };

  const hoverStyles = hover ? 'card-hover cursor-pointer' : '';
  const glowStyles = glow ? 'glow' : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${glowStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 border-b border-white/10 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t border-white/10 ${className}`}>{children}</div>
);

export default Card;
