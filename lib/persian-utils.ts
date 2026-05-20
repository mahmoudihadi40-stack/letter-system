// Persian (Jalali) Calendar Utilities

export function gregorianToPersian(date: Date = new Date()): {
  year: number
  month: number
  day: number
  formatted: string
} {
  const gy = date.getFullYear()
  const gm = date.getMonth() + 1
  const gd = date.getDate()

  // Array of days in each Gregorian month
  const g_d_n = (() => {
    let sum = 0
    for (let i = 1; i < gm; i++) {
      if (i === 2) {
        sum += gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0) ? 29 : 28
      } else if ([4, 6, 9, 11].includes(i)) {
        sum += 30
      } else {
        sum += 31
      }
    }
    return 365 * gy + Math.floor((gy - 1) / 4) - Math.floor((gy - 1) / 100) + Math.floor((gy - 1) / 400) + sum + gd
  })()

  // Jalali calendar calculation
  let jy: number
  let jm: number
  let jd: number

  // Days from Gregorian epoch (March 22, 622 CE = Farvardin 1, 1 JH)
  const epochDays = 79
  const j_d_n = g_d_n - epochDays

  // Calculate Jalali year
  jy = Math.floor(j_d_n / 365.2425) + 1

  // Recalculate based on year
  let yearDays = 0
  for (let y = 1; y < jy; y++) {
    yearDays += 365 + (y % 33 === 1 || y % 33 === 5 || y % 33 === 9 || y % 33 === 13 || y % 33 === 17 || y % 33 === 22 || y % 33 === 26 || y % 33 === 30 ? 1 : 0)
  }

  const dayInYear = j_d_n - yearDays
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]

  jm = 1
  jd = dayInYear
  for (let i = 0; i < 12; i++) {
    if (jd <= monthDays[i]) {
      jm = i + 1
      break
    }
    jd -= monthDays[i]
  }

  const formattedMonth = String(jm).padStart(2, '0')
  const formattedDay = String(jd).padStart(2, '0')

  return {
    year: jy,
    month: jm,
    day: jd,
    formatted: `${jy}/${formattedMonth}/${formattedDay}`
  }
}

export function formatPersianDate(date: Date = new Date()): string {
  const persian = gregorianToPersian(date)
  return persian.formatted
}

export function getPersianDateString(date: Date = new Date()): string {
  const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند'
  ]

  const persian = gregorianToPersian(date)
  const dayName = days[date.getDay()]
  const monthName = months[persian.month - 1]

  return `${dayName} ${persian.day} ${monthName} ${persian.year}`
}

// Letter numbering system
export function generateLetterNumber(): string {
  const today = new Date()
  const persian = gregorianToPersian(today)
  const dateStr = `${persian.year}${String(persian.month).padStart(2, '0')}${String(persian.day).padStart(2, '0')}`

  // Get counter from localStorage (in production, this would be from database)
  const counters: Record<string, number> = JSON.parse(localStorage.getItem('letterCounters') || '{}')

  const currentCounter = (counters[dateStr] || 0) + 1
  counters[dateStr] = currentCounter

  localStorage.setItem('letterCounters', JSON.stringify(counters))

  return `${dateStr}${String(currentCounter).padStart(2, '0')}`
}

// Department names with hotel prefix
export const DEPARTMENTS = [
  { id: 'it', name: 'واحد فناوری اطلاعات', fullName: 'واحد فناوری اطلاعات هتل نور حیات' },
  { id: 'hr', name: 'واحد منابع انسانی', fullName: 'واحد منابع انسانی هتل نور حیات' },
  { id: 'finance', name: 'واحد مالی و حسابداری', fullName: 'واحد مالی و حسابداری هتل نور حیات' },
  { id: 'facilities', name: 'واحد تاسیسات', fullName: 'واحد تاسیسات هتل نور حیات' },
  { id: 'rooms', name: 'واحد اتاق‌ها', fullName: 'واحد اتاق‌ها هتل نور حیات' },
  { id: 'restaurant', name: 'واحد رستوران', fullName: 'واحد رستوران هتل نور حیات' },
  { id: 'security', name: 'واحد امنیت', fullName: 'واحد امنیت هتل نور حیات' },
  { id: 'admin', name: 'واحد اداری', fullName: 'واحد اداری هتل نور حیات' }
]
