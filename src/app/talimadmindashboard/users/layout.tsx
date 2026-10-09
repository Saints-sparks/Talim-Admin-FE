import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = { title: 'Users' };

/**
 * Names the user directory and user pages in the document title ("Users · Talim Admin").
 *
 * @param props - Standard children.
 * @param props.children - The active page.
 * @returns The children unchanged.
 */
export default function UsersLayout({ children }: { children: ReactNode }) {
  return children;
}
