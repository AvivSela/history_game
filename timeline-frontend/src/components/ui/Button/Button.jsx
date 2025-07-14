import React from 'react';
import './Button.css';

/**
 * Button - Reusable button component with multiple variants and sizes
 * 
 * This component provides a consistent button interface across the application
 * with support for different variants (primary, secondary, success) and sizes
 * (small, default, large). It includes proper accessibility attributes and
 * hover/disabled states.
 * 
 * @component
 * @example
 * ```jsx
 * <Button variant="primary" size="large" onClick={handleClick}>
 *   Click Me
 * </Button>
 * ```
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, success)
 * @param {string} [props.size='default'] - Button size (small, default, large)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {Function} [props.onClick] - Click handler function
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 * @param {Object} props.rest - Additional props passed to the button element
 * 
 * @returns {JSX.Element} The button component
 */
const Button = ({ 
  variant = 'primary', 
  size = 'default', 
  disabled = false, 
  onClick, 
  className = '', 
  children, 
  ...rest 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success'
  };
  const sizeClasses = {
    small: 'btn-small',
    default: '',
    large: 'btn-large'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button; 