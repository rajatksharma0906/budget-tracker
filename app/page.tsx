'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/LoginPage';
import { getStoredUserId } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (getStoredUserId()) {
      router.replace('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return null;
  }

  return <LoginPage />;
}
