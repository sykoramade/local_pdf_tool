import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { DM_Serif_Display } from 'next/font/google'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})
const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://localpdf.tools'),
  title: {
    default: 'LocalPDF — Free PDF Editor, No Upload Required',
    template: '%s | LocalPDF',
  },
  description:
    'Edit, compress, and manage PDF files directly in your browser. Your files never leave your computer. No account, no paywall, no surprises.',
  keywords: ['pdf editor', 'pdf compressor', 'edit pdf online', 'pdf editor no upload', 'free pdf tools'],
  openGraph: {
    siteName: 'LocalPDF',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${dmSerifDisplay.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
