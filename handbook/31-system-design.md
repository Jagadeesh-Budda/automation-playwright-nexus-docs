# Chapter 39: System Design Whiteboard Scenarios

## Metadata
* **Part**: Part 8: Interview Preparation
* **Learning Objectives**:
  - Design automated testing architectures
  - Mock API boundaries
  - Manage execution reporting
* **Prerequisites**:
  - Chapter 30: Jenkins & Azure DevOps Pipelines
* **Estimated Reading Time**: 25 mins
* **Difficulty Level**: Advanced

---

## 1. Why This Matters
Senior SDET interviews test your system design skills. Knowing how to build robust, scalable automation architectures is key for these roles.

---

## 2. Conceptual Overview
This chapter guides you through senior SDET interview system design scenarios, focusing on designing testing architectures, API mocking, parallel run scheduling, and telemetry reporting. A key design principle is handling the dependency trade-off: over-mocking speeds up executions but compromises validation fidelity. Systems should partition verification into test tiers: fast hermetic suites with schema-validated API mocking, paired with staging environment integration pipelines executing complete end-to-end user journeys against live backend and database configurations.

### Execution Flow Diagram
```
[Code Repository] ──► Trigger PR Run ──► [Docker Execution Cluster]
                                                ├── Database Seeding API
                                                ├── Network Mocks (page.route)
                                                └── Telemetry (S3 Traces Bucket)
```

---

## 3. Implementation and Code Examples
```typescript
// Implemented whiteboard test infrastructure design configuration
export class TestInfrastructureDesign {
  readonly telemetryEndpoint: string;
  readonly workerLimit: number;
  readonly databaseSeedingUrl: string;

  constructor(env: string) {
    this.telemetryEndpoint = env === 'prod' ? 'https://telemetry.enterprise.com' : 'https://staging-telemetry.org';
    this.workerLimit = env === 'prod' ? 8 : 4;
    this.databaseSeedingUrl = env === 'prod' ? 'https://db-api.prod.com' : 'http://localhost:5000/db/seed';
  }

  async triggerTelemetryAlert(errorType: string, message: string) {
    console.log('Sending error trace to ' + this.telemetryEndpoint + ' - ' + errorType + ': ' + message);
    
    // Simulate real transport dispatch call (e.g. POST network alert)
    // await this.page.request.post(this.telemetryEndpoint + '/alerts', { data: { errorType, message } });
  }
}
```

---

## 4. Best Practices (Do's and Don'ts)

### Do
* Structure your design explanations around environment setup, execution, data seeding, and reporting.
* Advocate for API mocking to isolate UI tests and speed up builds.

### Don't
* Avoid complex architectures without first addressing data isolation.
* Avoid relying solely on mocked endpoints in design plans without introducing unmocked staging regression runs to capture integration bugs.

---

## 5. Chapter Summary
* Design decoupled architectures separating seeding, execution, and logs.
* Balance API routing mocks with actual integration environment checks.
* Store runtime trace archives to external cloud storage systems.

---

## 6. Exercises & Mini-Project

### Exercises
1. Sketch a whiteboard diagram representing the test pipeline for a payment application.

<details>
<summary>💡 Exercise 1 Solution</summary>

```
# Exercise 1 Solution:
# Draw a flowchart layout with components:
# 1. GitHub PR Hook -> 2. Jenkins Trigger -> 3. Docker Spawned ->
# 4. DB Seed API -> 5. Playwright execution -> 6. Publish Allure report
```

</details>

2. List the tools and strategies needed to test a microservices system.

<details>
<summary>💡 Exercise 2 Solution</summary>

```
# Exercise 2 Solution:
# 1. API mocking hermetic layer (mocking auth/third party search index).
# 2. Database seeding API context (seeding specific tenant users directly).
# 3. Native integration checks (no mock checkout payments suite).
```

</details>

### Mini-Project
Write an architecture design document for an automation suite.

<details>
<summary>💡 Mini-Project Solution</summary>

```
// Mini-Project Solution:
// High-level system layout outlining layers for:
// - Connection pooling limits
// - S3 trace archive uploads
```

</details>

---

## 7. Progressive Project: TodoMVC Automation
**TodoMVC Step**: Design a whiteboard architecture diagram for the TodoMVC testing system:
```
[Git PR Commit] ──► [Docker Run] ──► [Mocked localStorage State] ──► [Test Executed] ──► [JUnit XML Export]
```

---

## 8. Interview Q&A Preparation

**Q1: How do you handle test data generation in a parallel execution design?**
* **Expected Answer:** Use dynamic data factories to generate unique accounts for each test, seed data via APIs before tests run, or configure isolated databases for each worker process.


---

## 9. Chapter Cheat Sheet
```
Design layers: Seeding, Execution, Mocking, Telemetry
```