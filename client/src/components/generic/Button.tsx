import type { ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

export type ButtonVariant =
  'primary' | 'link' | 'info' | 'success' | 'warning' | 'danger' | 'light' | 'dark' | 'text' | 'ghost';

export type ButtonSize = 'small' | 'medium' | 'large';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  outlined?: boolean;
  fullwidth?: boolean;
  isLoading?: boolean;
}

export default function Button({
  icon,
  variant,
  size,
  outlined,
  fullwidth,
  isLoading,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const buttonClass = [
    'button',
    variant && `is-${variant}`,
    size && `is-${size}`,
    outlined && 'is-outlined',
    fullwidth && 'is-fullwidth',
    isLoading && 'is-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={buttonClass} disabled={disabled || isLoading} {...rest}>
      {icon && <Icon name={icon} />}
      {children && <span>{children}</span>}
    </button>
  );
}
