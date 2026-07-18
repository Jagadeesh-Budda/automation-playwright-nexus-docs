import type { Metadata } from 'next';
import RevisionDashboard from '../../components/RevisionDashboard';

export const metadata: Metadata = {
  title: 'Revision Center — Playwright Automation Academy',
  description: 'Your personal learning memory system. Bookmarks, notes, highlights, and spaced repetition to reinforce what you learn.',
};

export default function RevisionCenterPage() {
  return (
    <main id="revision-center-main" className="revision-center-page">
      <RevisionDashboard />
    </main>
  );
}
