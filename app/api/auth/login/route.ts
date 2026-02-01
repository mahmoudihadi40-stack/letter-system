import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { getUserByUsername } from '@/lib/db';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// مدت اعتبار session (1 هفته)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    console.log('[v0] Login attempt for username:', username);

    // جستجوی کاربر
    const user = await getUserByUsername(username);

    console.log('[v0] User found:', !!user);

    if (!user) {
      console.log('[v0] User not found:', username);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // بررسی رمز
    console.log('[v0] Comparing passwords...');
    const isPasswordValid = await bcryptjs.compare(password, user.password_hash);
    console.log('[v0] Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('[v0] Password mismatch for user:', username);
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // حذف رمز از response
    const { password_hash, ...userWithoutPassword } = user;

    // ایجاد cookie session
    const sessionData = {
      user: userWithoutPassword,
      expires: new Date(Date.now() + SESSION_DURATION).toISOString(),
    };

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userWithoutPassword,
      },
      { status: 200 }
    );

    // ذخیره session در cookie
    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}
