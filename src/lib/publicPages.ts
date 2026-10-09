/** The public Talim site, where the policies and help pages live. */
export const PUBLIC_SITE_URL = 'https://www.mytalim.com';

/** A page on the public site that every Talim app links to (v1.5 addendum 2026-10-09). */
export interface PublicPage {
  label: string;
  href: string;
}

/** Privacy policy, terms of service and help, in the order the apps list them. */
export const PUBLIC_PAGES: readonly PublicPage[] = [
  { label: 'Privacy policy', href: `${PUBLIC_SITE_URL}/privacy` },
  { label: 'Terms of service', href: `${PUBLIC_SITE_URL}/terms` },
  { label: 'Help and support', href: `${PUBLIC_SITE_URL}/support` },
];
