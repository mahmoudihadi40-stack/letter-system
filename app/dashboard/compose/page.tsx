'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateLetterNumber, DEPARTMENTS, getPersianDateString } from '@/lib/persian-utils'

interface User {
  id: string
  full_name: string
  department?: string
  role?: string
}

interface Draft {
  id: string
  letterNumber: string
  letterDate: string
  subject: string
  content: string
  toDepart: string
  recipients: string[]
  fontSize: number
  fontFamily: string
  textAlign: string
  bold: boolean
  italic: boolean
  underline: boolean
  status: string
  createdBy: string
  attachmentCount?: number
}

export default function ComposePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draftId')
  
  const [user, setUser] = useState<User | null>(null)
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null)
  const [letterNumber, setLetterNumber] = useState('')
  const [letterDate, setLetterDate] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [fontFamily, setFontFamily] = useState('Tahoma')
  const [textAlign, setTextAlign] = useState('right')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [underline, setUnderline] = useState(false)
  const [toDepart, setToDepart] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [attachments, setAttachments] = useState<File[]>([])
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // If editing a draft, load it
      if (draftId) {
        const allDrafts: Draft[] = JSON.parse(localStorage.getItem('drafts') || '[]')
        const draft = allDrafts.find(d => d.id === draftId)
        
        if (draft && draft.createdBy === parsedUser.id) {
          setEditingDraftId(draftId)
          setLetterNumber(draft.letterNumber)
          setLetterDate(draft.letterDate)
          setSubject(draft.subject)
          setContent(draft.content)
          setFontSize(draft.fontSize)
          setFontFamily(draft.fontFamily)
          setTextAlign(draft.textAlign)
          setBold(draft.bold)
          setItalic(draft.italic)
          setUnderline(draft.underline)
          setToDepart(draft.toDepart)
          setRecipients(draft.recipients)
        }
      } else {
        setLetterNumber(generateLetterNumber())
        setLetterDate(getPersianDateString())
      }
    } else {
      router.push('/')
    }
  }, [router, draftId])

  const handleSaveDraft = async () => {
    if (!user || !subject || !content) {
      alert('لطفاً موضوع و متن نامه را پر کنید')
      return
    }
    
    const drafts: Draft[] = JSON.parse(localStorage.getItem('drafts') || '[]')
    
    if (editingDraftId) {
      // Update existing draft
      const index = drafts.findIndex(d => d.id === editingDraftId)
      if (index !== -1) {
        drafts[index] = {
          ...drafts[index],
          subject,
          content,
          toDepart,
          recipients,
          fontSize,
          fontFamily,
          bold,
          italic,
          underline,
          textAlign,
          attachmentCount: attachments.length
        }
      }
      alert('پیش‌نویس با موفقیت بروز رسانی شد')
    } else {
      // Create new draft
      drafts.push({
        id: `draft_${Date.now()}`,
        letterNumber,
        letterDate,
        subject,
        content,
        toDepart,
        recipients,
        fontSize,
        fontFamily,
        bold,
        italic,
        underline,
        textAlign,
        status: 'draft',
        createdBy: user.id,
        attachmentCount: attachments.length
      })
      alert('پیش‌نویس با موفقیت ذخیره شد')
    }
    
    localStorage.setItem('drafts', JSON.stringify(drafts))
    router.push('/dashboard/drafts')
  }

  const handleSubmitForApproval = async () => {
    if (!user || !subject || !content || !toDepart) {
      alert('لطفاً تمام فیلدهای الزامی را پر کنید')
      return
    }
    
    // Save letter with pending status
    const letters = JSON.parse(localStorage.getItem('letters') || '[]')
    letters.push({
      id: `letter_${Date.now()}`,
      letterNumber,
      letterDate,
      subject,
      content,
      fromDepart: user.department || 'it',
      toDepart,
      recipients,
      fontSize,
      fontFamily,
      bold,
      italic,
      underline,
      textAlign,
      status: 'pending_approval',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      signature: null,
      attachmentCount: attachments.length
    })
    localStorage.setItem('letters', JSON.stringify(letters))
    
    alert('نامه برای تایید ارسال شد')
    router.push('/dashboard/outbox')
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
            <p className="text-sm text-gray-500">{editingDraftId ? 'ویرایش پیش‌نویس' : 'نوشتن نامه جدید'}</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            بازگشت
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Formatting Toolbar */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">ابزارهای قالب‌بندی</h3>
          <div className="flex flex-wrap gap-6">
            {/* Font Family */}
            <div>
              <label className="block text-sm font-semibold mb-2">فونت</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                disabled={isLocked}
                className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-200"
              >
                <option value="Tahoma">Tahoma</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-semibold mb-2">اندازه</label>
              <input
                type="number"
                min="10"
                max="32"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                disabled={isLocked}
                className="px-3 py-2 border rounded-md text-sm w-24 disabled:bg-gray-200"
              />
            </div>

            {/* Text Formatting */}
            <div className="flex gap-2 items-end">
              <Button
                onClick={() => setBold(!bold)}
                variant={bold ? 'default' : 'outline'}
                size="sm"
                disabled={isLocked}
                className="font-bold"
              >
                B
              </Button>
              <Button
                onClick={() => setItalic(!italic)}
                variant={italic ? 'default' : 'outline'}
                size="sm"
                disabled={isLocked}
                className="italic"
              >
                I
              </Button>
              <Button
                onClick={() => setUnderline(!underline)}
                variant={underline ? 'default' : 'outline'}
                size="sm"
                disabled={isLocked}
                className="underline"
              >
                U
              </Button>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-sm font-semibold mb-2">تراز</label>
              <div className="flex gap-1">
                <Button
                  onClick={() => setTextAlign('right')}
                  variant={textAlign === 'right' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLocked}
                >
                  ⋮ →
                </Button>
                <Button
                  onClick={() => setTextAlign('center')}
                  variant={textAlign === 'center' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLocked}
                >
                  ⋮ ·
                </Button>
                <Button
                  onClick={() => setTextAlign('left')}
                  variant={textAlign === 'left' ? 'default' : 'outline'}
                  size="sm"
                  disabled={isLocked}
                >
                  ⋮ ←
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recipient Selection */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">تعیین گیرندگان</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                به (گیرنده اصلی) <span className="text-red-500">*</span>
              </label>
              <select
                value={toDepart}
                onChange={(e) => setToDepart(e.target.value)}
                disabled={isLocked}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
              >
                <option value="">انتخاب واحد...</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">رونوشت (گیرندگان اضافی)</label>
              <select
                multiple
                value={recipients}
                onChange={(e) => setRecipients(Array.from(e.target.selectedOptions, option => option.value))}
                disabled={isLocked}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 h-24"
              >
                {DEPARTMENTS.filter(d => d.id !== toDepart).map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Ctrl + Click برای انتخاب چندگانه</p>
            </div>
          </div>
        </Card>

        {/* Attachments Section */}
        <Card className="p-6 mb-6">
          <h3 className="font-semibold mb-4">فایل‌های پیوست</h3>
          <div>
            <label className="block text-sm font-semibold mb-2">اضافه کردن فایل</label>
            <input
              type="file"
              multiple
              onChange={(e) => setAttachments(Array.from(e.target.files || []))}
              disabled={isLocked}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
            />
            <p className="text-xs text-gray-500 mt-2">می‌توانید چندین فایل را انتخاب کنید</p>
            
            {attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">فایل‌های انتخاب‌شده:</p>
                <div className="space-y-2">
                  {attachments.map((file, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📎</span>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        disabled={isLocked}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold disabled:text-gray-400"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Letter Template */}
        <Card className="p-12 bg-white mb-6" style={{ direction: 'rtl' }}>
          {/* Header Section */}
          <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
            <p className="text-lg font-semibold mb-4">بسم الله الرحمن الرحیم</p>
            <div className="flex justify-between text-sm text-gray-600">
              <div className="text-right">
                <p>تاریخ: {letterDate}</p>
                <p>شماره: {letterNumber}</p>
              </div>
              <div></div>
            </div>
          </div>

          {/* Letter Body */}
          <div className="mb-8" style={{ fontFamily, fontSize: `${fontSize}px` }}>
            <p className="mb-4">
              <span className="font-semibold">از:</span> {DEPARTMENTS.find(d => d.id === (user?.department || 'it'))?.fullName || 'واحد نامشخص'}
            </p>
            <p className="mb-4">
              <span className="font-semibold">به:</span> {DEPARTMENTS.find(d => d.id === toDepart)?.fullName || '[انتخاب نشده]'}
            </p>
            {recipients.length > 0 && (
              <p className="mb-4">
                <span className="font-semibold">رونوشت:</span> {recipients.map(r => DEPARTMENTS.find(d => d.id === r)?.name).join('، ')}
              </p>
            )}

            {/* Subject */}
            <div className="mb-6 pb-4 border-b border-gray-300">
              <p>
                <span className="font-semibold">موضوع:</span>{' '}
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={isLocked}
                  placeholder="موضوع نامه را وارد کنید"
                  className="inline-block border-b pb-1 focus:outline-none w-96 disabled:bg-transparent"
                  style={{
                    fontWeight: bold ? 'bold' : 'normal',
                    fontStyle: italic ? 'italic' : 'normal',
                    textDecoration: underline ? 'underline' : 'none'
                  }}
                />
              </p>
            </div>

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLocked}
              placeholder="متن نامه را وارد کنید..."
              className="w-full min-h-48 p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight: bold ? 'bold' : 'normal',
                fontStyle: italic ? 'italic' : 'normal',
                textDecoration: underline ? 'underline' : 'none',
                textAlign: textAlign as any
              }}
            />


          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button
            onClick={handleSaveDraft}
            variant="outline"
            disabled={isLocked}
          >
            ذخیره به‌عنوان پیش‌نویس
          </Button>
          <Button
            onClick={handleSubmitForApproval}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            disabled={isLocked}
          >
            ارسال برای تایید
          </Button>
        </div>
      </main>
    </div>
  )
}
