'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    setInitialized(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('[v0] Attempting login for user:', username)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      console.log('[v0] Login response status:', response.status)
      const data = await response.json()
      console.log('[v0] Login response data:', data)

      if (!response.ok) {
        setError(data.error || 'خطای ورود - لطفاً نام کاربری و رمز عبور را بررسی کنید')
        return
      }

      // Store user info in sessionStorage
      if (data.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user))
        sessionStorage.setItem('token', data.token || '')
        
        // اگر اولین ورود است، به صفحه‌ی تغییر رمز ببر
        if (data.user.firstLogin) {
          router.push('/first-login')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      console.error('[v0] Login error:', err)
      setError('خطای ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-amber-700">هتل نور حیات</h1>
              <p className="text-sm text-gray-500">Nour Hayat Hotel</p>
            </div>
            <h2 className="text-2xl font-bold text-amber-700 mb-2">سیستم نامه‌نگاری</h2>
            <p className="text-gray-600">اتوماسیون نامه‌نگاری اداری</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام کاربری
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="نام کاربری را وارد کنید"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور را وارد کنید"
                disabled={loading}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm text-blue-700">
              <p className="font-semibold mb-1">اطلاعات ورود:</p>
              <p>نام کاربری: <span className="font-mono font-bold">ADMIN</span></p>
              <p>رمز عبور: <span className="font-mono font-bold">123</span></p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium"
            >
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
