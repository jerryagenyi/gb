import { describe, expect, it } from 'vitest';
import { legacyRedirects } from '@/lib/legacy-redirects';

const dest = (source: string) => legacyRedirects.find((r) => r.source === source)?.destination;

describe('legacy WP redirects', () => {
  it('maps old pages to the matching section', () => {
    expect(dest('/about')).toBe('/#about');
    expect(dest('/research')).toBe('/#research');
    expect(dest('/podcast')).toBe('/#research');
    expect(dest('/contact')).toBe('/#connect');
    expect(dest('/connect')).toBe('/#connect');
  });

  it('sends blog URLs home for now', () => {
    expect(dest('/blog')).toBe('/');
    expect(dest('/on-setting-goals')).toBe('/');
    expect(dest('/should-you-change-your-accent')).toBe('/');
  });

  it('never uses permanent redirects (Phase 3 reclaims these URLs)', () => {
    expect(legacyRedirects.every((r) => r.permanent === false)).toBe(true);
  });
});
