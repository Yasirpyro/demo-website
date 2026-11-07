import { useEffect, useState } from 'react';
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function OfflineStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    const offer = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', offer);
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      void navigator.serviceWorker
        .register('/sw.js')
        .then(() => navigator.serviceWorker.ready)
        .then(() => setReady(true))
        .catch(() => setFailed(true));
    }
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      window.removeEventListener('beforeinstallprompt', offer);
    };
  }, []);
  return (
    <div className="offline-status container" role="status">
      {!online
        ? 'Offline · Your menu, orders and reservations stay on this browser.'
        : ready
          ? 'Ready for offline visits.'
          : failed
            ? 'Offline setup unavailable in this browser. Online browsing still works.'
            : ''}
      {install && (
        <button
          onClick={() => {
            void install
              .prompt()
              .then(() => install.userChoice)
              .then(() => setInstall(null))
              .catch(() => setInstall(null));
          }}
        >
          Install restaurant app
        </button>
      )}
    </div>
  );
}
