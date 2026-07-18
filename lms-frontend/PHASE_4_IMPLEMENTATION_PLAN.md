# Phase 4 — Learning Insights (Implementation Plan)

## Objective
Deliver a Learning Insights experience that helps learners and instructors understand strengths, weaknesses, and progress trends. Key features: strong topic identification, time-spent analytics, completion trends, learning readiness score, and a weekly learning report.

---

## Scope & Deliverables
- API: `/api/revision/analytics` extended payload with new fields
  - `strongTopics`: lessons with high avg score and consistent reviews
  - `timeSpent`: daily and weekly minutes (last 8 weeks)
  - `completionTrends`: module completion percentage over time
  - `readinessScore`: composite readiness metric (0–100)
  - `weeklyReport`: summary object (strengths, weaknesses, minutes, reviews)

- Data Model
  - Add `StudySession` (if missing) to track `userId, lessonId?, minutes, startedAt, endedAt`
  - Use existing `masteryEvent`, `revisionSchedule`, `userProgress` for analytics inputs

- Engine
  - Extend `src/lib/revisionEngine.ts` with:
    - `getStrongTopics(history)`
    - `getCompletionTrends(progressHistory)`
    - `computeReadinessScore(analytics)`
    - `compileWeeklyReport(history, timeSpent)`

- API
  - Update `src/app/api/revision/analytics/route.ts` to include new data
  - Expose endpoints for `timeSpent` ingestion and weekly report export

- UI
  - Update `src/components/revision/RevisionAnalytics.tsx` to show:
    - `Strong Topics` panel (cards)
    - `Time Spent` chart (8-week sparkline)
    - `Completion Trends` chart (module-level)
    - `Readiness Score` card with color banding
    - `Weekly Report` summary with CTA (export PDF)

- Tests
  - Unit tests for `revisionEngine` new functions
  - API tests for analytics route
  - E2E tests for new UI panels and API endpoints

- Docs
  - Update `Futureplanning.md` to mark Phase 4 milestones
  - Add `PHASE_4_IMPLEMENTATION_PLAN.md` (this file)

---

## Timeline & Milestones (suggested)
- Week 1: Data model + Engine primitives + API changes (back-end)
- Week 2: UI components + unit tests
- Week 3: E2E tests + polish + docs + release notes

---

## Implementation Notes & Design Decisions
- Keep analytics computation deterministic and idempotent.
- Computations run on the server via `analytics/route.ts` to reduce client CPU usage and allow caching.
- `readinessScore` formula suggestion (weighted):
  - retentionRate (30%) + avgReviewScore (25%) + reviewStreak normalized (15%) + completionMomentum (20%) + inverse weakTopics count (10%).
- Store `StudySession` events with minute resolution; if not available, estimate time via `userProgress` timestamps.
- Charts use lightweight components (SVG/Canvas), avoid heavy client libs for performance.

### Architecture: split analytics engine & background computation
- Split the analytics responsibilities into focused modules to keep code small and testable. Suggested layout:

```
lib/
  analytics/
    readinessEngine.ts   // readinessScore and component metrics
    studySessionEngine.ts// ingest + time-aggregation helpers
    trendEngine.ts       // completion trends, velocity, projections
    reportEngine.ts      // weekly report composition
    instructorEngine.ts  // aggregation for instructor dashboards
  revisionEngine.ts      // thin orchestrator that composes above modules
```

- Background computation: precompute expensive signals (trend projections, cohort aggregates, weekly reports) asynchronously:
  - Lightweight metrics remain computed on-demand in `analytics/route.ts`.
  - Heavier analytics are produced by a background worker or scheduled job (e.g., cron, serverless function, or queue worker) and cached.
  - Invalidate cached precomputations on events (quiz completion, review, lesson completion) via an event hook to keep results fresh.
  - This keeps API latency low and allows the system to scale as users grow.

---

## Next Actions (I can take now)
- Add initial `StudySession` Prisma model and migration (if you want me to modify DB schema).
- Implement `getStrongTopics` and `computeReadinessScore` in `src/lib/revisionEngine.ts`.
- Update `src/app/api/revision/analytics/route.ts` to return the extended payload.
- Create UI placeholders in `src/components/revision/RevisionAnalytics.tsx`.

