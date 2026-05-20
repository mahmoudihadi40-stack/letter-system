'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DEPARTMENTS, formatPersianDate } from '@/lib/persian-utils'

interface User {
  id: string
  full_name: string
}

interface Draft {
  id: string
  letterNumber: string
  letterDate: string
  subject: string
  content: string
  toDepart: string
  recipients: string[]
  instructions: string
  fontSize: number
  fontFamily: string
  textAlign: string
  bold: boolean
  italic: boolean
  underline: boolean
  status: string
  createdBy: string
}

export default function DraftsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      const allDrafts = JSON.parse(localStorage.getItem('drafts') || '[]')
      setDrafts(allDrafts.filter((d: Draft) => d.createdBy === JSON.parse(userData).id))
    } else {
      router.push('/')
    }
  }, [router])

  const handlePreview = (draft: Draft) => {
    setSelectedDraft(draft)
    setShowPreview(true)
  }

  const handleEdit = (draftId: string) => {
    router.push(`/dashboard/compose?draftId=${draftId}`)
  }

  const handleDelete = (draftId: string) => {
    if (confirm('آیا مطمئن هستید؟ این عمل قابل بازگشت نیست')) {
      const allDrafts = JSON.parse(localStorage.getItem('drafts') || '[]')
      const filtered = allDrafts.filter((d: Draft) => d.id !== draftId)
      localStorage.setItem('drafts', JSON.stringify(filtered))
      setDrafts(filtered)
      alert('پیش‌نویس حذف شد')
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
              src="/logo.png"
              alt="Nour Hayat Hotel"
              width={100}
              height={40}
              priority
            />
            <p className="text-sm text-gray-500">پیش‌نویس‌ها</p>
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
        {drafts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 mb-4">هیچ پیش‌نویسی وجود ندارد</p>
            <Button
              onClick={() => router.push('/dashboard/compose')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              نوشتن نامه جدید
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">شماره: {draft.letterNumber}</p>
                    <h3 className="text-lg font-semibold mb-2">{draft.subject || 'بدون موضوع'}</h3>
                    <p className="text-sm text-gray-600 mb-2">به: {DEPARTMENTS.find(d => d.id === draft.toDepart)?.name || 'نامشخص'}</p>
                    <p className="text-sm text-gray-600">تاریخ: {draft.letterDate}</p>
                  </div>
                  <div className="flex gap-2 flex-col">
                    <Button
                      onClick={() => handlePreview(draft)}
                      variant="outline"
                      size="sm"
                      className="text-blue-600"
                    >
                      پیش‌نمایش
                    </Button>
                    <Button
                      onClick={() => handleEdit(draft.id)}
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                    >
                      ویرایش
                    </Button>
                    <Button
                      onClick={() => handleDelete(draft.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {showPreview && selectedDraft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Close Button */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                  size="sm"
                >
                  بستن
                </Button>
              </div>

              {/* Letter Preview */}
              <div
                className="border-2 border-gray-300 p-8 rounded-lg bg-white"
                style={{
                  fontFamily: selectedDraft.fontFamily,
                  fontSize: `${selectedDraft.fontSize}px`,
                  textAlign: selectedDraft.textAlign as any,
                  direction: 'rtl'
                }}
              >
                {/* Header */}
                <div className="text-center mb-4 text-sm">
                  <p className="font-semibold mb-2">بسم الله الرحمن الرحیم</p>
                  <div className="flex justify-between text-xs mb-4">
                    <span>شماره: {selectedDraft.letterNumber}</span>
                    <span>تاریخ: {selectedDraft.letterDate}</span>
                  </div>
                </div>

                <div className="mb-6 pb-4 border-b-2 border-gray-300">
                  <p className="mb-2">
                    <span className="font-semibold">از:</span> {DEPARTMENTS.find(d => d.id === (user?.id === selectedDraft.createdBy ? 'it' : 'admin'))?.fullName || 'واحد نامشخص'}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">به:</span> {DEPARTMENTS.find(d => d.id === selectedDraft.toDepart)?.fullName || 'نامشخص'}
                  </p>
                  {selectedDraft.recipients.length > 0 && (
                    <p className="text-sm">
                      <span className="font-semibold">رونوشت:</span> {selectedDraft.recipients.map(r => DEPARTMENTS.find(d => d.id === r)?.name).join('، ')}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="mb-6">
                  <p className="font-semibold mb-2">موضوع:</p>
                  <p
                    style={{
                      fontWeight: selectedDraft.bold ? 'bold' : 'normal',
                      fontStyle: selectedDraft.italic ? 'italic' : 'normal',
                      textDecoration: selectedDraft.underline ? 'underline' : 'none'
                    }}
                  >
                    {selectedDraft.subject}
                  </p>
                </div>

                {/* Content */}
                <div className="mb-6 whitespace-pre-wrap">
                  <p
                    style={{
                      fontWeight: selectedDraft.bold ? 'bold' : 'normal',
                      fontStyle: selectedDraft.italic ? 'italic' : 'normal',
                      textDecoration: selectedDraft.underline ? 'underline' : 'none'
                    }}
                  >
                    {selectedDraft.content}
                  </p>
                </div>

                {/* Signature */}
                <div className="mt-8 text-center">
                  <div className="mb-8"></div>
                  <p className="font-semibold">امضاء</p>
                </div>

                {/* Notes/Instructions */}
                {selectedDraft.instructions && (
                  <div className="mt-8 pt-4 border-t-2 border-gray-300 text-sm">
                    <p className="font-semibold mb-2">پیش‌نویس:</p>
                    <p>{selectedDraft.instructions}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end mt-6">
                <Button
                  onClick={() => {
                    setShowPreview(false)
                    handleEdit(selectedDraft.id)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ویرایش نامه
                </Button>
                <Button
                  onClick={() => setShowPreview(false)}
                  variant="outline"
                >
                  بستن
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
