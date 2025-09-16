import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Barlow } from 'next/font/google';
import ReduxProvider from '../redux/ReduxProvider';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-barlow',
});

export default function App({ Component, pageProps }) {
  return (
    <div className={barlow.variable}>
      <ReduxProvider>
        <Component {...pageProps} />
      </ReduxProvider>
    </div>
  );
}
