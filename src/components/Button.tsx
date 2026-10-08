import type { CSSProperties } from 'react';

export type ButtonLink = {
  label: string;
  href: string;
  variant: 'primary' | 'ghost';
};

export function Button({ label, href, variant, style }: ButtonLink & { style?: CSSProperties }) {
  return (
    <a href={href} className={`btn btn-${variant}`} style={style}>
      {label}
    </a>
  );
}
