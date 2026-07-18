'use client';
import type { RevisionAnalytics } from '../../lib/revisionEngine';

interface Props {
  data: RevisionAnalytics;
}

const SCORE_LABELS: Record<number, string> = { 1: 'Forgot', 2: 'Hard', 3: 'Okay', 4: 'Good', 5: 'Easy' };

function formatMinutes(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
}

export default function RevisionAnalytics({ data }: Props) {
  const maxVelocity = Math.max(...data.learningVelocity, 1);
  const weeklyTotal = data.timeSpent.weekly.reduce((sum, val) => sum + val, 0);
  const topModules = Object.entries(data.completionTrends.modules)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 4);

  return (
    <div className="analytics-panel">

      {/* Top stats row */}
      <div className="analytics-stats-grid">
        <div className="analytics-stat-card analytics-stat-card--green">
          <span className="analytics-stat-icon">🎯</span>
          <span className="analytics-stat-number">{data.retentionRate}%</span>
          <span className="analytics-stat-label">Retention Rate</span>
        </div>
        <div className="analytics-stat-card analytics-stat-card--blue">
          <span className="analytics-stat-icon">📋</span>
          <span className="analytics-stat-number">{data.totalReviews}</span>
          <span className="analytics-stat-label">Total Reviews</span>
        </div>
        <div className="analytics-stat-card analytics-stat-card--purple">
          <span className="analytics-stat-icon">⭐</span>
          <span className="analytics-stat-number">{data.avgReviewScore.toFixed(1)}</span>
          <span className="analytics-stat-label">Avg Review Score</span>
        </div>
        <div className="analytics-stat-card analytics-stat-card--orange">
          <span className="analytics-stat-icon">🔥</span>
          <span className="analytics-stat-number">{data.reviewStreak}</span>
          <span className="analytics-stat-label">Review Streak (days)</span>
        </div>
      </div>

      <div className="analytics-stats-grid analytics-stats-grid--secondary">
        <div className="analytics-stat-card analytics-stat-card--teal">
          <span className="analytics-stat-icon">⚡</span>
          <span className="analytics-stat-number">{data.readinessScore}</span>
          <span className="analytics-stat-label">Readiness Score</span>
        </div>
        <div className="analytics-stat-card analytics-stat-card--pink">
          <span className="analytics-stat-icon">⏱️</span>
          <span className="analytics-stat-number">{formatMinutes(weeklyTotal)}</span>
          <span className="analytics-stat-label">Study Time (last 8 weeks)</span>
        </div>
        <div className="analytics-stat-card analytics-stat-card--gray">
          <span className="analytics-stat-icon">📈</span>
          <span className="analytics-stat-number">{topModules.length}</span>
          <span className="analytics-stat-label">Tracked Modules</span>
        </div>
        <div className="analytics-stat-card analytics-stat-card--lime">
          <span className="analytics-stat-icon">🧭</span>
          <span className="analytics-stat-number">{data.weeklyReport.consistency}</span>
          <span className="analytics-stat-label">Active Days This Week</span>
        </div>
      </div>

      {/* Weekly velocity bar chart */}
      <div className="analytics-section">
        <h3 className="analytics-section-title">📈 Learning Velocity (8 weeks)</h3>
        <div className="analytics-velocity-chart">
          {data.learningVelocity.map((val, i) => (
            <div key={i} className="analytics-velocity-col">
              <div className="analytics-velocity-bar-wrapper" title={`${val} review${val !== 1 ? 's' : ''}`}>
                <div
                  className="analytics-velocity-bar"
                  style={{ height: `${(val / maxVelocity) * 100}%` }}
                />
              </div>
              <span className="analytics-velocity-label">W{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time spent */}
      <div className="analytics-section">
        <h3 className="analytics-section-title">⏱️ Time Spent</h3>
        <div className="analytics-timegrid">
          {Object.entries(data.timeSpent.daily).slice(-7).map(([date, minutes]) => (
            <div key={date} className="analytics-timegrid-item">
              <span className="analytics-timegrid-date">{date.slice(5)}</span>
              <span className="analytics-timegrid-value">{minutes}m</span>
            </div>
          ))}
        </div>
        <p className="analytics-section-sub">Weekly totals: {formatMinutes(weeklyTotal)}</p>
      </div>

      {/* Completion trends */}
      <div className="analytics-section">
        <h3 className="analytics-section-title">🎯 Completion Trends</h3>
        {topModules.length === 0 ? (
          <p className="analytics-section-sub">No completion data available yet.</p>
        ) : (
          <div className="analytics-trends-list">
            {topModules.map(([moduleId, summary]) => (
              <div key={moduleId} className="analytics-trends-item">
                <span>{moduleId}</span>
                <span>{summary.score}% score, {summary.attempts} attempts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly report */}
      <div className="analytics-section analytics-section--report">
        <h3 className="analytics-section-title">📋 Weekly Learning Report</h3>
        <div className="analytics-report-grid">
          <div className="analytics-report-card">
            <strong>Next Week Goal</strong>
            <p>{data.weeklyReport.nextWeekGoal}</p>
          </div>
          <div className="analytics-report-card">
            <strong>Recommended Revision</strong>
            <p>{data.weeklyReport.recommendedRevision.join(', ') || 'Nothing recommended yet'}</p>
          </div>
          <div className="analytics-report-card">
            <strong>Biggest Improvement</strong>
            <p>{data.weeklyReport.biggestImprovement?.lessonTitle ?? 'N/A'}</p>
          </div>
          <div className="analytics-report-card">
            <strong>Estimated Finish</strong>
            <p>{data.weeklyReport.estimatedFinishDate ?? 'TBD'}</p>
          </div>
        </div>
        <div className="analytics-report-summary">
          <strong>Needs Attention:</strong> {data.weeklyReport.needsAttention.map(topic => topic.lessonTitle).join(', ') || 'None'}
        </div>
      </div>

      {/* Instructor summary */}
      {data.instructor?.hardestLessons?.length > 0 && (
        <div className="analytics-section analytics-section--instructor">
          <h3 className="analytics-section-title">👩‍🏫 Instructor Insights</h3>
          <p className="analytics-section-sub">Hardest lessons based on class averages.</p>
          <div className="analytics-instructor-list">
            {data.instructor.hardestLessons.map(item => (
              <div key={item.lessonId} className="analytics-instructor-item">
                <span>{item.lessonId}</span>
                <span>{item.score}% avg score</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak topics */}
      {data.weakTopics.length > 0 && (
        <div className="analytics-section">
          <h3 className="analytics-section-title">⚠️ Weak Topics</h3>
          <div className="analytics-weak-list">
            {data.weakTopics.map(topic => (
              <div key={topic.lessonId} className="analytics-weak-item">
                <div className="analytics-weak-info">
                  <span className="analytics-weak-title">{topic.lessonTitle}</span>
                  <span className="analytics-weak-reason">{topic.reason.replace('-', ' ')}</span>
                </div>
                <div className="analytics-weak-score">
                  <span
                    className="analytics-score-badge"
                    style={{
                      background: topic.avgScore < 2 ? '#fef2f2' : topic.avgScore < 3 ? '#fefce8' : '#f0fdf4',
                      color:      topic.avgScore < 2 ? '#dc2626'  : topic.avgScore < 3 ? '#ca8a04'  : '#16a34a',
                    }}
                  >
                    {topic.avgScore.toFixed(1)} / 5
                  </span>
                  <span className="analytics-weak-reviews">{topic.reviewCount} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forgotten lessons */}
      {data.forgottenLessons.length > 0 && (
        <div className="analytics-section analytics-section--danger">
          <h3 className="analytics-section-title">💔 Forgotten Lessons ({data.forgottenLessons.length})</h3>
          <p className="analytics-section-sub">Overdue by more than 7 days or scored 1 on last review.</p>
          <div className="analytics-forgotten-list">
            {data.forgottenLessons.map(lid => (
              <span key={lid} className="analytics-forgotten-tag">{lid}</span>
            ))}
          </div>
        </div>
      )}

      {/* Review history */}
      {data.reviewHistory.length > 0 && (
        <div className="analytics-section">
          <h3 className="analytics-section-title">🕓 Recent Review History</h3>
          <div className="analytics-history-list">
            {data.reviewHistory.slice(0, 10).map((item, i) => (
              <div key={i} className="analytics-history-item">
                <span className="analytics-history-lesson">{item.lessonId}</span>
                <span className="analytics-history-score">
                  {SCORE_LABELS[item.score] ?? item.score}
                </span>
                <span className="analytics-history-date">
                  {new Date(item.reviewedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
