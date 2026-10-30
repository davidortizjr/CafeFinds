import { useEffect, useState } from 'react'

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}

// Counts up from 0 to `target` with an ease-out. Jumps straight to the final
// value for anyone who has asked their device to reduce motion.
export function useCountUp(target, { duration = 800, decimals = 0 } = {}) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0)

  useEffect(() => {
    if (typeof target !== 'number' || Number.isNaN(target)) return
    if (prefersReducedMotion()) {
      setValue(target)
      return
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(target * (1 - Math.pow(1 - t, 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return Number(value).toFixed(decimals)
}
