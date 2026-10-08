export type LegacyRedirect = { source: string; destination: string; permanent: false };

const to = (destination: string, sources: string[]): LegacyRedirect[] =>
  sources.map((source) => ({ source, destination, permanent: false }));

export const legacyRedirects: LegacyRedirect[] = [
  ...to('/#about', ['/about', '/team', '/teaching']),
  ...to('/#research', ['/research', '/research-3', '/writing', '/podcast']),
  ...to('/#connect', ['/connect', '/contact', '/contact-genevieve']),
  ...to('/', [
    '/blog',
    '/on-setting-goals',
    '/should-you-change-your-accent',
    '/home',
    '/home-2',
    '/home-3',
    '/sample-page',
    '/tests',
  ]),
];
