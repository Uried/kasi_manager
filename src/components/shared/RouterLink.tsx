import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Link = ({ to, children, className, onClick }: LinkProps) => {
  return (
    <NavLink to={to} className={className} onClick={onClick}>
      {children}
    </NavLink>
  );
};
