// src/components/product/IuteCreditWidget.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { CreditCard } from 'lucide-react';

interface IuteCreditWidgetProps {
  productId: string;
  price: number;
  productName: string;
  /** Minimum price to show the widget. Default: 1000 MDL */
  minPrice?: number;
  /** 'product' | 'category' | 'cart' | 'payment' */
  pageType?: string;
}

export default function IuteCreditWidget({
  price,
  productId,
  minPrice = 1000,
  pageType = 'product',
}: IuteCreditWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    // Check if IutePay SDK loaded
    const check = () => {
      // @ts-expect-error IutePay global
      if (window.iute) {
        setSdkLoaded(true);
      } else {
        setTimeout(check, 500);
      }
    };
    check();
  }, []);

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
 * IutePay Checkout Button — for use on cart/checkout page.
 * Opens the official IutePay checkout modal.
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
      console.error('IutePay SDK not loaded');
      return;
    }

    // @ts-expect-error IutePay global
    window.iute.checkout(
      {
        merchant: {
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
        orderId,
        currency,
        shippingAmount,
        taxAmount,
        subtotal,
        total,
      },
      {
        onSuccess: (result: { checkoutSessionId: string }) => {
          onSuccess?.(result);
        },
        onFailure: (result: { message: string }) => {
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
