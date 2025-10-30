import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReduxProvider from '../redux/ReduxProvider';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <ReduxProvider>
      <Head>
        <title>Zagro Footwear</title>
        <meta name="application-name" content="Zagro Footwear" />
      </Head>
      <Component {...pageProps} />
    </ReduxProvider>
  );
}
