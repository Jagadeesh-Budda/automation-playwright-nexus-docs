// scripts/knowledge/knowledge-schema.ts

export interface SourceReference {
  file: string;          // Relative file path from workspace root
  heading: string;       // Contextual heading section where it was found
  lineRange: string;     // Line range (e.g., "120-164")
}

export interface CodeBlock {
  language: string;
  code: string;
  isExample: boolean;
  sourceReference: SourceReference;
}

export interface CommonMistake {
  title: string;
  wrong: string;
  correct: string;
  why: string;
  sourceReference: SourceReference;
}

export interface BestPractice {
  type: 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';
  title: string;
  content: string;
  sourceReference: SourceReference;
}

export interface LessonMetadata {
  id: string;
  title: string;
  url: string;
  group: string;
  level: number;
  estimatedMinutes: number;
  category: string;
  outcome?: string;
}

export interface LessonKnowledgeAtom {
  metadata: LessonMetadata;
  concepts: string[];
  headings: string[];
  codeBlocks: CodeBlock[];
  mermaidDiagrams: {
    diagram: string;
    sourceReference: SourceReference;
  }[];
  bestPractices: BestPractice[];
  commonMistakes: CommonMistake[];
  confidence: number; // Quality/Completeness score (0.0 to 1.0)
}

export interface IgnoredElement {
  lessonId: string;
  type: 'generic-summary' | 'placeholder-solution' | 'generic-warning' | 'quiz' | 'challenge-wrapper';
  reason: string;
  contentSnippet: string;
  sourceReference: SourceReference;
}

export interface ExtractionOutput {
  version: string;
  generatedAt: string;
  academyVersion: string;
  lessonCount: number;
  atoms: LessonKnowledgeAtom[];
}

export interface ExtractionReport {
  version: string;
  generatedAt: string;
  lessonsScanned: number;
  lessonsExtracted: number;
  knowledgeAtomsCount: number;
  totalCodeBlocks: number;
  totalMermaidDiagrams: number;
  totalBestPractices: number;
  totalCommonMistakes: number;
  ignoredScaffolding: {
    summaryTables: number;
    challengeWrappers: number;
    quizzes: number;
    genericWarnings: number;
  };
  errorsCount: number;
}

export interface ErrorLog {
  lessonId: string;
  filePath: string;
  error: string;
  stack?: string;
}
