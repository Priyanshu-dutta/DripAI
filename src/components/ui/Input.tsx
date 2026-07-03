import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/**
 * Premium design Input box for form options.
 */
export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="option-field">
      {label && <label>{label}</label>}
      <input
        className={`interactiveInput ${className}`}
        {...props}
      />
    </div>
  );
};
export default Input;
