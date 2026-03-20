import { redirect } from 'next/navigation'

// Legacy route — compression now happens in /workspace
export default function CompressPage() {
  redirect('/workspace?tool=compress')
}
