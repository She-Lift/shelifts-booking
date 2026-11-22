export type IconSize = 'small' | 'medium' | 'large';

export interface IconProps {
  name: string;
  size?: IconSize;
  className?: string;
}

export default function Icon({ name, size, className }: IconProps) {
  const wrapperClass = ['icon', size && `is-${size}`, className].filter(Boolean).join(' ');

  return (
    <span className={wrapperClass} aria-hidden="true">
      <span className="material-symbols-outlined">{name}</span>
    </span>
  );
}
