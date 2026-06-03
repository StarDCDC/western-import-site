import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { getPageContent } from "@/lib/pages";
import { parseBlocks } from "@/lib/blocks";
import PageBlocks from "@/components/public/PageBlocks";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate",
  description:
    "Politica de confidențialitate Western Import. Informații despre colectarea, utilizarea și protecția datelor personale conform GDPR.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Politica de Confidențialitate — Western Import",
    description: "Politica de confidențialitate Western Import.",
  },
};

export default async function PrivacyPage() {
  const pageData = await getPageContent("privacy");

  if (pageData?.contentRo) {
    const content = pageData.contentRo;
    const isBlockContent = content.trim().startsWith("[");
    const blocks = isBlockContent ? parseBlocks(content) : [];

    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Breadcrumb items={[{ label: "Politica de Confidențialitate" }]} />
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Politica de Confidențialitate</h1>
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
          <Breadcrumb items={[{ label: "Politica de Confidențialitate" }]} />
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Politica de Confidențialitate
            </h1>
            <div className="w-16 h-1 bg-primary rounded-full mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              Ultima actualizare: 20 mai 2026
            </p>
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                1. Introducere
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                SRL Western Import („noi", „al nostru") respectă confidențialitatea datelor dumneavoastră
                personale și se angajează să le protejeze. Această Politică de Confidențialitate explică
                cum colectăm, utilizăm, stocăm și protejăm informațiile personale atunci când vizitați
                site-ul nostru westernimport.md („Site") și atunci când cumpărați produse de la noi.
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Prezenta politică este elaborată în conformitate cu Regulamentul (UE) 2016/679 (GDPR),
                Legea Republicii Moldova nr. 133 din 08.07.2011 privind protecția datelor cu caracter
                personal și legislația aplicabilă în materie.
              </p>
            </section>

            {/* 2. Datele colectate */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                2. Ce date personale colectăm
              </h2>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                2.1 Date furnizate de dumneavoastră
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li><strong>Date de identitate:</strong> nume, prenume</li>
                <li><strong>Date de contact:</strong> adresă de e-mail, număr de telefon</li>
                <li><strong>Date de livrare:</strong> adresă completă (stradă, număr, apartament, oraș, cod poștal)</li>
                <li><strong>Date financiare:</strong> informații de plată (procesate exclusiv prin furnizorii de plăți, noi nu stocăm datele cardului)</li>
                <li><strong>Date de cont:</strong> parolă (stocată criptat), preferințe</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                2.2 Date colectate automat
              </h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mb-4">
                <li><strong>Date tehnice:</strong> adresă IP, tip browser, sistem de operare, rezoluție ecran</li>
                <li><strong>Date de navigare:</strong> pagini vizitate, timp petrecut pe pagină, sursa de trafic</li>
                <li><strong>Cookies și tehnologii similare:</strong> vezi secțiunea 6 (Politica Cookies)</li>
              </ul>

              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">
                2.3 Date provenite din alte surse
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Nu primim date personale de la terțe părți, cu excepția datelor de autentificare de la
                furnizorii de servicii de social login (dacă sunt utilizați) și datelor de plată de la
                procesatorii de carduri.
              </p>
            </section>

            {/* 3. Scopul colectării */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                3. Scopul colectării datelor
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Utilizăm datele personale pentru următoarele scopuri:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Procesarea comenzilor:</strong> gestionarea, expedierea și livrarea produselor comandate.</li>
                <li><strong>Comunicare:</strong> trimiterea confirmărilor de comandă, notificărilor de livrare și a informațiilor de service.</li>
                <li><strong>Gestionarea contului:</strong> accesul la istoricul de comenzi, lista de favorite și setările contului.</li>
                <li><strong>Suport clienți:</strong> răspunsul la întrebări, soluționarea reclamațiilor și gestionarea returnărilor.</li>
                <li><strong>Marketing:</strong> trimiterea newsletter-ului și a ofertelor personalizate, doar cu acordul dumneavoastră prealabil.</li>
                <li><strong>Analiză și îmbunătățire:</strong> înțelegerea modului de utilizare a Site-ului pentru a îmbunătăți experiența.</li>
                <li><strong>Securitate:</strong> prevenirea fraudei și protejarea Site-ului împotriva accesului neautorizat.</li>
                <li><strong>Conformitate legală:</strong> respectarea obligațiilor fiscale, contabile și legale.</li>
              </ul>
            </section>

            {/* 4. Baza legală */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                4. Baza legală a procesării
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Procesarea datelor dumneavoastră personale se bazează pe unul sau mai multe dintre
                următoarele temeiuri legale:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Executarea contractului</strong> — procesarea comenzilor și livrarea produselor (Art. 6(1)(b) GDPR).</li>
                <li><strong>Consimțământul</strong> — newsletter, cookies de marketing (Art. 6(1)(a) GDPR).</li>
                <li><strong>Interesul legitim</strong> — analiza traficului, prevenirea fraudei (Art. 6(1)(f) GDPR).</li>
                <li><strong>Obligația legală</strong> — emiterea facturilor, păstrarea evidențelor contabile (Art. 6(1)(c) GDPR).</li>
              </ul>
            </section>

            {/* 5. Drepturile utilizatorului */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                5. Drepturile dumneavoastră
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Conform GDPR și legislației Republicii Moldova, aveți următoarele drepturi:
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul de acces</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul de rectificare</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți solicita corectarea datelor inexacte sau completarea datelor incomplete.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul la ștergere („dreptul de a fi uitat")</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți solicita ștergerea datelor personale, cu excepția cazurilor în care legea ne
                    obligă să le păstrăm.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul la restricționarea procesării</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți solicita limitarea utilizării datelor în anumite circumstanțe.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul la portabilitate</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți solicita exportul datelor într-un format structurat, lizibil automat.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul de opoziție</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți să vă opuneți procesării datelor bazate pe interesul legitim.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200">Dreptul de a retrage consimțământul</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    Puteți retracta consimțământul oricând, fără a afecta legalitatea procesării anterioare.
                    Pentru newsletter, folosiți linkul de dezabonare din fiecare e-mail.
                  </p>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-4">
                Pentru a exercita oricare dintre aceste drepturi, contactați-ne la{" "}
                <strong>privacy@westernimport.md</strong>. Vom răspunde în maximum 30 de zile.
                Aveți, de asemenea, dreptul de a depune o plângere la Autoritatea Națională pentru
                Protecția Datelor cu Caracter Personal din Republica Moldova.
              </p>
            </section>

            {/* 6. Cookies */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                6. Cookies
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Site-ul utilizează cookies pentru a îmbunătăți experiența de navigare, a analiza traficul
                și a afișa conținut personalizat. Detalii complete sunt disponibile în{" "}
                <a href="/cookies" className="text-primary hover:underline">Politica Cookies</a>.
              </p>
            </section>

            {/* 7. Destinatari */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                7. Cu cine împărtășim datele
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Nu vindem, nu închiriem și nu comercializăm datele dumneavoastră personale. Le putem
                împărtăși cu:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>Furnizori de servicii de livrare</strong> — exclusiv datele necesare livrării (nume, adresă, telefon).</li>
                <li><strong>Procesatori de plăți</strong> — pentru procesarea tranzacțiilor securizate.</li>
                <li><strong>Instrumente de analiză</strong> — Google Analytics (date anonimizate).</li>
                <li><strong>Autorități publice</strong> — doar în cazul obligațiilor legale.</li>
              </ul>
            </section>

            {/* 8. Stocare și securitate */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                8. Stocarea și protecția datelor
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Datele personale sunt stocate pe servere securizate localizate în Uniunea Europeană.
                Aplicăm următoarele măsuri de securitate:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Criptarea conexiunilor prin SSL/TLS (HTTPS).</li>
                <li>Parole stocate sub formă hash (bcrypt).</li>
                <li>Acces restricționat la datele personale — doar personalul autorizat.</li>
                <li>Backup-uri zilnice criptate.</li>
                <li>Audit periodic de securitate.</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Păstrăm datele personale atât timp cât este necesar pentru scopurile pentru care au fost
                colectate sau cât cere legislația (de exemplu, datele fiscale sunt păstrate minimum 5 ani).
              </p>
            </section>

            {/* 9. Datele copiilor */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                9. Datele copiilor
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Site-ul nu este destinat persoanelor sub 18 ani și nu colectăm conștient date de la
                minori. Dacă aflăm că am colectat date personale ale unui minor fără consimțământul
                părintelui, le vom șterge de îndată.
              </p>
            </section>

            {/* 10. DPO */}
            <section className="mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                10. Ofițerul pentru protecția datelor (DPO)
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Pentru întrebări legate de protecția datelor, contactați responsabilul nostru cu
                protecția datelor:
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>E-mail:</strong> privacy@westernimport.md<br />
                  <strong>Telefon:</strong> +373 69 466 585<br />
                  <strong>Adresă:</strong> SRL Western Import, str. Podgorenilor 17, MD-2001, Chișinău, Republica Moldova
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
