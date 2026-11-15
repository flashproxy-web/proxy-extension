import { z } from 'zod';

import type { Credentials } from '@/shared/model';

import { VAULT } from './config';

const sealedSchema = z.object({ iv: z.array(z.number()), ct: z.array(z.number()) });
type Sealed = z.infer<typeof sealedSchema>;

const credentialsSchema = z.object({ username: z.string(), password: z.string() });

const CIPHER = 'AES-GCM';
const encoder = new TextEncoder();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(VAULT.db, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(VAULT.store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function keyStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const req = fn(db.transaction(VAULT.store, mode).objectStore(VAULT.store));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

let key: Promise<CryptoKey> | null = null;

function masterKey(): Promise<CryptoKey> {
  key ??= (async () => {
    const existing = await keyStore<CryptoKey | undefined>('readonly', (store) =>
      store.get(VAULT.keyId)
    );
    if (existing) return existing;
    const created = await crypto.subtle.generateKey(
      { name: CIPHER, length: VAULT.keyBits },
      false,
      ['encrypt', 'decrypt']
    );
    await keyStore('readwrite', (store) => store.put(created, VAULT.keyId));
    return created;
  })();
  key.catch(() => (key = null));
  return key;
}

const storageKey = (id: string) => VAULT.prefix + id;

export async function saveSecret(id: string, value: unknown): Promise<void> {
  const iv = crypto.getRandomValues(new Uint8Array(VAULT.ivBytes));
  const ct = await crypto.subtle.encrypt(
    { name: CIPHER, iv, additionalData: encoder.encode(id) },
    await masterKey(),
    encoder.encode(JSON.stringify(value))
  );
  const sealed: Sealed = { iv: Array.from(iv), ct: Array.from(new Uint8Array(ct)) };
  await chrome.storage.local.set({ [storageKey(id)]: sealed });
}

export async function readSecret<T>(id: string, schema: z.ZodType<T>): Promise<T | null> {
  const stored = await chrome.storage.local.get(storageKey(id));
  const sealed = sealedSchema.safeParse(stored[storageKey(id)]);
  if (!sealed.success) return null;
  try {
    const plain = await crypto.subtle.decrypt(
      { name: CIPHER, iv: new Uint8Array(sealed.data.iv), additionalData: encoder.encode(id) },
      await masterKey(),
      new Uint8Array(sealed.data.ct)
    );
    const parsed = schema.safeParse(JSON.parse(new TextDecoder().decode(plain)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const removeSecret = (id: string) => chrome.storage.local.remove(storageKey(id));

export const saveCredentials = (id: string, credentials: Credentials) =>
  saveSecret(id, credentials);

export const readCredentials = (id: string): Promise<Credentials | null> =>
  readSecret(id, credentialsSchema);

export const removeCredentials = (id: string) => removeSecret(id);
