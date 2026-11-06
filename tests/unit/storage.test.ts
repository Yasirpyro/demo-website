import { describe, it, expect } from 'vitest';
import { createStorageAdapter, readVersioned, writeVersioned } from '../../src/lib/storage-adapter';
const isNumbers = (input: unknown): input is number[] =>
  Array.isArray(input) && input.every((v: unknown) => typeof v === 'number');
describe('StorageAdapter', () => {
  it('uses local storage with a versioned envelope', () => {
    localStorage.clear();
    const adapter = createStorageAdapter(() => localStorage);
    writeVersioned(adapter, 'rdemo:v1:test', [1, 2]);
    expect(adapter.mode).toBe('local');
    expect(readVersioned(adapter, 'rdemo:v1:test', isNumbers, [])).toEqual([1, 2]);
  });
  it('works for the session when storage is unavailable', () => {
    const adapter = createStorageAdapter(() => {
      throw new Error('Denied');
    });
    adapter.setItem('a', 'value');
    expect(adapter.mode).toBe('memory');
    expect(adapter.getItem('a')).toBe('value');
    adapter.removeItem('a');
    expect(adapter.getItem('a')).toBeNull();
  });
  it.each(['not json', '{"version":0,"data":[]}', '{"version":1,"data":["bad"]}'])(
    'isolates corrupt and incompatible data: %s',
    (raw) => {
      localStorage.clear();
      const adapter = createStorageAdapter(() => localStorage);
      adapter.setItem('bad', raw);
      adapter.setItem('good', 'keep');
      expect(readVersioned(adapter, 'bad', isNumbers, [])).toEqual([]);
      expect(adapter.getItem('bad')).toBeNull();
      expect(adapter.getItem('good')).toBe('keep');
    },
  );
  it('retains writes and notifies once after a quota failure', () => {
    let fail = false;
    const storage: Storage = {
      length: 0, clear: () => {},
      key: () => null,
      getItem: () => null,
      setItem: () => {
        if (fail) throw new Error('Quota');
      },
      removeItem: () => {},
    };
    const adapter = createStorageAdapter(() => storage);
    let notices = 0;
    const stop = adapter.subscribe(() => notices++);
    fail = true;
    adapter.setItem('a', 'first');
    adapter.setItem('b', 'second');
    expect(adapter.getItem('a')).toBe('first');
    expect(notices).toBe(1);
    stop();
  });
  it('retains previously read data when reads later fail', () => {
    let fail = false;
    const storage: Storage = {
      length: 1, clear: () => {},
      key: () => null,
      getItem: () => {
        if (fail) throw new Error('Denied');
        return 'saved';
      },
      setItem: () => {},
      removeItem: () => {},
    };
    const adapter = createStorageAdapter(() => storage);
    expect(adapter.getItem('a')).toBe('saved');
    fail = true;
    expect(adapter.getItem('a')).toBe('saved');
    expect(adapter.mode).toBe('memory');
  });
});
