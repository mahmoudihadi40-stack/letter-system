import { NextRequest, NextResponse } from 'next/server';
import { getPendingLetters, getAllLetters, getUserById } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // دریافت نامه‌های برای تأیید
    const allLetters = await getAllLetters();
    
    // فیلتر نامه‌هایی که منتظر تأیید این کاربر هستند
    const letters = allLetters.filter(
      (l) =>
        l.manager_id === session.user.id &&
        l.status === 'pending_approval'
    );

    // افزودن اطلاعات فرستنده
    const enrichedLetters = await Promise.all(
      letters.map(async (letter) => {
        const sender = await getUserById(letter.from_user_id);
        return {
          ...letter,
          sender,
        };
      })
    );

    return NextResponse.json({ letters: enrichedLetters }, { status: 200 });
  } catch (error) {
    console.error('Inbox fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inbox', details: String(error) },
      { status: 500 }
    );
  }
}
