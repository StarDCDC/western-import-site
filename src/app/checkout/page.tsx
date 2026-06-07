// src/app/checkout/page.tsx
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/api';
import Link from 'next/link';
import { CreditCard, Truck, MapPin, ShoppingBag, CheckCircle, Tag, AlertCircle, Loader2, Store, Package } from 'lucide-react';
import { checkIdnp as c365CheckIdnp, submitLoanRequest as c365Submit, confirmRequest as c365Confirm, isCredit365Configured as c365IsConfigured } from '@/lib/credit365-client';
import { useLanguage } from '@/components/ui/LanguageProvider';
import { getCartTexts } from '@/lib/i18n-cart';

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
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT' | 'CREDIT_365';
  notes: string;
  couponCode: string;
  terms: boolean;
  // Credit365 fields
  c365_idnp: string;
  c365_lastName: string;
  c365_firstName: string;
  c365_birthDate: string;
  c365_gender: '1' | '2';
  c365_duration: string;
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

export default function CheckoutPage({ forceLocale }: { forceLocale?: string }) {
  const { locale: ctxLocale } = useLanguage();
  // Detect RU from prop, context or URL path
  const isRu = forceLocale === 'ru' || ctxLocale === 'ru' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/ru'));
  const locale = isRu ? 'ru' : 'ro';
  const txt = getCartTexts(locale);
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
    c365_idnp: '',
    c365_lastName: '',
    c365_firstName: '',
    c365_birthDate: '',
    c365_gender: '1',
    c365_duration: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Credit365 flow state
  const [c365Step, setC365Step] = useState<'idle' | 'idnp' | 'terms' | 'details' | 'sms' | 'done'>('idle');
  const [c365Terms, setC365Terms] = useState<Array<{ months: number; amounts: number[] }>>([]);
  const [c365ProductId, setC365ProductId] = useState<number | null>(null);
  const [c365UserId, setC365UserId] = useState<number | null>(null);
  const [c365ApplicationId, setC365ApplicationId] = useState<number | null>(null);
  const [c365SmsCode, setC365SmsCode] = useState('');
  const [c365Passport, setC365Passport] = useState<string | null>(null);
  const [c365Loading, setC365Loading] = useState(false);
  const [c365Error, setC365Error] = useState('');

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
    if (!form.customerName.trim()) e.customerName = txt.nameRequired;
    else if (form.customerName.trim().length < 2) e.customerName = txt.nameMin;

    if (!form.phone.trim()) e.phone = txt.phoneRequired;
    else if (!/^\+?[\d\s()-]{6,20}$/.test(form.phone.trim())) e.phone = txt.phoneInvalid;

    if (!form.email.trim()) e.email = txt.emailRequired;
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) e.email = txt.emailInvalid;

    if (form.deliveryMethod !== 'PICKUP') {
      if (!form.raion.trim()) e.raion = txt.districtRequired;
      if (!form.strada.trim()) e.strada = txt.streetRequired;
      if (!form.codPostal.trim()) e.codPostal = txt.postalRequired;
    }

    if (!form.terms) e.terms = txt.termsRequired;

    return e;
  }

  // Apply coupon
  async function applyCoupon() {
    if (!form.couponCode.trim()) {
      setCouponError(txt.promoPlaceholder);
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
        setCouponError(data.error || txt.invalidCode);
        setCoupon(null);
      }
    } catch {
      setCouponError(txt.validationError);
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
              window.iute.configure('e757e925-8e5c-4ccf-9712-edf093290032', 'md');
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
                    setErrorMessage(result.message || txt.errorPlacingOrder);
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
                setErrorMessage(txt.connectionError);
                setStep('error');
              };
              document.head.appendChild(script);
            }
            return;
          }
        }

        // Credit365 — redirect to credit application
        if (form.paymentMethod === 'CREDIT_365') {
          setStep('success');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        setStep('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.error || txt.errorPlacingOrder);
        setStep('error');
      }
    } catch {
      setErrorMessage(txt.connectionError);
      setStep('error');
    }
  }

  function updateField(field: keyof FormData, value: string | boolean | number) {
    setForm((f) => ({ ...f, [field]: value }));
    // Reset Credit365 flow when switching payment method
    if (field === 'paymentMethod' && value !== 'CREDIT_365') {
      setC365Step('idle');
      setC365Error('');
    }
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
        <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">{txt.cartEmpty}</h1>
            <Link href={isRu ? "/ru/catalog" : "/catalog"} className="text-primary font-semibold hover:underline">{txt.backToCatalog}</Link>
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
        <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-5">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{txt.orderSuccess}</h1>
            <p className="text-slate-500 mb-2">{txt.orderEmail}</p>
            <p className="text-sm text-slate-400 mb-1">{txt.orderNumber}</p>
            <p className="text-lg font-bold text-primary mb-6">{orderNumber}</p>
            <div className="flex flex-col gap-3">
              <Link href={isRu ? "/ru" : "/"} className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                {txt.backToStore}
              </Link>
              <Link href="/account" className="text-sm text-slate-500 hover:text-primary">{txt.myOrders} →</Link>
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
      <main className="flex-1 bg-slate-50 dark:bg-[var(--color-dark-bg)] min-h-screen">
        <div className="max-w-[1280px] mx-auto px-5 py-8">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-4 sm:mb-6">{txt.checkoutTitle}</h1>

          {step === 'error' && errorMessage && (
            <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">{errorMessage}</p>
                <button onClick={() => setStep('form')} className="text-xs text-red-500 hover:underline mt-1">{txt.tryAgain}</button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06]">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" /> {txt.personalData}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div data-error={errors.customerName ? 'true' : undefined}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{txt.fullName} *</label>
                      <input
                        type="text"
                        value={form.customerName}
                        onChange={(e) => updateField('customerName', e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-lg border ${errors.customerName ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700'} text-sm`}
                        placeholder={txt.namePlaceholder}
                      />
                      {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                    </div>
                    <div data-error={errors.phone ? 'true' : undefined}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{txt.phone} *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-lg border ${errors.phone ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700'} text-sm`}
                        placeholder={txt.phonePlaceholder}
                      />
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                    <div data-error={errors.email ? 'true' : undefined}>
                      <label className="block text-xs font-medium text-slate-500 mb-1">{txt.email} *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={`w-full py-2.5 px-3 rounded-lg border ${errors.email ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700'} text-sm`}
                        placeholder={txt.emailPlaceholder}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                {/* Delivery Method */}
                <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06]">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> {txt.deliveryMethod}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'PICKUP' as const, label: txt.storePickup, desc: txt.storePickupDesc, icon: Store },
                      { id: 'COURIER_CHISINAU' as const, label: txt.courierChisinau, desc: txt.courierChisinauDesc, icon: Truck },
                      { id: 'COURIER_NATIONAL' as const, label: txt.courierNational, desc: txt.courierNationalDesc, icon: Package },
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
                              : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
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
                  <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06]">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">{txt.deliveryAddress}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div data-error={errors.city ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{txt.city}</label>
                        <select
                          value={form.city}
                          onChange={(e) => updateField('city', e.target.value)}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700 text-sm"
                        >
                          <option value="">{txt.selectCity}</option>
                          <option>{txt.cityChisinau}</option>
                          <option>{txt.cityBalti}</option>
                          <option>{txt.cityOrhei}</option>
                          <option>{txt.citySoroca}</option>
                          <option>{txt.cityUngheni}</option>
                          <option>{txt.cityCahul}</option>
                          <option>{txt.cityComrat}</option>
                          <option>{txt.cityEdinet}</option>
                          <option>{txt.cityOther}</option>
                        </select>
                      </div>
                      <div data-error={errors.raion ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{txt.district} *</label>
                        <input
                          type="text"
                          value={form.raion}
                          onChange={(e) => updateField('raion', e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-lg border ${errors.raion ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700'} text-sm`}
                          placeholder={txt.districtPlaceholder}
                        />
                        {errors.raion && <p className="text-xs text-red-500 mt-1">{errors.raion}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{txt.locality}</label>
                        <input
                          type="text"
                          value={form.localitate}
                          onChange={(e) => updateField('localitate', e.target.value)}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700 text-sm"
                          placeholder={txt.localityPlaceholder}
                        />
                      </div>
                      <div data-error={errors.strada ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{txt.street} *</label>
                        <input
                          type="text"
                          value={form.strada}
                          onChange={(e) => updateField('strada', e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-lg border ${errors.strada ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700'} text-sm`}
                          placeholder={txt.streetPlaceholder}
                        />
                        {errors.strada && <p className="text-xs text-red-500 mt-1">{errors.strada}</p>}
                      </div>
                      <div data-error={errors.codPostal ? 'true' : undefined}>
                        <label className="block text-xs font-medium text-slate-500 mb-1">{txt.postalCode} *</label>
                        <input
                          type="text"
                          value={form.codPostal}
                          onChange={(e) => updateField('codPostal', e.target.value)}
                          className={`w-full py-2.5 px-3 rounded-lg border ${errors.codPostal ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700'} text-sm`}
                          placeholder={txt.postalPlaceholder}
                        />
                        {errors.codPostal && <p className="text-xs text-red-500 mt-1">{errors.codPostal}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06]">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> {txt.paymentMethod}
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 'CASH' as const, label: txt.cashOnDelivery, desc: txt.cashDesc, icon: '💵' },
                      { id: 'CREDIT' as const, label: txt.creditIute, desc: txt.creditIuteDesc, icon: '🏦' },
                      { id: 'CREDIT_365' as const, label: txt.credit365, desc: txt.credit365Desc, icon: '💳' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => updateField('paymentMethod', m.id)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-colors flex items-center gap-3 ${
                          form.paymentMethod === m.id
                            ? 'border-primary bg-primary/5'
                            : 'border-slate-200 dark:border-white/[0.08] hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">{m.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-slate-800 dark:text-white">{m.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          form.paymentMethod === m.id ? 'border-primary' : 'border-slate-300 dark:border-white/[0.08]'
                        }`}>
                          {form.paymentMethod === m.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Installment plan — shown when any credit selected */}
                  {form.paymentMethod === 'CREDIT' && total >= 1000 && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-100 dark:border-orange-800/30">
                      <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-3 uppercase tracking-wide">
                        {txt.installmentPlan}
                      </p>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-widest text-orange-600/70 mb-1">{txt.monthlyPayment}</p>
                        <p className="text-3xl font-black text-orange-600">
                          {formatPrice(Math.ceil(total / 4))}
                          <span className="text-sm font-medium text-orange-400 ml-1">{txt.perMonth}</span>
                        </p>
                        <p className="text-xs text-orange-500 mt-1">{txt.smartZero}</p>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                          <p className="text-[10px] text-orange-600/60">{txt.period}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">4 {txt.months}</p>
                        </div>
                        <div className="text-center p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                          <p className="text-[10px] text-orange-600/60">{txt.overpayment}</p>
                          <p className="text-sm font-bold text-green-600">{txt.zeroMDL}</p>
                        </div>
                        <div className="text-center p-2 bg-white/50 dark:bg-slate-700/50 rounded-lg">
                          <p className="text-[10px] text-orange-600/60">{txt.total}</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{formatPrice(total)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-1.5 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                        <span className="text-[11px] font-bold text-green-700 dark:text-green-400">{txt.zeroPercentNoOverpay}</span>
                      </div>
                    </div>
                  )}

                  {/* Credit365 Interactive Flow */}
                  {form.paymentMethod === 'CREDIT_365' && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">💳</span>
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                          {txt.credit365Title}
                        </p>
                      </div>

                      {c365Error && (
                        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
                          ⚠️ {c365Error}
                        </div>
                      )}

                      {/* Step: IDNP */}
                      {c365Step === 'idle' || c365Step === 'idnp' ? (
                        <div className="space-y-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400">{txt.c365Step1}</p>
                          <input
                            type="text"
                            value={form.c365_idnp}
                            onChange={(e) => updateField('c365_idnp', e.target.value.replace(/\D/g, '').slice(0, 13))}
                            placeholder={txt.c365IdnpPlaceholder}
                            maxLength={13}
                            className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-sm"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (form.c365_idnp.length < 13) { setC365Error(txt.c365IdnpError); return; }
                              setC365Loading(true); setC365Error('');
                              try {
                                const data = await c365CheckIdnp(form.c365_idnp);
                                setC365Terms(data.terms);
                                setC365ProductId(data.productId);
                                setC365UserId(data.userId);
                                setC365Step('terms');
                              } catch (err) {
                                setC365Error(err instanceof Error ? err.message : txt.c365CheckError);
                              } finally { setC365Loading(false); }
                            }}
                            disabled={c365Loading}
                            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                          >
                            {c365Loading ? txt.c365Checking : txt.c365CheckBtn}
                          </button>
                        </div>
                      ) : null}

                      {/* Step: Select term */}
                      {c365Step === 'terms' && (
                        <div className="space-y-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400">{txt.c365Step2}</p>
                          <div className="grid grid-cols-2 gap-2">
                            {c365Terms.map((t) => (
                              <button
                                key={t.months}
                                type="button"
                                onClick={() => {
                                  updateField('c365_duration', String(t.months));
                                  setC365Step('details');
                                }}
                                className={`p-3 rounded-lg border-2 text-center transition ${
                                  form.c365_duration === String(t.months)
                                    ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30'
                                    : 'border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-700 hover:border-blue-300'
                                }`}
                              >
                                <p className="text-lg font-bold text-slate-800 dark:text-white">{t.months} {txt.months}</p>
                                <p className="text-[10px] text-blue-600/70">{formatPrice(Math.ceil(total / t.months))}{txt.perMonth}</p>
                              </button>
                            ))}
                          </div>
                          <button type="button" onClick={() => setC365Step('idnp')} className="text-xs text-blue-500 hover:underline">{txt.c365Back}</button>
                        </div>
                      )}

                      {/* Step: Personal details */}
                      {c365Step === 'details' && (
                        <div className="space-y-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400">{txt.c365Step3}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <input value={form.c365_firstName} onChange={(e) => updateField('c365_firstName', e.target.value)} placeholder={txt.c365FirstName} className="px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-sm" />
                            <input value={form.c365_lastName} onChange={(e) => updateField('c365_lastName', e.target.value)} placeholder={txt.c365LastName} className="px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-sm" />
                            <input type="date" value={form.c365_birthDate} onChange={(e) => updateField('c365_birthDate', e.target.value)} className="px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-sm" />
                            <select value={form.c365_gender} onChange={(e) => updateField('c365_gender', e.target.value)} className="px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-sm">
                              <option value="1">{txt.c365GenderMale}</option>
                              <option value="2">{txt.c365GenderFemale}</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] text-blue-600/70">{txt.c365PassportLabel}</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  const base64 = (reader.result as string).split(',')[1];
                                  setC365Passport(base64);
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="w-full text-xs"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!form.c365_firstName || !form.c365_lastName || !form.c365_birthDate) {
                                setC365Error(txt.c365FillAll); return;
                              }
                              setC365Loading(true); setC365Error('');
                              try {
                                const phoneNum = parseInt(form.phone.replace(/\D/g, ''));
                                const applicationId = await c365Submit({
                                  idnp: form.c365_idnp,
                                  lastName: form.c365_lastName,
                                  firstName: form.c365_firstName,
                                  phone: phoneNum,
                                  email: form.email || null,
                                  productId: c365ProductId!,
                                  amount: total,
                                  duration: parseInt(form.c365_duration),
                                  birthDate: form.c365_birthDate,
                                  gender: parseInt(form.c365_gender),
                                  commodityName: items.map(i => i.product.name).join(', ').slice(0, 100),
                                  passportBase64: c365Passport,
                                });
                                setC365ApplicationId(applicationId);
                                setC365Step('sms');
                              } catch (err) {
                                setC365Error(err instanceof Error ? err.message : txt.c365SendError);
                              } finally { setC365Loading(false); }
                            }}
                            disabled={c365Loading}
                            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                          >
                            {c365Loading ? txt.c365Sending : txt.c365SendBtn}
                          </button>
                          <button type="button" onClick={() => setC365Step('terms')} className="text-xs text-blue-500 hover:underline">{txt.c365Back}</button>
                        </div>
                      )}

                      {/* Step: SMS confirmation */}
                      {c365Step === 'sms' && (
                        <div className="space-y-3">
                          <p className="text-xs text-blue-600 dark:text-blue-400">{txt.c365Step4}</p>
                          <p className="text-xs text-slate-500">{txt.c365SmsSent}</p>
                          <input
                            type="text"
                            value={c365SmsCode}
                            onChange={(e) => setC365SmsCode(e.target.value)}
                            placeholder={txt.c365SmsPlaceholder}
                            maxLength={6}
                            className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-slate-700 text-sm text-center text-lg tracking-widest"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!c365SmsCode || !c365ApplicationId) return;
                              setC365Loading(true); setC365Error('');
                              try {
                                await c365Confirm(c365ApplicationId!, c365SmsCode);
                                setC365Step('done');
                              } catch (err) {
                                setC365Error(err instanceof Error ? err.message : txt.c365ConfirmError);
                              } finally { setC365Loading(false); }
                            }}
                            disabled={c365Loading}
                            className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition disabled:opacity-50"
                          >
                            {c365Loading ? txt.c365Confirming : txt.c365ConfirmBtn}
                          </button>
                        </div>
                      )}

                      {/* Done */}
                      {c365Step === 'done' && (
                        <div className="text-center space-y-2">
                          <div className="text-3xl">✅</div>
                          <p className="text-sm font-bold text-green-600">{txt.c365Done}</p>
                          <p className="text-xs text-slate-500">{txt.c365DoneDesc}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06]">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">{txt.notes}</h3>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    rows={3}
                    className="w-full py-2.5 px-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700 text-sm resize-none"
                    placeholder={txt.notesPlaceholder}
                  />
                </div>
              </div>

              {/* Summary Sidebar */}
              <div>
                <div className="bg-white dark:bg-[var(--color-dark-elevated)] rounded-2xl p-5 border border-slate-200 dark:border-white/[0.06] sticky top-24">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">{txt.orderSummary}</h3>

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

                  <div className="border-t border-slate-200 dark:border-white/[0.06] pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>{txt.subtotal}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>

                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{txt.discountLabel} ({coupon?.code})</span>
                        <span>-{formatPrice(couponDiscount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-500">
                      <span>{txt.shipping}</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">{txt.free}</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold">
                        <span>{txt.totalDiscount}</span>
                        <span>-{formatPrice(totalDiscount)}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 dark:border-white/[0.06] pt-2 flex justify-between font-bold text-lg text-slate-800 dark:text-white">
                      <span>{txt.total}</span>
                      <span className="text-primary-dark dark:text-primary">{formatPrice(total)}</span>
                    </div>

                    {/* Installment summary in sidebar */}
                    {form.paymentMethod === 'CREDIT' && total >= 1000 && (
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 mt-3 border border-orange-100 dark:border-orange-800/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-orange-600/70 font-semibold">{txt.installmentMonthlyLabel}</p>
                            <p className="text-2xl font-black text-orange-600">{formatPrice(Math.ceil(total / 4))}<span className="text-xs font-medium text-orange-400">{txt.perMonth}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wide text-orange-600/70 font-semibold">{txt.installmentSmartLabel}</p>
                            <p className="text-sm font-bold text-green-600">{txt.noOverpayment}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Credit365 summary */}
                    {form.paymentMethod === 'CREDIT_365' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mt-3 border border-blue-100 dark:border-blue-800/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-blue-600/70 font-semibold">Credit365</p>
                            <p className="text-sm font-bold text-blue-600">{c365Step === 'done' ? txt.credit365Approved : txt.credit365Pending}</p>
                          </div>
                          {c365Step !== 'done' && (
                            <span className="text-xs text-blue-500">{txt.fillForm}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Free shipping reminder */}
                  {shippingCost > 0 && form.deliveryMethod !== 'PICKUP' && (
                    <div className="mt-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 text-xs">
                      <p className="text-amber-700 dark:text-amber-400">
                        {txt.moreForFreeShipping} <strong>{formatPrice(remainingForFreeShipping)}</strong> {txt.forFreeShipping}
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
                        <button type="button" onClick={removeCoupon} className="text-xs text-red-500 hover:underline">{txt.remove}</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={form.couponCode}
                            onChange={(e) => updateField('couponCode', e.target.value.toUpperCase())}
                            placeholder={txt.promoPlaceholder}
                            className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={applyCoupon}
                          disabled={couponLoading || !form.couponCode.trim()}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                          {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : txt.apply}
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
                      {txt.termsAgree}{' '}
                      <Link href={isRu ? "/ru/terms" : "/terms"} className="text-primary hover:underline">{txt.terms}</Link> {txt.and}{' '}
                      <Link href={isRu ? "/ru/privacy" : "/privacy"} className="text-primary hover:underline">{txt.privacy}</Link>
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
                        <Loader2 className="w-4 h-4 animate-spin" /> {txt.processing}
                      </>
                    ) : (
                      `${txt.placeOrder} — ${formatPrice(total)}`
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center mt-3">
                    {txt.dataSecure}
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
