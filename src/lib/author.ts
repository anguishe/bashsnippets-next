// Single public identity for the site's author — used by the about page,
// article schema, and bylines so the name and sameAs never drift.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bashsnippets.xyz';

export const AUTHOR = {
  name: 'Travis',
  alternateName: 'Anguishe',
  // '@id' lets every page's Person node resolve to one entity in the graph
  '@id': `${SITE_URL}/about`,
  url: `${SITE_URL}/about`,
  sameAs: [
    'https://github.com/anguishe',
    'https://www.youtube.com/@BashSnippets',
    'https://dev.to/bashsnippets',
    'https://medium.com/@anguisheh1',
  ],
} as const;
