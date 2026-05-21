// src/components/product/IuteCreditWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice, getCreditCalculations, type CreditCalculation } from '@/lib/api';
import { AVAILABLE_MONTHS } from '@/lib/integrations/iuteCredit';

interface IuteCreditWidgetProps {
  productId: string;
  price: number;
  productName: string;
  /** Minimum price to show the widget. Default: 1000 MDL */
  minPrice?: number;
}

// Local interest rate table (matches iuteCredit.ts)
const INTEREST_RATES: Record<number, number> = {
  3: 0,
  6: 0,
  9: 4.9,
  12: 7.9,
  18: 11.9,
  24: 14.9,
};

export default function IuteCreditWidget({ productId, price, productName, minPrice = 1000 }: IuteCreditWidgetProps) {
  const [creditPlans, setCreditPlans] = useState<CreditCalculation[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const [creditLoading, setCreditLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Customer form for credit application
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState<{ applicationId: string; redirectUrl: string } | null>(null);

  // Don't show for cheap products
  if (price < minPrice) return null;

  // Load credit calculations from API
  useEffect(() => {
    async function loadCredit() {
      setCreditLoading(true);
      try {
        const plans = await getCreditCalculations(productId);
        if (plans && plans.length > 0) {
          setCreditPlans(plans);
          const zeroPlan = plans.filter(p => p.interestRate === 0);
          if (zeroPlan.length > 0) {
            setSelectedMonths(zeroPlan[zeroPlan.length - 1].months);
          }
        }
      } catch {
        // Will use fallback below
      } finally {
        setCreditLoading(false);
      }
    }
    if (productId) loadCredit();
  }, [productId]);

  // Local fallback calculation
  useEffect(() => {
    if (creditPlans.length === 0 && !creditLoading) {
      const plans: CreditCalculation[] = AVAILABLE_MONTHS.map(months => {
        const rate = INTEREST_RATES[months] || 0;
        let monthlyPayment: number;
        if (rate === 0) {
          monthlyPayment = Math.ceil(price / months);
        } else {
          const monthlyRate = rate / 100 / 12;
          const factor = Math.pow(1 + monthlyRate, months);
          monthlyPayment = Math.ceil(price * (monthlyRate * factor) / (factor - 1));
        }
        const totalPayment = monthlyPayment * months;
        return {
          months,
          monthlyPayment,
          totalPayment,
          interestRate: rate,
          interestAmount: totalPayment - price,
        };
      });
      setCreditPlans(plans);
      const zeroPlan = plans.filter(p => p.interestRate === 0);
      if (zeroPlan.length > 0) {
        setSelectedMonths(zeroPlan[zeroPlan.length - 1].months);
      }
    }
  }, [price, creditPlans.length, creditLoading]);

  const selectedPlan = creditPlans.find(p => p.months === selectedMonths);

  const handleApply = async () => {
    if (!customerName || !customerPhone) return;
    setApplying(true);
    try {
      // Use the API route to generate a credit link
      const res = await fetch('/api/integrations/iute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          months: selectedMonths,
          customerName,
          customerPhone,
          customerEmail,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setApplyResult(json.data);
        // If there's a redirect URL, open it
        if (json.data.redirectUrl) {
          window.open(json.data.redirectUrl, '_blank');
        }
      }
    } catch {
      // Fallback: open IuteCredit page directly
      window.open(`/api/integrations/iute?productId=${productId}`, '_blank');
    } finally {
      setApplying(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-5 mb-2 border border-orange-200 dark:border-orange-800">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-600" />
            <h3 className="font-bold text-sm text-orange-800 dark:text-orange-300">
              Cumpără în rate — IuteCredit
            </h3>
            {selectedPlan?.interestRate === 0 && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full">
                0% DOBÂNDĂ
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-orange-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-orange-600" />
          )}
        </button>

        {expanded && (
          <div className="mt-3">
            {creditPlans.length > 0 ? (
              <>
                {/* Starting from */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-orange-700 dark:text-orange-300">
                    de la {formatPrice(creditPlans[0].monthlyPayment)}/lună
                  </span>
                </div>

                {/* Month selector buttons */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {creditPlans.map((plan) => (
                    <button
                      key={plan.months}
                      onClick={() => setSelectedMonths(plan.months)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedMonths === plan.months
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-orange-400'
                      }`}
                    >
                      {plan.months} luni
                      {plan.interestRate === 0 && <span className="ml-1 text-green-600">✓</span>}
                    </button>
                  ))}
                </div>

                {/* Selected plan details card */}
                {selectedPlan && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-3 mb-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rata lunară:</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {formatPrice(selectedPlan.monthlyPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total de plată:</span>
                      <span className="font-bold text-slate-800 dark:text-white">
                        {formatPrice(selectedPlan.totalPayment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dobândă anuală:</span>
                      <span
                        className={`font-bold ${
                          selectedPlan.interestRate === 0
                            ? 'text-green-600'
                            : 'text-slate-800 dark:text-white'
                        }`}
                      >
                        {selectedPlan.interestRate === 0
                          ? '0% (GRATUIT)'
                          : `${selectedPlan.interestRate}%`}
                      </span>
                    </div>
                    {selectedPlan.interestAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cost credit:</span>
                        <span className="text-orange-600 font-bold">
                          +{formatPrice(selectedPlan.interestAmount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <CreditCard className="w-4 h-4" /> Aplică credit
                  </button>
                  <a
                    href={`/api/integrations/iute?productId=${productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-4 py-2.5 border border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400 rounded-xl font-semibold text-sm hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Detalii
                  </a>
                </div>

                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  Credit oferit de IuteCredit Moldova. Termeni și condiții aplicabile.
                </p>
              </>
            ) : creditLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Se încarcă opțiunile de credit...
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Aplică pentru credit
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {productName} — {selectedPlan && formatPrice(selectedPlan.monthlyPayment)}/lună × {selectedMonths} luni
            </p>

            {applyResult ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <p className="font-semibold text-slate-900 dark:text-white mb-1">
                  Cerere trimisă!
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  ID cerere: <span className="font-mono">{applyResult.applicationId}</span>
                </p>
                {applyResult.redirectUrl && (
                  <a
                    href={applyResult.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" /> Completează aplicația
                  </a>
                )}
                <button
                  onClick={() => { setShowApplyModal(false); setApplyResult(null); }}
                  className="block mx-auto mt-3 text-sm text-slate-500 hover:text-slate-700"
                >
                  Închide
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nume complet *
                  </label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Ion Popescu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Telefon *
                  </label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="+373 69 123 456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    type="email"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="email@exemplu.md"
                  />
                </div>

                {selectedPlan && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Produs:</span>
                      <span className="font-medium text-slate-800 dark:text-white">{formatPrice(price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Rata lunară:</span>
                      <span className="font-bold text-orange-700">{formatPrice(selectedPlan.monthlyPayment)} × {selectedMonths} luni</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total:</span>
                      <span className="font-bold text-slate-800 dark:text-white">{formatPrice(selectedPlan.totalPayment)}</span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleApply}
                    disabled={applying || !customerName || !customerPhone}
                    className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white transition-colors ${
                      applying || !customerName || !customerPhone
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    {applying ? 'Se trimite...' : 'Trimite cererea'}
                  </button>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    Anulează
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
