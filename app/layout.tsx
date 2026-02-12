import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: "Weavy | AI-Powered Design Workflows, Built for Creative Pros",
  description:
    "Transform your creative vision into scalable workflows with Weavy. Integrate AI models and editing tools in one seamless, node-based platform.",
  openGraph: {
    title: "Weavy | AI-Powered Design Workflows, Built for Creative Pros",
    description:
      "Transform your creative vision into scalable workflows with Weavy. Integrate AI models and editing tools in one seamless, node-based platform.",
    images: [
      "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6829db27001db19910ac428b_OG%20image%20option1.avif",
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weavy | AI-Powered Design Workflows, Built for Creative Pros",
    description:
      "Transform your creative vision into scalable workflows with Weavy. Integrate AI models and editing tools in one seamless, node-based platform.",
    images: [
      "https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6829db27001db19910ac428b_OG%20image%20option1.avif",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-wf-domain="www.weavy.ai"
        data-wf-page="681b040781d5b5e278a6999f"
        data-wf-site="681b040781d5b5e278a69989"
      >
        <head>
          <meta charSet="utf-8" />
          <link
            href="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6829dad31872740b3fb4f912_favicon.svg"
            rel="shortcut icon"
            type="image/x-icon"
          />
          <link
            href="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/6829dad8315fe0e5d7abf94b_Webclip.svg"
            rel="apple-touch-icon"
          />
          <link
            rel="stylesheet"
            href="/cdn.jsdelivr.net/npm/@splidejs/splide@3.2.2/dist/css/splide-core.min.css"
          />
          <link
            href="/cdn.prod.website-files.com/681b040781d5b5e278a69989/css/weavy-ai.webflow.shared.4177f1ac9.css"
            rel="stylesheet"
            type="text/css"
          />
        </head>
        <body>
          {children}

          {/* Google Tag Manager */}
          <Script id="gtm" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PW3B9LZJ');
            `}
          </Script>
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-PW3B9LZJ"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>

          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-FZG9BNPQXK"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('set', 'developer_id.dZGVlNj', true);
              gtag('js', new Date());
              gtag('config', 'G-FZG9BNPQXK');
            `}
          </Script>

          {/* FirstPromoter */}
          <Script id="firstpromoter-init" strategy="afterInteractive">
            {`
              (function(w){w.fpr=w.fpr||function(){w.fpr.q = w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
              fpr("init", {cid:"vzajpas8"}); 
              fpr("click");
            `}
          </Script>
          <Script
            src="https://cdn.firstpromoter.com/fpr.js"
            strategy="afterInteractive"
          />

          {/* PostHog */}
          <Script id="posthog-init" strategy="afterInteractive">
            {`
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init be ys Ss me gs ws capture Ne calculateEventProperties xs register register_once register_for_session unregister unregister_for_session Rs getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Is ks createPersonProfile Ps bs opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing $s debug Es getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('phc_NT2sOH8m82boUw21Q1Vsr0tQUtjpRJUIE5aoqA0En8T', {
                  api_host: 'https://eu.i.posthog.com',
                  person_profiles: 'identified_only', 
              })
              `}
          </Script>

          {/* Global Libs */}
          <Script
            src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
            type="module"
            strategy="lazyOnload"
          />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"
            strategy="afterInteractive"
          />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"
            strategy="afterInteractive"
          />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/Draggable.min.js"
            strategy="afterInteractive"
          />
          <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/leader-line/1.0.3/leader-line.min.js"
            strategy="afterInteractive"
          />
          <Script
            src="https://cdn.jsdelivr.net/npm/@splidejs/splide@3.2.2/dist/js/splide.min.js"
            strategy="afterInteractive"
          />
          <Script
            src="https://unpkg.com/lenis@1.2.3/dist/lenis.min.js"
            strategy="afterInteractive"
          />

          {/* Webflow JS */}
          <Script
            src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=681b040781d5b5e278a69989"
            strategy="beforeInteractive"
          />
          {/* We moved webflow JS to public/cdn.prod.website-files.com/681b040781d5b5e278a69989/js/ */}
          <Script
            src="/cdn.prod.website-files.com/681b040781d5b5e278a69989/js/webflow.schunk.e0c428ff9737f919.js"
            strategy="afterInteractive"
          />
          <Script
            src="/cdn.prod.website-files.com/681b040781d5b5e278a69989/js/webflow.schunk.dde2c6d4ef1627b8.js"
            strategy="afterInteractive"
          />
          <Script
            src="/cdn.prod.website-files.com/681b040781d5b5e278a69989/js/webflow.3a34c156.6bb9f3ec92cc8a2c.js"
            strategy="afterInteractive"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
