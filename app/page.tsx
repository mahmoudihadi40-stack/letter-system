'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const initializeSession = async () => {
      try {
        // خودکار کاربر IT را login کن
        const response = await fetch('/api/auth/auto-login');
        if (response.ok) {
          // به داشبورد ببره
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        router.push('/login');
      }
    };

    initializeSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">درحال بارگذاری...</h1>
        <p className="text-gray-600">سیستم مدیریت نامه‌نگاری</p>
      </div>
    </div>
  );
}
