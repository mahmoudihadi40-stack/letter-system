import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch from time.ir via server-side
    const response = await fetch('https://www.time.ir/datep', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error('time.ir API call failed')
    }

    const text = await response.text()
    console.log('[v0] time.ir response:', text)

    // Response format: year/month/day hour:minute:second
    const match = text.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)/)

    if (!match) {
      throw new Error('Could not parse time.ir response')
    }

    const [, year, month, day, hour, minute] = match
    const persianDate = `${year}/${month}/${day}`
    const time = `${hour}:${minute}`

    return NextResponse.json({ persianDate, time, success: true })
  } catch (error) {
    console.error('[v0] Failed to fetch from time.ir:', error)
    
    // Fallback to worldtimeapi
    try {
      const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Tehran')
      if (!response.ok) throw new Error('worldtimeapi failed')
      
      const data = await response.json()
      const datetime = new Date(data.datetime)
      
      const time = datetime.toTimeString().split(' ')[0].substring(0, 5)
      
      // Simple Gregorian to Jalali conversion
      const jDate = gregorianToJalali(datetime)
      const persianDate = `${jDate.year}/${String(jDate.month).padStart(2, '0')}/${String(jDate.day).padStart(2, '0')}`
      
      return NextResponse.json({ persianDate, time, success: true })
    } catch (fallbackError) {
      console.error('[v0] Fallback also failed:', fallbackError)
      return NextResponse.json({ 
        persianDate: '', 
        time: '', 
        success: false,
        error: 'Failed to fetch time from all sources'
      }, { status: 500 })
    }
  }
}

function gregorianToJalali(date: Date) {
  const gy = date.getFullYear()
  const gm = date.getMonth() + 1
  const gd = date.getDate()

  let jy: number
  let jm: number
  let jd: number

  if (gm > 2) {
    jy = gy + 979
  } else {
    jy = gy + 978
  }

  const b = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let gdn = 365 * gy + Math.floor((gy + 3) / 4) - Math.floor((gy + 99) / 100) + Math.floor((gy + 399) / 400) + gd + b[gm - 1]
  let jdn = 365 * jy + Math.floor((jy - 979) / 33) * 8 + Math.floor(((jy - 979) % 33 + 3) / 4) + 78 + 1
  let diff = gdn - jdn
  jy = jy + Math.floor(diff / 365)
  diff = diff % 365

  if (diff < 186) {
    jm = 1 + Math.floor(diff / 31)
    jd = 1 + (diff % 31)
  } else {
    jm = 7 + Math.floor((diff - 186) / 30)
    jd = 1 + ((diff - 186) % 30)
  }

  return { year: jy, month: jm, day: jd }
}
