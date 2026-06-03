// src/lib/integrations/nineNineNineMd.ts — 999.md Partners API Client
// Docs: https://partners-api.999.md/api/documentation
//
// Autentificare: HTTP Basic Auth peste HTTPS. Cheia API este "username",
// parola lipsește → credențiala este `API_KEY:` (cu două puncte la final),
// codificată base64. Header: `Authorization: Basic <base64(api_key + ":")>`.
//
// Format creare advert (verificat live):
//   POST /adverts
//   { category_id:"2", subcategory_id:"4", offer_type:"776",
//     features:[ {id:"7", value:"12900"}, {id:"2", value:"9999", unit:"mdl"},
//                {id:"12", value:"Titlu"}, {id:"14", value:["image_id.jpg"]} ] }
//   IMPORTANT: `id` și `value` (pentru drop-down) sunt STRING-uri, nu numere.

const BASE_URL = 'https://partners-api.999.md';
const API_KEY = process.env.NINE_NINE_NINE_MD_API_KEY || 'qMmu73Mg5Q942hVLc4kyuyhnnf97';

export type Lang = 'ro' | 'ru';
export type Currency = 'mdl' | 'eur' | 'usd';

// ─── Auth ─────────────────────────────────────────────────────────
function basicAuth(): string {
  return 'Basic ' + Buffer.from(`${API_KEY}:`).toString('base64');
}

function jsonHeaders(): Record<string, string> {
  return { Authorization: basicAuth(), 'Content-Type': 'application/json' };
}

