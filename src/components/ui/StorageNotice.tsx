import { useSyncExternalStore } from 'react';
import { storageAdapter } from '../../lib/storage-adapter';
export function StorageNotice() {
  const mode = useSyncExternalStore(
    storageAdapter.subscribe,
    () => storageAdapter.mode,
    () => 'local',
  );
  return mode === 'memory' ? (
    <div className="storage-notice" role="status">
      Your browser cannot save data. Everything works for this session; data will be lost when you
      close it.
    </div>
  ) : null;
}
