import type { ReactNode } from "react";
import { NEZKOS_GARAGE } from "../../Constants";
import "./header.css";

type HeaderProps = { children?: ReactNode };

export default function Header({ children }: HeaderProps) {
  return (
    <header className="site-header">
      <span className="site-header-brand">{NEZKOS_GARAGE}</span>
      <nav className="site-header-actions">{children}</nav>
    </header>
  );
}
