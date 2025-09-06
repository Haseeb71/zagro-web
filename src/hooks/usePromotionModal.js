import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const usePromotionModal = () => {
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the home page
    const isHomePage = router.pathname === '/';
    
    if (isHomePage) {
      // Always show on home page (every reload)
      const timer = setTimeout(() => {
        setShowPromotionModal(true);
        setHasShownModal(true);
      }, 2000); // 2 second delay

      return () => clearTimeout(timer);
    } else {
      // For other pages, check if user has already seen the promotion modal
      const hasSeenModal = localStorage.getItem('hasSeenPromotionModal');
      
      if (!hasSeenModal) {
        // Show modal after a short delay to ensure page is loaded
        const timer = setTimeout(() => {
          setShowPromotionModal(true);
          setHasShownModal(true);
          // Mark as seen in localStorage
          localStorage.setItem('hasSeenPromotionModal', 'true');
        }, 2000); // 2 second delay

        return () => clearTimeout(timer);
      }
    }
  }, [router.pathname]);

  const closePromotionModal = () => {
    setShowPromotionModal(false);
  };

  const resetPromotionModal = () => {
    // Reset the modal state (useful for testing)
    localStorage.removeItem('hasSeenPromotionModal');
    setHasShownModal(false);
    setShowPromotionModal(false);
  };

  return {
    showPromotionModal,
    closePromotionModal,
    resetPromotionModal,
    hasShownModal
  };
};

export default usePromotionModal;
