'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/api';
import Link from 'next/link';
import { CreditCard, Truck, MapPin, ShoppingBag, CheckCircle, Tag, AlertCircle, Loader2, Store, Package } from 'lucide-react';

interface FormData {
  customerName: string;
  phone: string;
  email: string;
  city: string;
  raion: string;
  localitate: string;
  strada: string;
  codPostal: string;
  deliveryMethod: 'PICKUP' | 'COURIER_CHISINAU' | 'COURIER_NATIONAL';
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT';
  notes: string;
  couponCode: string;
  terms: boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface CouponData {
  code: string;
  type: string;
  value: number;
  discount: number;
}

export default function CheckoutPage() {
  const { items, clearCart, getTotal } = useCartStore();
  const [step, setStep] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    customerName: '',
    phone: '',
    email: '',
    city: '',
    raion: '',
    localitate: '',
    strada: '',
    codPostal: '',
    deliveryMethod: 'COURIER_CHISINAU',
    paymentMethod: 'CASH',
    notes: '',
    couponCode: '',
    terms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const subtotal = getTotal();

  // Calculate shipping
  const shippingCost = 0; // FREE shipping everywhere in Moldova

  // Coupon discount
  const couponDiscount = coupon?.discount || 0;

  const totalDiscount = couponDiscount;
  const total = subtotal - totalDiscount + shippingCost;

  // Free shipping threshold — always free now
  const freeShippingThreshold = 0;
  const remainingForFreeShipping = 0;

  // Validate form
  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.customerName.trim()) e.customerName = 'Numele este obligatoriu';
    else if (form.customerName.trim().length < 2) e.customerName = 'Minim 2 caractere';

    if (!form.phone.trim()) e.phone = 'Telefonul este obligatoriu';
    else if (!/^\+?[\d\s()-]{6,20}$/.test(form.phone.trim())) e.phone = 'Număr invalid';

