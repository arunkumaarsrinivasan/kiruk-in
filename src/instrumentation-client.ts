// Runs before hydration — the earliest client code Next.js offers.
// Lapse (animation inspector) patches rAF / performance.now / Date.now / timers
// for the whole document, so it must load before framer-motion caches them.
// Dev only: the branch is dead-code-eliminated from production builds.
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { mountLapse } = require('@aiforui/lapse/panel') as typeof import('@aiforui/lapse/panel')
  mountLapse()
}
