import { Link } from 'react-router';
import { icon3d } from './topics';

export function NotFoundPage() {
  return (
    <div className="empty">
      <img className="empty-icon" src={icon3d('zoom')} alt="" width="112" height="112" />
      <h1>Page not found</h1>
      <p className="empty-text">This page doesn't exist.</p>
      <Link to="/" className="button-primary" viewTransition>
        Go to the home screen
      </Link>
    </div>
  );
}
