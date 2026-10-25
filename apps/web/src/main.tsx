import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import './styles.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element in index.html');

// A data router, so links can animate page changes with the View Transitions API.
const router = createBrowserRouter(routes);

// After an update, an app that was already open may ask for page files of the old version, which
// the server no longer has ("Failed to fetch dynamically imported module"). Load the new version
// of the page being opened instead, once; if that fails too, the error shows as before.
window.addEventListener('vite:preloadError', () => {
  const next = router.state.navigation.location ?? window.location;
  const url = next.pathname + next.search;
  const key = 'reloaded-for-update';
  try {
    const last = JSON.parse(sessionStorage.getItem(key) ?? 'null') as { url: string; at: number };
    if (last?.url === url && Date.now() - last.at < 10_000) return;
    sessionStorage.setItem(key, JSON.stringify({ url, at: Date.now() }));
  } catch {
    return; // Without session storage a reload could repeat forever.
  }
  window.location.assign(url);
});

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
