# LMS API Load Testing with k6

This directory contains automated k6 scripts to load-test the dynamic backend services of the LMS. These tests focus on high-priority endpoints that experience concurrent traffic under user cohorts:

1. **Code Validation API** (`/api/validate-code`)
2. **Progress Sync API** (`/api/progress`)
3. **Certificate Generation API** (`/api/certify`)

---

## Prerequisites

Install k6 on your system:
- **Windows (Chocolatey)**: `choco install k6`
- **Mac (Homebrew)**: `brew install k6`
- **Linux (Debian/Ubuntu)**: 
  ```bash
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5D85C1C2DA0047D
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/repository/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```

---

## Running the Tests

To run the load testing scenarios against localhost (make sure both dev/production servers are running on port 3000):

```bash
npm run test:load
```

### Specifying Target Environments & Exporting Reports
To run the tests against a staging URL and output a detailed JSON report for CI/CD tracking:

```bash
k6 run -e BASE_URL=https://staging.lms-platform.com --summary-export=load-report.json tests/load/k6_load_test.js
```

---

## Test Scenarios & Pacing

The script implements **realistic student behavior models**:
- **Unique Identities**: Virtual users submit requests under distinct IDs (`student_load_${__VU}_${__ITER}`) to bypass caching and replicate exact ledger load.
- **Randomized Module Distribution**: Requests target a rotating list of active modules, simulating varied classroom progression.
- **Human Think-Time**: Requests are spaced using randomized pauses (`sleep(Math.random() * 2 + 0.5)`) rather than continuous execution.

The script runs four scenarios:
1. **Smoke Test (`smoke`)**:
   - Runs with **10 concurrent Virtual Users (VUs)** for **1 minute**.
2. **Normal Load Test (`normal`)**:
   - Ramps up from 0 to **100 VUs** over 13 minutes.
3. **Stress Test (`stress`)**:
   - Aggressively ramps up to **500 VUs** over 15 minutes.
4. **Certificate Test (`certificate`)**:
   - Constant load of **5 VUs** for **1 minute** to test cryptographic sign calculations.

---

## Performance Targets & Quality Gates
Metrics are segmented using endpoint tags. The tests fail in CI/CD if any gate target is breached:

| API Target | Tag | P95 Threshold | P99 Threshold | Max Error Rate |
|---|---|---|---|---|
| **Code Validation** | `validate` | `< 100 ms` | `< 200 ms` | `< 1%` |
| **Progress Sync** | `progress` | `< 120 ms` | `< 250 ms` | `< 1%` |
| **Certificate Claim** | `certify` | `< 800 ms` | `< 1500 ms` | `< 1%` |

---

## Interpreting Failures

If k6 reports threshold breaches, check the following components:
1. **High P95/P99 latency on `validate`**: Indicates CPU bottlenecks during AST parsing or validator rule evaluations.
2. **High latency/failures on `progress`**: Indicates SQLite database write locks, connection pool exhaustion, or Prisma transaction queue blocks under concurrency.
3. **High latency on `certify`**: Typically caused by slow HMAC signature generation or layout generation delays.
4. **Failure Rate > 1.0%**: Indicates server-side crashes (check PM2/Next logs for `EADDRINUSE`, database locking exceptions, or timeout warnings).
