'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface User {
  id: string
  username: string
  full_name: string
  firstLogin: boolean
}

export default function FirstLoginPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser.firstLogin) {
        router.push('/dashboard')
      } else {
        setUser(parsedUser)
      }
    } else {
      router.push('/')
    }
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!newPassword || !confirmPassword) {
      setError('لطفاً تمام فیلدها را پر کنید')
      return
    }

    if (newPassword.length < 4) {
      setError('رمز عبور باید حداقل 4 کاراکتر باشد')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('رمزهای عبور مطابقت ندارند')
      return
    }

    setLoading(true)

    // Update user password in localStorage (admin users list)
    const users = JSON.parse(localStorage.getItem('admin_users') || '[]')
    const updatedUsers = users.map((u: any) =>
      u.id === user?.id ? { ...u, password: newPassword, firstLogin: false } : u
    )
    localStorage.setItem('admin_users', JSON.stringify(updatedUsers))

    // Update session user
    const updatedUser = { ...user, password: newPassword, firstLogin: false }
    sessionStorage.setItem('user', JSON.stringify(updatedUser))

    alert('رمز عبور با موفقیت تغییر یافت')
    router.push('/dashboard')
    setLoading(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="Nour Hayat Hotel"
                width={180}
                height={70}
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">تغییر رمز عبور</h1>
            <p className="text-gray-600">خوش آمدید، {user?.full_name}</p>
            <p className="text-sm text-gray-500 mt-2">لطفاً برای بار اول رمز عبور خود را تغییر دهید</p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">کاربر:</span> {user.full_name} ({user.username})
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور جدید
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="رمز عبور جدید را وارد کنید"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تایید رمز عبور
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="رمز عبور را دوباره وارد کنید"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 font-semibold disabled:bg-gray-400"
            >
              {loading ? 'در حال پردازش...' : 'تغییر رمز عبور و ادامه'}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
