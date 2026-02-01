import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/db';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  try {
    // ID کاربر IT (ADMIN) = 1
    const user = await getUserById(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // ایجاد session برای کاربر IT
    const sessionData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        department_id: user.department_id,
        role: user.role,
        is_manager: user.is_manager,
        is_admin: user.is_admin,
      },
      expires: new Date(Date.now() + SESSION_DURATION).toISOString(),
    };

    const response = NextResponse.json(
      { message: 'Auto-login successful', user: sessionData.user },
      { status: 200 }
    );

    response.cookies.set('session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
    });

    return response;
  } catch (error) {
    console.error('Auto-login error:', error);
    return NextResponse.json(
      { error: 'Auto-login failed', details: String(error) },
      { status: 500 }
    );
  }
}
