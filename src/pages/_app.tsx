import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import Script from 'next/script';
import { Router } from 'next/router';
import Head from 'next/head';

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Petform</title>
        <meta name="description" content="Generate pet photo" />
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
      </Head>
      <ChakraProvider>
        <Component {...pageProps}/>
      </ChakraProvider>
    </>
  )
}
