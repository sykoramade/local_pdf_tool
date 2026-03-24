import type { Metadata } from 'next'
import Link from 'next/link'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: 'Blog — LocalPDF',
  description:
    'Long-form guides, privacy deep-dives, and release notes from the LocalPDF team.',
  alternates: { canonical: 'https://localpdf.tools/blog' },
}

const POSTS = [
  {
    slug: 'why-your-pdf-editor-shouldnt-need-a-server',
    title: "Why Your PDF Editor Shouldn't Need a Server",
    date: 'March 2026',
    excerpt:
      'Every time you upload a PDF to an online editor, you're trusting a stranger with your documents. Here's why that's a problem — and how browser-based processing fixes it.',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <NavBar current="blog" />

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '80px 24px 120px' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.28)',
            marginBottom: 32,
          }}
        >
          LocalPDF Blog
        </p>

        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#f4f6fc',
            margin: '0 0 48px',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          From the team
        </h1>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {POSTS.map(post => (
            <li
              key={post.slug}
              style={{
                borderTop: '1px solid rgba(255,255,255,.08)',
                padding: '32px 0',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,.28)',
                  marginBottom: 10,
                }}
              >
                {post.date}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: '#f4f6fc',
                    margin: '0 0 12px',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.3,
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#818cf8')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#f4f6fc')}
                >
                  {post.title}
                </h2>
              </Link>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, margin: '0 0 16px' }}>
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#818cf8',
                  textDecoration: 'none',
                }}
              >
                Read article →
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Footer />
    </main>
  )
}
