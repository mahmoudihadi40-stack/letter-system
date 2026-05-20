'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

interface User {
  id: string
  username: string
  full_name: string
  email: string
  role: string
  permissions: string[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/')
    }
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('token')
    router.push('/')
  }

  if (loading) return <div className="text-center py-10">در حال بارگذاری...</div>

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b-2 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-amber-700">هتل نور حیات</h1>
              <p className="text-xs text-gray-500">Nour Hayat Hotel</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">خوش آمدید</p>
              <p className="text-gray-600 font-semibold">{user.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user.full_name}</p>
              <p className="text-sm text-gray-500">{user.role}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
            >
              خروج
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* نوشتن نامه جدید */}
          <Link href="/dashboard/compose">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✍️</div>
              <h2 className="text-lg font-semibold mb-2">نوشتن نامه جدید</h2>
              <p className="text-gray-600 text-sm">
                یک نامه اداری جدید بنویسید
              </p>
            </Card>
          </Link>

          {/* کارتابل نامه‌های صادره */}
          <Link href="/dashboard/outbox">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📤</div>
              <h2 className="text-lg font-semibold mb-2">نامه‌های صادره</h2>
              <p className="text-gray-600 text-sm">
                نامه‌های ارسالی و منتظر تایید
              </p>
            </Card>
          </Link>

          {/* کارتابل نامه‌های وارده */}
          <Link href="/dashboard/inbox">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📥</div>
              <h2 className="text-lg font-semibold mb-2">نامه‌های وارده</h2>
              <p className="text-gray-600 text-sm">
                نامه‌های دریافتی و معلق
              </p>
            </Card>
          </Link>

          {/* جستجو و آرشیو */}
          <Link href="/dashboard/search">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-lg font-semibold mb-2">جستجو و آرشیو</h2>
              <p className="text-gray-600 text-sm">
                جستجو در سوابق نامه‌ها
              </p>
            </Card>
          </Link>

          {/* پیش‌نویس‌ها */}
          <Link href="/dashboard/drafts">
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-lg font-semibold mb-2">پیش‌نویس‌ها</h2>
              <p className="text-gray-600 text-sm">
                نامه‌های ذخیره‌نشده‌ی شما
              </p>
            </Card>
          </Link>
        </div>

        {/* Admin Panel Link */}
        {user.permissions?.includes('manage_users') && (
          <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">پنل مدیریت</h3>
                <p className="text-blue-700">
                  شما دسترسی مدیریت دارید. می‌توانید کاربران و سیستم را مدیریت کنید.
                </p>
              </div>
              <Link href="/admin">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  ورود به پنل مدیریت
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <p className="text-gray-600 mb-2">نامه‌های صادره امروز</p>
            <p className="text-4xl font-bold text-indigo-600">0</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 mb-2">نامه‌های منتظر تایید</p>
            <p className="text-4xl font-bold text-yellow-600">0</p>
          </Card>
          <Card className="p-6">
            <p className="text-gray-600 mb-2">کل نامه‌ها</p>
            <p className="text-4xl font-bold text-green-600">0</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
