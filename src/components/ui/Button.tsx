import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass';
}

/**
 * Reusable Button component styled according to premium design tokens.
 * Logic is minimal for Phase 1 skeleton layout.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
export default Button;
