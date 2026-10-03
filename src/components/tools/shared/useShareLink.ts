'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useClipboard } from './useClipboard';
import { track } from '@/lib/track';

// A share link is `#s=` + base64url(JSON of the tool's inputs). The hash never reaches the
// server, so nothing a user types is sent anywhere by sharing. The decoder (#SC…), exit-code
// lookup (?code=) and open-ports explainer keep their own formats.
const PREFIX = '#s=';
// Long enough for any real command or PATH; short enough that a crafted link can't balloon state.
const MAX_STRING = 4000;
const MAX_ARRAY = 100;
// Above this the URL stops being pasteable into chat or a Stack Exchange answer.
const MAX_LINK = 6000;

type Primitive = string | number | boolean;
type Flat = Record<string, Primitive>;
export type ShareValue = Primitive | Primitive[] | Flat;

/**
 * One shareable input: its current value, its setter, and an optional extra check for values a
 * type check can't police (enums, nested shapes). The setter is typed `never` so any
 * `Dispatch<SetStateAction<T>>` fits; values are shape-checked before it is ever called.
 */
export type ShareField = readonly [unknown, (v: never) => void, ((v: unknown) => boolean)?];

function isPrimitive(v: unknown): v is Primitive {
  if (typeof v === 'string') return v.length <= MAX_STRING;
  if (typeof v === 'number') return Number.isFinite(v);
  return typeof v === 'boolean';
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Trust boundary: the hash is attacker-controlled. A value is accepted only when it has the
// same shape as the field's current value; objects merge key by key, unknown keys dropped.
function coerce(current: unknown, incoming: unknown): { ok: boolean; value?: unknown } {
  if (Array.isArray(current)) {
    const elemType = current.length ? typeof current[0] : 'string';
    if (!Array.isArray(incoming) || incoming.length > MAX_ARRAY) return { ok: false };
    if (elemType === 'object') return { ok: true, value: incoming }; // the field's validator must vouch for it
    return incoming.every((v) => isPrimitive(v) && typeof v === elemType) ? { ok: true, value: incoming } : { ok: false };
  }
  if (isPlainObject(current)) {
    if (!isPlainObject(incoming)) return { ok: false };
    const merged: Record<string, unknown> = { ...current };
    for (const [k, v] of Object.entries(incoming)) {
      if (k in current && isPrimitive(v) && typeof v === typeof current[k]) merged[k] = v;
    }
    return { ok: true, value: merged };
  }
  if (current === null) return { ok: incoming === null || isPrimitive(incoming), value: incoming };
  return isPrimitive(incoming) && typeof incoming === typeof current ? { ok: true, value: incoming } : { ok: false };
}

function encode(obj: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(s: string): unknown {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
}

/** Allowed-values check for enum fields: `[mode, setMode, oneOf(MODES)]`. */
export function oneOf(values: readonly unknown[]) {
  return (v: unknown) => values.includes(v);
}

/** Every listed key of an object field must hold one of its allowed values. */
export function enumKeys(spec: Record<string, readonly unknown[]>) {
  return (v: unknown) => isPlainObject(v) && Object.entries(spec).every(([k, allowed]) => allowed.includes(v[k]));
}

/**
 * Restores the listed fields from a `#s=` link on first render and returns `copyLink`, which
 * writes the current values into the URL and copies it. The hash is written only on copy, so
 * typing never floods the history.
 */
export function useShareLink(fields: Record<string, ShareField>) {
  const { copied, copy } = useClipboard();
  const [error, setError] = useState('');
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith(PREFIX)) return;
    let data: unknown;
    try {
      data = decode(hash.slice(PREFIX.length));
    } catch {
      return; // a mangled link opens the tool in its default state rather than breaking it
    }
    if (!isPlainObject(data)) return;
    for (const [key, [current, set, check]] of Object.entries(fieldsRef.current)) {
      if (!(key in data)) continue;
      const { ok, value } = coerce(current, data[key]);
      if (ok && (!check || check(value))) (set as (v: unknown) => void)(value);
    }
    track('tool_share_opened');
  }, []);

  const copyLink = useCallback(async () => {
    const snapshot = Object.fromEntries(Object.entries(fieldsRef.current).map(([k, [v]]) => [k, v]));
    const hash = PREFIX + encode(snapshot);
    if (hash.length > MAX_LINK) {
      setError('Too much input for a share link. Trim the pasted text and try again.');
      return;
    }
    setError('');
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(null, '', url);
    if (await copy(url)) track('tool_share_copied');
  }, [copy]);

  return { copied, copyLink, error };
}
