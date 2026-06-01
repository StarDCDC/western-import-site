// src/components/product/IuteCreditWidget.tsx — IutePay promotional messaging + checkout
// Docs: <div class="iute-as-low-as" data-amount="..." data-page-type="..." data-sku="..." />
'use client';

import { useEffect, useRef } from 'react';
import { CreditCard } from 'lucide-react';

interface IuteCreditWidgetProps {
  productId: string;
  price: number;
  /** Product name (unused by SDK but kept for interface compat) */
  productName?: string;
  /** Minimum price to show the widget. Default: 1000 MDL */
  minPrice?: number;
  /** 'product' | 'category' | 'cart' | 'payment' */
  pageType?: string;
}

/**
 * IutePay "As Low As" promotional widget.
 * Shows monthly payment calculation automatically via the SDK.
 * Place on product pages, category pages, cart, and checkout.
 */
export default function IuteCreditWidget({
  price,
  productId,
  minPrice = 1000,
  pageType = 'product',
}: IuteCreditWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Re-trigger SDK scan after mount — the SDK looks for .iute-as-low-as elements
    // @ts-expect-error IutePay global
    if (window.iute && widgetRef.current) {
      // SDK auto-detects the element; if needed, we can force a re-scan
      // by briefly toggling the element's visibility
      const el = widgetRef.current;
      const parent = el.parentElement;
      if (parent) {
        const clone = el.cloneNode(true) as HTMLDivElement;
        parent.replaceChild(clone, el);
      }
    }
  }, [price, productId]);

  // Don't show for cheap products
  if (price < minPrice) return null;

  return (
    <div
      ref={widgetRef}
      className="iute-as-low-as"
      data-amount={String(price)}
      data-page-type={pageType}
      data-sku={productId}
      data-learnmore-show="true"
    />
  );
}

/**
 * IutePay Checkout Button — for checkout page.
 * Opens the official IutePay checkout modal with cart + customer data.
 *
 * Docs flow:
 * 1. Customer clicks "Plătește în rate cu IutePay"
 * 2. iute.checkout() is called with order data
 * 3. onSuccess → save checkoutSessionId, create order as PENDING
 * 4. IutePay POSTs to userConfirmationUrl when loan is approved/signed
 */
export function IutePayCheckoutButton({
  cartItems,
  customerData,
  orderId,
  total,
  subtotal,
  currency = 'MDL',
  shippingAmount = 0,
  taxAmount = 0,
  onSuccess,
  onFailure,
}: {
  cartItems: Array<{
    displayName: string;
    sku: string;
    unitPrice: number;
    qty: number;
    itemImageUrl?: string;
    itemUrl?: string;
  }>;
  customerData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    region?: string;
    zipCode?: string;
  };
  orderId: string;
  total: number;
  subtotal: number;
  currency?: string;
  shippingAmount?: number;
  taxAmount?: number;
  onSuccess?: (result: { checkoutSessionId: string }) => void;
  onFailure?: (result: { message: string }) => void;
}) {
  const handleClick = () => {
    // @ts-expect-error IutePay global
    if (!window.iute) {
      console.error('[IutePay] SDK not loaded');
      onFailure?.({ message: 'IutePay SDK nu s-a încărcat. Reîncarcă pagina.' });
      return;
    }

    // @ts-expect-error IutePay global
    window.iute.checkout(
      {
        merchant: {
          // Docs: userConfirmationUrl = webhook for loan status updates (POST)
          userConfirmationUrl: `${window.location.origin}/api/iute/confirm`,
          userCancelUrl: `${window.location.origin}/cart`,
          userConfirmationUrlAction: 'POST',
          name: 'Western Import',
        },
        shipping: {
          name: {
            first: customerData.firstName,
            last: customerData.lastName,
          },
          address: {
            line1: customerData.address1,
            line2: customerData.address2 || '',
            city: customerData.city,
            state: customerData.region || '',
            zipcode: customerData.zipCode || '',
            country: 'mda',
          },
          phoneNumber: customerData.phone,
          email: customerData.email,
        },
        billing: {
          name: {
            first: customerData.firstName,
            last: customerData.lastName,
          },
          address: {
            line1: customerData.address1,
            line2: customerData.address2 || '',
            city: customerData.city,
            state: customerData.region || '',
            zipcode: customerData.zipCode || '',
            country: 'mda',
          },
          phoneNumber: customerData.phone,
          email: customerData.email,
        },
        items: cartItems.map((item) => ({
          displayName: item.displayName,
          sku: item.sku,
          unitPrice: item.unitPrice,
          qty: item.qty,
          ...(item.itemImageUrl ? { itemImageUrl: item.itemImageUrl } : {}),
          ...(item.itemUrl ? { itemUrl: item.itemUrl } : {}),
        })),
        metadata: {
          mode: 'modal',
        },
        // Docs: orderId mandatory — unique order identifier
        orderId,
        // Docs: currency mandatory — ISO-3 code
        currency,
        // Docs: shippingAmount mandatory — use 0 if not applicable
        shippingAmount,
        // Docs: taxAmount mandatory — use 0 if not applicable
        taxAmount,
        // Docs: subtotal mandatory — cart subtotal
        subtotal,
        // Docs: total mandatory — loan application amount is based on this
        total,
      },
      {
        // Docs: onSuccess — loan application successfully submitted
        // result.checkoutSessionId — save this to link with order
        onSuccess: (result: { checkoutSessionId: string }) => {
          console.log('[IutePay] Checkout success:', result);
          onSuccess?.(result);
        },
        // Docs: onFailure — validation error, modal closed, or maintenance mode
        onFailure: (result: { message: string }) => {
          console.warn('[IutePay] Checkout failure:', result);
          onFailure?.(result);
        },
      },
    );
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg w-full"
    >
      <CreditCard className="w-5 h-5" />
      <span>Plătește în rate cu IutePay</span>
    </button>
  );
}
