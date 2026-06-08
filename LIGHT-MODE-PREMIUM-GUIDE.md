# Western Import — Ghid Premium Light Mode & Specificații Tehnice Complete

> **Obiectiv:** Transformă Light Mode din "spital generic" într-un experience premium, cald, editorial — gen Apple Store / Stripe light.

**Data:** 2026-06-08  
**Status:** Ghid de implementare  
**Proiect:** Western Import — magazin online laptopuri & electronice import SUA

---

## CUPRINS

1. [Filosofie Light Mode Premium](#1-filosofie-light-mode-premium)
2. [Sistem de Culori — Light vs Dark](#2-sistem-de-culori)
3. [Tipografie & Spatiere](#3-tipografie--spatiere)
4. [Carduri Produs — Light Mode](#4-carduri-produs)
5. [Header & Navigation](#5-header--navigation)
6. [Footer](#6-footer)
7. [Hero & Homepage](#7-hero--homepage)
8. [Catalog & Filters](#8-catalog--filters)
9. [Pagina Produs](#9-pagina-produs)
10. [Coș Side-Cart (CartDrawer)](#10-coș-side-cart)
11. [Checkout One-Page](#11-checkout-one-page)
12. [Butoane & CTA-uri](#12-butoane--cta-uri)
13. [Formulare & Input-uri](#13-formulare--input-uri)
14. [Badge-uri & Labels](#14-badge-uri--labels)
15. [Loading States & Skeletons](#15-loading-states)
16. [Animații & Transiții](#16-animații--transiții)
17. [Mobile-First Responsive](#17-mobile-first)
18. [Checklist Implementare](#18-checklist)

---

## 1. FILOSOFIE LIGHT MODE PREMIUM

### Ce EVITĂM (design "spital"):
- ❌ Fundal alb pur `#FFFFFF` pe tot
- ❌ Text negru `#000000` pe alb
- ❌ Borduri dure `border-gray-300`
- ❌ Umbre grele `shadow-2xl`
- ❌ Contrast excesiv (eye strain)

### Ce FOLLOWM (design premium):
- ✅ Fundal cald ușor `#F7F8FA` cu suprafețe albe subtile
- ✅ Text slate-700/800 (nu negru absolut)
- ✅ Borduri invizibile `rgba(0,0,0,0.04)` — separate prin umbre, nu linii
- ✅ Umbre ultra-subtle `0 1px 3px rgba(0,0,0,0.02)`
- ✅ Accente de culoare prin brand blue, nu negru

### Referințe:
- **Apple Store** — fundal `#FBFBFD`, carduri cu umbră ghost, spațiu generos
- **Stripe** — alb pe gri foarte deschis, borduri de 1px aproape invizibile
- **Linear** — modern light cu accenturi subtile

---

## 2. SISTEM DE CULORI

### Paleta Light Mode (actualizare globals.css)

```css
/* ─── Light Mode Premium (REVIZUIT) ─── */
--color-light-bg: #F5F6F8;         /* Fundal principal — gri cald */
--color-light-surface: #FFFFFF;     /* Carduri, modale, drawers */
--color-light-elevated: #FFFFFF;    /* Elemente ridicate (dropdowns) */
--color-light-border: rgba(0, 0, 0, 0.06);  /* Borduri subtile */
--color-light-border-strong: rgba(0, 0, 0, 0.10); /* Borduri active/hover */
--color-light-text: #1E293B;       /* Text principal — slate-800 */
--color-light-text-secondary: #64748B; /* Text secundar — slate-500 */
--color-light-text-muted: #94A3B8;  /* Text terțiar — slate-400 */

/* ─── Warm Accent (NOU — pentru premium feel) ─── */
--color-warm-accent: #F59E0B;      /* Amber pentru highlight-uri */
--color-warm-accent-bg: #FFFBEB;   /* Amber background subtil */
--color-warm-accent-border: #FDE68A; /* Amber border */
```

### Mapare Tailwind (dark: prefix deja funcționează)

| Element | Light | Dark |
|---------|-------|------|
| **Page BG** | `bg-[var(--color-light-bg)]` | `dark:bg-[var(--color-dark-bg)]` |
| **Card BG** | `bg-white` | `dark:bg-[var(--color-dark-surface)]` |
| **Text principal** | `text-slate-800` | `dark:text-slate-200` |
| **Text secundar** | `text-slate-500` | `dark:text-slate-400` |
| **Border** | `border-black/[0.06]` | `dark:border-white/[0.06]` |
| **Shadow card** | `shadow-sm` | `dark:shadow-none` |
| **Input BG** | `bg-white` | `dark:bg-[var(--color-dark-elevated)]` |
| **Hover surface** | `hover:bg-slate-50` | `dark:hover:bg-white/[0.04]` |

---

## 3. TIPOGRAFIE & SPAȚIERE

### Font Stack (deja OK, doar review)

```css
/* Recomandare: menținem system stack + Inter fallback */
font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
```

### Scară tipografică:

| Element | Size | Weight | Light Color | Dark Color |
|---------|------|--------|-------------|------------|
| H1 (hero) | `text-3xl sm:text-4xl` | `font-bold` | `text-slate-900` | `dark:text-white` |
| H2 (secțiune) | `text-2xl` | `font-bold` | `text-slate-800` | `dark:text-slate-100` |
| H3 (card title) | `text-sm` | `font-semibold` | `text-slate-800` | `dark:text-slate-200` |
| Body | `text-sm` | `font-normal` | `text-slate-600` | `dark:text-slate-400` |
| Caption | `text-xs` | `font-medium` | `text-slate-500` | `dark:text-slate-500` |
| Price | `text-lg` | `font-extrabold` | `text-primary-dark` | `dark:text-blue-300` |

### Spațiere premium:
- Card padding: `p-5` (nu mai puțin)
- Secțiuni: `py-16 sm:py-20` (respirație)
- Grid gap: `gap-4 sm:gap-5` (consistent)

---

## 4. CARDURI PRODUS — Light Mode

### Problema actuală:
- Cardurile folosesc `card-premium` care e bun, dar hover-ul light mode poate fi mai rafinat
- Badge-urile roșii pe alb sunt prea agresive
- Prețul are `text-primary-dark` care e OK dar poate fi mai "warm"

### Card revizuit (CSS updates):

```css
/* ─── Product Card Light Mode Refinement ─── */
.card-premium {
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.02),
    0 4px 16px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-premium:hover {
  transform: translateY(-4px);
  border-color: rgba(30, 64, 175, 0.08);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(30, 64, 175, 0.04);
}
```

### ProductCard.tsx — Actualizări specifice:

```tsx
{/* BADGE — mai soft pe light mode */}
{product.badge && (
  <span className={`absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-white
    ${product.badge.type === 'sale' ? 'bg-rose-500' : ''}
    ${product.badge.type === 'new' ? 'bg-emerald-500' : ''}
    ${product.badge.type === 'refurb' ? 'bg-indigo-500' : ''}
  `}>
    {product.badge.type === 'sale' && discount ? `-${discount}%` : BADGE_LABELS[product.badge.type](product.badge.label)}
  </span>
)}

{/* PREȚ — mai cald pe light mode */}
<span className="text-lg font-extrabold text-primary dark:text-blue-300">
  {product.price.toLocaleString("ro-MD")} MDL
</span>

{/* BUTON ADAUGĂ — gradient subtil pe light */}
<button className="flex-1 flex items-center justify-center gap-1.5 
  bg-primary hover:bg-primary-dark text-white 
  py-2.5 rounded-xl text-[13px] font-semibold 
  transition-all duration-200 
  shadow-sm hover:shadow-md">
  <ShoppingCart size={15} /> Adaugă
</button>

{/* WISHLIST — subtil pe light */}
<button className="p-2.5 rounded-xl text-slate-400 
  border border-slate-100 dark:border-white/[0.06] 
  hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-500/30
  transition-colors">
  <Heart size={15} />
</button>
```

---

## 5. HEADER & NAVIGATION

### Header Light Mode — acum e `bg-slate-800` pe AMBELE teme

**Problema:** Header-ul e dark pe light mode, care e o alegere intenționată (brand consistency). Dar trebuie să fim atenți la:

1. **Search bar** în header dark — input-ul trebuie să fie vizibil
2. **Mobile menu** — dropdown-ul trebuie să fie light când tema e light
3. **Contrast** — textul din header e întotdeauna deschis pe fundal dark

### Recomandări:

```tsx
{/* Header rămâne slate-800 pe ambele teme — OK, e brand identity */}
{/* DAR: dropdown-urile/drawer-urile trebuie să urmeze tema activă */}

{/* User dropdown — trebuie să fie light pe light theme */}
<motion.div className="absolute right-0 top-full mt-1 w-48 
  bg-white dark:bg-[var(--color-dark-elevated)]
  border border-slate-100 dark:border-white/[0.06]
  rounded-xl shadow-lg">
  {/* ... */}
</motion.div>

{/* Mobile menu drawer — la fel */}
<div className="bg-white dark:bg-[var(--color-dark-surface)]">
```

### Topbar (opțional — adaugă un strat premium):

```tsx
{/* Topbar cu info util — doar desktop */}
<div className="hidden lg:block bg-primary-dark text-white/80 text-xs py-1.5">
  <div className="max-w-[1280px] mx-auto px-5 flex justify-between">
    <span>🚚 Livrare gratuită în toată Moldova</span>
    <span>📞 +373 69 466 585</span>
  </div>
</div>
```

---

## 6. FOOTER

### Footer Light Mode:

**Actual:** Footer e `bg-slate-900` pe ambele teme — OK ca brand, dar pe light mode trebuie mai cald.

**Recomandare:** Menținem footer dark pe ambele teme (consistent cu header-ul). Dar:

- Link-urile trebuie să fie mai clare pe dark
- Social icons — să fie vizibile
- Map embed să funcționeze

```tsx
{/* Footer rămâne dark — brand consistency cu header */}
<footer className="bg-slate-900 dark:bg-[var(--color-dark-surface)] text-slate-300 mt-10">
```

---

## 7. HERO & HOMEPAGE

### Hero Section — Light Mode Premium:

```tsx
{/* Hero background — gradient cald, nu alb pur */}
<section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 
  dark:from-[var(--color-dark-bg)] dark:via-[var(--color-dark-surface)] dark:to-blue-900/10
  py-16 sm:py-24 overflow-hidden">
  
  {/* Decorative blur — premium feel */}
  <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
  <div className="absolute bottom-10 left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
  
  <div className="relative max-w-[1280px] mx-auto px-5">
    {/* ... content ... */}
  </div>
</section>
```

### Features Bar — Light Mode:

```tsx
<div className="bg-white dark:bg-[var(--color-dark-surface)] border-b border-black/[0.04] dark:border-white/[0.04]">
  <div className="max-w-[1280px] mx-auto px-5 py-4 flex items-center justify-center gap-8 text-sm">
    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
      <Truck className="w-4 h-4 text-primary" />
      <span>Livrare Gratuită</span>
    </div>
    {/* ... */}
  </div>
</div>
```

---

## 8. CATALOG & FILTERS

### Pagina Catalog — Layout:

```tsx
{/* Layout principal */}
<div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
  <div className="flex gap-6">
    {/* Sidebar Filters — light mode */}
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 space-y-4">
        <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-5 
          border border-black/[0.04] dark:border-white/[0.06]">
          {/* Filter groups */}
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
            Categorie
          </h3>
          {/* Filter options */}
          <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
            <input type="checkbox" className="rounded border-slate-300 
              text-primary focus:ring-primary/20 
              dark:border-white/10 dark:bg-[var(--color-dark-elevated)]" />
            <span className="text-sm text-slate-600 dark:text-slate-400 
              group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Laptopuri
            </span>
          </label>
        </div>
      </div>
    </aside>

    {/* Product Grid */}
    <div className="flex-1">
      {/* Sort bar */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Laptopuri
        </h1>
        <select className="text-sm bg-white dark:bg-[var(--color-dark-elevated)] 
          border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2
          text-slate-700 dark:text-slate-300">
          <option>Preț crescător</option>
          <option>Preț descrescător</option>
          <option>Cele mai noi</option>
        </select>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ProductCard components */}
      </div>
    </div>
  </div>
</div>
```

---

## 9. PAGINA PRODUS

### Product Page — Light Mode:

```tsx
<div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
    
    {/* Stânga — Imagini */}
    <div className="space-y-4">
      {/* Imagine principală */}
      <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl 
        border border-black/[0.04] dark:border-white/[0.06] 
        aspect-square flex items-center justify-center p-8">
        {/* Product image */}
      </div>
      {/* Thumbnails */}
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-[var(--color-dark-elevated)]
          border-2 border-primary ring-2 ring-primary/20" />
        <div className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-[var(--color-dark-elevated)]
          border border-slate-200 dark:border-white/[0.06] hover:border-primary/30 
          transition-colors cursor-pointer" />
      </div>
    </div>

    {/* Dreapta — Info */}
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 dark:text-slate-500">
        <span>Acasă</span> / <span>Laptopuri</span> / <span className="text-slate-800 dark:text-slate-200">MacBook Pro</span>
      </nav>

      {/* Titlu */}
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
        MacBook Pro 14" M3 Pro
      </h1>

      {/* Rating & Reviews */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'text-amber-400' : 'text-slate-200 dark:text-slate-600'}`} fill="currentColor" />
          ))}
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">(24 review-uri)</span>
      </div>

      {/* Preț */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-primary-dark dark:text-blue-300">
          32.999 MDL
        </span>
        <span className="text-lg text-slate-400 line-through">39.999 MDL</span>
        <span className="text-sm font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-lg">
          -17%
        </span>
      </div>

      {/* Divider */}
      <hr className="border-slate-100 dark:border-white/[0.06]" />

      {/* Specs rapide */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl p-3">
          <p className="text-xs text-slate-500 dark:text-slate-500">Procesor</p>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">M3 Pro 12-core</p>
        </div>
        {/* ... more specs ... */}
      </div>

      {/* CTA principal */}
      <div className="flex gap-3">
        <button className="flex-1 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl 
          font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
          <ShoppingCart className="w-5 h-5" /> Adaugă în Coș
        </button>
        <button className="p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08]
          text-slate-500 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-500/30 
          transition-all">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Shield className="w-4 h-4 text-emerald-500" /> Garanție 12 luni
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Truck className="w-4 h-4 text-primary" /> Livrare gratuită
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <RefreshCw className="w-4 h-4 text-amber-500" /> Returnare 14 zile
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 10. COȘ SIDE-CART (CartDrawer)

### CartDrawer — Light Mode Premium:

```tsx
{/* Overlay */}
<motion.div className="fixed inset-0 bg-black/30 z-[200] backdrop-blur-[2px]" />

{/* Drawer */}
<motion.div className="fixed right-0 top-0 bottom-0 w-full max-w-md 
  bg-white dark:bg-[var(--color-dark-surface)] z-[201] 
  shadow-2xl flex flex-col
  border-l border-black/[0.04] dark:border-white/[0.06]">
  
  {/* Header */}
  <div className="flex items-center justify-between p-5 
    border-b border-slate-100 dark:border-white/[0.06]">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <ShoppingBag className="w-4.5 h-4.5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Coșul tău</h2>
        <span className="text-xs text-slate-500">({items.length} articole)</span>
      </div>
    </div>
    <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] 
      text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors">
      <X className="w-5 h-5" />
    </button>
  </div>

  {/* Items */}
  <div className="flex-1 overflow-y-auto p-4">
    {items.length === 0 ? (
      <div className="text-center py-20">
        <ShoppingBag className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">Coșul e gol</p>
        <p className="text-slate-400 text-sm mt-1">Adaugă produse pentru a începe</p>
      </div>
    ) : (
      <div className="space-y-3">
        {items.map((item) => (
          <motion.div key={item.product.id}
            className="flex gap-3 p-3 bg-slate-50 dark:bg-[var(--color-dark-elevated)] 
            rounded-xl border border-slate-100/60 dark:border-transparent">
            
            {/* Product thumbnail */}
            <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg 
              flex items-center justify-center shrink-0
              border border-slate-100 dark:border-white/[0.06]">
              <span className="text-xs font-bold text-slate-400">
                {(item.product.brand || 'WI').toString().slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {item.product.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{item.product.specs?.procesor || ''}</p>
              
              <div className="flex items-center justify-between mt-2.5">
                {/* Quantity controls */}
                <div className="flex items-center gap-1.5">
                  <button className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 
                    border border-slate-200 dark:border-white/[0.08] 
                    flex items-center justify-center 
                    hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-sm font-medium w-6 text-center text-slate-800 dark:text-white">
                    {item.quantity}
                  </span>
                  <button className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 
                    border border-slate-200 dark:border-white/[0.08] 
                    flex items-center justify-center 
                    hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                {/* Price */}
                <span className="text-sm font-bold text-primary-dark dark:text-blue-300">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            </div>

            {/* Delete */}
            <button className="self-start p-1.5 text-slate-300 hover:text-rose-500 
              transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20">
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    )}
  </div>

  {/* Footer */}
  {items.length > 0 && (
    <div className="border-t border-slate-100 dark:border-white/[0.06] p-5 space-y-4">
      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-slate-500 dark:text-slate-400">Subtotal:</span>
        <span className="font-bold text-slate-900 dark:text-white">{formatPrice(getTotal())}</span>
      </div>
      
      {/* Livrare */}
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">Livrare:</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">GRATUITĂ</span>
      </div>

      {/* Separator */}
      <div className="border-t border-slate-100 dark:border-white/[0.06] pt-3">
        <div className="flex justify-between text-lg font-bold">
          <span className="text-slate-900 dark:text-white">Total:</span>
          <span className="text-primary-dark dark:text-blue-300">{formatPrice(getTotal())}</span>
        </div>
      </div>

      {/* CTA */}
      <Link href="/checkout"
        className="block w-full bg-primary hover:bg-primary-dark text-white text-center 
        py-3.5 rounded-xl font-bold text-base shadow-sm hover:shadow-md 
        transition-all active:scale-[0.98]">
        Finalizează Comanda →
      </Link>
      
      <Link href="/cart"
        className="block w-full text-center py-2 text-sm text-slate-500 hover:text-slate-700
        dark:text-slate-400 dark:hover:text-white transition-colors">
        Vezi Coșul Complet
      </Link>
    </div>
  )}
</motion.div>
```

---

## 11. CHECKOUT ONE-PAGE

### Layout 2 coloane:

```tsx
<div className="max-w-[1100px] mx-auto px-4 py-8">
  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
    Finalizare Comandă
  </h1>

  <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
    
    {/* STÂNGA — Formular (3/5) */}
    <div className="lg:col-span-3 space-y-6">
      
      {/* Secțiunea 1: Livrare */}
      <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-6 
        border border-black/[0.04] dark:border-white/[0.06]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 
          flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" /> Livrare
        </h2>
        
        {/* Delivery method tabs */}
        <div className="flex gap-2 mb-5">
          <button className="flex-1 py-2.5 rounded-xl text-sm font-medium
            bg-primary/10 text-primary border border-primary/20
            dark:bg-primary/20 dark:text-blue-300">
            <Store className="w-4 h-4 inline mr-1.5" /> Ridicare
          </button>
          <button className="flex-1 py-2.5 rounded-xl text-sm font-medium
            bg-slate-50 text-slate-600 border border-slate-200
            dark:bg-[var(--color-dark-elevated)] dark:text-slate-400 dark:border-white/[0.06]">
            <Truck className="w-4 h-4 inline mr-1.5" /> Curier
          </button>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 block">
              Nume complet *
            </label>
            <input type="text" placeholder="Ion Popescu"
              className="w-full px-4 py-2.5 rounded-xl text-sm
                bg-slate-50 dark:bg-[var(--color-dark-elevated)]
                border border-slate-200 dark:border-white/[0.08]
                text-slate-900 dark:text-white
                placeholder:text-slate-400
                focus:ring-2 focus:ring-primary/20 focus:border-primary
                dark:focus:ring-primary/30 dark:focus:border-primary/50
                transition-all outline-none" />
          </div>
          {/* ... more fields ... */}
        </div>
      </div>

      {/* Secțiunea 2: Plată */}
      <div className="bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-6 
        border border-black/[0.04] dark:border-white/[0.06]">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 
          flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" /> Plată
        </h2>
        
        <div className="grid grid-cols-3 gap-2">
          <button className="py-3 rounded-xl text-sm font-medium
            bg-emerald-50 text-emerald-700 border-2 border-emerald-500/30
            dark:bg-emerald-900/20 dark:text-emerald-300">
            💵 Cash
          </button>
          <button className="py-3 rounded-xl text-sm font-medium
            bg-slate-50 text-slate-600 border border-slate-200
            dark:bg-[var(--color-dark-elevated)] dark:text-slate-400">
            💳 Card
          </button>
          <button className="py-3 rounded-xl text-sm font-medium
            bg-slate-50 text-slate-600 border border-slate-200
            dark:bg-[var(--color-dark-elevated)] dark:text-slate-400">
            🏦 Credit
          </button>
        </div>
      </div>
    </div>

    {/* DREAPTA — Sumar (2/5) */}
    <div className="lg:col-span-2">
      <div className="sticky top-24 bg-white dark:bg-[var(--color-dark-surface)] rounded-2xl p-6 
        border border-black/[0.04] dark:border-white/[0.06] space-y-4">
        
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Sumar Comandă
        </h3>

        {/* Produse */}
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {items.map(item => (
            <div key={item.product.id} className="flex gap-3">
              <div className="w-12 h-12 bg-slate-50 dark:bg-[var(--color-dark-elevated)] 
                rounded-lg flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-400">
                  {(item.product.brand || 'WI').toString().slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 dark:text-white truncate">{item.product.name}</p>
                <p className="text-xs text-slate-400">× {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-slate-800 dark:text-white shrink-0">
                {formatPrice(item.product.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <hr className="border-slate-100 dark:border-white/[0.06]" />

        {/* Coupon */}
        <div className="flex gap-2">
          <input type="text" placeholder="Cod promoțional"
            className="flex-1 px-3 py-2 rounded-lg text-sm
              bg-slate-50 dark:bg-[var(--color-dark-elevated)]
              border border-slate-200 dark:border-white/[0.08]
              text-slate-900 dark:text-white placeholder:text-slate-400
              outline-none focus:ring-2 focus:ring-primary/20" />
          <button className="px-4 py-2 rounded-lg text-sm font-medium
            bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300
            hover:bg-slate-200 dark:hover:bg-white/[0.10] transition-colors">
            Aplică
          </button>
        </div>

        {/* Totaluri */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Livrare</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Gratuită</span>
          </div>
          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>Reducere</span>
              <span>-{formatPrice(couponDiscount)}</span>
            </div>
          )}
        </div>

        <hr className="border-slate-100 dark:border-white/[0.06]" />

        <div className="flex justify-between text-lg font-bold">
          <span className="text-slate-900 dark:text-white">Total</span>
          <span className="text-primary-dark dark:text-blue-300">{formatPrice(total)}</span>
        </div>

        {/* CTA Final */}
        <button className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 
          rounded-xl font-bold text-base shadow-sm hover:shadow-md 
          transition-all active:scale-[0.98]">
          Plasează Comanda
        </button>

        {/* Trust */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Date securizate</span>
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> SSL</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 12. BUTOANE & CTA-URI

### Sistem de butoane unificat:

```tsx
{/* PRIMARY — Adaugă în coș, Finalizează */}
<button className="bg-primary hover:bg-primary-dark text-white 
  py-2.5 px-5 rounded-xl text-sm font-semibold
  shadow-sm hover:shadow-md 
  transition-all duration-200 active:scale-[0.97]">
  Acțiune Principală
</button>

{/* ACCENT — Cumpără acum, Ofertă limitată */}
<button className="bg-accent hover:bg-red-700 text-white 
  py-2.5 px-5 rounded-xl text-sm font-semibold
  shadow-sm hover:shadow-md 
  transition-all duration-200 active:scale-[0.97]">
  Ofertă
</button>

{/* SECONDARY — Vezi detalii, Continuă */}
<button className="bg-slate-100 dark:bg-white/[0.06] 
  hover:bg-slate-200 dark:hover:bg-white/[0.10] 
  text-slate-700 dark:text-slate-300
  py-2.5 px-5 rounded-xl text-sm font-semibold
  transition-all duration-200 active:scale-[0.97]">
  Vezi Detalii
</button>

{/* GHOST — Wishlist, Compare */}
<button className="text-slate-500 dark:text-slate-400
  hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10
  py-2.5 px-4 rounded-xl text-sm font-medium
  transition-all duration-200">
  Compara
</button>

{/* OUTLINE — Alternative */}
<button className="border border-slate-200 dark:border-white/[0.10]
  text-slate-700 dark:text-slate-300
  hover:border-primary hover:text-primary dark:hover:border-primary/50
  py-2.5 px-5 rounded-xl text-sm font-semibold
  transition-all duration-200">
  Alternativă
</button>
```

---

## 13. FORMULARE & INPUT-URI

### Input Light Mode Premium:

```tsx
{/* Input base */}
<input type="text" 
  className="w-full px-4 py-2.5 rounded-xl text-sm
    bg-slate-50 dark:bg-[var(--color-dark-elevated)]
    border border-slate-200 dark:border-white/[0.08]
    text-slate-900 dark:text-white
    placeholder:text-slate-400
    outline-none
    focus:ring-2 focus:ring-primary/20 focus:border-primary
    dark:focus:ring-primary/30 dark:focus:border-primary/50
    transition-all duration-200"
  placeholder="Placeholder..." />

{/* Input cu eroare */}
<input type="text"
  className="w-full px-4 py-2.5 rounded-xl text-sm
    bg-slate-50 border border-rose-300
    text-slate-900
    placeholder:text-slate-400
    outline-none
    focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500
    transition-all duration-200"
/>
<p className="text-xs text-rose-500 mt-1">Acest câmp este obligatoriu</p>

{/* Select */}
<select className="w-full px-4 py-2.5 rounded-xl text-sm
  bg-slate-50 dark:bg-[var(--color-dark-elevated)]
  border border-slate-200 dark:border-white/[0.08]
  text-slate-900 dark:text-white
  outline-none
  focus:ring-2 focus:ring-primary/20 focus:border-primary
  transition-all duration-200
  appearance-none cursor-pointer">
  <option>Opțiune 1</option>
</select>
```

### Textarea:
```tsx
<textarea className="w-full px-4 py-2.5 rounded-xl text-sm
  bg-slate-50 dark:bg-[var(--color-dark-elevated)]
  border border-slate-200 dark:border-white/[0.08]
  text-slate-900 dark:text-white
  placeholder:text-slate-400
  outline-none resize-none
  focus:ring-2 focus:ring-primary/20 focus:border-primary
  transition-all duration-200"
  rows={4} placeholder="Mesaj..." />
```

---

## 14. BADGE-URI & LABELS

### Badge-uri Light Mode (mai puțin agresive):

```tsx
{/* SALE badge — roșu cald, nu strident */}
<span className="bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[11px] font-bold">
  -15%
</span>

{/* NEW badge — verde proaspăt */}
<span className="bg-emerald-500 text-white px-2 py-0.5 rounded-lg text-[11px] font-bold">
  Nou
</span>

{/* REFURB badge — indigo sofisticat */}
<span className="bg-indigo-500 text-white px-2 py-0.5 rounded-lg text-[11px] font-bold">
  Refurb
</span>

{/* PREMIUM badge — amber warm */}
<span className="bg-amber-500 text-white px-2 py-0.5 rounded-lg text-[11px] font-bold">
  Premium
</span>

{/* IN STOCK — verde subtil */}
<span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300
  px-2.5 py-0.5 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800/30">
  ✓ În stoc
</span>

{/* LOW STOCK — amber warning */}
<span className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300
  px-2.5 py-0.5 rounded-lg text-xs font-medium border border-amber-200 dark:border-amber-800/30">
  ⚠ Ultimele 3
</span>

{/* FREE SHIPPING */}
<span className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300
  px-2.5 py-0.5 rounded-lg text-xs font-medium border border-blue-200 dark:border-blue-800/30">
  🚚 Livrare gratuită
</span>
```

---

## 15. LOADING STATES

### Skeleton Premium (Light Mode):

```tsx
{/* Product card skeleton */}
<div className="card-premium rounded-2xl p-5">
  <div className="h-[160px] bg-slate-100 dark:bg-[var(--color-dark-elevated)] rounded-xl mb-3.5 shimmer" />
  <div className="h-4 bg-slate-100 dark:bg-[var(--color-dark-elevated)] rounded-lg w-3/4 mb-2 shimmer" />
  <div className="h-3 bg-slate-100 dark:bg-[var(--color-dark-elevated)] rounded-lg w-1/2 mb-3 shimmer" />
  <div className="h-5 bg-slate-100 dark:bg-[var(--color-dark-elevated)] rounded-lg w-1/3 shimmer" />
</div>
```

### Shimmer animație (deja în globals.css — ok):
```css
/* Light shimmer — mai subtil */
.shimmer {
  background: linear-gradient(90deg, #F1F5F9 25%, #E8ECF1 50%, #F1F5F9 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## 16. ANIMAȚII & TRANZIȚII

### Standarde:

```css
/* Tranziții universale */
transition-all duration-200        /* DEFAULT — hover, focus */
transition-all duration-300        /* CARDURI — hover lift */
transition-colors duration-200     /* TEXT — color changes */

/* Hover lift standard */
hover:-translate-y-1               /* Subtil */
hover:-translate-y-[4px]           /* Carduri produs */

/* Scale pentru butoane */
active:scale-[0.97]                /* Click feedback */
active:scale-[0.98]                /* CTA-uri mari */

/* Framer Motion defaults */
initial={{ opacity: 0, y: 10 }}   /* Fade in de jos */
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -10 }}
transition={{ duration: 0.2 }}     /* Rapid, nu lent */
```

---

## 17. MOBILE-FIRST RESPONSIVE

### Breakpoints:

| Dimensiune | Clasă | Grid produse |
|-----------|-------|--------------|
| Mobile (< 640px) | default | 1 coloană |
| Tablet (640px+) | `sm:` | 2 coloane |
| Desktop (1024px+) | `lg:` | 3 coloane |
| Wide (1280px+) | `xl:` | 4 coloane (opțional) |

### Mobile specific:

```tsx
{/* Mobile: bottom sticky cart bar pe pagina produs */}
<div className="fixed bottom-0 left-0 right-0 lg:hidden 
  bg-white dark:bg-[var(--color-dark-surface)] 
  border-t border-slate-200 dark:border-white/[0.06] 
  p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
  <div className="flex items-center justify-between gap-3">
    <span className="text-lg font-bold text-primary-dark dark:text-blue-300">
      32.999 MDL
    </span>
    <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold 
      text-sm flex items-center justify-center gap-2">
      <ShoppingCart className="w-4 h-4" /> Adaugă
    </button>
  </div>
</div>

{/* Mobile: filter drawer (slide de jos) */}
<motion.div className="fixed bottom-0 left-0 right-0 lg:hidden
  bg-white dark:bg-[var(--color-dark-surface)]
  rounded-t-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)]
  max-h-[80vh] overflow-y-auto z-50"
  initial={{ y: '100%' }}
  animate={{ y: 0 }}
  exit={{ y: '100%' }}>
  {/* Filters content */}
</motion.div>
```

---

## 18. CHECKLIST IMPLEMENTARE

### Prioritate 1 — Fundament Light Mode

- [ ] **globals.css** — Actualizează variantele light (`--color-light-bg: #F5F6F8`, etc.)
- [ ] **Layout principal** — Adaugă `bg-[var(--color-light-bg)] dark:bg-[var(--color-dark-bg)]` pe body/wrapper
- [ ] **Card system** — Rafinează `.card-premium` cu umbre mai subtile pe light
- [ ] **Tipografie** — Verifică că textul principal e `slate-800` nu `black`
- [ ] **Borduri** — Schimbă `border-slate-200` în `border-black/[0.06]` pe light

### Prioritate 2 — Componente cheie

- [ ] **ProductCard.tsx** — Actualizează badge-uri, preț, butoane per ghid
- [ ] **CartDrawer.tsx** — Reface drawer-ul per secțiunea 10
- [ ] **Header.tsx** — Verifică dropdown-urile (user menu, search) să urmeze tema
- [ ] **Footer.tsx** — Menține dark, verifică link-uri și social icons

### Prioritate 3 — Checkout

- [ ] **checkout/page.tsx** — Reface layout 2 coloane per secțiunea 11
- [ ] **Formular checkout** — Inputs cu `bg-slate-50`, borduri subtile, focus ring primary
- [ ] **Payment method selector** — Tabs vizuale, nu radio buttons
- [ ] **Order summary sticky** — Sidebar care sticke pe desktop

### Prioritate 4 — Pagini secundare

- [ ] **Catalog page** — Sidebar filters + grid per secțiunea 8
- [ ] **Product page** — Layout 2 coloane per secțiunea 9
- [ ] **Homepage** — Hero gradient, features bar, product grid
- [ ] **About/Contact/etc** — Aplică același sistem de carduri și spațiere

### Prioritate 5 — Polish

- [ ] **Loading skeletons** — Shimmer subtil pe light
- [ ] **Transitions** — Toate la `duration-200` sau `duration-300`
- [ ] **Mobile** — Bottom bar pe pagina produs, filter drawer pe catalog
- [ ] **Dark mode** — Verifică că nimic nu s-a stricat după schimbări
- [ ] **Cross-browser** — Testare Chrome, Firefox, Safari

### Prioritate 6 — Testare & QA

- [ ] Toggle light/dark pe fiecare pagină
- [ ] Mobile responsive pe fiecare pagină
- [ ] Contrast check (WCAG AA)
- [ ] Performance check (Lighthouse)
- [ ] Verifică că traducerile RO/RU funcționează pe ambele teme

---

## REGULI DE AUR — LIGHT MODE

1. **NICIODATĂ** alb pur `#FFFFFF` ca fundal de pagină → folosește `#F5F6F8`
2. **NICIODATĂ** negru `#000000` ca text → folosește `slate-800` (`#1E293B`)
3. **ÎNTOTDEAUNA** umbre ultra-subtile pe carduri → `shadow-sm` maxim
4. **ÎNTOTDEAUNA** borduri invizibile → `rgba(0,0,0,0.04-0.06)`
5. **ÎNTOTDEAUNA** testare dark mode după fiecare modificare light
6. **ÎNTOTDEAUNA** `active:scale-[0.97]` pe butoane pentru feedback tactil
7. **SPAȚIU** > **LINII** — separă secțiunile prin spațiu, nu borduri

---

*Document generat pe 2026-06-08 de Gigi 😎*
*Proiect: Western Import — western-import-site*
