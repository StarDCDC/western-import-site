import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent, getLocalizedContent } from "@/lib/pages";
import { Users, Target, Heart, Shield, Award, TrendingUp, Star, Package, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Despre Noi",
  description:
    "Despre Western Import — povestea, misiunea, valorile și echipa din spatele magazinului de electronică premium din Chișinău.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Despre Noi — Western Import",
    description: "Povestea, misiunea și valorile magazinului de electronică premium din Chișinău.",
  },
};

export default async function AboutPage() {
  const pageData = await getPageContent("about");

  // If DB has content, render it dynamically
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
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-slate-600 dark:prose-p:text-slate-400
                  prose-a:text-primary hover:prose-a:underline
                  prose-strong:text-slate-800 dark:prose-strong:text-slate-200
                  prose-li:text-slate-600 dark:prose-li:text-slate-400
                  prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: content || '' }}
              />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fallback: original hardcoded content
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Despre Noi" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Despre Western Import
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-8" />

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Star size={20} className="text-primary" /> Povestea noastră
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la
                electronică de calitate la prețuri corecte, fără compromisuri. Am pornit de la un
                magazin mic pe o stradă liniștită din Chișinău, cu un laptop pe masă și o determinare
                uriașă.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                De ce „Western"? Pentru că aducem produse din occident — laptopuri, telefoane,
                monitoare și componente — seleculate cu grijă, testate minuțios și oferite cu garanție
                reală. Nu vindem „înghesuit", nu vindem „la noroc". Fiecare produs trece prin mâinile
                noastre înainte să ajungă la tine.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Astăzi, după 3 ani pe piață, suntem mândri de fiecare client mulțumit. Nu suntem cel
                mai mare magazin din Moldova — și nici nu dorim să fim. Preferăm să fim cel mai de încredere.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target size={20} className="text-primary" /> Misiune și valori
              </h2>
              <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 mb-6">
                <p className="text-slate-700 dark:text-slate-300 text-lg italic">
                  „Să oferim fiecărui moldovean acces la tehnologie de calitate, la un preț corect,
                  susținut de un serviciu clienți de excepție."
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Integritate</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Ce promitem, livrăm. Fără surprize ascunse, fără prețuri manipulative.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Award size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Calitate</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Fiecare produs e testat înainte de vânzare. Nu facem compromisuri.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <Heart size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Transparență</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Stările produselor sunt descrise clar. Știm ce vindem și de unde vine.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Users size={20} className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">Comunitate</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Clienții noștri sunt vecini, prieteni, colegi. Îi tratăm ca atare.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Western Import în cifre
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Users size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1000+</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Clienți mulțumiți</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Package size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">500+</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Produse în catalog</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Clock size={28} className="text-primary mx-auto mb-2" />
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">3</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ani pe piață</p>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                De ce Western Import?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Award size={24} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Calitate verificată</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Fiecare produs e testat individual de tehnicienii noștri. Nu primim produse direct
                    din cutie — le deschidem, verificăm și doar apoi le oferim clienților.
                  </p>
                </div>
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
                    <TrendingUp size={24} className="text-green-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Prețuri corecte</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Negociem direct cu furnizorii din UE și SUA. Fără intermediari inutili, fără
                    adaosuri ascunse. Prețul pe care îl vezi e cel mai bun pe care îl putem oferi.
                  </p>
                </div>
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                    <Shield size={24} className="text-blue-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Garanție reală</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    12 luni pentru produse noi, 6 luni pentru refurbished. Nu fugim de responsabilități
                    — avem service propriu și răspundem la telefon.
                  </p>
                </div>
                <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                    <Users size={24} className="text-purple-500" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Suport dedicat</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Nu suntem un magazin anonim. Vorbești cu oameni reali, care cunosc produsele și
                    te ajută să alegi ce ți se potrivește. Răspundem în maxim 2 ore.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users size={20} className="text-primary" /> Echipa
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-400 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    VI
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Victor I.</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Fondator & CEO</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    AM
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Andrei M.</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tehnician șef</p>
                </div>
                <div className="text-center p-5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                    EC
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Elena C.</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Suport clienți</p>
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
