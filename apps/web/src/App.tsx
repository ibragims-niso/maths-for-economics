import topicBank from '../../../content/topic-bank.json';
import { EquilibriumChart } from './EquilibriumChart';
import { useOfflineStatus } from './useOfflineStatus';

const REPO_URL = 'https://github.com/ibragims-niso/maths-for-economics';

const topicsPerYear = [1, 2, 3, 4].map(
  (year) => topicBank.filter((t) => t.coreYear === year).length,
);

export function App() {
  const status = useOfflineStatus();

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
          <span className={`status-dot status-dot--${status.tone}`} aria-hidden="true" />
          {status.message}
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
