import { redirect } from 'next/navigation'

// Legacy route — merge will be in /workspace (Sprint 17+); redirect home for now
export default function MergePage() {
  redirect('/')
}
