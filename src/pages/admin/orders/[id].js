import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Old URL /admin/orders/:id → new /admin/order/:id */
export default function LegacyOrderRedirect() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!router.isReady || !id) return;
    router.replace(`/admin/order/${id}`);
  }, [router, id]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-[#6b6560]">
      Opening order…
    </div>
  );
}
