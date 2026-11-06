export interface StorageAdapter {
  readonly mode: 'local' | 'memory';
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  subscribe(listener: () => void): () => void;
}

export function createStorageAdapter(
  resolveStorage: () => Storage = () => window.localStorage,
): StorageAdapter {
  const memory = new Map<string, string>();
  const listeners = new Set<() => void>();
  let storage: Storage | undefined;
  let mode: 'local' | 'memory' = 'local';
  const fallback = () => {
    if (mode === 'memory') return;
    mode = 'memory';
    listeners.forEach((listener) => listener());
  };
  try {
    storage = resolveStorage();
    const probe = 'rdemo:probe';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
  } catch {
    fallback();
  }
  return {
    get mode() {
      return mode;
    },
    getItem(key) {
      if (mode === 'local') {
        try {
          const value = storage?.getItem(key) ?? null;
          if (value === null) memory.delete(key);
          else memory.set(key, value);
          return value;
        } catch {
          fallback();
        }
      }
      return memory.get(key) ?? null;
    },
    setItem(key, value) {
      memory.set(key, value);
      if (mode === 'local') {
        try {
          storage?.setItem(key, value);
        } catch {
          fallback();
        }
      }
    },
    removeItem(key) {
      memory.delete(key);
      if (mode === 'local') {
        try {
          storage?.removeItem(key);
        } catch {
          fallback();
        }
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function readVersioned<T>(
  adapter: StorageAdapter,
  key: string,
  validate: (input: unknown) => input is T,
  initial: T,
): T {
  const raw = adapter.getItem(key);
  if (raw === null) return initial;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'version' in parsed &&
      parsed.version === 1 &&
      'data' in parsed &&
      validate(parsed.data)
    )
      return parsed.data;
  } catch {
    /* Damaged data is isolated to its own key. */
  }
  adapter.removeItem(key);
  return initial;
}

export function writeVersioned<T>(adapter: StorageAdapter, key: string, data: T) {
  adapter.setItem(key, JSON.stringify({ version: 1, data }));
}

export const storageAdapter = createStorageAdapter();
