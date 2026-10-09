import type { Metadata } from 'next';

/**
 * The portal's document title and description. Without them every page had an
 * empty `<title>` (axe `document-title`, WCAG 2.4.2): a browser tab, history
 * entry or screen reader had nothing to name the page by.
 */
export const siteMetadata: Metadata = {
  title: { default: 'Talim Admin', template: '%s · Talim Admin' },
  description: 'The Talim administrator portal: schools, support desk, notifications and platform settings.',
};
