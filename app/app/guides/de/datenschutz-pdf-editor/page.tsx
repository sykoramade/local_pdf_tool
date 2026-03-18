import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datenschutz-konformer PDF-Editor — Dokumente ohne Upload bearbeiten',
  description:
    'PDFs bearbeiten ohne Hochladen. LocalPDF verarbeitet alle Dateien direkt im Browser — kein Server, keine Datenweitergabe, keine DSGVO-Risiken.',
  alternates: { canonical: 'https://localpdf.tools/guides/de/datenschutz-pdf-editor' },
}

export default function GuideDatenschutzPdfEditor() {
  return (
    <main className="min-h-screen" style={{ background: '#0b0d14' }}>
      <nav style={{ background: '#0b0d14', borderBottom: '1px solid rgba(255,255,255,.08)' }} className="px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          ← PDF-Editor
        </Link>
        <span style={{ color: 'rgba(255,255,255,.15)' }}>|</span>
        <Link href="/compress" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
          PDF komprimieren
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-400">Ratgeber</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Datenschutz-konformer PDF-Editor — Dokumente ohne Upload bearbeiten
        </h1>
        <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,.5)' }}>
          Die meisten Online-PDF-Tools laden Ihre Dokumente auf fremde Server hoch. Für Unternehmen,
          die der DSGVO unterliegen, ist das ein unterschätztes Datenschutzrisiko. Dieser Ratgeber
          erklärt, welche Risiken dabei entstehen und wie browserbasierte Verarbeitung das Problem
          vollständig beseitigt.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            DSGVO-Risiken beim Hochladen von PDFs
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Artikel 5 Absatz 1 Buchstabe c DSGVO verlangt, dass personenbezogene Daten auf das
            notwendige Maß beschränkt werden (Datenminimierung). Wer ein Dokument bei einem
            Online-Dienst hochlädt, überträgt dessen Inhalt an einen Dritten — oft ohne
            Auftragsverarbeitungsvertrag (AVV), ohne Kenntnis des Serverstandorts und ohne
            Kontrolle über die Speicherdauer.
          </p>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            In der Praxis entstehen dabei regelmäßig folgende Probleme:
          </p>
          <ul className="space-y-3 text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Das Dokument wird auf Server übertragen, die möglicherweise außerhalb des EWR betrieben werden — ohne angemessenes Schutzniveau nach Art. 46 DSGVO.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Der Anbieter speichert hochgeladene Dateien häufig für 30 bis 60 Minuten oder länger — in dieser Zeit liegt das Dokument außerhalb Ihrer Kontrolle.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Kostenlose Dienste können Dokumentinhalte für eigene Zwecke — etwa KI-Training oder Analyse — verwenden, wenn die Nutzungsbedingungen dies erlauben.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Ohne AVV ist die Übermittlung personenbezogener Daten an den Drittanbieter in der Regel eine rechtswidrige Verarbeitung im Sinne der DSGVO.</span>
            </li>
          </ul>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Dieses Risiko tritt besonders dann auf, wenn Mitarbeitende Verträge, Gehaltsabrechnungen,
            Krankenunterlagen oder andere sensible Dokumente mit einem Online-Tool bearbeiten, ohne
            dass die Rechtsabteilung oder der Datenschutzbeauftragte davon Kenntnis hat.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Wie clientseitige Verarbeitung das Risiko eliminiert
          </h2>
          <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            LocalPDF verarbeitet alle PDF-Vorgänge — Bearbeiten, Zusammenführen, Aufteilen,
            Komprimieren — vollständig im Browser des Nutzers. Die Datei wird in den Arbeitsspeicher
            des Browsers geladen, mit JavaScript (pdf-lib) verarbeitet und direkt als Download
            ausgegeben. Es werden keine Bytes an einen Server übertragen.
          </p>
          <ul className="space-y-3 text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Kein personenbezogenes Datum verlässt das Gerät. LocalPDF empfängt zu keinem Zeitpunkt Dokumentinhalte.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Kein AVV mit LocalPDF erforderlich — da keine Verarbeitung personenbezogener Daten aus Dokumenten durch LocalPDF stattfindet.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Keine serverseitige Speicherung: Das Dokument existiert ausschließlich im Browser-Speicher, solange der Tab geöffnet ist.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✓</span>
              <span>Keine grenzüberschreitende Datenübermittlung — es gibt schlicht nichts zu übermitteln.</span>
            </li>
          </ul>
          <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Dies ist kein Marketingversprechen, sondern eine technische Eigenschaft der Architektur.
            Über die Entwicklerkonsole des Browsers lässt sich jederzeit nachprüfen, dass bei der
            Dokumentbearbeitung kein Upload stattfindet.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Anwendungsfälle in der Praxis
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Verträge und rechtliche Dokumente</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Anwaltskanzleien, Notariate und Rechtsabteilungen bearbeiten regelmäßig Verträge,
                NDAs und Schriftsätze. Das Hochladen solcher Dokumente bei einem Drittdienst kann
                Vertraulichkeitspflichten verletzen. Mit einem Browser-basierten Tool entsteht
                dieses Problem nicht.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>HR-Dokumente und Personalakten</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Arbeitsverträge, Gehaltsabrechnungen und Beurteilungen enthalten sensible
                Mitarbeiterdaten. Werden diese lokal im Browser bearbeitet, verlassen sie
                zu keinem Zeitpunkt die Infrastruktur des Unternehmens.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Medizinische Dokumente</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Arztpraxen, Kliniken und Pflegeeinrichtungen verwalten Patientenformulare,
                Einwilligungserklärungen und Befundberichte. Diese Dokumente fallen unter
                Art. 9 DSGVO (besondere Kategorien personenbezogener Daten). Eine lokale
                Verarbeitung im Browser vermeidet jegliche unkontrollierte Weitergabe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'rgba(255,255,255,.8)' }}>Behördenformulare und Steuerunterlagen</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
                Steuerberater, Buchhalter und Verwaltungsmitarbeitende bearbeiten Formulare
                mit Steuernummern, Bankverbindungen und anderen schützenswerten Daten.
                LocalPDF ermöglicht diese Arbeit, ohne dass Daten das Gerät verlassen.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">
            Was LocalPDF speichert — und was nicht
          </h2>
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
            Wer ein optionales LocalPDF-Konto erstellt, gibt lediglich eine E-Mail-Adresse an.
            Für Authentifizierung nutzen wir Supabase, für Zahlungsabwicklung Stripe. Keiner dieser
            Dienste erhält Dokumentinhalte. Die Dateiverarbeitung findet ausschließlich im
            Arbeitsspeicher Ihres Browsers statt.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.6)' }}>
            Wir verwenden den Begriff &ldquo;datenschutzfreundlich&rdquo; bewusst — nicht &ldquo;DSGVO-konform&rdquo;.
            Die Konformität Ihres Gesamtprozesses hängt von Ihrer internen Organisation ab. Was wir
            garantieren können: LocalPDF überträgt keine Dokumentinhalte an Dritte.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <div className="rounded-xl p-6" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
            <h3 className="font-semibold text-white mb-2">PDFs ohne Upload bearbeiten</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
              Text anklicken, bearbeiten, herunterladen. Kein Upload. Vollständig im Browser.
            </p>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors inline-block text-sm min-h-[44px]"
            >
              PDF-Editor öffnen →
            </Link>
          </div>
          <div className="rounded-xl p-6" style={{ background: 'rgba(99,102,241,.08)', border: '1px solid rgba(99,102,241,.2)' }}>
            <h3 className="font-semibold text-white mb-2">PDFs zusammenführen oder teilen</h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,.6)' }}>
              Mehrere Dateien zusammenführen oder Seiten extrahieren. Kein Upload erforderlich.
            </p>
            <Link
              href="/merge"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors inline-block text-sm min-h-[44px]"
            >
              PDFs zusammenführen →
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
