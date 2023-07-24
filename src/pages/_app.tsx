import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react';
import React, {useEffect, useState} from 'react';
import Script from 'next/script';
import { Router } from 'next/router';
import Head from 'next/head';
// import Hotjar from '@hotjar/browser';

// function FacebookPixel(){
//   React.useEffect(() => {
//     import("react-facebook-pixel")
//       .then((x) => x.default)
//       .then((ReactPixel) => {
//         ReactPixel.init("257397480350606");
//         ReactPixel.pageView();

//         Router.events.on("routeChangeComplete", () => {
//           ReactPixel.pageView();
//         });
//       });
//   });
//   return null;
// }

// const siteId = 3569199;
// const hotjarVersion = 6;

export default function App({ Component, pageProps }: AppProps) {
  // useEffect(() => {
  //   Hotjar.init(siteId, hotjarVersion);
  // }, []);

  return (
    <>
      <Head>
        <title>resume.js</title>
        <meta name="description" content="Generate resumes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <Script>
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '257397480350606');
            fbq('track', 'PageView');
          `}
        </Script>
        <Script>
          {`
          (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:3569199,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      </Head>
      <ChakraProvider>
        <Component {...pageProps}/>
      </ChakraProvider>
    </>
  )
}
