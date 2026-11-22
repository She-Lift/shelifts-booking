import { Link, type LinkProps } from 'react-router';
import Icon from './Icon';

export interface LinkButtonProps extends LinkProps {
  icon?: string;
}

export default function LinkButton({ icon, className = '', children, ...rest }: LinkButtonProps) {
  const buttonClass = ['button', className].filter(Boolean).join(' ');

  return (
    <Link className={buttonClass} {...rest}>
      {icon && <Icon name={icon} />}
      {children && <span>{children}</span>}
    </Link>
  );
}
