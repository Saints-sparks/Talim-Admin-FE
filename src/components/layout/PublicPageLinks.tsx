import React from 'react';
import { PUBLIC_PAGES } from '@/lib/publicPages';
import { cn } from '@/lib/utils';

/** Props for {@link PublicPageLinks}. */
export interface PublicPageLinksProps {
  /** Classes for the list (layout: a row on the sign-in page, a column in settings). */
  className?: string;
  /** Classes for each link. */
  linkClassName?: string;
}

/**
 * Links to the public privacy policy, terms of service and help pages on
 * www.mytalim.com, each opening in a new tab.
 *
 * @param props - See {@link PublicPageLinksProps}.
 * @param props.className - Classes for the list.
 * @param props.linkClassName - Classes for each link.
 * @returns The navigation list.
 */
export function PublicPageLinks({ className, linkClassName }: PublicPageLinksProps) {
  return (
    <nav aria-label="Talim policies and help">
      <ul className={cn('m-0 flex list-none p-0', className)}>
        {PUBLIC_PAGES.map((page) => (
          <li key={page.href}>
            <a
              href={page.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'rounded text-[#003366] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003366] focus-visible:ring-offset-2',
                linkClassName,
              )}
            >
              {page.label}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
