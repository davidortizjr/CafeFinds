import { useCountUp } from '../lib/motion.js'

// A number that counts up on first show. Renders a dash when there is nothing to count.
export default function CountUp({ value, decimals = 0 }) {
  const shown = useCountUp(typeof value === 'number' ? value : 0, { decimals })
  return <>{typeof value === 'number' ? shown : '–'}</>
}
