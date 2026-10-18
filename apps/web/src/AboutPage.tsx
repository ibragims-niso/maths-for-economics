import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { BackIcon } from './icons';
import { CODE_LICENCE_URL, CONTENT_LICENCE_URL, REPO_URL, REPORT_PROBLEM_URL } from './links';

const builtOn = new Date(__BUILD_DATE__).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function AboutPage({ menu }: { menu: ReactNode }) {
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
        <h1>About</h1>
        <p className="lead">
          Maths for Economics teaches the mathematics of an economics degree, from first year to
          final year, through what economists do with it.
        </p>
        <p className="byline">Made by Ibrahim Nohbalayev.</p>
      </header>

      <main className="prose">
        <section aria-labelledby="about-status">
          <h2 id="about-status">Where it is now</h2>
          <p>
            The app is in development. The first five topics are being written; the rest of the 102
            follow over the coming terms.
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
          <h2 id="about-licences">Licences</h2>
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
            <li>Fonts: Literata and Public Sans, SIL Open Font License 1.1.</li>
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
      </main>
    </>
  );
}
