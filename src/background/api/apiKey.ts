import { z } from 'zod';

import { STORAGE_KEY } from '../config';
import { readSecret, removeSecret, saveSecret } from '../vault';

const apiKeySchema = z.string().min(1);

export const readApiKey = () => readSecret(STORAGE_KEY.apiKey, apiKeySchema);

export const saveApiKey = (key: string) => saveSecret(STORAGE_KEY.apiKey, key);

export const hasApiKey = async () => !!(await readApiKey());

export async function clearApiKey(): Promise<void> {
  await removeSecret(STORAGE_KEY.apiKey);
}

/** Drops the session left by the old flashproxy.com sign-in (builds before the API key). */
export async function dropLegacySession(): Promise<void> {
  await Promise.all([
    removeSecret(STORAGE_KEY.legacySession),
    chrome.storage.local.remove(STORAGE_KEY.legacySession),
  ]);
}
