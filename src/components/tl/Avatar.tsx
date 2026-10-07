import React from 'react';

/**
 * Up to two initials for a name ("Ada Obi" → "AO").
 *
 * @param name - The display name.
 * @returns The initials, upper-cased, or "?" for an empty name.
 */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

/**
 * A stable avatar tone (`tl-tone-N`) for an id, so the same person has the
 * same colour on every screen.
 *
 * @param id - A stable id.
 * @returns A tone class.
 */
export function avatarTone(id: string): string {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `tl-tone-${[1, 2, 3, 0, 5][hash % 5]}`;
}

/**
 * A round initials avatar on a stable tone (the portals' `Avatar`).
 * Decorative: the name is always shown beside it.
 *
 * @param props - The person and the size.
 * @param props.id - Stable id, for the tone.
 * @param props.name - Full name, for the initials.
 * @param props.size - Diameter in px.
 * @returns The avatar.
 */
export function Avatar({ id, name, size = 36 }: { id: string; name: string; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size / 3.1) }}
      className={`${avatarTone(id)} flex shrink-0 items-center justify-center rounded-full bg-tone-bg font-extrabold text-tone-fg`}
    >
      {initialsOf(name)}
    </span>
  );
}
