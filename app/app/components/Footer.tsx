import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        background: '#080a10',
        borderColor: 'rgba(255,255,255,.06)',
        padding: '24px 0',
      }}
    >
      <div className="max-w-[900px] mx-auto px-8 flex items-center justify-between flex-wrap gap-3">
        <p
          className="text-[11px] leading-[1.65]"
          style={{ color: 'rgba(255,255,255,.2)' }}
        >
          &copy; 2026 Lounge Labs UG (haftungsbeschränkt). All rights reserved.
          &nbsp;&middot;&nbsp; Lounge Labs UG &middot; Registered in Germany &middot;&nbsp;
          <Link
            href="/about"
            className="transition-colors hover:text-white/60"
            style={{ color: 'rgba(255,255,255,.28)', textDecoration: 'none' }}
          >
            Imprint
          </Link>
          &nbsp;&middot;&nbsp;
          <Link
            href="/privacy-architecture"
            className="transition-colors hover:text-white/60"
            style={{ color: 'rgba(255,255,255,.28)', textDecoration: 'none' }}
          >
            Privacy Policy
          </Link>
        </p>
        <p
          className="text-right text-[9px] leading-[1.65] tracking-[0.04em]"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,.13)',
          }}
        >
          LocalPDF is a product of Lounge Labs UG<br />
          Made with love in Berlin.
        </p>
      </div>
    </footer>
  )
}
