import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Premium design Button component.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  // Map variant properties to global stylesheet buttons
  const variantClass = variant === 'primary' 
    ? 'prompt-submit-btn' 
    : 'nav-btn';
    
  return (
    <button
      className={`${variantClass} btn-size-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
