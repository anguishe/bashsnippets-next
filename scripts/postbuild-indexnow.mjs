// Production deploys only: submit the sitemap to IndexNow after every build.
// Wraps submit-indexnow.mjs; any failure is logged, never fails the deploy.
if (process.env.VERCEL_ENV !== 'production') {
  console.log('[IndexNow] skipped — not a production build');
  process.exit(0);
}
try {
  await import('./submit-indexnow.mjs');
} catch (err) {
  console.warn('[IndexNow] submission failed (non-fatal):', err?.message ?? err);
}
