'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParentLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/parent/dashboard');
  }, [router]);

  return (
    <div className="safe-screen">
      <p>正在前往家長後台...</p>
    </div>
  );
}
