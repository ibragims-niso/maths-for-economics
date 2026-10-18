import type { RouteObject } from 'react-router';
import { AboutPage } from './AboutPage';
import { AppShell } from './AppShell';
import { HomePage } from './HomePage';
import { NotFoundPage, PracticePage, ProgressPage, SettingsPage } from './PlaceholderPages';

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'practice', element: <PracticePage /> },
      { path: 'progress', element: <ProgressPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
