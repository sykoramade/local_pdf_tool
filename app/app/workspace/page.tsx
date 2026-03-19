import type { Metadata } from 'next'
import { Suspense } from 'react'
import WorkspaceShell from './WorkspaceShell'

export const metadata: Metadata = {
  title: 'Workspace — LocalPDF',
  description: 'Edit, sign, annotate, and compress PDFs entirely in your browser. No upload. No account required.',
  robots: { index: false },  // workspace is an app shell, not an SEO page
}

export default function WorkspacePage() {
  return (
    <Suspense>
      <WorkspaceShell />
    </Suspense>
  )
}
