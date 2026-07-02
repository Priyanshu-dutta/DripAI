import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Reusable Input text box aligned with clean typography design tokens.
 */
export const Input: React.FC<InputProps> = ({ className = '', ...props }) => {
  return (
    <input
      className={`input-base ${className}`}
      {...props}
    />
  );
};
export default Input;
