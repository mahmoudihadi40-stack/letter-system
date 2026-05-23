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

// Get time from worldtime API (more reliable)
export async function fetchIranTimeFromAPI(): Promise<{ date: string; time: string } | null> {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Tehran')
    if (!response.ok) throw new Error('API call failed')
    
    const data = await response.json()
    const datetime = new Date(data.datetime)
    
    const date = datetime.toISOString().split('T')[0]
    const time = datetime.toTimeString().split(' ')[0].substring(0, 5)
    
    return { date, time }
  } catch (error) {
    console.error('[v0] Failed to fetch Iran time from API:', error)
    return null
  }
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
