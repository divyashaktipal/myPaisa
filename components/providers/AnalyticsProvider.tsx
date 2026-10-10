"use client";

import { useEffect } from "react";
import Script from "next/script";

interface AnalyticsProviderProps {
  gaId: string;
  clarityId: string;
}

const AnalyticsProvider = ({ gaId, clarityId }: AnalyticsProviderProps) => {
  // Verify Clarity script injected correctly (dev-only log)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (gaId) console.log("[Analytics] GA4 loaded:", gaId);
      if (clarityId) console.log("[Analytics] Clarity loaded:", clarityId);
    }
  }, [gaId, clarityId]);

  return (
    <>
      {/* ── Google Analytics 4 ── */}
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {/* ── Microsoft Clarity ── */}
      {clarityId && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${clarityId}");
          `}
        </Script>
      )}
    </>
  );
};

export default AnalyticsProvider;
