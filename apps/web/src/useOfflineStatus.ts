import { useRegisterSW } from 'virtual:pwa-register/react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { describeOfflineStatus, type OfflineStatus, type SaveState } from './offline-status';

/** After this long without a saved copy, say so instead of "Saving…" forever. */
const SLOW_AFTER_MS = 30_000;

function subscribeOnline(onChange: () => void) {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

const canSave = () => 'serviceWorker' in navigator;

export function useOfflineStatus(): OfflineStatus {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine);
  const [ready, setReady] = useState(
    () => canSave() && Boolean(navigator.serviceWorker.controller),
  );
  const [failed, setFailed] = useState(() => !import.meta.env.DEV && !canSave());
  const [slow, setSlow] = useState(false);
  const {
    offlineReady: [offlineReady],
  } = useRegisterSW({ immediate: true, onRegisterError: () => setFailed(true) });

  useEffect(() => {
    if (import.meta.env.DEV || !canSave()) return;
    let active = true;
    // Resolves once a service worker is active, i.e. after the whole app was precached.
    navigator.serviceWorker.ready.then(() => active && setReady(true));
    const timer = window.setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const save: SaveState = import.meta.env.DEV
    ? 'dev'
    : ready || offlineReady
      ? 'saved'
      : failed
        ? 'failed'
        : slow
          ? 'slow'
          : 'saving';
  return describeOfflineStatus(save, online);
}
