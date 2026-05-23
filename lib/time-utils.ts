// Iran Time and Date Utilities

export interface TimeSettings {
  timeMode: 'automatic' | 'manual'
  manualDate: string // YYYY-MM-DD
  manualTime: string // HH:mm
  lastSyncTime: number // timestamp
}

// Get current Iran time (Tehran timezone)
export function getIranTime(): Date {
  const date = new Date()
  // Iran timezone is UTC+3:30
  const iranTime = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tehran' }))
  return iranTime
}

// Get Iran time formatted
export function getFormattedIranTime(): { date: string; time: string } {
  const iranTime = getIranTime()
  const date = iranTime.toISOString().split('T')[0]
  const time = iranTime.toTimeString().split(' ')[0].substring(0, 5)
  return { date, time }
}

// Get time from time.ir (Iran's official time server) via API route
export async function fetchIranTimeFromTimeIR(): Promise<{ date: string; time: string; persianDate: string } | null> {
  try {
    const response = await fetch('/api/time', {
      method: 'GET',
      cache: 'no-store'
    })
    
    if (!response.ok) throw new Error('API call failed')
    
    const data = await response.json()
    
    if (!data.success) {
      return null
    }

    // Check if user has manually adjusted the Jalali year
    const settings = getTimeSettings()
    let persianDate = data.persianDate
    
    if (settings.manualJalaliYear) {
      const [year, month, day] = data.persianDate.split('/')
      persianDate = `${settings.manualJalaliYear}/${settings.manualJalaliMonth || month}/${settings.manualJalaliDay || day}`
    }
    
    return {
      persianDate: persianDate,
      time: data.time,
      date: '' // Not used in UI but kept for compatibility
    }
  } catch (error) {
    console.error('[v0] Failed to fetch from API:', error)
    return null
  }
}

// Get system time as fallback with Jalali year adjustment support
export function getSystemTime(): { date: string; time: string; persianDate: string } {
  const now = new Date()
  const date = now.toISOString().split('T')[0]
  const time = now.toTimeString().split(' ')[0].substring(0, 5)
  
  const jDate = gregorianToJalali(now)
  let year = jDate.year
  let month = jDate.month
  let day = jDate.day
  
  // Check if user has manually adjusted the Jalali year/month/day
  const settings = getTimeSettings()
  if (settings.manualJalaliYear) {
    year = settings.manualJalaliYear
  }
  if (settings.manualJalaliMonth) {
    month = settings.manualJalaliMonth
  }
  if (settings.manualJalaliDay) {
    day = settings.manualJalaliDay
  }
  
  const persianDate = `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
  
  return { date, time, persianDate }
}

// Jalali to Gregorian conversion
export function jalaliToGregorian(jy: number, jm: number, jd: number): { year: number; month: number; day: number } {
  const epochDays = 79
  let yearDays = 0
  
  for (let y = 1; y < jy; y++) {
    yearDays += 365 + (y % 33 === 1 || y % 33 === 5 || y % 33 === 9 || y % 33 === 13 || y % 33 === 17 || y % 33 === 22 || y % 33 === 26 || y % 33 === 30 ? 1 : 0)
  }
  
  const monthDays = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  let dayInYear = jd
  for (let i = 0; i < jm - 1; i++) {
    dayInYear += monthDays[i]
  }
  
  const j_d_n = yearDays + dayInYear + epochDays
  
  let gy = 400 * Math.floor(j_d_n / 146097)
  let gd = j_d_n % 146097
  
  const leapAdj = Math.floor(gd / 36524)
  if (leapAdj > 3) {
    gd = (gd % 36524) + 36524
  } else {
    gy += 100 * leapAdj
    gd = gd % 36524
  }
  
  gy += 400 * Math.floor(gd / 146097)
  gd = gd % 146097
  
  let leapAdj2 = Math.floor(gd / 36524)
  if (leapAdj2 > 3) {
    gd = (gd % 36524) + 36524
  } else {
    gy += 100 * leapAdj2
    gd = gd % 36524
  }
  
  gy += 4 * Math.floor(gd / 1461)
  gd = gd % 1461
  
  let leapAdj3 = Math.floor(gd / 365)
  if (leapAdj3 > 3) {
    gd = (gd % 365) + 365
  } else {
    gy += leapAdj3
    gd = gd % 365
  }
  
  const isLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0
  const monthDaysG = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  
  let gm = 1
  let gday = gd + 1
  for (let i = 0; i < 12; i++) {
    if (gday <= monthDaysG[i]) {
      gm = i + 1
      break
    }
    gday -= monthDaysG[i]
  }
  
  return { year: gy, month: gm, day: gday }
}

// Get time settings from localStorage
export function getTimeSettings(): TimeSettings {
  if (typeof window === 'undefined') {
    return {
      timeMode: 'automatic',
      manualDate: '',
      manualTime: '',
      lastSyncTime: Date.now()
    }
  }
  
  const saved = localStorage.getItem('timeSettings')
  return saved ? JSON.parse(saved) : {
    timeMode: 'automatic',
    manualDate: '',
    manualTime: '',
    lastSyncTime: Date.now()
  }
}

// Save time settings to localStorage
export function saveTimeSettings(settings: TimeSettings): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('timeSettings', JSON.stringify(settings))
  }
}

// Get current system time based on settings
export function getCurrentSystemTime(): { date: string; time: string } {
  const settings = getTimeSettings()
  
  if (settings.timeMode === 'manual') {
    return {
      date: settings.manualDate,
      time: settings.manualTime
    }
  }
  
  return getFormattedIranTime()
}

// Gregorian to Jalali conversion (Persian date)
export function gregorianToJalali(gDate: Date): { year: number; month: number; day: number } {
  const gy = gDate.getFullYear()
  const gm = gDate.getMonth() + 1
  const gd = gDate.getDate()

  let jy: number
  let jm: number
  let jd: number

  const g_d_n = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd

  const epochDays = 79
  const j_d_n = g_d_n - epochDays

  jy = Math.floor(j_d_n / 365.2425) + 1

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

  return { year: jy, month: jm, day: jd }
}

// Format Jalali date as string
export function formatJalaliDate(jDate: { year: number; month: number; day: number }): string {
  const month = String(jDate.month).padStart(2, '0')
  const day = String(jDate.day).padStart(2, '0')
  return `${jDate.year}/${month}/${day}`
}

// Get formatted Persian date and time
export function getPersianDateAndTime(): { date: string; time: string; persianDate: string } {
  const systemTime = getCurrentSystemTime()
  const [year, month, day] = systemTime.date.split('-').map(Number)
  
  const gDate = new Date(year, month - 1, day)
  const jDate = gregorianToJalali(gDate)
  const persianDate = formatJalaliDate(jDate)
  
  return {
    date: systemTime.date,
    time: systemTime.time,
    persianDate
  }
}