    if (!form.email.trim()) e.email = 'Email-ul este obligatoriu';
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) e.email = 'Email invalid';

    if (form.deliveryMethod !== 'PICKUP') {
      if (!form.raion.trim()) e.raion = 'Raionul este obligatoriu';
      if (!form.strada.trim()) e.strada = 'Strada este obligatorie';
      if (!form.codPostal.trim()) e.codPostal = 'Codul poștal este obligatoriu';
    }

    if (!form.terms) e.terms = 'Trebuie să fii de acord cu termenii';

    return e;
  }

  // Apply coupon
  async function applyCoupon() {
    if (!form.couponCode.trim()) {
      setCouponError('Introdu un cod promoțional');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    setCoupon(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.couponCode, subtotal }),
      });
      const data = await res.json();

      if (data.success) {
        setCoupon(data.data);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Cod invalid');
        setCoupon(null);
      }
    } catch {
      setCouponError('Eroare la validarea codului');
    } finally {
      setCouponLoading(false);
    }
  }

  // Remove coupon
  function removeCoupon() {
    setCoupon(null);
    setCouponError('');
    setForm((f) => ({ ...f, couponCode: '' }));
  }

  // Submit order
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error]');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setStep('loading');
    setErrorMessage('');

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: orderItems,
          customerName: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          raion: form.raion.trim(),
          localitate: form.localitate.trim(),
          strada: form.strada.trim(),
          codPostal: form.codPostal.trim(),
          address: `${form.raion}, ${form.localitate}, ${form.strada}, ${form.codPostal}`.replace(/, ,/g, ',').replace(/^,|,$/g, '').trim(),
          deliveryMethod: form.deliveryMethod,
          paymentMethod: form.paymentMethod,
          notes: form.notes.trim(),
          couponCode: coupon?.code || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOrderNumber(data.data.orderNumber);
        clearCart();

        // Open IutePay checkout modal if credit was selected
        if (form.paymentMethod === 'CREDIT') {
          const iuteOrder = data.data.iutePayOrder;
          if (iuteOrder) {
            const doIuteCheckout = () => {
              // @ts-expect-error IutePay global
              window.iute.configure(publicKey, 'md');
              // @ts-expect-error IutePay global
              window.iute.checkout(
                {
                  merchant: {
                    userConfirmationUrl: `${window.location.origin}/api/iute/confirm`,
                    userCancelUrl: `${window.location.origin}/checkout`,
                    userConfirmationUrlAction: 'POST',
                    name: 'Western Import',
                  },
                  shipping: {
                    name: { first: form.customerName.split(' ')[0] || '', last: form.customerName.split(' ').slice(1).join(' ') || '' },
                    address: { line1: form.strada || '', line2: '', city: form.localitate || form.city || '', state: form.raion || '', zipcode: form.codPostal || '', country: 'mda' },
                    phoneNumber: form.phone,
                    email: form.email,
                  },
                  billing: {
                    name: { first: form.customerName.split(' ')[0] || '', last: form.customerName.split(' ').slice(1).join(' ') || '' },
                    address: { line1: form.strada || '', line2: '', city: form.localitate || form.city || '', state: form.raion || '', zipcode: form.codPostal || '', country: 'mda' },
                    phoneNumber: form.phone,
                    email: form.email,
                  },
                  items: iuteOrder.items,
                  orderId: iuteOrder.orderId,
                  currency: 'mdl',
                  shippingAmount: 0,
                  taxAmount: 0,
                  subtotal: iuteOrder.subtotal,
                  total: iuteOrder.total,
                  metadata: { mode: 'modal' },
                },
                {
                  onSuccess: (result: { checkoutSessionId: string }) => {
                    console.log('[IutePay] Checkout success:', result);
                    setStep('success');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  },
                  onFailure: (result: { message: string }) => {
                    console.error('[IutePay] Checkout failed:', result);
                    setErrorMessage(result.message || 'IutePay checkout eșuat');
                    setStep('error');
                  },
                },
              );
            };

            // @ts-expect-error IutePay global
            if (window.iute) {
              doIuteCheckout();
            } else {
              // SDK not yet loaded — load it dynamically then call checkout
              const publicKey = process.env.NEXT_PUBLIC_IUTE_CREDIT_API_KEY;
              if (!publicKey) {
                setErrorMessage('IutePay nu este configurat.');
                setStep('error');
                return;
              }
              // Load CSS
              const css = document.createElement('link');
              css.rel = 'stylesheet';
              css.href = 'https://ecom.iutecredit.md/iutepay.css';
              document.head.appendChild(css);
              // Load JS
              const script = document.createElement('script');
              script.src = 'https://ecom.iutecredit.md/iutepay.js';
              script.onload = () => doIuteCheckout();
              script.onerror = () => {
                setErrorMessage('Nu s-a putut încărca IutePay. Reîncarcă pagina.');
                setStep('error');
              };
              document.head.appendChild(script);
            }
            return;
          }
        }

        setStep('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || 'Eroare la plasarea comenzii');
        setStep('error');
      }
    } catch {
      setErrorMessage('Eroare de conexiune. Încearcă din nou.');
      setStep('error');
    }
  }

  function updateField(field: keyof FormData, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  }

  // Empty cart
  if (items.length === 0 && step === 'form') {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Coșul este gol</h1>
            <Link href="/catalog" className="text-primary font-semibold hover:underline">Înapoi la catalog</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Success
  if (step === 'success') {
    return (
      <>
        <Header />
        <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-5">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Comandă plasată cu succes!</h1>
            <p className="text-slate-500 mb-2">Vei primi un email de confirmare cu detaliile comenzii.</p>
            <p className="text-sm text-slate-400 mb-1">Număr comandă:</p>
            <p className="text-lg font-bold text-primary mb-6">{orderNumber}</p>
            <div className="flex flex-col gap-3">
              <Link href="/" className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                Înapoi la magazin
              </Link>
              <Link href="/account" className="text-sm text-slate-500 hover:text-primary">Vezi comenzile mele →</Link>
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
      <main className="flex-1 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">Finalizare Comandă</h1>

          {step === 'error' && errorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{errorMessage}</p>
                <button onClick={() => setStep('form')} className="text-xs text-red-500 hover:underline mt-1">Încearcă din nou</button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> Date Personale
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div data-error={errors.customerName ? 'true' : undefined}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Nume complet *</label>
                      <input
                        type="text"
                        value={form.customerName}
                        onChange={(e) => updateField('customerName', e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-lg border ${errors.customerName ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'} text-sm`}
                        placeholder="Ion Popescu"
                      />
                      {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                    </div>
                    <div data-error={errors.phone ? 'true' : undefined}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Telefon *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-lg border ${errors.phone ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'} text-sm`}
                        placeholder="+373 69 000 000"
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div data-error={errors.email ? 'true' : undefined}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-lg border ${errors.email ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'} text-sm`}
                        placeholder="email@exemplu.md"
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> Metodă Livrare
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'PICKUP' as const, label: 'Ridicare magazin', desc: 'Gratuit • Chișinău', icon: Store },
                      { id: 'COURIER_CHISINAU' as const, label: 'Curier Chișinău', desc: 'Gratuit • 1-2 zile', icon: Truck },
                      { id: 'COURIER_NATIONAL' as const, label: 'Curier național', desc: 'Gratuit • 2-5 zile', icon: Package },
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => updateField('deliveryMethod', m.id)}
                          className={`p-4 rounded-xl border-2 text-left transition-colors ${
                            form.deliveryMethod === m.id
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-5 h-5 mb-2 ${form.deliveryMethod === m.id ? 'text-primary' : 'text-slate-400'}`} />
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{m.label}</div>
                          <div className="text-xs text-slate-500 mt-1">{m.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Address */}
                {form.deliveryMethod !== 'PICKUP' && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Adresa de Livrare</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div data-error={errors.city ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Oraș</label>
                        <select
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        >
                          <option value="">Selectează orașul</option>
                          <option>Chișinău</option>
                          <option>Bălți</option>
                          <option>Orhei</option>
                          <option>Soroca</option>
                          <option>Ungheni</option>
                          <option>Cahul</option>
                          <option>Comrat</option>
                          <option>Edineț</option>
                          <option>Altul</option>
                        </select>
                      </div>
                      <div data-error={errors.raion ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Raionul *</label>
                        <input
                          type="text"
                          value={form.raion}
                          onChange={(e) => updateField('raion', e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-lg border ${errors.raion ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'} text-sm`}
                          placeholder="ex: Chișinău, Bălți, Orhei..."
                        />
                        {errors.raion && <p className="text-xs text-red-500 mt-1">{errors.raion}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Localitatea</label>
                        <input
                          type="text"
                          value={form.localitate}
                          onChange={(e) => updateField('localitate', e.target.value)}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                          placeholder="ex: sat, comună (opțional)"
                        />
                      </div>
                      <div data-error={errors.strada ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Strada *</label>
                        <input
                          type="text"
                          value={form.strada}
                          onChange={(e) => updateField('strada', e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-lg border ${errors.strada ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'} text-sm`}
                          placeholder="Strada, nr., apartament"
                        />
                        {errors.strada && <p className="text-xs text-red-500 mt-1">{errors.strada}</p>}
                      </div>
                      <div data-error={errors.codPostal ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Cod poștal *</label>
                        <input
                          type="text"
                          value={form.codPostal}
                          onChange={(e) => updateField('codPostal', e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-lg border ${errors.codPostal ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700'} text-sm`}
                          placeholder="ex: MD-2000"
                        />
                        {errors.codPostal && <p className="text-xs text-red-500 mt-1">{errors.codPostal}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Metodă Plată
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'CASH' as const, label: 'Cash la livrare', desc: 'Plătești la primirea comenzii', icon: '💵' },
                      { id: 'CREDIT' as const, label: 'Credit IuteCredit', desc: 'Rate fără dobândă până la 12 luni', icon: '🏦' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateField('paymentMethod', m.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-colors flex items-center gap-3 ${
                          form.paymentMethod === m.id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{m.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{m.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          form.paymentMethod === m.id ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                          {form.paymentMethod === m.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Notițe (opțional)</h3>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none"
                    placeholder="Instrucțiuni speciale pentru livrare..."
                  />
                </div>
              </div>

              {/* Summary Sidebar */}
              <div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 sticky top-24">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Sumar Comandă</h3>

                  <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300 truncate mr-2">
                          {item.product.name} × {item.quantity}
                        </span>
                        <span className="text-slate-800 dark:text-white font-medium shrink-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Reducere cod ({coupon?.code})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500">
                      <span>Transport</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">Gratuit</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>Total reducere</span>
                        <span>-{formatPrice(totalDiscount)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                      <span>Total</span>
                      <span className="text-primary-dark dark:text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Free shipping reminder */}
                  {shippingCost > 0 && form.deliveryMethod !== 'PICKUP' && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-xs">
                      <p className="text-amber-700 dark:text-amber-400">
                        🚚 Mai adaugă <strong>{formatPrice(remainingForFreeShipping)}</strong> pentru livrare gratuită!
                      </p>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="mt-4">
                    {coupon ? (
                      <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-400">{coupon.code}</span>
                          <span className="text-xs text-green-600">-{coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(coupon.value)}</span>
                        </div>
                        <button type="button" onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Elimină</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={form.couponCode}
                            onChange={(e) => updateField('couponCode', e.target.value.toUpperCase())}
                            placeholder="Cod promoțional"
                            className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading || !form.couponCode.trim()}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aplică'}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>

                  <label className="flex items-start gap-2 mt-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.terms}
                      onChange={(e) => updateField('terms', e.target.checked)}
                      className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-xs text-slate-500">
                      Sunt de acord cu{' '}
                      <Link href="/terms" className="text-primary hover:underline">Termenii și Condițiile</Link> și{' '}
                      <Link href="/privacy" className="text-primary hover:underline">Politica de Confidențialitate</Link>
                    </span>
                  </label>
                  {errors.terms && <p className="text-xs text-red-500 mt-1">{errors.terms}</p>}

                  <button
                    type="submit"
                    disabled={step === 'loading'}
                    className="w-full bg-accent text-white py-3 rounded-xl font-semibold mt-4 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {step === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Se procesează...
                      </>
                    ) : (
                      `Plasează comanda — ${formatPrice(total)}`
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-3">
                    🔒 Datele tale sunt securizate. Nu stocăm datele cardului.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
