import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db';
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

    const users = await getAllUsers();
    const managers = users.filter((u) => u.is_manager);

    return NextResponse.json({ managers }, { status: 200 });
  } catch (error) {
    console.error('Managers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch managers', details: String(error) },
      { status: 500 }
    );
  }
}
