import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from './Layout';
import { LAYOUT_CONFIG } from '../config/layout';

export default function ConditionalLayout({ children }) {
  const router = useRouter();
  const [shouldUseLayout, setShouldUseLayout] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (router.isReady) {
      const pathname = router.pathname;
      const useLayout = LAYOUT_CONFIG.shouldUseLayout(pathname);
      
      console.log(`Route: ${pathname}, Using Layout: ${useLayout}`);
      setShouldUseLayout(useLayout);
      setIsLoading(false);
    }
  }, [router.isReady, router.pathname]);

  // Show loading state while determining layout
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If layout is not needed, render children directly
  if (!shouldUseLayout) {
    return <>{children}</>;
  }

  // If layout is needed, wrap with Layout component
  return <Layout>{children}</Layout>;
}
