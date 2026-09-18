'use client';

/** One slice of the audience donut. */
export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * The audience breakdown donut. Renders a flat grey ring when the total is
 * zero, rather than inventing slices.
 *
 * @param props - The slices and their total.
 * @param props.data - The slices, in draw order.
 * @param props.total - The sum the centre label shows.
 * @returns The chart element.
 */
export function DonutChart({ data, total }: { data: DonutSlice[]; total: number }) {
  const r = 50;
  const cx = 68;
  const cy = 68;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;

  return (
    <svg viewBox="0 0 136 136" role="img" aria-label="Recipients by user type" className="h-32 w-32 shrink-0">
      {total <= 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
      ) : (
        data.map((slice) => {
          const ratio = slice.value / total;
          const dash = ratio * circumference;
          const offset = accumulated * circumference;
          accumulated += ratio;
          return (
            <circle
              key={slice.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })
      )}
      <text x={cx} y={cy - 7} textAnchor="middle" fontSize={14} fontWeight={700} fill="#101828">
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize={11} fill="#667085">
        Total
      </text>
    </svg>
  );
}
