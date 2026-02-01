import { NextRequest, NextResponse } from 'next/server';
import { updateUser, getUserByUsername } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newUsername } = body;

    if (!newUsername || newUsername.trim().length < 3) {
      return NextResponse.json(
        { error: 'نام کاربری باید حداقل 3 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // بررسی که آیا نام کاربری قبلاً موجود است
    const existingUser = await getUserByUsername(newUsername);
    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'این نام کاربری قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // بروزرسانی نام کاربری
    const updatedUser = await updateUser(session.user.id, {
      username: newUsername.trim(),
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'خطا در بروزرسانی نام کاربری' },
        { status: 500 }
      );
    }

    // بروزرسانی session
    const updatedSession = {
      user: {
        ...session.user,
        username: updatedUser.username,
      },
      expires: session.expires,
    };

    const response = NextResponse.json(
      { message: 'نام کاربری با موفقیت تغییر یافت', user: updatedSession.user },
      { status: 200 }
    );

    response.cookies.set('session', JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Username update error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر نام کاربری', details: String(error) },
      { status: 500 }
    );
  }
}
