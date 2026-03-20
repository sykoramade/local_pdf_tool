import { redirect } from 'next/navigation'

// Legacy route — all editing now happens in /workspace
export default function EditPage() {
  redirect('/workspace?tool=edit')
}
