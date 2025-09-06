import { useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import { ModalProvider } from '../contexts/ModalContext';
import PromotionModal from './PromotionModal';
import usePromotionModal from '../hooks/usePromotionModal';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function Layout({ children, showNavigation = true, showFooter = true }) {
  const { showPromotionModal, closePromotionModal } = usePromotionModal();

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
    <ModalProvider>
      <div className="min-h-screen bg-white">
        {showNavigation && <Navigation />}
        <main className="pt-0">{children}</main>
        {showFooter && <Footer />}
        
        {/* Promotion Modal */}
        <PromotionModal 
          isOpen={showPromotionModal} 
          onClose={closePromotionModal} 
        />
      </div>
    </ModalProvider>
  );
} 