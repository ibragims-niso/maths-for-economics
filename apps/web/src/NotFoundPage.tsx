import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { BackIcon } from './icons';

export function NotFoundPage({ menu }: { menu: ReactNode }) {
  return (
    <>
      <header>
        <div className="topbar">
          <Link to="/" className="back-link">
            <BackIcon />
            Home
          </Link>
          {menu}
        </div>
        <h1>Page not found</h1>
      </header>
      <main>
        <p>
          This page doesn't exist. <Link to="/">Go to the home screen</Link>.
        </p>
      </main>
    </>
  );
}
