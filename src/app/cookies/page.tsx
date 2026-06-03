import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";

export const metadata: Metadata = {
  title: "Politica Cookies",
  description:
    "Politica de cookies Western Import. Informații despre tipurile de cookies folosite, scopul lor și cum le poți gestiona.",
  alternates: {
    canonical: "/cookies",
  },
  openGraph: {
    title: "Politica Cookies — Western Import",
    description: "Politica de cookies Western Import.",
  },
};

export const dynamic = "force-dynamic";

export default async function CookiesPage() {
  const pageData = await getPageContent("cookies");

  if (pageData?.contentRo) {
    const content = pageData.contentRo;
    const isBlockContent = content.trim().startsWith("[");
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Politica Cookies" }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Politica Cookies</h1>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />
              {isBlockContent ? (
                <PageBlocks blocks={blocks} />
              ) : (
                <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Politica Cookies" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Politica Cookies
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Ultima actualizare: 20 mai 2026
            </p>

            {/* 1. Ce sunt cookies */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                1. Ce sunt cookies?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Cookies-urile sunt fișiere text de dimensiuni reduse stocate pe dispozitivul dumneavoastră
                (computer, tabletă, telefon) atunci când vizitați un site web. Ele permit site-ului să
                recunoască dispozitivul și să rețină informații despre vizita anterioară (de exemplu,
                preferințele de limbă sau produsele din coșul de cumpărături).
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Această politică explică tipurile de cookies utilizate pe westernimport.md, scopul
                lor și modul în care le puteți gestiona.
              </p>
            </section>

            {/* 2. Tipuri cookies */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                2. Tipuri de cookies utilizate
              </h2>

              {/* Strict necesare */}
              <div className="mb-6 p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🟢 Cookies strict necesare
                  </h3>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                    Întotdeauna active
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Aceste cookies sunt esențiale pentru funcționarea Site-ului și nu pot fi dezactivate.
                  Ele sunt setate doar în răspuns la acțiunile dumneavoastră (autentificare, adăugare în coș,
                  setări de securitate).
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Scop</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Durată</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">session_id</td>
                        <td className="py-2 pr-4">Menține sesiunea de autentificare</td>
                        <td className="py-2">Sesiune</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">cart</td>
                        <td className="py-2 pr-4">Reține produsele din coș</td>
                        <td className="py-2">30 zile</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">csrf_token</td>
                        <td className="py-2 pr-4">Protejează împotriva atacurilor CSRF</td>
                        <td className="py-2">Sesiune</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">theme</td>
                        <td className="py-2 pr-4">Reține preferința temă (light/dark)</td>
                        <td className="py-2">1 an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Funcționale */}
              <div className="mb-6 p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🔵 Cookies funcționale
                  </h3>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
                    Opționale
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Aceste cookies permit funcționalități îmbunătățite și personalizare, cum ar fi reținerea
                  limbii preferate, a regiunii sau a preferințelor de afișare.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Scop</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Durată</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">lang</td>
                        <td className="py-2 pr-4">Reține limba selectată</td>
                        <td className="py-2">1 an</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">recently_viewed</td>
                        <td className="py-2 pr-4">Afișează produsele vizualizate recent</td>
                        <td className="py-2">30 zile</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">wishlist</td>
                        <td className="py-2 pr-4">Reține produsele favorite</td>
                        <td className="py-2">1 an</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Analytics */}
              <div className="mb-6 p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🟡 Cookies de analiză (analytics)
                  </h3>
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full">
                    Opționale
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Aceste cookies ne ajută să înțelegem cum vizitatorii interacționează cu Site-ul,
                  colectând informații anonimizate: pagini vizitate, timp petrecut, sursa de trafic.
                  Folosim Google Analytics cu IP anonimizat.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Scop</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Durată</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">_ga</td>
                        <td className="py-2 pr-4">Identifică vizitatori unici (anonimizat)</td>
                        <td className="py-2">2 ani</td>
                      </tr>
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">_ga_*</td>
                        <td className="py-2 pr-4">Menține starea sesiunii analytics</td>
                        <td className="py-2">2 ani</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gid</td>
                        <td className="py-2 pr-4">Distinge vizitatorii în sesiuni diferite</td>
                        <td className="py-2">24 ore</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Marketing */}
              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    🟠 Cookies de marketing
                  </h3>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                    Opționale
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-3">
                  Aceste cookies sunt utilizate pentru a vă arăta reclame relevante pe alte site-uri
                  și pentru a măsura eficiența campaniilor noastre de marketing. Pot fi setate de
                  partenerii noștri de publicitate.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Cookie</th>
                        <th className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-semibold">Scop</th>
                        <th className="py-2 text-slate-700 dark:text-slate-300 font-semibold">Durată</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600 dark:text-slate-400">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-mono text-xs">_fbp</td>
                        <td className="py-2 pr-4">Pixel Facebook — remarketing</td>
                        <td className="py-2">3 luni</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-4 font-mono text-xs">_gcl_au</td>
                        <td className="py-2 pr-4">Google Ads — conversii</td>
                        <td className="py-2">3 luni</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 3. Gestionare */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                3. Cum gestionați cookies
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Puteți controla și gestiona cookies în mai multe moduri. Rețineți că dezactivarea
                anumitor cookies poate afecta funcționalitatea Site-ului.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li><strong>Bannerul de cookies</strong> — la prima vizită, puteți alege ce categorii de cookies acceptați.</li>
                <li><strong>Setările browserului</strong> — majoritatea browserelor permit blocarea sau ștergerea cookies.</li>
                <li><strong>Google Analytics Opt-out</strong> — instalați addon-ul oficial Google Analytics Opt-out.</li>
                <li><strong>Network Advertising Initiative</strong> — opt-out de la cookies de marketing la networkadvertising.org/choices.</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Instrucțiuni pe browser:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Google Chrome</p>
                  <p className="text-slate-600 dark:text-slate-400">Setări → Confidențialitate și securitate → Cookies</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Mozilla Firefox</p>
                  <p className="text-slate-600 dark:text-slate-400">Opțiuni → Confidențialitate → Cookies</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Safari</p>
                  <p className="text-slate-600 dark:text-slate-400">Preferințe → Confidențialitate → Cookies</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Microsoft Edge</p>
                  <p className="text-slate-600 dark:text-slate-400">Setări → Cookies → Gestionare cookies</p>
                </div>
              </div>
            </section>

            {/* 4. Modifications */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                4. Modificări ale politicii
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Western Import își rezervă dreptul de a actualiza această politică oricând. Vom
                notifica modificările semnificative prin bannerul de cookies sau prin e-mail. Vă
                recomandăm să revisitați periodic această pagină.
              </p>
            </section>

            {/* 5. Contact */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                5. Contact
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Pentru întrebări legate de utilizarea cookies:{" "}
                <strong>privacy@westernimport.md</strong> | <strong>+373 69 466 585</strong>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
