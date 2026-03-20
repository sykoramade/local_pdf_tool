import { redirect } from 'next/navigation'

// Legacy route — all annotation now happens in /workspace
export default function AnnotatePage() {
  redirect('/workspace?tool=annotate')
}
