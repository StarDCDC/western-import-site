import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";
import { Truck, RotateCcw, Package, Clock, ShieldCheck, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Livrare și Returnare",
  description:
    "Informații despre livrarea și returnarea produselor Western Import. Curier Chișinău, livrare națională, ridicare din magazin.",
  alternates: {
    canonical: "/shipping",
  },
  openGraph: {
    title: "Livrare și Returnare — Western Import",
    description: "Informații livrare și returnare produse Western Import.",
  },
};

export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const pageData = await getPageContent("shipping");

  if (pageData?.contentRo) {
    const content = pageData.contentRo;
    const isBlockContent = content.trim().startsWith("[");
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Livrare și Returnare" }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Livrare și Returnare</h1>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />
              {isBlockContent ? (
                <PageBlocks blocks={blocks} />
              ) : (
                <div
                  className="prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
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
          <Breadcrumb items={[{ label: "Livrare și Returnare" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Livrare și Returnare
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            {/* Cards livrare */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Truck className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Curier Chișinău</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gratuit</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Livrare în 1–2 zile lucrătoare</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <Package className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Curier național</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gratuit</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Livrare în 2–5 zile lucrătoare</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <MapPin className="text-primary mb-3" size={28} />
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Ridicare din magazin</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Gratuit</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">str. Podgorenilor 17, Chișinău</p>
              </div>
            </div>

            {/* Tabel prețuri livrare */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Truck size={20} className="text-primary" /> Tabel livrare
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Metodă</th>
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Zonă</th>
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Cost</th>
                      <th className="text-left py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">Termen</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-4">Curier</td>
                      <td className="py-3 px-4">Chișinău</td>
                      <td className="py-3 px-4">Gratuit <span className="text-xs text-green-600 dark:text-green-400">(transport gratuit oriunde)</span></td>
                      <td className="py-3 px-4">1–2 zile</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <td className="py-3 px-4">Curier</td>
                      <td className="py-3 px-4">Republica Moldova</td>
                      <td className="py-3 px-4">Gratuit</td>
                      <td className="py-3 px-4">2–5 zile</td>
                    </tr>
                    <tr className="border-t border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-4">Ridicare</td>
                      <td className="py-3 px-4">Magazin Chișinău</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400 font-semibold">Gratuit</td>
                      <td className="py-3 px-4">Aceleași zi*</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                * Ridicarea din magazin este disponibilă după confirmarea comenzii de către operator (maximum 2 ore).
              </p>
            </section>

            {/* Detalii livrare */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-primary" /> Detalii despre livrare
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Comenzile plasate până la ora 14:00 (luni–vineri) sunt expediate în aceeași zi.</li>
                <li>Comenzile plasate vineri după 14:00, sâmbătă sau duminică sunt expediate luni.</li>
                <li>La livrare, curierul așteaptă maximum 15 minute. Replanificarea costă 100 MDL.</li>
                <li>Livrare <strong>gratuită</strong> oriunde în Moldova, indiferent de suma comenzii.</li>
                <li>Vă rugăm să verificați coletul la primire. Dacă observați deteriorări, semnați proces-verbal cu curierul.</li>
                <li>Livrarea se face doar pe teritoriul Republicii Moldova.</li>
              </ul>
            </section>

            {/* Returnare */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <RotateCcw size={20} className="text-primary" /> Returnare și rambursare
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Conform legislației Republicii Moldova, aveți dreptul de a returna produsele în termen
                de <strong>14 zile calendaristice</strong> de la data primirii coletului.
              </p>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Condiții de returnare
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li>Produsul trebuie să fie în starea originală, neutilizat și nedeteriorat.</li>
                <li>Ambalajul trebuie să fie complet și intact, inclusiv accesorii și instrucțiuni.</li>
                <li>Factura sau dovada achiziției trebuie inclusă în colet.</li>
                <li>Produsele cu software activat sau conturi create nu pot fi returnate.</li>
                <li>Accesoriile desigilate (căști, încărcătoare etc.) nu pot fi returnate din motive de igienă.</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Procedura de returnare
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li>Contactați-ne la <strong>+373 69 466 585</strong> sau <strong>info@westernimport.md</strong> pentru a obține un număr de autorizație de returnare (RMA).</li>
                <li>Pregătiți produsul în ambalajul original cu toate accesoriile și factura.</li>
                <li>Adresați-vă la sediul nostru sau programați ridicarea de către curier (cost: 150 MDL, suportat de client).</li>
                <li>După primire, echipa noastră va inspecta produsul în maximum 3 zile lucrătoare.</li>
                <li>Rambursarea se va face prin aceeași metodă de plată folosită la achiziție, în maximum 14 zile lucrătoare.</li>
              </ol>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                Produse care NU pot fi returnate
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Software desigilat sau licențe activate.</li>
                <li>Produse personalizate sau gravate.</li>
                <li>Consumabile desigilate (cartușe, tonere, baterii).</li>
                <li>Produse cu defecțiuni cauzate de utilizare incorectă.</li>
              </ul>
            </section>

            {/* Garanție link */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldCheck size={20} className="text-primary" /> Garanție
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Toate produsele beneficiază de garanție. Pentru detalii complete, consultați{" "}
                <Link href="/warranty" className="text-primary hover:underline">
                  pagina de garanție
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
