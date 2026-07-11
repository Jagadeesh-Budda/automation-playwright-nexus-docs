import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class QuizReporter implements Reporter {
  totalFound = 0;
  passed = 0;
  failed = 0;
  failedRoutes: string[] = [];

  onTestBegin(test: TestCase) {
    if (test.title.includes('Validate Quiz')) {
      this.totalFound++;
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (test.title.includes('Validate Quiz')) {
      if (result.status === 'passed') {
        this.passed++;
      } else if (result.status === 'failed' || result.status === 'timedOut') {
        this.failed++;
        this.failedRoutes.push(test.title);
      }
    }
  }

  onEnd(result: FullResult) {
    const reportText = `
=======================================
         QUIZ VALIDATION REPORT        
=======================================
Total Quizzes Found: ${this.totalFound}
Passed Quizzes:      ${this.passed}
Failed Quizzes:      ${this.failed}
${this.failed > 0 ? `\nRoutes containing failures:\n${this.failedRoutes.map(r => `  - ${r}`).join('\n')}` : ''}
=======================================
`;
    console.log(reportText);
    
    // Also write to a file
    fs.writeFileSync(path.join(process.cwd(), 'quiz-validation-report.txt'), reportText);
  }
}

export default QuizReporter;
