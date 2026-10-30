import CountUp from './CountUp.jsx'

// Labels come first in the markup (so the list reads "Visited, 12") and are
// shown below the numbers with CSS.
export default function Stats({ items }) {
  return (
    <dl className="stats">
      {items.map(({ label, value, decimals }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            <CountUp value={value} decimals={decimals} />
          </dd>
        </div>
      ))}
    </dl>
  )
}
