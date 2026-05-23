'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DEPARTMENTS } from '@/lib/persian-utils'
import { getLogoPath, setLogoPath } from '@/lib/config'
import { getTimeSettings, saveTimeSettings, fetchIranTimeFromTimeIR, getSystemTime, getPersianDateAndTime } from '@/lib/time-utils'

interface User {
  id: string
  full_name: string
  permissions: string[]
}

const ROLES = [
  { id: 'it', name: 'مدیر IT', permissions: ['manage_users', 'manage_system', 'view_all'] },
  { id: 'ceo', name: 'مدیر عامل', permissions: ['view_all', 'approve_all', 'manage_departments'] },
  { id: 'director', name: 'مدیر کل', permissions: ['view_department', 'approve_letters', 'manage_staff'] },
  { id: 'manager', name: 'مسئول بخش', permissions: ['view_department', 'create_letter', 'approve_staff_letters'] },
  { id: 'employee', name: 'کارمند', permissions: ['create_letter', 'submit_for_approval'] }
]

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState('users')
  const [showUserModal, setShowUserModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<typeof ROLES[0] | null>(null)

  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'employee',
    department: DEPARTMENTS[0].id,
    permissions: []
  })

  const [newRole, setNewRole] = useState({ name: '', permissions: [] })
  const [newDepartment, setNewDepartment] = useState({ name: '', fullName: '' })
  const [signature, setSignature] = useState<File | null>(null)
  const [showLogoModal, setShowLogoModal] = useState(false)
  const [currentLogo, setCurrentLogo] = useState('/hotel-logo.png')
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [users, setUsers] = useState([
    {
      id: '1',
      username: 'ADMIN',
      fullName: 'مدیر سیستم',
      role: 'مدیر IT',
      department: '-',
      password: '***',
      status: 'فعال'
    }
  ])

  const [customDepartments, setCustomDepartments] = useState(DEPARTMENTS)
  
  // Logo settings
  const [logoSettings, setLogoSettings] = useState({
    headerLogoWidth: 100,
    headerLogoHeight: 40,
    loginLogoWidth: 180,
    loginLogoHeight: 70,
    letterLogoWidth: 150,
    letterLogoHeight: 60,
    letterLogoAlignment: 'center' as 'left' | 'center' | 'right'
  })

  // Time settings
  const [timeSettings, setTimeSettings] = useState(() => {
    const saved = getTimeSettings()
    return {
      ...saved,
      timeMode: saved.timeMode || 'automatic',
      manualJalaliYear: saved.manualJalaliYear || 1403,
      manualJalaliMonth: saved.manualJalaliMonth || 1,
      manualJalaliDay: saved.manualJalaliDay || 1,
      manualTime: saved.manualTime || '12:00'
    }
  })
  const [currentSystemTime, setCurrentSystemTime] = useState(getPersianDateAndTime())
  const [syncingTime, setSyncingTime] = useState(false)
  
  // Admin access permissions
  const [adminUsers, setAdminUsers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('adminUsers')
      return saved ? JSON.parse(saved) : ['1'] // Default: ADMIN user
    }
    return ['1']
  })

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Check if user has admin access
      const adminAccessList = localStorage.getItem('adminUsers')
      const allowedAdmins = adminAccessList ? JSON.parse(adminAccessList) : ['1']
      
      if (!allowedAdmins.includes(parsedUser.id) && parsedUser.id !== '1') {
        router.push('/dashboard')
      }
    } else {
      router.push('/')
    }
  }, [router])

  // Update system time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSystemTime(getPersianDateAndTime())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timeSettings])

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8)
  }

  const handleAddUser = () => {
    if (!newUser.username || !newUser.fullName || !newUser.password) {
      alert('نام کاربری، نام کامل و رمز عبور الزامی است')
      return
    }

    if (newUser.password.length < 4) {
      alert('رمز عبور باید حداقل 4 کاراکتر باشد')
      return
    }

    const addedUser = {
      id: String(users.length + 1),
      username: newUser.username,
      fullName: newUser.fullName,
      role: ROLES.find(r => r.id === newUser.role)?.name || 'کارمند',
      department: customDepartments.find(d => d.id === newUser.department)?.name || '-',
      password: newUser.password,
      status: 'فعال',
      firstLogin: true // نشان‌دهنده‌ی اینکه کاربر باید رمز خود را تغییر دهد
    }

    setUsers([...users, addedUser])
    console.log('[v0] User added with initial password:', newUser.username)

    alert(`کاربر اضافه شد\nنام کاربری: ${newUser.username}\nرمز عبور اولیه: ${newUser.password}\n\nکاربر باید در ورود اول رمز خود را تغییر دهد`)

    setNewUser({
      username: '',
      fullName: '',
      password: '',
      role: 'employee',
      department: DEPARTMENTS[0].id,
      permissions: []
    })
    setShowUserModal(false)
  }

  const handleAddRole = () => {
    if (!newRole.name) {
      alert('نام نقش الزامی است')
      return
    }
    alert('نقش جدید اضافه شد: ' + newRole.name)
    setShowRoleModal(false)
  }

  const handleAddDepartment = () => {
    if (!newDepartment.name) {
      alert('نام واحد الزامی است')
      return
    }
    const dept = {
      id: `dept_${Date.now()}`,
      name: newDepartment.name,
      fullName: newDepartment.fullName || `${newDepartment.name} هتل نور حیات`
    }
    setCustomDepartments([...customDepartments, dept])
    alert('واحد جدید اضافه شد: ' + newDepartment.name)
    setNewDepartment({ name: '', fullName: '' })
    setShowDepartmentModal(false)
  }

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSignature(file)
      alert(`امضاء آپلود شد: ${file.name}`)
    }
  }

  const handleDeleteRole = (roleId: string) => {
    if (confirm('آیا مطمئن هستید؟')) {
      alert('نقش حذف شد')
    }
  }

  const handleDeleteDepartment = (deptId: string) => {
    if (confirm('آیا مطمئن هستید؟')) {
      setCustomDepartments(customDepartments.filter(d => d.id !== deptId))
      alert('واحد حذف شد')
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (confirm('آیا مطمئن هستید؟')) {
      setUsers(users.filter(u => u.id !== userId))
      alert('کاربر حذف شد')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b-2 border-amber-500">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/hotel-logo.png"
              alt="Nour Hayat Hotel"
              width={100}
              height={40}
              priority
            />
            <p className="text-sm text-gray-500">پنل مدیریت</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            بازگشت
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'users'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            مدیریت کاربران
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'roles'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            مدیریت نقش‌ها
          </button>
          <button
            onClick={() => setActiveTab('logo')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'logo'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            تنظیم لوگو
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'departments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            مدیریت واحدها
          </button>
          <button
            onClick={() => setActiveTab('signatures')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'signatures'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            آپلود امضاء
          </button>
          <button
            onClick={() => setActiveTab('time')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'time'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            تنظیم تاریخ و ساعت
          </button>
          <button
            onClick={() => setActiveTab('admin-access')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'admin-access'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            دسترسی مدیریت
          </button>
        </div>

        {/* Time Settings Tab */}
        {activeTab === 'time' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">تنظیم تاریخ و ساعت سیستم</h2>
            
            {/* Current Time Display */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">تاریخ و ساعت فعلی سیستم:</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">تاریخ میلادی</p>
                  <p className="text-lg font-bold">{currentSystemTime.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">تاریخ شمسی</p>
                  <p className="text-lg font-bold">{currentSystemTime.persianDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">ساعت</p>
                  <p className="text-lg font-bold">{currentSystemTime.time}</p>
                </div>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-3">حالت تاریخ و ساعت</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="timeMode"
                    value="automatic"
                    checked={timeSettings.timeMode === 'automatic'}
                    onChange={(e) => {
                      const newSettings = { ...timeSettings, timeMode: 'automatic' as const }
                      setTimeSettings(newSettings)
                      saveTimeSettings(newSettings)
                    }}
                  />
                  <span>خودکار (از اینترنت)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="timeMode"
                    value="manual"
                    checked={timeSettings.timeMode === 'manual'}
                    onChange={(e) => {
                      const newSettings = { ...timeSettings, timeMode: 'manual' as const }
                      setTimeSettings(newSettings)
                      saveTimeSettings(newSettings)
                    }}
                  />
                  <span>دستی</span>
                </label>
              </div>
            </div>

            {/* Manual Time Settings */}
            {timeSettings.timeMode === 'manual' && (
              <div className="border-t pt-6 mb-6">
                <h3 className="font-semibold mb-4">تنظیم دستی تاریخ شمسی</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">سال شمسی</label>
                    <input
                      type="number"
                      value={timeSettings.manualJalaliYear || 1403}
                      onChange={(e) => {
                        const newSettings = { ...timeSettings, manualJalaliYear: parseInt(e.target.value) || 1403 }
                        setTimeSettings(newSettings)
                        saveTimeSettings(newSettings)
                      }}
                      min="1300"
                      max="1500"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">ماه (1-12)</label>
                    <input
                      type="number"
                      value={timeSettings.manualJalaliMonth || 1}
                      onChange={(e) => {
                        const newSettings = { ...timeSettings, manualJalaliMonth: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)) }
                        setTimeSettings(newSettings)
                        saveTimeSettings(newSettings)
                      }}
                      min="1"
                      max="12"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">روز (1-31)</label>
                    <input
                      type="number"
                      value={timeSettings.manualJalaliDay || 1}
                      onChange={(e) => {
                        const newSettings = { ...timeSettings, manualJalaliDay: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)) }
                        setTimeSettings(newSettings)
                        saveTimeSettings(newSettings)
                      }}
                      min="1"
                      max="31"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">ساعت (HH:mm)</label>
                  <input
                    type="time"
                    value={timeSettings.manualTime}
                    onChange={(e) => {
                      const newSettings = { ...timeSettings, manualTime: e.target.value }
                      setTimeSettings(newSettings)
                      saveTimeSettings(newSettings)
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Automatic Time Settings */}
            {timeSettings.timeMode === 'automatic' && (
              <div className="border-t pt-6">
                <Button
                  onClick={async () => {
                    setSyncingTime(true)
                    const result = await fetchIranTimeFromTimeIR()
                    if (result) {
                      setCurrentSystemTime(result)
                      alert('تاریخ و ساعت با موفقیت بروز رسانی شد')
                    } else {
                      alert('خطا در دریافت تاریخ و ساعت از اینترنت')
                    }
                    setSyncingTime(false)
                  }}
                  disabled={syncingTime}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {syncingTime ? 'در حال بروز رسانی...' : 'همزمان سازی الآن'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">تاریخ و ساعت سیستم به صورت خودکار از سرور جهانی دریافت می‌شود</p>
              </div>
            )}
          </Card>
        )}

        {/* Admin Access Tab */}
        {activeTab === 'admin-access' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">مدیریت دسترسی پنل مدیریت</h2>
            
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.username} - {user.role}</p>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={adminUsers.includes(user.id)}
                      onChange={(e) => {
                        let newAdminUsers: string[]
                        if (e.target.checked) {
                          newAdminUsers = [...adminUsers, user.id]
                        } else {
                          newAdminUsers = adminUsers.filter(id => id !== user.id)
                        }
                        setAdminUsers(newAdminUsers)
                        localStorage.setItem('adminUsers', JSON.stringify(newAdminUsers))
                      }}
                      disabled={user.id === '1'} // Can't remove admin access from main admin
                      className="w-4 h-4"
                    />
                    <span>دسترسی مدیریت</span>
                  </label>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 mt-4">کاربرانی که این گزینه فعال باشد، می‌توانند به پنل مدیریت دسترسی پیدا کنند.</p>
          </Card>
        )}

        {/* Logo Tab */}
        {activeTab === 'logo' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">تنظیم لوگوی هتل</h2>
            <div className="space-y-6">
              {/* Current Logo Preview */}
              <div>
                <label className="block text-sm font-semibold mb-2">لوگوی فعلی:</label>
                <div className="flex justify-center p-4 border rounded-lg bg-gray-50">
                  <Image
                    src={currentLogo}
                    alt="Current Logo"
                    width={200}
                    height={80}
                    onError={() => setCurrentLogo('/hotel-logo.png')}
                  />
                </div>
              </div>
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2">آپلود لوگوی جدید:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setLogoFile(file)
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setCurrentLogo(event.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">فرمت‌های پشتیبانی‌شده: PNG, JPG, SVG</p>
              </div>

              {/* Logo Sizes Settings */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">تنظیم اندازه‌های لوگو</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Header Logo */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">عرض لوگو در سرتیترها (px)</label>
                    <input
                      type="number"
                      value={logoSettings.headerLogoWidth}
                      onChange={(e) => setLogoSettings({
                        ...logoSettings,
                        headerLogoWidth: parseInt(e.target.value) || 100
                      })}
                      min="50"
                      max="300"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">ارتفاع لوگو در سرتیترها (px)</label>
                    <input
                      type="number"
                      value={logoSettings.headerLogoHeight}
                      onChange={(e) => setLogoSettings({
                        ...logoSettings,
                        headerLogoHeight: parseInt(e.target.value) || 40
                      })}
                      min="30"
                      max="150"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Login Logo */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">عرض لوگو در صفحه لاگین (px)</label>
                    <input
                      type="number"
                      value={logoSettings.loginLogoWidth}
                      onChange={(e) => setLogoSettings({
                        ...logoSettings,
                        loginLogoWidth: parseInt(e.target.value) || 180
                      })}
                      min="80"
                      max="400"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">ارتفاع لوگو در صفحه لاگین (px)</label>
                    <input
                      type="number"
                      value={logoSettings.loginLogoHeight}
                      onChange={(e) => setLogoSettings({
                        ...logoSettings,
                        loginLogoHeight: parseInt(e.target.value) || 70
                      })}
                      min="50"
                      max="250"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  {/* Letter Logo */}
                  <div>
                    <label className="block text-sm font-semibold mb-2">عرض لوگو در نامه‌ها (px)</label>
                    <input
                      type="number"
                      value={logoSettings.letterLogoWidth}
                      onChange={(e) => setLogoSettings({
                        ...logoSettings,
                        letterLogoWidth: parseInt(e.target.value) || 150
                      })}
                      min="80"
                      max="300"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">ارتفاع لوگو در نامه‌ها (px)</label>
                    <input
                      type="number"
                      value={logoSettings.letterLogoHeight}
                      onChange={(e) => setLogoSettings({
                        ...logoSettings,
                        letterLogoHeight: parseInt(e.target.value) || 60
                      })}
                      min="40"
                      max="150"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Letter Logo Alignment */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2">محل لوگو در سربرگ نامه</label>
                  <select
                    value={logoSettings.letterLogoAlignment}
                    onChange={(e) => setLogoSettings({
                      ...logoSettings,
                      letterLogoAlignment: e.target.value as 'left' | 'center' | 'right'
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="center">وسط</option>
                    <option value="right">راست</option>
                    <option value="left">چپ</option>
                  </select>
                </div>
              </div>

              {/* Save Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (logoFile) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        localStorage.setItem('customLogo', event.target?.result as string)
                        localStorage.setItem('logoSettings', JSON.stringify(logoSettings))
                        alert('لوگو و تنظیمات با موفقیت ذخیره شدند')
                        setLogoFile(null)
                      }
                      reader.readAsDataURL(logoFile)
                    } else {
                      localStorage.setItem('logoSettings', JSON.stringify(logoSettings))
                      alert('تنظیمات لوگو با موفقیت ذخیره شدند')
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  ذخیره تنظیمات
                </Button>
                <Button
                  onClick={() => {
                    setLogoSettings({
                      headerLogoWidth: 100,
                      headerLogoHeight: 40,
                      loginLogoWidth: 180,
                      loginLogoHeight: 70,
                      letterLogoWidth: 150,
                      letterLogoHeight: 60,
                      letterLogoAlignment: 'center'
                    })
                    localStorage.removeItem('logoSettings')
                    alert('تنظیمات به حالت پیش‌فرض بازگردانده شدند')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  بازنشانی
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowUserModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                اضافه کردن کاربر جدید
              </Button>
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">نام کاربری</th>
                      <th className="px-4 py-3 text-right font-semibold">نام کامل</th>
                      <th className="px-4 py-3 text-right font-semibold">نقش</th>
                      <th className="px-4 py-3 text-right font-semibold">واحد</th>
                      <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                      <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{u.username}</td>
                        <td className="px-4 py-3">{u.fullName}</td>
                        <td className="px-4 py-3">{u.role}</td>
                        <td className="px-4 py-3">{u.department}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            onClick={() => handleDeleteUser(u.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            حذف
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowRoleModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                اضافه کردن نقش جدید
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLES.map(role => (
                <Card key={role.id} className="p-4">
                  <h3 className="font-semibold mb-2">{role.name}</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-semibold mb-1">دسترسی‌ها:</p>
                    {role.permissions.map(perm => (
                      <p key={perm} className="text-xs ml-4">• {perm}</p>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleDeleteRole(role.id)}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-800"
                  >
                    حذف
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div>
            <div className="mb-6">
              <Button
                onClick={() => setShowDepartmentModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                اضافه کردن واحد جدید
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customDepartments.map(dept => (
                <Card key={dept.id} className="p-4">
                  <h3 className="font-semibold mb-2">{dept.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{dept.fullName}</p>
                  <Button
                    onClick={() => handleDeleteDepartment(dept.id)}
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-800"
                  >
                    حذف
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Signatures Tab */}
        {activeTab === 'signatures' && (
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">آپلود امضاء مدیران</h3>
              
              <div className="space-y-4">
                {customDepartments.map(dept => (
                  <div key={dept.id} className="border rounded-lg p-4">
                    <label className="block font-semibold mb-2">{dept.name}</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="block w-full text-sm text-gray-500"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 w-96">
              <h2 className="text-xl font-bold mb-4">اضافه کردن کاربر جدید</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="نام کاربری"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="نام کامل"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="password"
                  placeholder="رمز عبور اولیه (حداقل 4 کاراکتر)"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {ROLES.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  {customDepartments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setShowUserModal(false)}
                    variant="outline"
                  >
                    انصراف
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    اضافه کردن
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Role Modal */}
        {showRoleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 w-96">
              <h2 className="text-xl font-bold mb-4">اضافه کردن نقش جدید</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="نام نقش"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setShowRoleModal(false)}
                    variant="outline"
                  >
                    انصراف
                  </Button>
                  <Button
                    onClick={handleAddRole}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    اضافه کردن
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Department Modal */}
        {showDepartmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 w-96">
              <h2 className="text-xl font-bold mb-4">اضافه کردن واحد جدید</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="نام واحد"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  placeholder="نام کامل (اختیاری)"
                  value={newDepartment.fullName}
                  onChange={(e) => setNewDepartment({ ...newDepartment, fullName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setShowDepartmentModal(false)}
                    variant="outline"
                  >
                    انصراف
                  </Button>
                  <Button
                    onClick={handleAddDepartment}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    اضافه کردن
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
