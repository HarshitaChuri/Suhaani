/**
 * CycleRing — the app's signature visual motif.
 * A circular ring used to represent probability/risk scores, and later,
 * cycle-phase position. Ties the visual language back to the literal
 * subject matter: cycles.
 *
 * value: 0-1
 * label: text under the number (e.g. "risk score")
 * colorVar: CSS variable name for the arc color
 */
export default function CycleRing({ value = 0, label = "", size = 160, colorVar = "--color-primary" }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value);

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`var(${colorVar})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          fontFamily="var(--font-display)"
          fontSize={size * 0.22}
          fill="var(--color-text)"
        >
          {Math.round(value * 100)}%
        </text>
      </svg>
      {label && (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text-muted)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
