import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent, getLocalizedContent } from "@/lib/pages";
import { ShieldCheck, Clock, Wrench, Phone, AlertTriangle, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Garanție",
  description:
    "Politica de garanție Western Import. Perioade de garanție, ce acoperă, procedura de service și contact.",
  alternates: {
    canonical: "/warranty",
  },
  openGraph: {
    title: "Garanție — Western Import",
    description: "Politica de garanție Western Import.",
  },
};

export default async function WarrantyPage() {
  const pageData = await getPageContent("warranty");

  if (pageData?.contentRo) {
    const { title, content } = getLocalizedContent(pageData, 'ro');
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: title }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{title}</h1>
              <div className="w-16 h-1 bg-primary rounded-full mb-8" />
              <div
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content || '' }}
              />
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
          <Breadcrumb items={[{ label: "Garanție" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Garanție
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            {/* Carduri perioade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-6 bg-gradient-to-br from-primary/10 to-blue-500/5 dark:from-primary/20 dark:to-blue-500/10 rounded-xl border border-primary/20">
                <ShieldCheck className="text-primary mb-3" size={32} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Produse noi</h3>
                <p className="text-3xl font-extrabold text-primary">12 luni</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Garanție completă pentru toate produsele noi achiziționate de la Western Import.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <Clock className="text-slate-600 dark:text-slate-400 mb-3" size={32} />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Produse refurbished</h3>
                <p className="text-3xl font-extrabold text-slate-600 dark:text-slate-400">6 luni</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Garanție pentru produsele refurbished/testate, acoperind defecțiunile tehnice majore.
                </p>
              </div>
            </div>

            {/* Ce acoperă */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" /> Ce acoperă garanția
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Defecțiuni de fabricație ale componentelor hardware",
                  "Probleme de funcționare apărute în condiții normale de utilizare",
                  "Defecțiuni ale ecranului (pixeli morți în garanție, linii, spoturi)",
                  "Probleme de alimentare sau încărcare nelegate la uzură",
                  "Defecțiuni ale porturilor și conectoarelor",
                  "Probleme software preinstalat (sistem de operare, drivere)",
                  "Defecțiuni ale tastaturii și trackpad-ului",
                  "Defecțiuni ale difuzoarelor, microfonului sau camerei web",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Ce NU acoperă */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500" /> Ce NU acoperă garanția
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Deteriorări cauzate de căderi, lovituri sau expunere la lichide",
                  "Deteriorări intenționate sau modificări neautorizate",
                  "Utilizarea produsului în afara parametrilor tehnici specificați",
                  "Baterii cu capacitate redusă din uzură normală",
                  "Accesorii consumabile (huse, cabluri, încărcătoare din afara kitului original)",
                  "Probleme software cauzate de instalări ulterioare de programe",
                  "Defecțiuni cauzate de viruși sau software malicious",
                  "Deteriorări estetice (zgârieturi, lovituri) care nu afectează funcționalitatea",
                  "Reparații efectuate de terțe părți neautorizate",
                  "Utilizarea de accesorii necompatibile",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Procedură service */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wrench size={20} className="text-primary" /> Procedura de service
              </h2>
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: "Contactați-ne",
                    desc: "Sunați la +373 69 466 585 sau scrieți pe info@westernimport.md. Descrieți problema și furnizați numărul comenzii.",
                  },
                  {
                    step: 2,
                    title: "Diagnosticare",
                    desc: "Echipa noastră va evalua problema și vă va confirma dacă este acoperită de garanție. Vă vom informa despre termenele estimate.",
                  },
                  {
                    step: 3,
                    title: "Predare produs",
                    desc: "Aduceți produsul la sediul nostru din str. Podgorenilor 17, Chișinău, sau programați ridicarea prin curier (gratuit în garanție).",
                  },
                  {
                    step: 4,
                    title: "Reparație sau înlocuire",
                    desc: "Timpul de reparare: 5–15 zile lucrătoare. Dacă produsul nu poate fi reparat, vă oferim un produs echivalent sau rambursarea.",
                  },
                  {
                    step: 5,
                    title: "Returnare produs",
                    desc: "Vă notificăm când produsul este gata și stabiliți modalitatea de returnare. Ridicarea de la sediu sau livrare prin curier.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Termeni garanție */}
            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Termeni și condiții garanție
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Garanția începe de la data achiziției, conform facturii.</li>
                <li>Factura originală sau dovada achiziției este obligatorie.</li>
                <li>Reparația nu prelungește perioada de garanție.</li>
                <li>Piețele și componentele înlocuite în garanție devin proprietatea Western Import.</li>
                <li>Western Import nu este responsabilă pentru pierderea datelor. Faceți backup înainte de predare.</li>
                <li>Dacă diagnosticul relevă o problemă neacoperită de garanție, costul diagnosticului este de 300 MDL.</li>
              </ul>
            </section>

            {/* Contact service */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Phone size={20} className="text-primary" /> Contact service
              </h2>
              <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600 dark:text-slate-400 text-sm">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Telefon service</p>
                    <p>+373 69 466 585</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">E-mail service</p>
                    <p>service@westernimport.md</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Adresă</p>
                    <p>str. Podgorenilor 17, Chișinău</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Program service</p>
                    <p>Luni–Vineri: 09:00–18:00</p>
                    <p>Sâmbătă: 10:00–15:00</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
