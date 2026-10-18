import type { RouteObject } from 'react-router';
import { AboutPage } from './AboutPage';
import { AppShell } from './AppShell';
import { HomePage } from './HomePage';
import { NotFoundPage } from './NotFoundPage';
import { SettingsPage } from './settings/SettingsPage';

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
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      {
        path: 'formulas',
        lazy: () => import('./FormulasPage').then((m) => ({ Component: m.FormulasPage })),
      },
      {
        // Topic content is the largest part of the app, so it loads only when a topic opens.
        path: 'topic/:id',
        lazy: () => import('./TopicPage').then((m) => ({ Component: m.TopicPage })),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
