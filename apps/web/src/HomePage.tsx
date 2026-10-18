import type { ReactNode } from 'react';
import topicBank from '../../../content/topic-bank.json';
import { CurriculumMap, TopicIndex } from './CurriculumMap';
import { EquilibriumChart } from './EquilibriumChart';
import { InstallHint } from './InstallHint';
import type { OfflineStatus } from './offline-status';
import { useInstallOption } from './useInstallOption';

/** The five Phase 1 topics (docs/08-roadmap.md), in the order a student meets them. */
const FIRST_TOPIC_IDS = ['F04', 'F05', 'FM01', 'C107', 'C109'];
const firstTopics = FIRST_TOPIC_IDS.flatMap((id) => topicBank.filter((t) => t.id === id));

export function HomePage({ menu, status }: { menu: ReactNode; status: OfflineStatus }) {
  const installOption = useInstallOption();

  return (
    <>
      <header>
        <div className="topbar">
          <h1>Maths for Economics</h1>
          {menu}
        </div>
        <p className="lead">
          The mathematics of an economics degree, from first year to final year, explained through
          what economists do with it.
        </p>
      </header>

      <main>
        <section aria-labelledby="map-heading">
          <h2 id="map-heading">Your degree, topic by topic</h2>
          <CurriculumMap writing={FIRST_TOPIC_IDS} />
          <TopicIndex writing={FIRST_TOPIC_IDS} />
        </section>

        <section className="card" aria-labelledby="install-heading">
          <h2 id="install-heading">Keep it on your phone</h2>
          <p className="status" role="status">
            <span className={`status-dot status-dot--${status.tone}`} aria-hidden="true" />
            {status.message}
          </p>
          <InstallHint option={installOption} />
        </section>

        <section aria-labelledby="first-topics-heading">
          <h2 id="first-topics-heading">First topics</h2>
          <p>Being written now. Each starts with what economists use it for.</p>
          <ol className="topic-list">
            {firstTopics.map((t) => (
              <li key={t.id}>
                <span className="topic-title">{t.title}</span>
                <span className="topic-use">{t.economicUse}</span>
              </li>
            ))}
          </ol>
          <EquilibriumChart />
        </section>
      </main>
    </>
  );
}
