import { useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isDateInPeriod(date, logs) {
  return logs.some((log) => {
    const start = new Date(log.periodStartDate);
    const end = log.periodEndDate ? new Date(log.periodEndDate) : start;
    return date >= stripTime(start) && date <= stripTime(end);
  });
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export default function CycleCalendar({ logs = [], predictedNextStart }) {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDayOfMonth.getDay();

  const today = stripTime(new Date());
  const predicted = predictedNextStart ? stripTime(new Date(predictedNextStart)) : null;

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={navBtnStyle}>‹</button>
        <h3 style={{ fontSize: 18 }}>{MONTH_NAMES[month]} {year}</h3>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={navBtnStyle}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 8 }}>
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-mono)" }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const inPeriod = isDateInPeriod(date, logs);
          const isPredicted = predicted && isSameDay(date, predicted);
          const isToday = isSameDay(date, today);

          let bg = "transparent";
          let color = "var(--color-text)";
          if (inPeriod) { bg = "var(--color-primary)"; color = "white"; }
          else if (isPredicted) { bg = "var(--color-secondary)"; color = "white"; }

          return (
            <div
              key={i}
              title={isPredicted ? "Predicted next period" : undefined}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: bg,
                color,
                fontSize: 13,
                fontWeight: isToday ? 700 : 400,
                border: isToday ? "2px solid var(--color-primary)" : "2px solid transparent",
              }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 20, fontSize: 12, color: "var(--color-text-muted)" }}>
        <Legend swatch="var(--color-primary)" label="Logged period" />
        <Legend swatch="var(--color-secondary)" label="Predicted" />
      </div>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 10, height: 10, borderRadius: "50%", background: swatch }} />
      {label}
    </div>
  );
}

const navBtnStyle = {
  background: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  width: 32,
  height: 32,
  fontSize: 18,
  lineHeight: 1,
};