---

If you want me to start coding, tell me which of the "Next Actions" to prioritize. I can implement backend changes first (models + analytics engine + API) or start with the UI prototypes.

---

## Updates Requested (incorporated)
The plan has been expanded to include the following, per your detailed feedback.

### 1. `StudySession` definition (required)
- Purpose: reliable, auditable study-time capture for `timeSpent` analytics.
- Definition (required behavior):
  - Session starts when the learner opens a lesson or explicitly starts a study timer.
  - Track active activity and pause on idle (>120s of no interaction) or when the tab is hidden/minimized.
  - Resume when user returns (merge continuous segments into the same `StudySession`).
  - End session on lesson close or explicit stop; persist the record with `minutes` resolution.
  - Fields (Prisma model suggestion):
    ```prisma
    model StudySession {
      id        String   @id @default(cuid())
      userId    String
      lessonId  String?  // optional: session may be general (dashboard)
      minutes   Int
      startedAt DateTime
      endedAt   DateTime
      createdAt DateTime @default(now())
    }
    ```
  - Client instrumentation notes: debounce short interactions, ignore <10s segments, treat long-running video play as active only when player visibility and play state are present.

### 2. Expanded `readinessScore` design
- Move from a fixed-weight simple formula to a richer composite including:
  - Knowledge Coverage (coverage of required lessons / unlocked objectives)
  - Weak Topics (penalty for count/severity)
  - Module Completion % (momentum)
  - Quiz Consistency (variance and correctness over last N quizzes)
  - Revision Freshness (recency of reviews for due items)
  - Review Accuracy (avg review score)
  - Time Consistency (regularity of study sessions)
  - Drop-off Risk (trend-based predictor)
- Implementation: compute component scores (0–100), apply configurable weights, and normalize to 0–100.

### 3. Instructor Analytics (separate DTO)
- New API scope for instructor views exposing aggregated metrics:
  - Hardest lessons (avg score, fail-rate)
  - Average completion per module and cohort
  - Drop-off locations (lesson/chapter with highest exits)
  - Average quiz scores and attempts
  - Average study time (per lesson, per student)
- Access control: instructor endpoints must require proper role/permission.

### 4. Completion state model and trends
- Replace single `% complete` with explicit states per lesson/module:
  - `Started` → `In Progress` → `Completed` → `Mastered` → `Revised`
- Track timestamps for state transitions to calculate conversion funnel and time-to-mastery.

### 5. Rich Weekly Report (expanded)
- Report fields:
  - Achievements (badges, milestones)
  - Biggest Improvement (lesson/topic with largest score delta)
  - Needs Attention (weak topics requiring review)
  - Next Week Goal (automatic based on backlog and time budget)
  - Recommended Revision (top N lessons to revisit)
  - Estimated Finish Date (projection based on current pace)
  - Consistency (days active this week)
  - Time Distribution (pie or heatmap of time across topics)

### 6. Analytics caching and invalidation
- Add caching layer (in-memory or Redis) for compiled analytics per user.
  - TTL: 5 minutes by default.
  - Invalidations: explicit on review event, quiz completion, or lesson completion (emit invalidation hook).

### 7. Stable DTO for future AI integration
- Expose a compact analytics DTO (JSON schema) that includes computed metrics, weak/strong topic lists, time series, and raw counts to allow downstream AI/ML reuse without re-querying raw DB.

### 8. Future extensibility features (included)
- Learning velocity, burnout detection, inactivity warnings, goal completion prediction, weekly calendar, consistency score, personal-best streaks, difficulty heatmap — include as optional derived signals in the DTO so front-end or AI can consume them later.

---

## Small print & next steps
- I've incorporated these additions into the implementation plan file and the tracked TODOs. If you want, I can now:
  1. Add the `StudySession` Prisma model and migration.
  2. Implement server-side instrumentation endpoints (small client snippet + server ingest).
  3. Extend the `revisionEngine` with the richer `readinessScore` and `strongTopics`.
  4. Add a cached analytics layer and the stable DTO.

Pick which of the four tasks above to prioritize and I'll start coding.
