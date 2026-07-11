import http from 'k6/http';
import { sleep, check } from 'k6';

// Base URL of the deployed application or localhost
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  scenarios: {
    // 1. Smoke Test (Light load to check configuration)
    smoke: {
      executor: 'constant-vus',
      vus: 10,
      duration: '1m',
      exec: 'smokeTest',
    },
    // 2. Normal Load Test (100 users peak ramp-up)
    normal: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '3m', target: 50 },  // Ramp up to 50 users
        { duration: '7m', target: 100 }, // Peak normal load of 100 users
        { duration: '3m', target: 0 },   // Cool down to 0
      ],
      exec: 'normalTest',
    },
    // 3. Stress Test (Peak / Breaking point search up to 500 users)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 250 },
        { duration: '5m', target: 500 }, // Stress peak
        { duration: '3m', target: 0 },
      ],
      exec: 'stressTest',
    },
    // 4. Low-Volume Certificate Test (20-50 simultaneous certificate requests)
    certificate: {
      executor: 'constant-vus',
      vus: 5,
      duration: '1m',
      exec: 'certificateTest',
    },
  },
  thresholds: {
    // Tag-specific P95 / P99 latency gates
    'http_req_duration{name:validate}': ['p(95)<100', 'p(99)<200'],
    'http_req_duration{name:progress}': ['p(95)<120', 'p(99)<250'],
    'http_req_duration{name:certify}': ['p(95)<800', 'p(99)<1500'], // pdf / crypt takes a bit longer
    http_req_failed: ['rate<0.01'],                                // Global error rate < 1%
  },
};

// Realistic Module options to prevent single-route caching skew
const MODULES = [
  '01-js-ts-variables',
  '10-first-test',
  '11-navigating-clicking',
  '12-writing-assertions',
  '15-getbyrole',
  '16-assertions-deep',
  '24-what-are-poms',
  '30-custom-fixtures'
];

function getRandomModule() {
  return MODULES[Math.floor(Math.random() * MODULES.length)];
}

// Generate unique payload configurations per iteration
function generatePayloads() {
  const moduleId = getRandomModule();
  return {
    code: `test('Dynamic test run for ${moduleId}', async ({ page }) => {
      await page.goto('/course');
      await expect(page).toHaveTitle(/Aegis/);
    });`,
    moduleId,
    taskIndex: 0,
  };
}

// Helper to construct headers with unique learner ID
function getHeaders(vu, iter) {
  return {
    'Content-Type': 'application/json',
    'x-user-id': `student_load_${vu}_${iter || Math.floor(Math.random() * 10000)}`,
    'x-user-name': `Learner ${vu}`,
  };
}

// 1. Scenario: Smoke Test
export function smokeTest() {
  const headers = getHeaders(__VU, 1);
  const data = generatePayloads();
  
  const res = http.post(`${BASE_URL}/api/validate-code`, JSON.stringify(data), { 
    headers, 
    tags: { name: 'validate' } 
  });
  
  check(res, {
    'validate: status is 200': (r) => r.status === 200,
    'validate: response has valid boolean': (r) => r.json().valid !== undefined,
  });
  sleep(1);
}

// 2. Scenario: Normal User Flow (Realthink-time simulated)
export function normalTest() {
  const headers = getHeaders(__VU, __ITER);
  const data = generatePayloads();

  // 1. Submit code for validation
  const valRes = http.post(`${BASE_URL}/api/validate-code`, JSON.stringify(data), { 
    headers,
    tags: { name: 'validate' }
  });
  check(valRes, { 
    'validate: status is 200': (r) => r.status === 200,
    'validate: response has valid boolean': (r) => r.json().valid !== undefined,
  });

  // Randomized student think-time (0.5 to 2.5 seconds)
  sleep(Math.random() * 2 + 0.5);

  // 2. Save Progress
  const progPayload = JSON.stringify({ moduleId: data.moduleId, score: 100 });
  const progRes = http.post(`${BASE_URL}/api/progress`, progPayload, { 
    headers,
    tags: { name: 'progress' }
  });
  check(progRes, { 
    'progress: status is 200': (r) => r.status === 200,
    'progress: response has success': (r) => r.json().success === true,
  });

  sleep(Math.random() * 2 + 0.5);

  // 3. Query Progress Ledger
  const getProgRes = http.get(`${BASE_URL}/api/progress`, { 
    headers,
    tags: { name: 'progress' }
  });
  check(getProgRes, { 
    'progress_get: status is 200': (r) => r.status === 200,
    'progress_get: has progress list': (r) => r.json().progress !== undefined,
  });

  sleep(Math.random() * 3 + 1);
}

// 3. Scenario: Heavy stress test
export function stressTest() {
  const headers = getHeaders(__VU, __ITER);
  const data = generatePayloads();

  const valRes = http.post(`${BASE_URL}/api/validate-code`, JSON.stringify(data), { 
    headers,
    tags: { name: 'validate' }
  });
  check(valRes, { 
    'validate: status is 200': (r) => r.status === 200,
    'validate: response has valid boolean': (r) => r.json().valid !== undefined,
  });

  const progPayload = JSON.stringify({ moduleId: data.moduleId, score: 100 });
  const progRes = http.post(`${BASE_URL}/api/progress`, progPayload, { 
    headers,
    tags: { name: 'progress' }
  });
  check(progRes, { 
    'progress: status is 200': (r) => r.status === 200 
  });

  sleep(Math.random() * 1 + 0.2); // Aggressive execution rate
}

// 4. Scenario: Low-Volume Certificate Generation
export function certificateTest() {
  const headers = getHeaders(__VU, __ITER);

  // A. Generate initial progress so they are eligible to claim certs
  const progPayload = JSON.stringify({ moduleId: '10-first-test', score: 100 });
  http.post(`${BASE_URL}/api/progress`, progPayload, { 
    headers,
    tags: { name: 'progress' }
  });

  sleep(1);

  // B. Claim Certificate
  const certPayload = JSON.stringify({ name: `Candidate ${__VU}`, path: 'all' });
  const certRes = http.post(`${BASE_URL}/api/certify`, certPayload, { 
    headers,
    tags: { name: 'certify' }
  });
  
  check(certRes, {
    'certify: status is 200': (r) => r.status === 200,
    'certify: returns certId': (r) => r.json().certId !== undefined,
    'certify: returns signature': (r) => r.json().signature !== undefined,
  });

  sleep(Math.random() * 4 + 2); // Simulated time before next download action
}
