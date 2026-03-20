import { redirect } from 'next/navigation'

// Legacy route — split will be in /workspace (Sprint 17+); redirect home for now
export default function SplitPage() {
  redirect('/')
}
