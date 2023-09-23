import { DefaultSeo } from 'next-seo';
import { ChakraProvider } from '@chakra-ui/react'

import theme from '../theme'
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo
        title="MPC.is"
        description="Learn what MPC is and the most important features such as Distributed Key Generation (DKG) and Threshold Signature Scheme (TSS)."
        openGraph={{
          type: 'website',
          locale: 'en_IE',
          url: 'https://mpc.is/',
          siteName: 'MPC.is',
          images: [{
            url: 'https://mpc.is/images/mpc.png',
            width: 1200,
            height: 630,
            alt: 'MPC',
          }],
        }}
        twitter={{
          handle: '@0xjjpa',
          site: '@0xjjpa',
          cardType: 'summary_large_image',
        }}
      />

      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  )
}

export default MyApp