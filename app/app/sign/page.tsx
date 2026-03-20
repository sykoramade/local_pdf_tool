import { redirect } from 'next/navigation'

// Legacy route — all signing now happens in /workspace
export default function SignPage() {
  redirect('/workspace?tool=sign')
}
