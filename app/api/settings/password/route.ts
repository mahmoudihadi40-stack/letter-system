import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { updateUser, getUserById } from '@/lib/db';
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
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'رمز عبور فعلی و جدید را وارد کنید' },
        { status: 400 }
      );
    }

    if (newPassword.length < 3) {
      return NextResponse.json(
        { error: 'رمز عبور جدید باید حداقل 3 کاراکتر باشد' },
        { status: 400 }
      );
    }

    // دریافت کاربر
    const user = await getUserById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی رمز عبور فعلی
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'رمز عبور فعلی اشتباه است' },
        { status: 401 }
      );
    }

    // Hash رمز عبور جدید
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // بروزرسانی رمز عبور
    const updatedUser = await updateUser(session.user.id, {
      password_hash: hashedPassword,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'خطا در بروزرسانی رمز عبور' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'رمز عبور با موفقیت تغییر یافت' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور', details: String(error) },
      { status: 500 }
    );
  }
}
