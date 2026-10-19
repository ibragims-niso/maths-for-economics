import type { RouteObject } from 'react-router';
import { AppShell } from './AppShell';
import { HomePage } from './HomePage';
import { NotFoundPage } from './NotFoundPage';

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'practice',
        lazy: () => import('./practice/PracticePage').then((m) => ({ Component: m.PracticePage })),
      },
      {
        path: 'progress',
        lazy: () => import('./progress/ProgressPage').then((m) => ({ Component: m.ProgressPage })),
      },
      {
        // Settings checks imported programme files, which needs the schema library: load on demand.
        path: 'settings',
        lazy: () => import('./settings/SettingsPage').then((m) => ({ Component: m.SettingsPage })),
      },
      {
        path: 'about',
        lazy: () => import('./AboutPage').then((m) => ({ Component: m.AboutPage })),
      },
      {
        path: 'formulas',
        lazy: () => import('./FormulasPage').then((m) => ({ Component: m.FormulasPage })),
      },
      {
        // Topic content is the largest part of the app, so it loads only when a topic opens.
        path: 'topic/:id',
        lazy: () => import('./TopicPage').then((m) => ({ Component: m.TopicPage })),
      },
      {
        // The mentor's read-only page (R11); needs a connection.
        path: 'm/:token',
        lazy: () => import('./mentor/MentorPage').then((m) => ({ Component: m.MentorPage })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
