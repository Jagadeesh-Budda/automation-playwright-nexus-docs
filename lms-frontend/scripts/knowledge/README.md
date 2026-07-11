# Phase 1: Knowledge Extraction Engine

This folder contains the foundation scripts and schema definitions for the Playwright Academy Knowledge Extraction pipeline. The objective of this engine is to ingest structured/unstructured files from the course and output highly normalized, atomized knowledge constructs for downstream publishing.

## Content Transformation Pipeline

```
[Playwright Academy Courses] (MDX + Module JSON + metadata.json)
              │
              ▼
[Knowledge Extraction Engine] (extract-knowledge.ts)
              │
              ▼
    [Knowledge Atoms] (output/knowledge-atoms.json)
              │
              ▼
   [Knowledge Database] ( downstream compilation & merge )
              │
              ▼
[Publishing Pipeline] (Handbooks, Interview Guides, Workbooks)
```

## Folder Structure

```
scripts/knowledge/
├── extract-knowledge.ts     # Main parsing and precedence-merging engine
├── knowledge-schema.ts      # Strongly-typed TypeScript interfaces
├── README.md                # This architecture documentation
└── output/                  # Generated assets folder
    ├── knowledge-atoms.json      # Structured list of extracted knowledge atoms
    ├── ignored-elements.json     # Details of all skipped/boilerplate items
    ├── extraction-report.json    # Run telemetry stats (JSON format)
    ├── extraction-report.md      # Human-readable markdown run report
    └── errors.json               # Details of errors (resumable validation)
```

## Merging & Precedence Rules

To construct a unified representation of the lesson, the parser resolves metadata properties deterministically using the following rules:
1. **Lesson ID & Metadata (Precedence: Normal)**: Base metadata (group, path slug, category, estimated duration) are loaded from `lms-frontend/src/data/metadata.json`.
2. **Pedagogical Configurations (Precedence: Normal)**: Objectives, exercises, and spec declarations are loaded from their respective modules in `lms-frontend/src/data/modules/`.
3. **Instructional Prose & Examples (Precedence: High)**: Custom definitions, code blocks, alerts, and headings are extracted directly from the `page.mdx` files. The raw MDX file is the source of truth for all content.

## Parsing Specification

### Supported Content (Extracted)
- **Concept definitions**: Parsed from section paragraphs.
- **API commands**: Collected from code syntax blocks.
- **Mermaid diagrams**: Captured from ` ```mermaid ` fences.
- **Best practices**: Extracted from blockquotes containing Note, Tip, or Important tags (`> [!NOTE]`, `> [!TIP]`, etc.).
- **Lesson-specific mistakes**: Parsed from custom `> [!WARNING]` blockquotes that contain specific wrong/correct patterns.

### Scaffolding Content (Omitted & Tagged)
- **Quizzes**: Skips JSX `<Quiz ... />` triggers.
- **Challenge wrappers**: Skips JSX `<CodeEditor ... />` or `<SolutionGate ... />` triggers.
- **Generic summary tables**: Skips tables matching boilerplate lists (e.g. "Saves hours of debugging...").
- **Generic warning blocks**: Skips warning callouts that contain duplicate text (e.g., "Brittle Implementation", "Missing Synchronization").
- **Placeholder solutions**: Skips code sections that contain reference solution comments instead of real implementation.
