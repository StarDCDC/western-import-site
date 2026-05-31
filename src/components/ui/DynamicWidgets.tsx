"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(() => import("@/components/ui/ChatbotWidget"), { ssr: false });
const AnalyticsScripts = dynamic(() => import("@/components/ui/AnalyticsScripts"), { ssr: false });
const RecaptchaScripts = dynamic(() => import("@/components/ui/RecaptchaScripts"), { ssr: false });
const WhatsAppButton = dynamic(() => import("@/components/ui/WhatsAppButton"), { ssr: false });

export default function DynamicWidgets() {
  return (
    <>
      <AnalyticsScripts />
      <RecaptchaScripts />
      <WhatsAppButton />
      <ChatbotWidget widgetId={process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID || ""} />
    </>
  );
}
