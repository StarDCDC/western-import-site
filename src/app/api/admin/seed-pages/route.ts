import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/utils';

const pagesData = [
  {
    slug: 'about',
    titleRo: 'Despre Noi',
    titleRu: 'О нас',
    contentRo: `<h2>Povestea noastră</h2>
<p>Western Import s-a născut în 2023 dintr-o simplă observație: moldovenii merită acces la electronică de calitate la prețuri corecte, fără compromisuri. Am pornit de la un magazin mic pe o stradă liniștită din Chișinău, cu un laptop pe masă și o determinare uriașă.</p>
<p>De ce „Western"? Pentru că aducem produse din occident — laptopuri, telefoane, monitoare și componente — selectate cu grijă, testate minuțios și oferite cu garanție reală. Nu vindem „înghesuit", nu vindem „la noroc". Fiecare produs trece prin mâinile noastre înainte să ajungă la tine.</p>
<p>Astăzi, după 3 ani pe piață, suntem mândri de fiecare client mulțumit. Nu suntem cel mai mare magazin din Moldova — și nici nu dorim să fim. Preferăm să fim cel mai de încredere.</p>

<h2>Misiune și valori</h2>
<blockquote><p>„Să oferim fiecărui moldovean acces la tehnologie de calitate, la un preț corect, susținut de un serviciu clienți de excepție."</p></blockquote>
<ul>
<li><strong>Integritate</strong> — Ce promitem, livrăm. Fără surprize ascunse, fără prețuri manipulative.</li>
<li><strong>Calitate</strong> — Fiecare produs e testat înainte de vânzare. Nu facem compromisuri.</li>
<li><strong>Transparență</strong> — Stările produselor sunt descrise clar. Știm ce vindem și de unde vine.</li>
<li><strong>Comunitate</strong> — Clienții noștri sunt vecini, prieteni, colegi. Îi tratăm ca atare.</li>
</ul>

<h2>Western Import în cifre</h2>
<ul>
<li><strong>1000+</strong> Clienți mulțumiți</li>
<li><strong>500+</strong> Produse în catalog</li>
<li><strong>3</strong> Ani pe piață</li>
</ul>

<h2>De ce Western Import?</h2>
<ul>
<li><strong>Calitate verificată</strong> — Fiecare produs e testat individual de tehnicienii noștri. Nu primim produse direct din cutie — le deschidem, verificăm și doar apoi le oferim clienților.</li>
<li><strong>Prețuri corecte</strong> — Negociem direct cu furnizorii din UE și SUA. Fără intermediari inutili, fără adaosuri ascunse.</li>
<li><strong>Garanție reală</strong> — 12 luni pentru produse noi, 6 luni pentru refurbished. Nu fugim de responsabilități — avem service propriu și răspundem la telefon.</li>
<li><strong>Suport dedicat</strong> — Nu suntem un magazin anonim. Vorbești cu oameni reali, care cunosc produsele și te ajută să alegi ce ți se potrivește. Răspundem în maxim 2 ore.</li>
</ul>

<h2>Echipa</h2>
<ul>
<li><strong>Victor I.</strong> — Fondator &amp; CEO</li>
<li><strong>Andrei M.</strong> — Tehnician șef</li>
<li><strong>Elena C.</strong> — Suport clienți</li>
</ul>`,
    contentRu: `<h2>Наша история</h2>
<p>Western Import появился в 2023 году из простого наблюдения: молдаване заслуживают доступа к качественной электронике по справедливым ценам, без компромиссов. Мы начали с маленького магазина на тихой улице в Кишинёве, с ноутбуком на столе и огромной решимостью.</p>
<p>Почему «Western»? Потому что мы привозим продукты с Запада — ноутбуки, телефоны, мониторы и комплектующие — тщательно отобранные, досконально проверенные и предлагаемые с реальной гарантией.</p>
<p>Сегодня, после 3 лет на рынке, мы гордимся каждым довольным клиентом. Мы не самый большой магазин в Молдове — и не стремимся быть таковым. Мы предпочитаем быть самыми надёжными.</p>

<h2>Миссия и ценности</h2>
<blockquote><p>«Обеспечить каждому молдаванину доступ к качественной технологии по справедливой цене, поддерживаемый исключительным обслуживанием клиентов.»</p></blockquote>
<ul>
<li><strong>Честность</strong> — Что обещаем, то и доставляем. Никаких скрытых сюрпризов и манипулятивных цен.</li>
<li><strong>Качество</strong> — Каждый продукт тестируется перед продажей. Мы не идём на компромиссы.</li>
<li><strong>Прозрачность</strong> — Состояние продуктов описано чётко. Мы знаем, что продаём и откуда это.</li>
<li><strong>Сообщество</strong> — Наши клиенты — соседи, друзья, коллеги. Мы относимся к ним соответственно.</li>
</ul>

<h2>Western Import в цифрах</h2>
<ul>
<li><strong>1000+</strong> Довольных клиентов</li>
<li><strong>500+</strong> Товаров в каталоге</li>
<li><strong>3</strong> Года на рынке</li>
</ul>

<h2>Почему Western Import?</h2>
<ul>
<li><strong>Проверенное качество</strong> — Каждый продукт индивидуально тестируется нашими техниками.</li>
<li><strong>Справедливые цены</strong> — Прямые переговоры с поставщиками из ЕС и США. Без лишних посредников.</li>
<li><strong>Реальная гарантия</strong> — 12 месяцев для новых продуктов, 6 месяцев для восстановленных.</li>
<li><strong>Выделенная поддержка</strong> — Вы общаетесь с реальными людьми, которые знают продукты.</li>
</ul>

<h2>Команда</h2>
<ul>
<li><strong>Виктор И.</strong> — Основатель и CEO</li>
<li><strong>Андрей М.</strong> — Главный техник</li>
<li><strong>Елена К.</strong> — Поддержка клиентов</li>
</ul>`,
    isPublished: true,
  },
  {
    slug: 'privacy',
    titleRo: 'Politica de Confidențialitate',
    titleRu: 'Политика конфиденциальности',
    contentRo: `<p><em>Ultima actualizare: 20 mai 2026</em></p>

<h2>1. Introducere</h2>
<p>SRL Western Import („noi", „al nostru") respectă confidențialitatea datelor dumneavoastră personale și se angajează să le protejeze. Această Politică de Confidențialitate explică cum colectăm, utilizăm, stocăm și protejăm informațiile personale atunci când vizitați site-ul nostru westernimport.md („Site") și atunci când cumpărați produse de la noi.</p>
<p>Prezenta politică este elaborată în conformitate cu Regulamentul (UE) 2016/679 (GDPR), Legea Republicii Moldova nr. 133 din 08.07.2011 privind protecția datelor cu caracter personal și legislația aplicabilă în materie.</p>

<h2>2. Ce date personale colectăm</h2>
<h3>2.1 Date furnizate de dumneavoastră</h3>
<ul>
<li><strong>Date de identitate:</strong> nume, prenume</li>
<li><strong>Date de contact:</strong> adresă de e-mail, număr de telefon</li>
<li><strong>Date de livrare:</strong> adresă completă (stradă, număr, apartament, oraș, cod poștal)</li>
<li><strong>Date financiare:</strong> informații de plată (procesate exclusiv prin furnizorii de plăți, noi nu stocăm datele cardului)</li>
<li><strong>Date de cont:</strong> parolă (stocată criptat), preferințe</li>
</ul>
<h3>2.2 Date colectate automat</h3>
<ul>
<li><strong>Date tehnice:</strong> adresă IP, tip browser, sistem de operare, rezoluție ecran</li>
<li><strong>Date de navigare:</strong> pagini vizitate, timp petrecut pe pagină, sursa de trafic</li>
<li><strong>Cookies și tehnologii similare</strong></li>
</ul>

<h2>3. Scopul colectării datelor</h2>
<ul>
<li><strong>Procesarea comenzilor:</strong> gestionarea, expedierea și livrarea produselor comandate.</li>
<li><strong>Comunicare:</strong> trimiterea confirmărilor de comandă, notificărilor de livrare și a informațiilor de service.</li>
<li><strong>Gestionarea contului:</strong> accesul la istoricul de comenzi, lista de favorite și setările contului.</li>
<li><strong>Suport clienți:</strong> răspunsul la întrebări, soluționarea reclamațiilor și gestionarea returnărilor.</li>
<li><strong>Marketing:</strong> trimiterea newsletter-ului și a ofertelor personalizate, doar cu acordul dumneavoastră prealabil.</li>
<li><strong>Analiză și îmbunătățire:</strong> înțelegerea modului de utilizare a Site-ului pentru a îmbunătăți experiența.</li>
<li><strong>Securitate:</strong> prevenirea fraudei și protejarea Site-ului împotriva accesului neautorizat.</li>
<li><strong>Conformitate legală:</strong> respectarea obligațiilor fiscale, contabile și legale.</li>
</ul>

<h2>4. Baza legală a procesării</h2>
<ul>
<li><strong>Executarea contractului</strong> — procesarea comenzilor și livrarea produselor (Art. 6(1)(b) GDPR).</li>
<li><strong>Consimțământul</strong> — newsletter, cookies de marketing (Art. 6(1)(a) GDPR).</li>
<li><strong>Interesul legitim</strong> — analiza traficului, prevenirea fraudei (Art. 6(1)(f) GDPR).</li>
<li><strong>Obligația legală</strong> — emiterea facturilor, păstrarea evidențelor contabile (Art. 6(1)(c) GDPR).</li>
</ul>

<h2>5. Drepturile dumneavoastră</h2>
<ul>
<li><strong>Dreptul de acces</strong> — Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră.</li>
<li><strong>Dreptul de rectificare</strong> — Puteți solicita corectarea datelor inexacte sau completarea datelor incomplete.</li>
<li><strong>Dreptul la ștergere</strong> — Puteți solicita ștergerea datelor personale, cu excepția cazurilor în care legea ne obligă să le păstrăm.</li>
<li><strong>Dreptul la restricționarea procesării</strong> — Puteți solicita limitarea utilizării datelor în anumite circumstanțe.</li>
<li><strong>Dreptul la portabilitate</strong> — Puteți solicita exportul datelor într-un format structurat, lizibil automat.</li>
<li><strong>Dreptul de opoziție</strong> — Puteți să vă opuneți procesării datelor bazate pe interesul legitim.</li>
<li><strong>Dreptul de a retrage consimțământul</strong> — Puteți retracta consimțământul oricând, fără a afecta legalitatea procesării anterioare.</li>
</ul>
<p>Pentru a exercita oricare dintre aceste drepturi, contactați-ne la <strong>privacy@westernimport.md</strong>. Vom răspunde în maximum 30 de zile. Aveți, de asemenea, dreptul de a depune o plângere la Autoritatea Națională pentru Protecția Datelor cu Caracter Personal din Republica Moldova.</p>

<h2>6. Cookies</h2>
<p>Site-ul utilizează cookies pentru a îmbunătăți experiența de navigare, a analiza traficul și a afișa conținut personalizat. Detalii complete sunt disponibile în <a href="/cookies">Politica Cookies</a>.</p>

<h2>7. Cu cine împărtășim datele</h2>
<p>Nu vindem, nu închiriem și nu comercializăm datele dumneavoastră personale. Le putem împărtăși cu:</p>
<ul>
<li><strong>Furnizori de servicii de livrare</strong> — exclusiv datele necesare livrării (nume, adresă, telefon).</li>
<li><strong>Procesatori de plăți</strong> — pentru procesarea tranzacțiilor securizate.</li>
<li><strong>Instrumente de analiză</strong> — Google Analytics (date anonimizate).</li>
<li><strong>Autorități publice</strong> — doar în cazul obligațiilor legale.</li>
</ul>

<h2>8. Stocarea și protecția datelor</h2>
<p>Datele personale sunt stocate pe servere securizate localizate în Uniunea Europeană. Aplicăm următoarele măsuri de securitate:</p>
<ul>
<li>Criptarea conexiunilor prin SSL/TLS (HTTPS).</li>
<li>Parole stocate sub formă hash (bcrypt).</li>
<li>Acces restricționat la datele personale — doar personalul autorizat.</li>
<li>Backup-uri zilnice criptate.</li>
<li>Audit periodic de securitate.</li>
</ul>

<h2>9. Datele copiilor</h2>
<p>Site-ul nu este destinat persoanelor sub 18 ani și nu colectăm conștient date de la minori.</p>

<h2>10. Ofițerul pentru protecția datelor (DPO)</h2>
<p>Pentru întrebări legate de protecția datelor, contactați responsabilul nostru cu protecția datelor:</p>
<ul>
<li><strong>E-mail:</strong> privacy@westernimport.md</li>
<li><strong>Telefon:</strong> +373 69 466 585</li>
<li><strong>Adresă:</strong> SRL Western Import, str. Podgorenilor 17, MD-2001, Chișinău, Republica Moldova</li>
</ul>`,
    contentRu: `<p><em>Последнее обновление: 20 мая 2026 г.</em></p>

<h2>1. Введение</h2>
<p>SRL Western Import («мы», «наш») уважает конфиденциальность ваших персональных данных и обязуется их защищать. Настоящая Политика конфиденциальности объясняет, как мы собираем, используем, храним и защищаем персональную информацию при посещении нашего сайта westernimport.md («Сайт») и при покупке у нас товаров.</p>
<p>Настоящая политика разработана в соответствии с Регламентом (ЕС) 2016/679 (GDPR), Законом Республики Молдова № 133 от 08.07.2011 о защите персональных данных и применимым законодательством.</p>

<h2>2. Какие персональные данные мы собираем</h2>
<h3>2.1 Данные, предоставленные вами</h3>
<ul>
<li><strong>Идентификационные данные:</strong> имя, фамилия</li>
<li><strong>Контактные данные:</strong> адрес электронной почты, номер телефона</li>
<li><strong>Данные доставки:</strong> полный адрес (улица, номер, квартира, город, почтовый индекс)</li>
<li><strong>Финансовые данные:</strong> платёжная информация (обрабатывается исключительно платёжными провайдерами, мы не храним данные карты)</li>
<li><strong>Данные аккаунта:</strong> пароль (хранится в зашифрованном виде), предпочтения</li>
</ul>
<h3>2.2 Данные, собираемые автоматически</h3>
<ul>
<li><strong>Технические данные:</strong> IP-адрес, тип браузера, операционная система, разрешение экрана</li>
<li><strong>Данные навигации:</strong> посещённые страницы, время на странице, источник трафика</li>
<li><strong>Cookies и аналогичные технологии</strong></li>
</ul>

<h2>3. Цель сбора данных</h2>
<ul>
<li><strong>Обработка заказов:</strong> управление, отправка и доставка заказанных товаров.</li>
<li><strong>Коммуникация:</strong> отправка подтверждений заказа, уведомлений о доставке и сервисной информации.</li>
<li><strong>Управление аккаунтом:</strong> доступ к истории заказов, списку избранного и настройкам.</li>
<li><strong>Поддержка клиентов:</strong> ответы на вопросы, решение жалоб и обработка возвратов.</li>
<li><strong>Маркетинг:</strong> отправка рассылки и персонализированных предложений только с вашего предварительного согласия.</li>
<li><strong>Анализ и улучшение:</strong> понимание использования Сайта для улучшения опыта.</li>
<li><strong>Безопасность:</strong> предотвращение мошенничества и защита Сайта от несанкционированного доступа.</li>
<li><strong>Правовое соответствие:</strong> соблюдение налоговых, бухгалтерских и юридических обязательств.</li>
</ul>

<h2>4. Правовое основание обработки</h2>
<ul>
<li><strong>Исполнение договора</strong> — обработка заказов и доставка товаров (Ст. 6(1)(b) GDPR).</li>
<li><strong>Согласие</strong> — рассылка, маркетинговые cookies (Ст. 6(1)(a) GDPR).</li>
<li><strong>Законный интерес</strong> — анализ трафика, предотвращение мошенничества (Ст. 6(1)(f) GDPR).</li>
<li><strong>Юридическая обязанность</strong> — выставление счетов, ведение бухгалтерского учёта (Ст. 6(1)(c) GDPR).</li>
</ul>

<h2>5. Ваши права</h2>
<ul>
<li><strong>Право доступа</strong> — Вы можете запросить копию персональных данных, которые мы о вас храним.</li>
<li><strong>Право на исправление</strong> — Вы можете запросить исправление неточных данных.</li>
<li><strong>Право на удаление</strong> — Вы можете запросить удаление персональных данных.</li>
<li><strong>Право на ограничение обработки</strong> — Вы можете запросить ограничение использования данных.</li>
<li><strong>Право на переносимость</strong> — Вы можете запросить экспорт данных в структурированном формате.</li>
<li><strong>Право на возражение</strong> — Вы можете возразить против обработки данных на основании законного интереса.</li>
<li><strong>Право отозвать согласие</strong> — Вы можете отозвать согласие в любое время.</li>
</ul>
<p>Для осуществления любого из этих прав свяжитесь с нами: <strong>privacy@westernimport.md</strong>. Мы ответим в течение 30 дней.</p>

<h2>6. Cookies</h2>
<p>Сайт использует cookies для улучшения навигации, анализа трафика и отображения персонализированного контента. Подробности доступны в <a href="/cookies">Политике Cookies</a>.</p>

<h2>7. С кем мы делимся данными</h2>
<p>Мы не продаём, не сдаём в аренду и не коммерциализируем ваши персональные данные. Мы можем делиться ими с:</p>
<ul>
<li><strong>Службами доставки</strong> — только данные, необходимые для доставки.</li>
<li><strong>Платёжными процессорами</strong> — для обработки транзакций.</li>
<li><strong>Инструментами аналитики</strong> — Google Analytics (анонимизированные данные).</li>
<li><strong>Государственными органами</strong> — только по юридическим обязательствам.</li>
</ul>

<h2>8. Хранение и защита данных</h2>
<p>Персональные данные хранятся на защищённых серверах в Европейском Союзе. Мы применяем:</p>
<ul>
<li>Шифрование соединений через SSL/TLS (HTTPS).</li>
<li>Пароли хранятся в хешированном виде (bcrypt).</li>
<li>Ограниченный доступ к персональным данным — только авторизованный персонал.</li>
<li>Ежедневное зашифрованное резервное копирование.</li>
<li>Периодический аудит безопасности.</li>
</ul>

<h2>9. Данные детей</h2>
<p>Сайт не предназначен для лиц младше 18 лет, и мы сознательно не собираем данные от несовершеннолетних.</p>

<h2>10. Ответственный за защиту данных (DPO)</h2>
<ul>
<li><strong>E-mail:</strong> privacy@westernimport.md</li>
<li><strong>Телефон:</strong> +373 69 466 585</li>
<li><strong>Адрес:</strong> SRL Western Import, ул. Подгоренилор 17, MD-2001, Кишинёв, Республика Молдова</li>
</ul>`,
    isPublished: true,
  },
  {
    slug: 'cookies',
    titleRo: 'Politica Cookies',
    titleRu: 'Политика Cookies',
    contentRo: `<p><em>Ultima actualizare: 20 mai 2026</em></p>

<h2>1. Ce sunt cookies?</h2>
<p>Cookies-urile sunt fișiere text de dimensiuni reduse stocate pe dispozitivul dumneavoastră (computer, tabletă, telefon) atunci când vizitați un site web. Ele permit site-ului să recunoască dispozitivul și să rețină informații despre vizita anterioară (de exemplu, preferințele de limbă sau produsele din coșul de cumpărături).</p>

<h2>2. Tipuri de cookies utilizate</h2>

<h3>🟢 Cookies strict necesare (Întotdeauna active)</h3>
<p>Aceste cookies sunt esențiale pentru funcționarea Site-ului și nu pot fi dezactivate.</p>
<ul>
<li><strong>session_id</strong> — Menține sesiunea de autentificare (Sesiune)</li>
<li><strong>cart</strong> — Reține produsele din coș (30 zile)</li>
<li><strong>csrf_token</strong> — Protejează împotriva atacurilor CSRF (Sesiune)</li>
<li><strong>theme</strong> — Reține preferința temă light/dark (1 an)</li>
</ul>

<h3>🔵 Cookies funcționale (Opționale)</h3>
<p>Permit funcționalități îmbunătățite și personalizare.</p>
<ul>
<li><strong>lang</strong> — Reține limba selectată (1 an)</li>
<li><strong>recently_viewed</strong> — Afișează produsele vizualizate recent (30 zile)</li>
<li><strong>wishlist</strong> — Reține produsele favorite (1 an)</li>
</ul>

<h3>🟡 Cookies de analiză (Opționale)</h3>
<p>Ne ajută să înțelegem cum vizitatorii interacționează cu Site-ul, colectând informații anonimizate. Folosim Google Analytics cu IP anonimizat.</p>
<ul>
<li><strong>_ga</strong> — Identifică vizitatori unici, anonimizat (2 ani)</li>
<li><strong>_ga_*</strong> — Menține starea sesiunii analytics (2 ani)</li>
<li><strong>_gid</strong> — Distinge vizitatorii în sesiuni diferite (24 ore)</li>
</ul>

<h3>🟠 Cookies de marketing (Opționale)</h3>
<p>Sunt utilizate pentru a vă arăta reclame relevante pe alte site-uri.</p>
<ul>
<li><strong>_fbp</strong> — Pixel Facebook — remarketing (3 luni)</li>
<li><strong>_gcl_au</strong> — Google Ads — conversii (3 luni)</li>
</ul>

<h2>3. Cum gestionați cookies</h2>
<p>Puteți controla și gestiona cookies în mai multe moduri:</p>
<ul>
<li><strong>Bannerul de cookies</strong> — la prima vizită, puteți alege ce categorii acceptați.</li>
<li><strong>Setările browserului</strong> — majoritatea browserelor permit blocarea sau ștergerea cookies.</li>
<li><strong>Google Analytics Opt-out</strong> — instalați addon-ul oficial.</li>
<li><strong>Network Advertising Initiative</strong> — opt-out de la cookies de marketing.</li>
</ul>

<h2>4. Modificări ale politicii</h2>
<p>Western Import își rezervă dreptul de a actualiza această politică oricând. Vom notifica modificările semnificative prin bannerul de cookies sau prin e-mail.</p>

<h2>5. Contact</h2>
<p>Pentru întrebări legate de utilizarea cookies: <strong>privacy@westernimport.md</strong> | <strong>+373 69 466 585</strong></p>`,
    contentRu: `<p><em>Последнее обновление: 20 мая 2026 г.</em></p>

<h2>1. Что такое cookies?</h2>
<p>Cookies — это небольшие текстовые файлы, сохраняемые на вашем устройстве (компьютер, планшет, телефон) при посещении веб-сайта. Они позволяют сайту распознавать устройство и сохранять информацию о предыдущем посещении (например, языковые предпочтения или товары в корзине).</p>

<h2>2. Типы используемых cookies</h2>

<h3>🟢 Строго необходимые cookies (Всегда активны)</h3>
<p>Эти cookies необходимы для работы Сайта и не могут быть отключены.</p>
<ul>
<li><strong>session_id</strong> — Поддерживает сеанс аутентификации (Сеанс)</li>
<li><strong>cart</strong> — Сохраняет товары в корзине (30 дней)</li>
<li><strong>csrf_token</strong> — Защищает от атак CSRF (Сеанс)</li>
<li><strong>theme</strong> — Сохраняет предпочтения темы (1 год)</li>
</ul>

<h3>🔵 Функциональные cookies (Опциональные)</h3>
<p>Обеспечивают расширенные функции и персонализацию.</p>
<ul>
<li><strong>lang</strong> — Сохраняет выбранный язык (1 год)</li>
<li><strong>recently_viewed</strong> — Показывает недавно просмотренные товары (30 дней)</li>
<li><strong>wishlist</strong> — Сохраняет избранные товары (1 год)</li>
</ul>

<h3>🟡 Аналитические cookies (Опциональные)</h3>
<p>Помогают понять, как посетители взаимодействуют с Сайтом, собирая анонимизированную информацию. Мы используем Google Analytics с анонимизированным IP.</p>
<ul>
<li><strong>_ga</strong> — Идентифицирует уникальных посетителей, анонимизировано (2 года)</li>
<li><strong>_ga_*</strong> — Поддерживает состояние сеанса аналитики (2 года)</li>
<li><strong>_gid</strong> — Различает посетителей в разных сеансах (24 часа)</li>
</ul>

<h3>🟠 Маркетинговые cookies (Опциональные)</h3>
<p>Используются для показа релевантной рекламы на других сайтах.</p>
<ul>
<li><strong>_fbp</strong> — Пиксель Facebook — ремаркетинг (3 месяца)</li>
<li><strong>_gcl_au</strong> — Google Ads — конверсии (3 месяца)</li>
</ul>

<h2>3. Как управлять cookies</h2>
<ul>
<li><strong>Баннер cookies</strong> — при первом посещении вы можете выбрать категории cookies.</li>
<li><strong>Настройки браузера</strong> — большинство браузеров позволяют блокировать или удалять cookies.</li>
<li><strong>Google Analytics Opt-out</strong> — установите официальный аддон.</li>
<li><strong>Network Advertising Initiative</strong> — отказ от маркетинговых cookies.</li>
</ul>

<h2>4. Изменения политики</h2>
<p>Western Import оставляет за собой право обновлять эту политику в любое время. Мы уведомим о значительных изменениях через баннер cookies или по электронной почте.</p>

<h2>5. Контакты</h2>
<p>По вопросам использования cookies: <strong>privacy@westernimport.md</strong> | <strong>+373 69 466 585</strong></p>`,
    isPublished: true,
  },
  {
    slug: 'warranty',
    titleRo: 'Garanție',
    titleRu: 'Гарантия',
    contentRo: `<h2>Perioade de garanție</h2>
<ul>
<li><strong>Produse noi: 12 luni</strong> — Garanție completă pentru toate produsele noi achiziționate de la Western Import.</li>
<li><strong>Produse refurbished: 6 luni</strong> — Garanție pentru produsele refurbished/testate, acoperind defecțiunile tehnice majore.</li>
</ul>

<h2>Ce acoperă garanția</h2>
<ul>
<li>Defecțiuni de fabricație ale componentelor hardware</li>
<li>Probleme de funcționare apărute în condiții normale de utilizare</li>
<li>Defecțiuni ale ecranului (pixeli morți, linii, spoturi)</li>
<li>Probleme de alimentare sau încărcare nelegate la uzură</li>
<li>Defecțiuni ale porturilor și conectoarelor</li>
<li>Probleme software preinstalat (sistem de operare, drivere)</li>
<li>Defecțiuni ale tastaturii și trackpad-ului</li>
<li>Defecțiuni ale difuzoarelor, microfonului sau camerei web</li>
</ul>

<h2>Ce NU acoperă garanția</h2>
<ul>
<li>Deteriorări cauzate de căderi, lovituri sau expunere la lichide</li>
<li>Deteriorări intenționate sau modificări neautorizate</li>
<li>Utilizarea produsului în afara parametrilor tehnici specificați</li>
<li>Baterii cu capacitate redusă din uzură normală</li>
<li>Accesorii consumabile (huse, cabluri, încărcătoare din afara kitului original)</li>
<li>Probleme software cauzate de instalări ulterioare de programe</li>
<li>Defecțiuni cauzate de viruși sau software malicious</li>
<li>Deteriorări estetice (zgârieturi, lovituri) care nu afectează funcționalitatea</li>
<li>Reparații efectuate de terțe părți neautorizate</li>
<li>Utilizarea de accesorii necompatibile</li>
</ul>

<h2>Procedura de service</h2>
<ol>
<li><strong>Contactați-ne</strong> — Sunați la +373 69 466 585 sau scrieți pe info@westernimport.md. Descrieți problema și furnizați numărul comenzii.</li>
<li><strong>Diagnosticare</strong> — Echipa noastră va evalua problema și vă va confirma dacă este acoperită de garanție.</li>
<li><strong>Predare produs</strong> — Aduceți produsul la sediul nostru din str. Podgorenilor 17, Chișinău, sau programați ridicarea prin curier (gratuit în garanție).</li>
<li><strong>Reparație sau înlocuire</strong> — Timpul de reparare: 5–15 zile lucrătoare. Dacă produsul nu poate fi reparat, vă oferim un produs echivalent sau rambursarea.</li>
<li><strong>Returnare produs</strong> — Vă notificăm când produsul este gata și stabiliți modalitatea de returnare.</li>
</ol>

<h2>Termeni și condiții garanție</h2>
<ul>
<li>Garanția începe de la data achiziției, conform facturii.</li>
<li>Factura originală sau dovada achiziției este obligatorie.</li>
<li>Reparația nu prelungește perioada de garanție.</li>
<li>Piețele și componentele înlocuite în garanție devin proprietatea Western Import.</li>
<li>Western Import nu este responsabilă pentru pierderea datelor. Faceți backup înainte de predare.</li>
<li>Dacă diagnosticul relevă o problemă neacoperită de garanție, costul diagnosticului este de 300 MDL.</li>
</ul>

<h2>Contact service</h2>
<ul>
<li><strong>Telefon service:</strong> +373 69 466 585</li>
<li><strong>E-mail service:</strong> service@westernimport.md</li>
<li><strong>Adresă:</strong> str. Podgorenilor 17, Chișinău</li>
<li><strong>Program service:</strong> Luni–Vineri: 09:00–18:00, Sâmbătă: 10:00–15:00</li>
</ul>`,
    contentRu: `<h2>Сроки гарантии</h2>
<ul>
<li><strong>Новые товары: 12 месяцев</strong> — Полная гарантия на все новые товары, приобретённые у Western Import.</li>
<li><strong>Восстановленные товары: 6 месяцев</strong> — Гарантия на восстановленные/проверенные товары, покрывающая основные технические неисправности.</li>
</ul>

<h2>Что покрывает гарантия</h2>
<ul>
<li>Производственные дефекты компонентов оборудования</li>
<li>Проблемы работы, возникшие при нормальных условиях использования</li>
<li>Дефекты экрана (битые пиксели, линии, пятна)</li>
<li>Проблемы питания или зарядки, не связанные с износом</li>
<li>Дефекты портов и разъёмов</li>
<li>Проблемы предустановленного ПО (ОС, драйверы)</li>
<li>Дефекты клавиатуры и трекпада</li>
<li>Дефекты динамиков, микрофона или веб-камеры</li>
</ul>

<h2>Что НЕ покрывает гарантия</h2>
<ul>
<li>Повреждения от падений, ударов или воздействия жидкостей</li>
<li>Намеренные повреждения или несанкционированные модификации</li>
<li>Использование продукта вне указанных технических параметров</li>
<li>Аккумуляторы с пониженной ёмкостью из-за нормального износа</li>
<li>Расходные аксессуары (чехлы, кабели, зарядные устройства не из оригинального комплекта)</li>
<li>Проблемы ПО, вызванные последующими установками программ</li>
<li>Неисправности, вызванные вирусами или вредоносным ПО</li>
<li>Эстетические повреждения (царапины, вмятины), не влияющие на функциональность</li>
<li>Ремонт, выполненный неавторизованными третьими лицами</li>
<li>Использование несовместимых аксессуаров</li>
</ul>

<h2>Процедура обслуживания</h2>
<ol>
<li><strong>Свяжитесь с нами</strong> — Позвоните +373 69 466 585 или напишите на info@westernimport.md. Опишите проблему и укажите номер заказа.</li>
<li><strong>Диагностика</strong> — Наша команда оценит проблему и подтвердит, покрывается ли она гарантией.</li>
<li><strong>Передача товара</strong> — Принесите товар в наш офис по ул. Подгоренилор 17, Кишинёв, или организуйте забор курьером (бесплатно по гарантии).</li>
<li><strong>Ремонт или замена</strong> — Срок ремонта: 5–15 рабочих дней. Если товар не подлежит ремонту, предоставим эквивалентный товар или возврат средств.</li>
<li><strong>Возврат товара</strong> — Мы уведомим вас, когда товар будет готов, и согласуем способ возврата.</li>
</ol>

<h2>Условия гарантии</h2>
<ul>
<li>Гарантия начинается с даты покупки, указанной в счёте-фактуре.</li>
<li>Оригинальный счёт-фактура или подтверждение покупки обязательны.</li>
<li>Ремонт не продлевает гарантийный срок.</li>
<li>Заменённые по гарантии детали становятся собственностью Western Import.</li>
<li>Western Import не несёт ответственности за потерю данных. Сделайте резервную копию перед передачей.</li>
<li>Если диагностика выявит проблему, не покрываемую гарантией, стоимость диагностики — 300 MDL.</li>
</ul>

<h2>Контакты сервисного центра</h2>
<ul>
<li><strong>Телефон сервиса:</strong> +373 69 466 585</li>
<li><strong>E-mail сервиса:</strong> service@westernimport.md</li>
<li><strong>Адрес:</strong> ул. Подгоренилор 17, Кишинёв</li>
<li><strong>Часы работы:</strong> Понедельник–Пятница: 09:00–18:00, Суббота: 10:00–15:00</li>
</ul>`,
    isPublished: true,
  },
  {
    slug: 'shipping',
    titleRo: 'Livrare și Returnare',
    titleRu: 'Доставка и возврат',
    contentRo: `<h2>Metode de livrare</h2>
<ul>
<li><strong>Curier Chișinău</strong> — Gratuit, livrare în 1–2 zile lucrătoare</li>
<li><strong>Curier național</strong> — Gratuit, livrare în 2–5 zile lucrătoare</li>
<li><strong>Ridicare din magazin</strong> — Gratuit, str. Podgorenilor 17, Chișinău</li>
</ul>

<h2>Tabel livrare</h2>
<table>
<tr><th>Metodă</th><th>Zonă</th><th>Cost</th><th>Termen</th></tr>
<tr><td>Curier</td><td>Chișinău</td><td>Gratuit</td><td>1–2 zile</td></tr>
<tr><td>Curier</td><td>Republica Moldova</td><td>Gratuit</td><td>2–5 zile</td></tr>
<tr><td>Ridicare</td><td>Magazin Chișinău</td><td>Gratuit</td><td>Aceleași zi*</td></tr>
</table>
<p><small>* Ridicarea din magazin este disponibilă după confirmarea comenzii de către operator (maximum 2 ore).</small></p>

<h2>Detalii despre livrare</h2>
<ul>
<li>Comenzile plasate până la ora 14:00 (luni–vineri) sunt expediate în aceeași zi.</li>
<li>Comenzile plasate vineri după 14:00, sâmbătă sau duminică sunt expediate luni.</li>
<li>La livrare, curierul așteaptă maximum 15 minute. Replanificarea costă 100 MDL.</li>
<li>Livrare <strong>gratuită</strong> oriunde în Moldova, indiferent de suma comenzii.</li>
<li>Vă rugăm să verificați coletul la primire. Dacă observați deteriorări, semnați proces-verbal cu curierul.</li>
<li>Livrarea se face doar pe teritoriul Republicii Moldova.</li>
</ul>

<h2>Returnare și rambursare</h2>
<p>Conform legislației Republicii Moldova, aveți dreptul de a returna produsele în termen de <strong>14 zile calendaristice</strong> de la data primirii coletului.</p>

<h3>Condiții de returnare</h3>
<ul>
<li>Produsul trebuie să fie în starea originală, neutilizat și nedeteriorat.</li>
<li>Ambalajul trebuie să fie complet și intact, inclusiv accesorii și instrucțiuni.</li>
<li>Factura sau dovada achiziției trebuie inclusă în colet.</li>
<li>Produsele cu software activat sau conturi create nu pot fi returnate.</li>
<li>Accesoriile desigilate (căști, încărcătoare etc.) nu pot fi returnate din motive de igienă.</li>
</ul>

<h3>Procedura de returnare</h3>
<ol>
<li>Contactați-ne la <strong>+373 69 466 585</strong> sau <strong>info@westernimport.md</strong> pentru a obține un număr de autorizație de returnare (RMA).</li>
<li>Pregătiți produsul în ambalajul original cu toate accesoriile și factura.</li>
<li>Adresați-vă la sediul nostru sau programați ridicarea de către curier (cost: 150 MDL, suportat de client).</li>
<li>După primire, echipa noastră va inspecta produsul în maximum 3 zile lucrătoare.</li>
<li>Rambursarea se va face prin aceeași metodă de plată folosită la achiziție, în maximum 14 zile lucrătoare.</li>
</ol>

<h3>Produse care NU pot fi returnate</h3>
<ul>
<li>Software desigilat sau licențe activate.</li>
<li>Produse personalizate sau gravate.</li>
<li>Consumabile desigilate (cartușe, tonere, baterii).</li>
<li>Produse cu defecțiuni cauzate de utilizare incorectă.</li>
</ul>`,
    contentRu: `<h2>Способы доставки</h2>
<ul>
<li><strong>Курьер по Кишинёву</strong> — Бесплатно, доставка за 1–2 рабочих дня</li>
<li><strong>Курьер по стране</strong> — Бесплатно, доставка за 2–5 рабочих дней</li>
<li><strong>Самовывоз из магазина</strong> — Бесплатно, ул. Подгоренилор 17, Кишинёв</li>
</ul>

<h2>Таблица доставки</h2>
<table>
<tr><th>Способ</th><th>Зона</th><th>Стоимость</th><th>Срок</th></tr>
<tr><td>Курьер</td><td>Кишинёв</td><td>Бесплатно</td><td>1–2 дня</td></tr>
<tr><td>Курьер</td><td>Республика Молдова</td><td>Бесплатно</td><td>2–5 дней</td></tr>
<tr><td>Самовывоз</td><td>Магазин, Кишинёв</td><td>Бесплатно</td><td>В тот же день*</td></tr>
</table>
<p><small>* Самовывоз доступен после подтверждения заказа оператором (максимум 2 часа).</small></p>

<h2>Детали доставки</h2>
<ul>
<li>Заказы, оформленные до 14:00 (понедельник–пятница), отправляются в тот же день.</li>
<li>Заказы, оформленные в пятницу после 14:00, в субботу или воскресенье, отправляются в понедельник.</li>
<li>При доставке курьер ждёт максимум 15 минут. Перенос доставки стоит 100 MDL.</li>
<li><strong>Бесплатная</strong> доставка по всей Молдове, независимо от суммы заказа.</li>
<li>Пожалуйста, проверяйте посылку при получении. При обнаружении повреждений составьте акт с курьером.</li>
<li>Доставка осуществляется только на территории Республики Молдова.</li>
</ul>

<h2>Возврат и возмещение</h2>
<p>Согласно законодательству Республики Молдова, вы имеете право вернуть товар в течение <strong>14 календарных дней</strong> с даты получения посылки.</p>

<h3>Условия возврата</h3>
<ul>
<li>Товар должен быть в оригинальном состоянии, неиспользованный и неповреждённый.</li>
<li>Упаковка должна быть полной и неповреждённой, включая аксессуары и инструкции.</li>
<li>Счёт-фактура или подтверждение покупки должны быть включены в посылку.</li>
<li>Товары с активированным ПО или созданными аккаунтами не подлежат возврату.</li>
<li>Вскрытые аксессуары (наушники, зарядные устройства и т.д.) не подлежат возврату по гигиеническим соображениям.</li>
</ul>

<h3>Процедура возврата</h3>
<ol>
<li>Свяжитесь с нами по <strong>+373 69 466 585</strong> или <strong>info@westernimport.md</strong> для получения номера авторизации возврата (RMA).</li>
<li>Подготовьте товар в оригинальной упаковке со всеми аксессуарами и счётом.</li>
<li>Принесите товар в наш офис или организуйте забор курьером (стоимость: 150 MDL, оплачивается клиентом).</li>
<li>После получения наша команда осмотрит товар в течение максимум 3 рабочих дней.</li>
<li>Возмещение будет произведено тем же способом оплаты, что и при покупке, в течение максимум 14 рабочих дней.</li>
</ol>

<h3>Товары, НЕ подлежащие возврату</h3>
<ul>
<li>Вскрытое ПО или активированные лицензии.</li>
<li>Персонализированные или гравированные товары.</li>
<li>Вскрытые расходные материалы (картриджи, тонеры, батареи).</li>
<li>Товары с дефектами, вызванными неправильным использованием.</li>
</ul>`,
    isPublished: true,
  },
  {
    slug: 'terms',
    titleRo: 'Termeni și Condiții',
    titleRu: 'Условия и положения',
    contentRo: `<p><em>Ultima actualizare: 20 mai 2026</em></p>

<h2>1. Dispoziții generale</h2>
<p>Prezentul document stabilește termenii și condițiile de utilizare a site-ului westernimport.md, proprietatea SRL Western Import, înregistrată în Chișinău, Republica Moldova, CIF/IDNO 1022600012345, sediul social str. Podgorenilor 17, Chișinău.</p>
<p>Accesarea și utilizarea Site-ului implică acceptarea integrală a prezentului document. Western Import își rezervă dreptul de a modifica acești termeni în orice moment.</p>
<p>Vârsta minimă pentru efectuarea de achiziții este de 18 ani.</p>

<h2>2. Conturi utilizatori</h2>
<p>Pentru a plasa comenzi pe Site, utilizatorul trebuie să creeze un cont furnizând date personale reale și complete.</p>
<ul>
<li>Utilizatorul este singurul responsabil pentru păstrarea confidențialității datelor de autentificare.</li>
<li>Orice activitate realizată din contul utilizatorului este considerată ca fiind efectuată de acesta.</li>
<li>Western Import își rezervă dreptul de a suspenda sau șterge conturi care încalcă acești termeni.</li>
<li>Datele personale sunt procesate în conformitate cu Politica de Confidențialitate.</li>
</ul>

<h2>3. Produse și prețuri</h2>
<p>Prețurile afișate pe Site sunt exprimate în Lei moldovenești (MDL) și includ TVA.</p>
<ul>
<li>În cazul unei erori evidente de preț, Western Import poate anula comanda și va notifica clientul în maximum 24 de ore.</li>
<li>Photografiile produselor au caracter informativ; nuanțele de culoare pot diferi față de produsul real.</li>
<li>Stocul este actualizat în timp real.</li>
<li>Promoțiile sunt valabile în perioada specificată și nu se cumulează decât dacă este menționat explicit.</li>
</ul>

<h2>4. Procesul de comandă</h2>
<p>Plasarea unei comenzi presupune: selectarea produselor, adăugarea în coș, completarea datelor de livrare, alegerea metodei de plată și confirmarea.</p>
<ul>
<li>După confirmare, clientul primește un e-mail cu detaliile comenzii.</li>
<li>Comanda devine definitivă după confirmarea de către Western Import.</li>
<li>Western Import poate refuza o comandă în caz de suspiciune de fraudă.</li>
<li>Clientul poate anula o comandă gratuit înainte de expediere.</li>
</ul>

<h2>5. Metode de plată</h2>
<ul>
<li><strong>Numerar la livrare</strong> — plata se efectuează curierului la primirea coletului.</li>
<li><strong>Card bancar online</strong> — Visa, MasterCard, procesare securizată.</li>
<li><strong>Transfer bancar</strong> — datele de plată vor fi trimise pe e-mail după confirmarea comenzii.</li>
</ul>
<p>Plățile online sunt procesate prin conexiuni securizate (SSL/TLS). Datele cardului bancar nu sunt stocate pe serverele noastre.</p>

<h2>6. Livrare</h2>
<p>Detalii complete despre metodele și termenele de livrare sunt disponibile pe pagina <a href="/shipping">Livrare și Returnare</a>.</p>
<ul>
<li>Riscul transferului de proprietate trece la client în momentul predării produsului către curier.</li>
<li>Clientul trebuie să verifice integritatea coletului la primire.</li>
<li>Livrarea se face exclusiv pe teritoriul Republicii Moldova.</li>
</ul>

<h2>7. Returnare și rambursare</h2>
<p>Conform legislației Republicii Moldova, clientul are dreptul de a returna produsul în termen de 14 zile calendaristice de la primire.</p>
<ul>
<li>Costurile de returnare sunt suportate de client, cu excepția produselor defecte sau necorespunzătoare.</li>
<li>Rambursarea se efectuează în maximum 14 zile lucrătoare.</li>
<li>Produsele personalizate sau sigilate care au fost desigilate nu pot fi returnate.</li>
</ul>

<h2>8. Proprietate intelectuală</h2>
<p>Tot conținutul Site-ului este proprietatea Western Import sau a licențiatorilor săi și este protejat de legislația privind drepturile de autor.</p>
<ul>
<li>Reproducerea, distribuirea sau utilizarea conținutului fără acord scris prealabil este interzisă.</li>
<li>Numele „Western Import", logo-ul și sloganurile sunt mărci ale companiei.</li>
</ul>

<h2>9. Limitarea răspunderii</h2>
<p>Western Import depune eforturi rezonabile pentru a asigura exactitatea informațiilor de pe Site, dar nu oferă garanții privind disponibilitatea neîntreruptă a Site-ului, absența erorilor sau compatibilitatea cu orice dispozitiv.</p>

<h2>10. Forța majoră</h2>
<p>Western Import nu va fi responsabilă pentru întârzieri cauzate de evenimente independente de voința sa: dezastre naturale, pandemii, conflicte armate, greve, restricții guvernamentale etc.</p>

<h2>11. Legi aplicabile și jurisdicție</h2>
<p>Prezentul document este guvernat de legislația Republicii Moldova. Orice litigiu va fi soluționat pe cale amiabilă, iar în lipsa unui acord, prin instanțele judecătorești competente din Chișinău.</p>

<h2>12. Contact</h2>
<ul>
<li><strong>E-mail:</strong> info@westernimport.md</li>
<li><strong>Telefon:</strong> +373 69 466 585</li>
<li><strong>Adresă:</strong> str. Podgorenilor 17, Chișinău, Republica Moldova</li>
<li><strong>Program:</strong> Luni–Vineri: 09:00–18:00, Sâmbătă: 10:00–15:00</li>
</ul>`,
    contentRu: `<p><em>Последнее обновление: 20 мая 2026 г.</em></p>

<h2>1. Общие положения</h2>
<p>Настоящий документ устанавливает условия и положения использования сайта westernimport.md, принадлежащего SRL Western Import, зарегистрированной в Кишинёве, Республика Молдова, CIF/IDNO 1022600012345, юридический адрес: ул. Подгоренилор 17, Кишинёв.</p>
<p>Доступ и использование Сайта подразумевают полное принятие настоящего документа. Western Import оставляет за собой право изменять эти условия в любое время.</p>
<p>Минимальный возраст для совершения покупок — 18 лет.</p>

<h2>2. Аккаунты пользователей</h2>
<p>Для оформления заказов на Сайте пользователь должен создать аккаунт, предоставив реальные и полные персональные данные.</p>
<ul>
<li>Пользователь несёт единоличную ответственность за сохранение конфиденциальности данных аутентификации.</li>
<li>Любая активность из аккаунта пользователя считается совершённой им.</li>
<li>Western Import оставляет за собой право приостановить или удалить аккаунты, нарушающие эти условия.</li>
<li>Персональные данные обрабатываются в соответствии с Политикой конфиденциальности.</li>
</ul>

<h2>3. Товары и цены</h2>
<p>Цены на Сайте указаны в молдавских леях (MDL) и включают НДС.</p>
<ul>
<li>В случае очевидной ошибки в цене Western Import может отменить заказ и уведомить клиента в течение 24 часов.</li>
<li>Фотографии товаров носят информационный характер; оттенки цвета могут отличаться.</li>
<li>Наличие товара обновляется в реальном времени.</li>
<li>Акции действительны в указанный период и не суммируются, если не указано иное.</li>
</ul>

<h2>4. Процесс заказа</h2>
<p>Оформление заказа: выбор товаров, добавление в корзину, заполнение данных доставки, выбор способа оплаты и подтверждение.</p>
<ul>
<li>После подтверждения клиент получает электронное письмо с деталями заказа.</li>
<li>Заказ становится окончательным после подтверждения Western Import.</li>
<li>Western Import может отказать в заказе при подозрении на мошенничество.</li>
<li>Клиент может отменить заказ бесплатно до отправки товара.</li>
</ul>

<h2>5. Способы оплаты</h2>
<ul>
<li><strong>Наличные при получении</strong> — оплата курьеру при получении посылки.</li>
<li><strong>Банковская карта онлайн</strong> — Visa, MasterCard, безопасная обработка.</li>
<li><strong>Банковский перевод</strong> — платёжные данные будут отправлены по электронной почте после подтверждения заказа.</li>
</ul>
<p>Онлайн-платежи обрабатываются через защищённые соединения (SSL/TLS). Данные банковской карты не хранятся на наших серверах.</p>

<h2>6. Доставка</h2>
<p>Подробности о способах и сроках доставки доступны на странице <a href="/shipping">Доставка и возврат</a>.</p>
<ul>
<li>Риск перехода права собственности переходит к клиенту в момент передачи товара курьеру.</li>
<li>Клиент должен проверить целостность посылки при получении.</li>
<li>Доставка осуществляется исключительно на территории Республики Молдова.</li>
</ul>

<h2>7. Возврат и возмещение</h2>
<p>Согласно законодательству Республики Молдова, клиент имеет право вернуть товар в течение 14 календарных дней с момента получения.</p>
<ul>
<li>Расходы на возврат несёт клиент, за исключением дефектных или несоответствующих товаров.</li>
<li>Возмещение осуществляется в течение максимум 14 рабочих дней.</li>
<li>Персонализированные или вскрытые товары не подлежат возврату.</li>
</ul>

<h2>8. Интеллектуальная собственность</h2>
<p>Всё содержание Сайта является собственностью Western Import или её лицензиаров и защищено законодательством об авторском праве.</p>
<ul>
<li>Воспроизведение, распространение или использование контента без предварительного письменного согласия запрещено.</li>
<li>Название «Western Import», логотип и слоганы являются товарными знаками компании.</li>
</ul>

<h2>9. Ограничение ответственности</h2>
<p>Western Import прилагает разумные усилия для обеспечения точности информации на Сайте, но не гарантирует бесперебойную доступность, отсутствие ошибок или совместимость с любым устройством.</p>

<h2>10. Форс-мажор</h2>
<p>Western Import не несёт ответственности за задержки, вызванные обстоятельствами, не зависящими от её воли: стихийные бедствия, пандемии, вооружённые конфликты, забастовки, правительственные ограничения и т.д.</p>

<h2>11. Применимое законодательство и юрисдикция</h2>
<p>Настоящий документ регулируется законодательством Республики Молдова. Любой спор разрешается в мирном порядке, а при отсутствии согласия — через компетентные суды Кишинёва.</p>

<h2>12. Контакты</h2>
<ul>
<li><strong>E-mail:</strong> info@westernimport.md</li>
<li><strong>Телефон:</strong> +373 69 466 585</li>
<li><strong>Адрес:</strong> ул. Подгоренилор 17, Кишинёв, Республика Молдова</li>
<li><strong>Часы работы:</strong> Понедельник–Пятница: 09:00–18:00, Суббота: 10:00–15:00</li>
</ul>`,
    isPublished: true,
  },
];

// /api/admin/seed-pages — seed pages with full RO/RU content
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return errorResponse('Neautorizat', 401);
    }

    let created = 0;
    let updated = 0;

    for (const page of pagesData) {
      const result = await prisma.page.upsert({
        where: { slug: page.slug },
        update: {
          titleRo: page.titleRo,
          titleRu: page.titleRu,
          contentRo: page.contentRo,
          contentRu: page.contentRu,
          isPublished: page.isPublished,
        },
        create: page,
      });
      // Check if it was created or updated
      const existed = await prisma.page.count({ where: { slug: page.slug } });
      if (existed > 0) {
        // We can't easily tell if it was created vs updated with upsert,
        // but the count after upsert will always be 1
        updated++;
      }
    }

    // Recount
    const total = await prisma.page.count();

    return successResponse({
      message: 'Pages seeded successfully',
      total,
      pages: pagesData.map(p => ({ slug: p.slug, titleRo: p.titleRo, titleRu: p.titleRu })),
    }, 201);
  } catch (e) {
    console.error('[SEED-PAGES] Error:', e);
    return serverErrorResponse();
  }
}
