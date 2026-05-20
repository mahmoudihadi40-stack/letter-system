import { NextRequest, NextResponse } from 'next/server'

// Default admin user
const DEFAULT_USERS = [
  {
    id: '1',
    username: 'ADMIN',
    password: '123',
    full_name: 'مدیر سیستم',
    email: 'admin@nourhayyat.com',
    role: 'مدیر IT',
    permissions: ['manage_users', 'manage_system', 'view_all'],
    firstLogin: false
  }
]

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      )
    }

    // Get users from localStorage via sessionStorage (will be stored in browser)
    // For now, use default users + any added from admin panel
    let allUsers: any[] = DEFAULT_USERS

    // Find user
    const user = allUsers.find(u => u.username === username && u.password === password)

    if (!user) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نادرست است' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        firstLogin: user.firstLogin || false,
        department: user.department || 'it'
      },
      token: 'demo-token'
    })

    response.cookies.set('auth_token', 'demo-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    })

    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'خطای ورود' },
      { status: 500 }
    )
  }
}
