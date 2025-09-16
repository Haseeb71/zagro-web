import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ConditionalLayout from "@/components/ConditionalLayout";
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { loadCart } from '@/redux/slices/cartSlice';

// Component to handle cart hydration
function CartHydration() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Load cart from localStorage when app starts
    dispatch(loadCart());
  }, [dispatch]);
  
  return null;
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <CartHydration />
      <ConditionalLayout>
        <Component {...pageProps} />
      </ConditionalLayout>
    </Provider>
  );
}
