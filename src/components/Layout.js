import { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Layout({ children }) {
  // Initialize AOS animations
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

  // Re-initialize AOS on window resize
  useEffect(() => {
    const handleResize = () => {
      AOS.refresh();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
} 