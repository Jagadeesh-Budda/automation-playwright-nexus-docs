'use client';
import type { HeatmapDay } from '../../lib/revisionEngine';

interface Props {
  heatmap: HeatmapDay[];
}

const INTENSITY_CLASSES = ['', 'heatmap-l1', 'heatmap-l2', 'heatmap-l3', 'heatmap-l4'];

function intensityClass(sessions: number): string {
  if (sessions === 0) return '';
  if (sessions === 1) return INTENSITY_CLASSES[1];
  if (sessions === 2) return INTENSITY_CLASSES[2];
  if (sessions <= 4) return INTENSITY_CLASSES[3];
  return INTENSITY_CLASSES[4];
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function RevisionHeatmap({ heatmap }: Props) {
  // Group by week columns
  const weeks: HeatmapDay[][] = [];
  let week: HeatmapDay[] = [];

  for (let i = 0; i < heatmap.length; i++) {
    const day = heatmap[i];
    const dow = new Date(day.date).getDay();
    if (dow === 0 && week.length > 0) {
      weeks.push(week);
      week = [];
    }
    week.push(day);
  }
  if (week.length > 0) weeks.push(week);

  // Month labels
  const monthLabels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((w, col) => {
    const m = new Date(w[0].date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ label: MONTHS[m], col });
      lastMonth = m;
    }
  });

  const totalSessions = heatmap.reduce((s, d) => s + d.sessions, 0);

  return (
    <div className="heatmap-wrapper">
      <div className="heatmap-summary">
        <strong>{totalSessions}</strong> review sessions in the last year
      </div>

      <div className="heatmap-scroll">
        {/* Month labels */}
        <div className="heatmap-months">
          {monthLabels.map(({ label, col }) => (
            <span
              key={`${label}-${col}`}
              className="heatmap-month-label"
              style={{ gridColumn: col + 1 }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Day labels + grid */}
        <div className="heatmap-grid-wrapper">
          <div className="heatmap-day-labels">
            {DAYS.map((d, i) => (
              <span key={d} className={`heatmap-day-label ${i % 2 === 0 ? '' : 'heatmap-day-label--visible'}`}>{d}</span>
            ))}
          </div>

          <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
            {weeks.map((w, wi) => (
              <div key={wi} className="heatmap-week">
                {/* Pad start of first week */}
                {wi === 0 && w.length < 7 && (
                  Array.from({ length: 7 - w.length }).map((_, pi) => (
                    <div key={`pad-${pi}`} className="heatmap-cell heatmap-cell--empty" />
                  ))
                )}
                {w.map(day => (
                  <div
                    key={day.date}
                    className={`heatmap-cell ${intensityClass(day.sessions)}`}
                    title={`${day.date}: ${day.sessions} session${day.sessions !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span>Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={`heatmap-legend-cell ${cls}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