// ─── Core request ─────────────────────────────────────────────────
async function apiRequest<T>(
  method: string,
  path: string,
  opts: { body?: unknown; params?: Record<string, string | number | undefined> } = {}
): Promise<T> {
  let url = `${BASE_URL}${path}`;
  if (opts.params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.params)) {
      if (v !== undefined && v !== '') qs.append(k, String(v));
    }
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  const res = await fetch(url, {
    method,
    headers: jsonHeaders(),
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`999.md API ${res.status} ${method} ${path}: ${parseApiError(text)}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

function parseApiError(text: string): string {
  try {
    const j = JSON.parse(text);
    if (typeof j.error === 'string') return j.error;
    if (j.error?.message) return j.error.message;
    return text;
  } catch {
    return text || 'Eroare necunoscută';
  }
}

// ─── Tipuri taxonomie / features ──────────────────────────────────
export interface Category { id: string; title: string; url?: string }
export interface Subcategory { id: string; title: string; url?: string }
export interface OfferType { id: string; title: string }

export interface FeatureOption { id: string | number; title: string }
export interface Feature {
  id: string | number;
  title: string;
  type: string; // drop_down_options | textbox_text | textbox_numeric_measurement | upload_images | offer_type | ...
  required: boolean;
  options?: FeatureOption[];
  units?: string[] | null;
  depends_on?: unknown;
}
export interface FeatureGroup { title: string; features: Feature[] }
export interface FeaturesResponse { features_groups: FeatureGroup[] }

// Un câmp trimis la creare/actualizare advert
export interface AdvertFeatureInput {
  id: string;
  value: string | string[];
  unit?: string;
}
export interface AdvertInput {
  category_id: string;
  subcategory_id: string;
  offer_type: string;
  features: AdvertFeatureInput[];
}

// ─── Taxonomie ────────────────────────────────────────────────────
export async function getCategories(lang: Lang = 'ro'): Promise<Category[]> {
  const d = await apiRequest<{ categories: Category[] }>('GET', '/categories', { params: { lang } });
  return d.categories ?? [];
}

export async function getSubcategories(categoryId: string | number, lang: Lang = 'ro'): Promise<Subcategory[]> {
  const d = await apiRequest<{ subcategories: Subcategory[] }>(
    'GET', `/categories/${categoryId}/subcategories`, { params: { lang } }
  );
  return d.subcategories ?? [];
}

export async function getOfferTypes(
  categoryId: string | number, subcategoryId: string | number, lang: Lang = 'ro'
): Promise<OfferType[]> {
  const d = await apiRequest<{ offer_types: OfferType[] }>(
    'GET', `/categories/${categoryId}/subcategories/${subcategoryId}/offer-types`, { params: { lang } }
  );
  return d.offer_types ?? [];
}

// GET /features — primii 3 parametri sunt obligatorii
export async function getFeatures(args: {
  category_id: string | number;
  subcategory_id: string | number;
  offer_type: string | number;
  lang?: Lang;
}): Promise<FeaturesResponse> {
  return apiRequest<FeaturesResponse>('GET', '/features', {
    params: {
      category_id: String(args.category_id),
      subcategory_id: String(args.subcategory_id),
      offer_type: String(args.offer_type),
      lang: args.lang ?? 'ro',
    },
  });
}

export async function getDependentOptions(args: {
  subcategory_id: string | number;
  dependency_feature_id: string | number;
  parent_option_id: string | number;
  lang?: Lang;
}) {
  return apiRequest<any>('GET', '/dependent_options', {
    params: {
      subcategory_id: String(args.subcategory_id),
      dependency_feature_id: String(args.dependency_feature_id),
      parent_option_id: String(args.parent_option_id),
      lang: args.lang ?? 'ro',
    },
  });
}

// ─── Cont ─────────────────────────────────────────────────────────
export async function getCash(): Promise<number> {
  const d = await apiRequest<{ cash: number }>('GET', '/cash');
  return d.cash;
}

export async function getPhoneNumbers(lang: Lang = 'ro') {
  return apiRequest<any>('GET', '/phone_numbers', { params: { lang } });
}

// ─── Imagini ──────────────────────────────────────────────────────
// POST /images (multipart/form-data, câmp `file`) → { image_id }
export async function uploadImageFromUrl(url: string): Promise<string> {
  const src = await fetch(url, { cache: 'no-store' });
  if (!src.ok) throw new Error(`Nu pot descărca imaginea (${src.status}): ${url}`);
  const blob = await src.blob();
  const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg';

  const form = new FormData();
  form.append('file', blob, filename);

  // NB: fără Content-Type manual — fetch setează singur boundary-ul multipart.
  const res = await fetch(`${BASE_URL}/images`, {
    method: 'POST',
    headers: { Authorization: basicAuth() },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`999.md upload imagine ${res.status}: ${parseApiError(text)}`);
  const d = JSON.parse(text);
  return d.image_id ?? d.id;
}

// ─── Adverts ──────────────────────────────────────────────────────
export interface AdvertsListParams {
  page?: number | string;
  page_size?: number | string;
  states?: string; // comma-separated: ex. "public,hidden"
  lang?: Lang;
}
export async function getAdverts(params: AdvertsListParams = {}): Promise<{ adverts: any[]; raw: any }> {
  const raw = await apiRequest<any>('GET', '/adverts', {
    params: {
      page: params.page,
      page_size: params.page_size,
      states: params.states,
      lang: params.lang ?? 'ro',
    },
  });
  return { adverts: Array.isArray(raw?.adverts) ? raw.adverts : [], raw };
}

export async function getAdvert(id: string | number, lang: Lang = 'ro') {
  return apiRequest<any>('GET', `/adverts/${id}`, { params: { lang } });
}

export async function getAdvertFeatures(id: string | number, lang: Lang = 'ro') {
  return apiRequest<any>('GET', `/adverts/${id}/features`, { params: { lang } });
}

export async function createAdvert(input: AdvertInput): Promise<{ id: string }> {
  const d = await apiRequest<{ advert?: { id: string }; id?: string }>('POST', '/adverts', { body: input });
  const id = d.advert?.id ?? d.id;
  if (!id) throw new Error('999.md: răspuns fără id la creare advert');
  return { id: String(id) };
}

// PATCH — actualizează doar feature-urile trimise; value:null șterge un feature
export async function updateAdvert(
  id: string | number,
  features: AdvertFeatureInput[],
  offerType?: string
) {
  const body: Record<string, unknown> = { features };
  if (offerType) body.offer_type = offerType;
  return apiRequest<any>('PATCH', `/adverts/${id}`, { body });
}

export async function republishAdvert(id: string | number) {
  return apiRequest<any>('POST', `/adverts/${id}/republish`);
}

export async function setAccessPolicy(id: string | number, policy: 'public' | 'private') {
  return apiRequest<any>('PUT', `/adverts/${id}/access_policy`, { body: { access_policy: policy } });
}

// ─── Mapare produs local → advert 999.md ──────────────────────────
export interface Local999Product {
  name: string;
  price: number;
  currency?: Currency;
  descriptionRo?: string | null;
  descriptionRu?: string | null;
  images?: string[];          // URL-uri (se încarcă pe 999.md)
  brand?: string | null;      // ex. "Acer"
  condition?: 'NEW' | 'REFURBISHED' | 'USED';
  categorySlug?: string | null;
  categoryName?: string | null;
  region?: string;            // implicit Chișinău
  specs?: Record<string, string | null>; // RAM, Storage, Display, CPU, GPU etc.
}

// Mapare categorie locală → taxonomie 999.md (category_id, subcategory_id).
// Cheile sunt cuvinte-cheie căutate în slug/nume (normalizate, fără diacritice).
interface Taxonomy { category_id: string; subcategory_id: string; offer_type: string }
const TAXONOMY_RULES: Array<{ match: string[]; tax: Taxonomy }> = [
  { match: ['laptop', 'notebook'],            tax: { category_id: '2',  subcategory_id: '4',    offer_type: '776' } },
  { match: ['desktop', 'calculator', 'pc'],   tax: { category_id: '2',  subcategory_id: '3',    offer_type: '776' } },
  { match: ['monoblo', 'all-in-one'],         tax: { category_id: '2',  subcategory_id: '7660', offer_type: '776' } },
  { match: ['mini'],                          tax: { category_id: '2',  subcategory_id: '7661', offer_type: '776' } },
  { match: ['tablet'],                        tax: { category_id: '2',  subcategory_id: '1485', offer_type: '776' } },
  { match: ['monitor'],                       tax: { category_id: '2',  subcategory_id: '10',   offer_type: '776' } },
  { match: ['placa video', 'gpu', 'video'],   tax: { category_id: '2',  subcategory_id: '11',   offer_type: '776' } },
  { match: ['procesor', 'cpu'],               tax: { category_id: '2',  subcategory_id: '14',   offer_type: '776' } },
  { match: ['ssd'],                           tax: { category_id: '2',  subcategory_id: '7663', offer_type: '776' } },
  { match: ['hdd'],                           tax: { category_id: '2',  subcategory_id: '13',   offer_type: '776' } },
  { match: ['ram', 'memorie'],                tax: { category_id: '2',  subcategory_id: '12',   offer_type: '776' } },
  { match: ['telefon', 'smartphone', 'phone', 'iphone'], tax: { category_id: '38', subcategory_id: '40', offer_type: '776' } },
];
const DEFAULT_TAXONOMY: Taxonomy = { category_id: '2', subcategory_id: '4', offer_type: '776' };

export function resolveTaxonomy(p: Local999Product): Taxonomy {
  const hay = norm(`${p.categorySlug ?? ''} ${p.categoryName ?? ''} ${p.name}`);
  for (const rule of TAXONOMY_RULES) {
    if (rule.match.some((m) => hay.includes(norm(m)))) return rule.tax;
  }
  return DEFAULT_TAXONOMY;
}

// Normalizare pentru comparații (lowercase, fără diacritice/spații duble)
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function findOption(options: FeatureOption[] | undefined, ...candidates: string[]): string | undefined {
  if (!options?.length) return undefined;
  const wanted = candidates.map(norm).filter(Boolean);
  // 1) potrivire exactă
  for (const w of wanted) {
    const o = options.find((opt) => norm(opt.title) === w);
    if (o) return String(o.id);
  }
  // 2) potrivire parțială (în ambele sensuri)
  for (const w of wanted) {
    const o = options.find((opt) => norm(opt.title).includes(w) || w.includes(norm(opt.title)));
    if (o) return String(o.id);
  }
  return undefined;
}

const titleMatches = (t: string, ...keys: string[]) => keys.some((k) => norm(t).includes(norm(k)));

// ─── Spec matching helpers ─────────────────────────────────────────
// Mapare între cheile de spec locale și feature IDs / titluri 999.md
// Pe 999.md specificatiile sunt DROP_DOWN cu optiuni predefinite.
// Trebuie sa potrivim valoarea din spec cu optiunea corecta.

// Mapare: specKey local → [{featureId 999.md, ...keywords pentru titlu}]
const SPEC_FEATURE_MAP: Array<{
  specKeys: string[];
  featureKeywords: string[];
  matchMode: 'exact_option' | 'contains' | 'prefix';
}> = [
  // RAM: "8 GB" → optiunea "8 GB"
  { specKeys: ['ram'], featureKeywords: ['memorie ram', 'ram'], matchMode: 'exact_option' },
  // Storage capacity: "256 GB" → optiunea "256 GB"
  { specKeys: ['storage'], featureKeywords: ['capacitatea hard', 'capacit', 'stocare'], matchMode: 'exact_option' },
  // CPU Series: "Intel Core i5" → "Intel Core i5"
  { specKeys: ['cpuSeries', 'cpuModel'], featureKeywords: ['serie procesor', 'procesor'], matchMode: 'exact_option' },
  // GPU Series: "GeForce RTX 30" → optiunea
  { specKeys: ['gpuSeries'], featureKeywords: ['serie placa video', 'serie plac'], matchMode: 'exact_option' },
  // GPU Type: "Dedicată" sau "Încorporată"
  { specKeys: ['gpuType'], featureKeywords: ['tip placa video', 'tip plac'], matchMode: 'exact_option' },
  // Display: "15.6"" → optiunea "15.6\""  
  { specKeys: ['display'], featureKeywords: ['diagonala', 'ecran', 'diagonal'], matchMode: 'contains' },
  // Resolution: "1920x1080" → optiunea "1920x1080 px"
  { specKeys: ['resolution'], featureKeywords: ['rezolut', 'resolution'], matchMode: 'contains' },
  // Refresh rate: "144" → optiunea "144 Hz"
  { specKeys: ['refreshRate'], featureKeywords: ['frecventa', 'refresh'], matchMode: 'contains' },
  // OS: "Windows" → optiunea "Windows"
  { specKeys: ['os'], featureKeywords: ['sistem de operare', 'sistem oper'], matchMode: 'exact_option' },
  // Storage type: "SSD" → optiunea "SSD"
  { specKeys: ['storageType'], featureKeywords: ['tip de stocare', 'tip stocare'], matchMode: 'exact_option' },
];

function tryMatchSpec(featureTitle: string, specs?: Record<string, string | null>): string | null {
  if (!specs) return null;
  for (const mapping of SPEC_FEATURE_MAP) {
    if (mapping.featureKeywords.some((k) => norm(featureTitle).includes(norm(k)))) {
      for (const key of mapping.specKeys) {
        const val = specs[key];
        if (val) return val;
      }
    }
  }
  return null;
}

function tryMatchSpecNumeric(featureTitle: string, specs?: Record<string, string | null>): string | undefined {
  const textVal = tryMatchSpec(featureTitle, specs);
  if (!textVal) return undefined;
  const num = textVal.match(/\d+(?:\.\d+)?/);
  return num ? num[0] : undefined;
}

/** Cauta valoarea spec-ului in optiunile dropdown-ului 999.md */
function tryMatchSpecDropdown(
  featureTitle: string,
  options: FeatureOption[] | undefined,
  specs?: Record<string, string | null>,
  product?: Local999Product
): string | undefined {
  if (!specs || !options?.length) return undefined;

  for (const mapping of SPEC_FEATURE_MAP) {
    if (!mapping.featureKeywords.some((k) => norm(featureTitle).includes(norm(k)))) continue;

    for (const specKey of mapping.specKeys) {
      const specVal = specs[specKey];
      if (!specVal) continue;

      // 1) Potrivire exacta a optiunii ("8 GB" == "8 GB")
      const exact = findOption(options, specVal);
      if (exact) return exact;

      // 2) Potrivire partiala — valoarea spec contine sau e continuta
      const normSpec = norm(specVal);
      for (const opt of options) {
        const normOpt = norm(opt.title);
        if (normOpt.includes(normSpec) || normSpec.includes(normOpt)) {
          return String(opt.id);
        }
      }

      // 3) Potrivire pe numere ("15.6" in "15.6\"")
      const specNum = specVal.match(/[\d.]+/)?.[0];
      if (specNum) {
        for (const opt of options) {
          const optNum = opt.title.match(/[\d.]+/)?.[0];
          if (optNum === specNum) return String(opt.id);
        }
      }
    }
  }
  return undefined;
}

export interface BuiltAdvert {
  input: AdvertInput;
  features: AdvertFeatureInput[];
  warnings: string[];
}

/**
 * Construiește payload-ul de advert pornind de la schema reală de features
 * a subcategoriei țintă. Completează automat câmpurile obligatorii (titlu, preț,
 * regiune, producător, stare, imagini) și pune valori implicite pentru
 * drop-down-urile obligatorii pe care nu le putem deduce (semnalate în `warnings`).
 */
export async function buildAdvertFromProduct(
  product: Local999Product,
  taxonomyOverride?: Partial<Taxonomy>,
  lang: Lang = 'ro'
): Promise<BuiltAdvert> {
  const tax: Taxonomy = { ...resolveTaxonomy(product), ...taxonomyOverride };
  const schema = await getFeatures({ ...tax, lang });
  const allFeatures = schema.features_groups.flatMap((g) => g.features);

  // Încarcă imaginile (URL → image_id)
  const imageIds: string[] = [];
  for (const url of product.images ?? []) {
    try {
      imageIds.push(await uploadImageFromUrl(url));
    } catch (e) {
      // o imagine ratată nu trebuie să blocheze publicarea
      console.error('[999.md] upload imagine eșuat:', (e as Error).message);
    }
  }

  const currency: Currency = product.currency ?? 'mdl';
  const conditionText = product.condition === 'NEW' ? 'Nou' : 'Uzat';
  const features: AdvertFeatureInput[] = [];
  const warnings: string[] = [];
  let titleAssigned = false;

  for (const f of allFeatures) {
    const id = String(f.id);
    const type = f.type;

    if (type === 'offer_type') continue; // mers la nivel top (offer_type)

    if (type === 'upload_images') {
      if (imageIds.length) features.push({ id, value: imageIds });
      else if (f.required) warnings.push(`Fără imagini pentru câmpul obligatoriu "${f.title}"`);
      continue;
    }

    if (type === 'textbox_numeric_measurement') {
      // Prețul are units mdl/eur/usd
      if (f.units?.some((u) => ['mdl', 'eur', 'usd'].includes(u))) {
        features.push({ id, value: String(Math.round(product.price)), unit: currency });
      } else if (f.required) {
        warnings.push(`Câmp numeric obligatoriu necompletat: "${f.title}"`);
      }
      continue;
    }

    if (type === 'textbox_text' || type === 'textarea' || type === 'textbox') {
      if (!titleAssigned && (titleMatches(f.title, 'head', 'titlu', 'заголов', 'denumire', 'nume') || f.required)) {
        // Trimitem titlul bilingv dacă avem ambele limbi
        const nameRu = product.name; // TODO: traducere dacă e necesar
        features.push({ id, value: product.name.slice(0, 100) });
        titleAssigned = true;
      } else if (titleMatches(f.title, 'descri', 'описан', 'body', 'text', 'continut', 'содержан', 'подробн')) {
        // Descriere bilingvă: RO + RU — trimitem ca text concatenat
        const descRo = product.descriptionRo || '';
        const descRu = product.descriptionRu || '';
        const desc = descRo || descRu || product.name;
        if (descRo && descRu) {
          features.push({ id, value: `${descRo.slice(0, 4000)}\n\n---\n\n${descRu.slice(0, 4000)}` });
        } else if (desc) {
          features.push({ id, value: String(desc).slice(0, 9000) });
        }
      } else if (f.required) {
        // Încercăm să potrivim spec-uri din produs
        const specVal = tryMatchSpec(f.title, product.specs);
        if (specVal) {
          features.push({ id, value: specVal });
        } else {
          warnings.push(`Câmp text obligatoriu necompletat: "${f.title}"`);
        }
      }
      continue;
    }

    if (type === 'drop_down_options' || type === 'drop_down') {
      let optId: string | undefined;

      if (titleMatches(f.title, 'regiune', 'регион', 'oras', 'localit')) {
        optId = findOption(f.options, product.region ?? 'Chișinău', 'Chisinau', 'Chișinău mun.');
      } else if (titleMatches(f.title, 'producator', 'производ', 'marca', 'brand')) {
        optId = product.brand ? findOption(f.options, product.brand) : undefined;
        if (!optId) optId = findOption(f.options, 'Altele', 'Другое', 'Other');
      } else if (titleMatches(f.title, 'stare', 'состоян', 'condit')) {
        optId = findOption(f.options, conditionText, product.condition === 'NEW' ? 'Nou' : 'Uzat', 'Folosit');
      } else {
        // Încercăm să potrivim spec-uri (RAM, storage, display etc.)
        optId = tryMatchSpecDropdown(f.title, f.options, product.specs, product);
      }

      if (!optId && f.required) {
        // nu putem deduce → prima opțiune, ca advertul să rămână valid
        optId = f.options?.[0] ? String(f.options[0].id) : undefined;
        if (optId) warnings.push(`Valoare implicită pentru "${f.title}" → "${f.options?.[0]?.title}"`);
      }
      if (optId) features.push({ id, value: optId });
      continue;
    }

    // Numeric simplu (fără unități de măsură) — potrivire cu spec-uri
    if (type === 'textbox_numeric') {
      const specVal = tryMatchSpecNumeric(f.title, product.specs);
      if (specVal !== undefined) {
        features.push({ id, value: String(specVal) });
      } else if (f.required) {
        warnings.push(`Câmp numeric obligatoriu necompletat: "${f.title}"`);
      }
      continue;
    }

    // alte tipuri obligatorii necunoscute → semnalăm
    if (f.required) warnings.push(`Tip de câmp neacoperit: "${f.title}" (${type})`);
  }

  return {
    input: { category_id: tax.category_id, subcategory_id: tax.subcategory_id, offer_type: tax.offer_type, features },
    features,
    warnings,
  };
}

// ─── Operațiuni de nivel înalt ────────────────────────────────────

/** Publică un produs nou pe 999.md. Întoarce id-ul advertului + avertismente. */
export async function pushProductTo999(
  product: Local999Product,
  opts: { taxonomy?: Partial<Taxonomy>; makePublic?: boolean; lang?: Lang } = {}
): Promise<{ id: string; warnings: string[] }> {
  const built = await buildAdvertFromProduct(product, opts.taxonomy, opts.lang);
  const { id } = await createAdvert(built.input);
  if (opts.makePublic !== false) {
    try { await setAccessPolicy(id, 'public'); } catch (e) {
      built.warnings.push(`Nu am putut seta public: ${(e as Error).message}`);
    }
  }
  return { id, warnings: built.warnings };
}

/** Actualizează un advert existent (titlu, preț, descriere, imagini, stare). */
export async function updateProductOn999(
  advertId: string | number,
  product: Local999Product,
  opts: { taxonomy?: Partial<Taxonomy>; lang?: Lang } = {}
): Promise<{ warnings: string[] }> {
  const built = await buildAdvertFromProduct(product, opts.taxonomy, opts.lang);
  await updateAdvert(advertId, built.features, built.input.offer_type);
  return { warnings: built.warnings };
}

/** Caută un advert după titlu în lista contului (folosit pentru sync idempotent). */
export async function findAdvertByTitle(title: string): Promise<string | null> {
  const { adverts } = await getAdverts({ page: 1, page_size: 100, states: 'public,hidden,archived' });
  const want = norm(title);
  const match = adverts.find((a) => norm(String(a.title ?? '')) === want);
  return match ? String(match.id) : null;
}

/** Ascunde un advert pe 999.md (setează access_policy = private). */
export async function hideAdvertOn999(id: string | number): Promise<void> {
  await setAccessPolicy(id, 'private');
}
