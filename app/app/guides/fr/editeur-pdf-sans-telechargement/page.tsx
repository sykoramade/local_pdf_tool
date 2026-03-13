import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Éditeur PDF Sans Téléchargement — Protégez Vos Données RGPD',
  description:
    'Modifiez vos PDF directement dans le navigateur, sans aucun envoi vers un serveur. Zéro risque RGPD pour vos contrats, formulaires et documents médicaux.',
  alternates: { canonical: 'https://localpdf.tools/guides/fr/editeur-pdf-sans-telechargement' },
}

export default function GuideEditeurPdfSansTelechargement() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          ← Éditeur PDF
        </Link>
        <span className="text-gray-300">|</span>
        <Link href="/compress" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          Compresser un PDF
        </Link>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500">Guide</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Éditeur PDF Sans Téléchargement — Protégez Vos Données RGPD
        </h1>
        <p className="text-lg text-gray-500 mb-10">
          La plupart des outils PDF en ligne téléchargent vos documents sur des serveurs distants.
          Pour les entreprises soumises au RGPD, cela représente un risque de conformité souvent
          sous-estimé. Ce guide explique ces risques et comment le traitement côté client les supprime
          entièrement.
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Les risques RGPD des outils PDF en ligne
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            L&apos;article 5, paragraphe 1, point c) du RGPD impose le principe de minimisation des
            données : les données personnelles doivent être &ldquo;adéquates, pertinentes et limitées à ce
            qui est nécessaire&rdquo;. Lorsqu&apos;un collaborateur télécharge un document sur un outil PDF en
            ligne, il transfère son contenu à un tiers — souvent sans base contractuelle appropriée
            et sans contrôle sur la durée de conservation.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            Les problèmes les plus fréquents en pratique :
          </p>
          <ul className="space-y-3 text-gray-600 text-sm mb-4">
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Le document est transmis vers des serveurs potentiellement situés hors de l&apos;EEE, sans mécanisme de transfert approprié au sens de l&apos;article 46 du RGPD.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>La plupart des outils conservent les fichiers téléchargés pendant 30 à 60 minutes — voire davantage — sur leurs serveurs, hors de votre contrôle.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Les services gratuits peuvent exploiter le contenu des documents à des fins d&apos;analyse ou d&apos;entraînement de modèles d&apos;IA, selon leurs conditions d&apos;utilisation.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">✗</span>
              <span>Sans contrat de sous-traitance en bonne et due forme, tout transfert de données personnelles vers l&apos;outil constitue un traitement potentiellement illicite au regard du RGPD.</span>
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Ces risques concernent tout particulièrement les secteurs où les documents contiennent des
            données sensibles : ressources humaines, santé, juridique, finance. Dans ces domaines, un
            simple téléchargement vers un outil PDF non qualifié peut constituer une violation de
            données à notifier à la CNIL.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Comment le traitement côté client élimine ces risques
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            LocalPDF effectue toutes les opérations — modification de texte, fusion, découpage,
            compression — entièrement dans le navigateur de l&apos;utilisateur. Le fichier est chargé en
            mémoire, traité avec des bibliothèques JavaScript (pdf-lib), puis téléchargé directement
            sur l&apos;appareil. Aucun octet n&apos;est envoyé à un serveur.
          </p>
          <ul className="space-y-3 text-gray-600 text-sm mb-4">
            <li className="flex gap-3">
              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
              <span>Aucune donnée personnelle ne quitte l&apos;appareil. L&apos;infrastructure de LocalPDF ne reçoit jamais le contenu du document.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
              <span>Aucun contrat de sous-traitance n&apos;est nécessaire avec LocalPDF pour le traitement des documents, puisque LocalPDF ne traite aucune donnée personnelle issue de vos fichiers.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
              <span>Aucune conservation côté serveur : le document n&apos;existe que dans la mémoire du navigateur pendant la session, puis disparaît à la fermeture de l&apos;onglet.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 shrink-0 mt-0.5">✓</span>
              <span>Les règles sur les transferts transfrontaliers ne s&apos;appliquent pas au contenu du document, car celui-ci ne franchit aucune frontière.</span>
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Cette architecture constitue une mise en oeuvre concrète du principe de privacy by design
            (article 25 du RGPD). Ce n&apos;est pas une déclaration de politique — c&apos;est une propriété
            technique vérifiable.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Cas d&apos;usage courants
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Contrats et documents juridiques</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Les juristes, notaires et services juridiques traitent régulièrement des contrats,
                des accords de confidentialité et des actes. Télécharger ces documents sur un service
                tiers peut violer des obligations de confidentialité professionnelle. Un traitement
                local dans le navigateur évite ce problème.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Formulaires RH et documents salariaux</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Contrats de travail, bulletins de paie, évaluations : ces documents contiennent
                des données personnelles sensibles. Leur traitement local dans le navigateur
                garantit qu&apos;ils ne quittent jamais le système d&apos;information de l&apos;entreprise.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Documents médicaux</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Les professionnels de santé manipulent des formulaires de consentement, des ordonnances
                et des comptes rendus médicaux. Ces données relèvent de la catégorie particulière
                au sens de l&apos;article 9 du RGPD. LocalPDF permet de les modifier sans aucune
                transmission externe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Documents fiscaux et comptables</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Factures, relevés bancaires, déclarations fiscales : les experts-comptables et
                services financiers peuvent travailler sur ces fichiers dans LocalPDF sans risque
                de divulgation involontaire à un prestataire non qualifié.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Ce que LocalPDF conserve — et ce qu&apos;il ne conserve pas
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Si vous créez un compte LocalPDF (facultatif), seule votre adresse e-mail est enregistrée.
            Nous utilisons Supabase pour l&apos;authentification et Stripe pour la facturation. Aucun de
            ces services ne reçoit le contenu de vos documents. Le traitement des fichiers s&apos;effectue
            exclusivement dans la mémoire de votre navigateur.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Nous utilisons délibérément le terme &ldquo;conforme RGPD par conception&rdquo; plutôt que
            &ldquo;conforme au RGPD&rdquo; au sens absolu. La conformité globale de votre organisation dépend
            de vos propres processus. Ce que nous garantissons : LocalPDF ne transfère aucun contenu
            de document à des tiers.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          <div className="bg-indigo-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Modifier des PDFs sans télécharger</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cliquez sur le texte, modifiez-le, téléchargez. Sans upload. Entièrement dans le navigateur.
            </p>
            <Link
              href="/"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors inline-block text-sm min-h-[44px]"
            >
              Ouvrir l&apos;éditeur PDF →
            </Link>
          </div>
          <div className="bg-indigo-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Fusionner ou découper des PDFs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Combinez plusieurs fichiers ou extrayez des pages. Sans upload, sans compte requis.
            </p>
            <Link
              href="/merge"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-lg transition-colors inline-block text-sm min-h-[44px]"
            >
              Fusionner des PDFs →
            </Link>
          </div>
        </div>
      </article>
    </main>
  )
}
