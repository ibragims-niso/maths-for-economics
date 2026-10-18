import { Link } from 'react-router';
import { icon3d } from './topics';

// Sections whose features arrive in Phase 1. Each says plainly what will be here.

function EmptyState(props: { icon: string; title: string; text: string; items: string[] }) {
  return (
    <div className="empty">
      <img className="empty-icon" src={icon3d(props.icon)} alt="" width="112" height="112" />
      <h1>{props.title}</h1>
      <p className="empty-text">{props.text}</p>
      <ul className="empty-list">
        {props.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <Link to="/" className="button-primary" viewTransition>
        See the topics
      </Link>
    </div>
  );
}

export function SettingsPage() {
  return (
    <EmptyState
      icon="setting"
      title="Settings"
      text="Settings arrive with the first topics."
      items={[
        'Your programme: Core, LSE, Cambridge or MIT',
        'Your own free AI key',
        'Share progress with a parent or tutor',
      ]}
    />
  );
}

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
