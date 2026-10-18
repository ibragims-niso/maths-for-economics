import { useRegisterSW } from 'virtual:pwa-register/react';
import { useSyncExternalStore } from 'react';
import topicBank from '../../../content/topic-bank.json';
import { EquilibriumChart } from './EquilibriumChart';

const REPO_URL = 'https://github.com/ibragims-niso/maths-for-economics';

const topicsPerYear = [1, 2, 3, 4].map(
  (year) => topicBank.filter((t) => t.coreYear === year).length,
);

function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

function useOnline() {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine);
}

export function App() {
  const online = useOnline();
  const {
    offlineReady: [offlineReady],
  } = useRegisterSW({ immediate: true });
  const savedForOffline = offlineReady || Boolean(navigator.serviceWorker?.controller);

  return (
    <main className="page">
      <header>
        <h1>Maths for Economics</h1>
        <p className="lead">
          The mathematics of an economics degree, from first year to final year, explained through
          what economists do with it.
        </p>
      </header>

      <EquilibriumChart />

      <section className="card" aria-labelledby="status-heading">
        <h2 id="status-heading">In development</h2>
        <p>
          {topicBank.length} topics are planned across four years:{' '}
          {topicsPerYear.map((n, i) => `${n} in year ${i + 1}`).join(', ')}. The first topics arrive
          in the next phase.
        </p>
        <p className="status" role="status">
          <span className={savedForOffline ? 'dot dot-ready' : 'dot'} aria-hidden="true" />
          {online
            ? savedForOffline
              ? 'Saved on this device. It will open without internet.'
              : 'Saving for offline use…'
            : 'No internet. You are using the copy saved on this device.'}
        </p>
      </section>

      <footer>
        <p>
          Free and open source. Code: MIT. Content: CC BY-NC-SA 4.0.{' '}
          <a href={REPO_URL}>Source on GitHub</a>
        </p>
      </footer>
    </main>
  );
}
