import { CurriculumMap } from './CurriculumMap';
import { CODE_LICENCE_URL, CONTENT_LICENCE_URL, REPO_URL, REPORT_PROBLEM_URL } from './links';
import { READY, TOPIC_COUNT } from './topics';

const builtOn = new Date(__BUILD_DATE__).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function AboutPage() {
  return (
    <>
      <div className="practice-hero">
        <span className="map-tile">
          <CurriculumMap />
        </span>
        <div>
          <h1 id="about-heading">About</h1>
          <p className="topic-meta">
            {READY.size} of {TOPIC_COUNT} topics written. Each point is a topic; gold ones are
            ready.
          </p>
        </div>
      </div>

      <article className="sheet sheet--page about" aria-labelledby="about-heading">
        <div className="sheet-handle" aria-hidden="true" />
        <p className="lead">
          Maths for Economics teaches the mathematics of an economics degree, from first year to
          final year, through what economists do with it.
        </p>
        <p className="byline">Made by Ibrahim Nohbalayev.</p>

        <section aria-labelledby="about-status">
          <h2 id="about-status">Where it is now</h2>
          <p>
            The app is in development. Topics are written in curriculum order; the rest of the{' '}
            {TOPIC_COUNT} follow over the coming terms.
          </p>
        </section>

        <section aria-labelledby="about-how">
          <h2 id="about-how">How it is built</h2>
          <ul>
            <li>Every topic starts with how economists use it, then teaches the method.</li>
            <li>Answers and worked steps come from tested code, never from AI.</li>
            <li>The AI tutor explains ideas and methods. It never does your homework for you.</li>
            <li>Everything except AI help works without internet.</li>
          </ul>
        </section>

        <section aria-labelledby="about-free">
          <h2 id="about-free">Free and private</h2>
          <p>No ads, no accounts and no tracking. The app is free and its code is open source.</p>
        </section>

        <section aria-labelledby="about-licences">
          <h2 id="about-licences">Licences and credits</h2>
          <ul>
            <li>
              App code: <a href={CODE_LICENCE_URL}>MIT licence</a>.
            </li>
            <li>
              Topics, explanations and exercises:{' '}
              <a href={CONTENT_LICENCE_URL} className="nowrap">
                CC BY-NC-SA 4.0
              </a>
              .
            </li>
            <li>3D icons: 3dicons by Vijay Verma, CC0.</li>
            <li>Font: Poppins, SIL Open Font License 1.1.</li>
            <li>
              Topic lists follow public course information. No textbook, lecture or exam text is
              copied.
            </li>
          </ul>
        </section>

        <section aria-labelledby="about-version">
          <h2 id="about-version">Version</h2>
          <p>
            Draft (development) {__APP_VERSION__}. Built on {builtOn}.
          </p>
          <p>
            <a href={REPO_URL}>Source code on GitHub</a>
            <span aria-hidden="true"> · </span>
            <a href={REPORT_PROBLEM_URL}>Report a problem</a>
          </p>
        </section>
      </article>
    </>
  );
}
