import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";

export const metadata: Metadata = {
  title: "Termeni și Condiții",
  description:
    "Termenii și condițiile de utilizare a site-ului Western Import. Informații despre comenzi, plată, livrare, returnare și drepturile consumatorului.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Termeni și Condiții — Western Import",
    description: "Termenii și condițiile de utilizare a site-ului Western Import.",
  },
};

export default async function TermsPage() {
  const pageData = await getPageContent("terms");

  if (pageData?.contentRo) {
    const content = pageData.contentRo;
    const isBlockContent = content.trim().startsWith("[");
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Termeni și Condiții" }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Termeni și Condiții</h1>
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

  // Fallback: original hardcoded content
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Termeni și Condiții" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Termeni și Condiții
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Ultima actualizare: 20 mai 2026
            </p>

            {/* 1. Dispoziții generale */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                1. Dispoziții generale
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Prezentul document stabilește termenii și condițiile de utilizare a site-ului
                westernimport.md (denumit în continuare „Site"), proprietatea SRL Western Import,
                înregistrată în Chișinău, Republica Moldova, CIF/IDNO 1022600012345, sediul social
                str. Podgorenilor 17, Chișinău.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Accesarea și utilizarea Site-ului implică acceptarea integrală a prezentului document.
                Western Import își rezervă dreptul de a modifica acești termeni în orice moment,
                modificările intrând în vigoare la data publicării lor pe Site.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Vârsta minimă pentru efectuarea de achiziții este de 18 ani. Utilizatorii minori pot
                utiliza Site-ul doar sub supravegherea și cu acordul părinților sau al reprezentanților
                legali.
              </p>
            </section>

            {/* 2. Conturi utilizatori */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                2. Conturi utilizatori
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Pentru a plasa comenzi pe Site, utilizatorul trebuie să creeze un cont furnizând date
                personale reale și complete: nume complet, adresă de e-mail, număr de telefon și
                adresă de livrare.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>Utilizatorul este singurul responsabil pentru păstrarea confidențialității datelor de autentificare.</li>
                <li>Orice activitate realizată din contul utilizatorului este considerată ca fiind efectuată de acesta.</li>
                <li>Western Import își rezervă dreptul de a suspenda sau șterge conturi care încalcă acești termeni.</li>
                <li>Datele personale sunt procesate în conformitate cu Politica de Confidențialitate.</li>
              </ul>
            </section>

            {/* 3. Produse și prețuri */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                3. Produse și prețuri
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Prețurile afișate pe Site sunt exprimate în Lei moldovenești (MDL) și includ TVA.
                Western Import depune eforturi rezonabile pentru a menține prețurile actualizate, însă
                pot exista erori punctuale.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>În cazul unei erori evidente de preț, Western Import poate anula comanda și va notifica clientul în maximum 24 de ore.</li>
                <li>Photografiile produselor au caracter informativ; nuanțele de culoare pot diferi față de produsul real.</li>
                <li>Stocul este actualizat în timp real. Dacă un produs comandat nu mai este disponibil, clientul va fi notificat și i se va oferi rambursarea sau o alternativă.</li>
                <li>Promoțiile sunt valabile în perioada specificată și nu se cumulează decât dacă este menționat explicit.</li>
              </ul>
            </section>

            {/* 4. Comenzi */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                4. Procesul de comandă
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Plasarea unei comenzi pe Site presupune parcurgerea următorilor pași: selectarea
                produselor dorite, adăugarea lor în coșul de cumpărături, completarea datelor de
                livrare, alegerea metodei de plată și confirmarea comenzii.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>După confirmare, clientul primește un e-mail cu detaliile comenzii.</li>
                <li>Comanda devine definitivă după confirmarea de către Western Import și procesarea plății (dacă aplicabil).</li>
                <li>Western Import poate refuza o comandă în caz de suspiciune de fraudă sau încălcare a termenilor.</li>
                <li>Clientul poate anula o comandă gratuit înainte de expedierea produsului.</li>
              </ul>
            </section>

            {/* 5. Plata */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                5. Metode de plată
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Western Import acceptă următoarele metode de plată:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li><strong>Numerar la livrare</strong> — plata se efectuează curierului la primirea coletului.</li>
                <li><strong>Card bancar online</strong> — Visa, MasterCard, procesare securizată prin partenerul de plăți.</li>
                <li><strong>Transfer bancar</strong> — datele de plată vor fi trimise pe e-mail după confirmarea comenzii.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400">
                Plățile online sunt procesate prin conexiuni securizate (SSL/TLS). Datele cardului
                bancar nu sunt stocate pe serverele noastre.
              </p>
            </section>

            {/* 6. Livrare */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                6. Livrare
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Detalii complete despre metodele și termenele de livrare sunt disponibile pe pagina{" "}
                <Link href="/shipping" className="text-primary hover:underline">
                  Livrare și Returnare
                </Link>.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Riscul transferului de proprietate trece la client în momentul predării produsului către curierul ales de Western Import.</li>
                <li>Clientul trebuie să verifice integritatea coletului la primire. Orice defect vizibil trebuie semnalat curierului și consemnat în procesul-verbal.</li>
                <li>Livrarea se face exclusiv pe teritoriul Republicii Moldova.</li>
              </ul>
            </section>

            {/* 7. Returnare și rambursare */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                7. Returnare și rambursare
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Conform legislației Republicii Moldova, clientul are dreptul de a returna produsul în
                termen de 14 zile calendaristice de la primire, fără motivare, cu condiția ca produsul
                să fie în starea originală, neutilizat și în ambalajul intact.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>Costurile de returnare sunt suportate de client, cu excepția produselor defecte sau necorespunzătoare.</li>
                <li>Rambursarea se efectuează în maximum 14 zile lucrătoare de la primirea produsului returnat.</li>
                <li>Produsele personalizate sau sigilate care au fost desigilate nu pot fi returnate.</li>
                <li>Procedura detaliată de returnare este descrisă pe pagina{" "}
                <Link href="/shipping" className="text-primary hover:underline">Livrare și Returnare</Link>.
                </li>
              </ul>
            </section>

            {/* 8. Proprietate intelectuală */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                8. Proprietate intelectuală
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Tot conținutul Site-ului — inclusiv, dar fără a se limita la: texte, imagini, grafice,
                logo-uri, pictograme, clipuri audio și video, descărcări digitale, compilații de date
                și cod software — este proprietatea Western Import sau a licențiatorilor săi și este
                protejat de legislația privind drepturile de autor și proprietatea intelectuală.
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Reproducerea, distribuirea sau utilizarea conținutului fără acord scris prealabil este interzisă.</li>
                <li>Numele „Western Import", logo-ul și sloganurile sunt mărci înregistrate sau neînregistrate ale companiei.</li>
                <li>Denumirile produselor și brandurilor aparțin proprietarilor respectivi și sunt folosite cu titlu informativ.</li>
              </ul>
            </section>

            {/* 9. Limitarea răspunderii */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                9. Limitarea răspunderii
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Western Import depune eforturi rezonabile pentru a asigura exactitatea informațiilor
                de pe Site, dar nu oferă garanții explicite sau implicite privind:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-3">
                <li>Disponibilitatea neîntreruptă a Site-ului.</li>
                <li>Absența erorilor sau virusilor.</li>
                <li>Compatibilitatea Site-ului cu orice dispozitiv sau browser.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400">
                În niciun caz, răspunderea totală a Western Import față de client nu va depăși
                valoarea comenzii respective. Această clauză nu limitează drepturile consumatorului
                prevăzute de legislația Republicii Moldova.
              </p>
            </section>

            {/* 10. Forța majoră */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                10. Forța majoră
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Western Import nu va fi responsabilă pentru întârzieri sau neîndepliniri cauzate de
                evenimente independente de voința sa: dezastre naturale, pandemii, conflicte armate,
                greve, restricții guvernamentale, întreruperi ale furnizorilor de servicii sau orice
                alt eveniment de forță majoră.
              </p>
            </section>

            {/* 11. Legi aplicabile */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                11. Legi aplicabile și jurisdicție
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Prezentul document este guvernat de legislația Republicii Moldova. Orice litigiu va fi
                soluționat pe cale amiabilă, iar în lipsa unui acord, prin instanțele judecătorești
                competente din Chișinău, Republica Moldova.
              </p>
            </section>

            {/* 12. Contact */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                12. Contact
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Pentru orice întrebări legate de acești Termeni și Condiții, vă rugăm să ne contactați:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>E-mail:</strong> info@westernimport.md</li>
                <li><strong>Telefon:</strong> +373 69 466 585</li>
                <li><strong>Adresă:</strong> str. Podgorenilor 17, Chișinău, Republica Moldova</li>
                <li><strong>Program:</strong> Luni–Vineri: 09:00–18:00, Sâmbătă: 10:00–15:00</li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
