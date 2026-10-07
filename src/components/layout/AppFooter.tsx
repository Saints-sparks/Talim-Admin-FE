import React from 'react';
import { versionLabel } from '@/lib/version';

/**
 * The console's footer: the product name and its version from
 * `package.json`, which support asks for first.
 *
 * @returns The footer.
 */
export function AppFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F1F1] px-6 py-4 text-xs font-medium text-[#6F6F6F]">
      <span>Talim Admin</span>
      <span data-testid="app-version">{versionLabel()}</span>
    </footer>
  );
}
