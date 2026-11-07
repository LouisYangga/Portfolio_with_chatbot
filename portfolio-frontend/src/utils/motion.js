// Shared scroll-reveal settings.
// Short, small-offset fades that start ~200px before an element enters the
// viewport, so fast scrolling never lands on a blank screen.
export const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: 'easeOut', delay },
  viewport: { once: true, margin: '0px 0px 200px 0px' },
})
