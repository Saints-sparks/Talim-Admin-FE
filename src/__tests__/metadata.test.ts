import { siteMetadata } from '@/app/metadata';

describe('site metadata', () => {
  it('gives every page a title (axe document-title)', () => {
    expect(siteMetadata.title).toEqual({ default: 'Talim Admin', template: '%s · Talim Admin' });
    expect(siteMetadata.description).toBeTruthy();
  });
});
