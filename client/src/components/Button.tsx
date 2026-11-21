import type { ButtonHTMLAttributes } from 'react';
import Icon from './Icon';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string;
  isLoading?: boolean;
}

export default function Button({
  icon,
  isLoading,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  const buttonClass = ['button', isLoading && 'is-loading', className].filter(Boolean).join(' ');

  return (
    <button type={type} className={buttonClass} disabled={disabled || isLoading} {...rest}>
      {icon && <Icon name={icon} />}
      {children && <span>{children}</span>}
    </button>
  );
}
