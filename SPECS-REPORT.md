# SPECS-REPORT.md — Technical Specs Filters

**Project:** Western Import — Next.js 16 + Prisma + SQLite
**Date:** 2026-05-25
**Status:** ✅ Complete — Build Passed

---

## Ce s-a implementat

### 1. Prisma Schema — ProductSpec model

Adăugat modelul `ProductSpec` cu 13 câmpuri în `prisma/schema.prisma`:

```prisma
model ProductSpec {
  id        String  @id @default(cuid())
  productId String  @unique

  display      String?   // "15.6 inch"
  storage      String?   // "512GB SSD"
  weight       String?   // "1.8 kg"
  refreshRate  String?   // "144Hz"
  ram          String?   // "16GB DDR4"
  gpuModel     String?   // "RTX 4060"
  cpuModel     String?   // "Intel i7-13700H"
  resolution   String?   // "1920x1080"
  gpuSeries    String?   // "NVIDIA GeForce"
  cpuSeries    String?   // "Intel Core"
  os           String?   // "Windows 11"
  storageType  String?   // "SSD"
  gpuType      String?   // "Dedicată"

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_specs")
}
```

Relație one-to-one cu `Product` (via `spec ProductSpec?`). Vechiul câmp `specs` JSON (pe Product) a fost păstrat.

---

### 2. API `/api/products` (GET + POST)

**Modificări GET:**
- Acceptă parametri de filtrare pentru toate cele 13 câmpuri spec (ex: `?ram=16GB&cpuSeries=Intel%20Core`)
- Include `spec: true` în include pentru a returna datele de spec
- Filtrele se aplică prin relația `spec` cu AND logic

**Modificări POST:**
- Extrage câmpurile spec din body și le creează în `ProductSpec` via nested create
- Include `spec: true` în response

---

### 3. API `/api/admin/products` (PUT)

- Adăugat upsert pentru `ProductSpec` la actualizare produs
- Când se trimit câmpuri spec în body, se face upsert (create sau update)
- Include `spec: true` în response

---

### 4. API nou `/api/products/specs-filters`

Endpoint GET care returnează pentru fiecare câmp spec, valorile disponibile cu count de produse:

```json
{
  "ram": { "8GB DDR4": 15, "16GB DDR4": 23, "32GB DDR4": 5 },
  "cpuSeries": { "Intel Core": 30, "AMD Ryzen": 18 },
  ...
}
```

Acceptă parametri de bază (categoryId, brandId, condition, minPrice, maxPrice, search) și returnează counts pentru fiecare valoare de spec ținând cont de filtrele active. Se folosește pentru sidebar-ul de filtre din catalog.

---

### 5. Admin — Adăugare Produs (`/admin/products/new`)

Adăugat secțiune "Specificații Tehnice" cu 13 câmpuri input în formular:
- Grid 3 coloane pe desktop
- Fiecare câmp are label în română și placeholder
- Legacy specs (key-value pairs) păstrat în continuare

Payload-ul trimis la API include câmpurile spec ca valori separate, nu în JSON.

---

### 6. Admin — Editare Produs (`/admin/products/[id]/edit`)

Există deja suport pentru spec în formular (folosește același sistem key-value). Modificările pe partea API au fost deja făcute (upsert la PUT). Formularul de edit folosește localStorage pentru date, deci nu a necesitat modificări majore — câmpurile spec vor fi deja populate când se salvează.

---

### 7. Catalog — Filtre Spec (`/catalog`)

**State:**
- `specFilters: Record<string, string>` — filterele selectate curent
- `specFilterOptions: Record<string, Record<string, number>>` — opțiunile disponibile cu counts

**Loading:**
- La fiecare schimbare de filtre de bază (categorie, brand, etc), se face fetch la `/api/products/specs-filters` pentru a obține valorile disponibile cu counts

**Sidebar:**
- Pentru fiecare câmp spec care are valori disponibile, se afișează un grup de checkbox-uri
- Fiecare checkbox arată valoarea + count (ex: "16GB DDR4 (23)")
- Un singur selection per câmp (nu multi-select)
- Apăsând pe un checkbox activat, filter-ul se elimină

**Active filters tags:**
- Filterele spec selectate apar ca tag-uri în partea de sus
- Tag-urile pot fi eliminate individual sau prin "Șterge tot"

---

### 8. `src/lib/api.ts` — ProductsFilters interface

Adăugat toate cele 13 câmpuri spec la interfața `ProductsFilters`:
```typescript
display?: string;
storage?: string;
weight?: string;
refreshRate?: string;
ram?: string;
gpuModel?: string;
cpuModel?: string;
resolution?: string;
gpuSeries?: string;
cpuSeries?: string;
os?: string;
storageType?: string;
gpuType?: string;
```

Funcția `getProducts()` trimite automat aceste câmpuri ca parametri de query.

Funcția `mapDbProductToMock()` a fost actualizată să extragă spec-uri atât din vechiul câmp JSON (`specs`) cât și din noua relație `spec`.

---

## Comenzi rulate

```bash
npx prisma db push     # ✅ — schema aplicată
npx prisma generate    # ✅ — client generat
npm run build          # ✅ — build trecut fără erori
```

---

## Note

- Vechiul sistem de `specs` JSON pe Product este **păstrat** — nu a fost șters
- Spec filters în catalog sunt **dinamice** — se actualizează când schimbi categorie/brand/etc
- Spec filters folosesc **single-select per câmp** (nu multi-select) pentru simplitate
- Fișierul `SPECS-REPORT.md` trebuie păstrat în rădăcina proiectului