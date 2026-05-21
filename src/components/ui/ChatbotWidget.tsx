"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

interface ChatbotWidgetProps {
  widgetId: string;
}

export default function ChatbotWidget({ widgetId }: ChatbotWidgetProps) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const setting = localStorage.getItem("chatbot-widget-enabled");
    if (setting === "false") {
      setEnabled(false);
    }
  }, []);

  if (!widgetId || !enabled) {
    return null;
  }

  return (
    <>
      <Script
        src="https://static.elfsight.com/platform/platform.js"
        strategy="lazyOnload"
      />
      <div
        className={`elfsight-app-${widgetId}`}
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          zIndex: 9999,
          pointerEvents: "auto",
        }}
      />
    </>
  );
}
