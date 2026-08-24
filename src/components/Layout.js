import { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import { ModalProvider } from '../contexts/ModalContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Layout({ children, showNavigation = true, showFooter = true }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true,
        offset: 100,
        easing: 'ease-out-cubic',
        delay: 100,
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      AOS.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ModalProvider>
      <div className="min-h-screen bg-white">
        {showNavigation && <Navigation />}
        <main className="pt-0">{children}</main>
        {showFooter && <Footer />}
        <WhatsAppButton />
      </div>
    </ModalProvider>
  );
}
