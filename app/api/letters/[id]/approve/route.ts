import { NextRequest, NextResponse } from 'next/server';
import { updateLetter, createApproval, getLetterById } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const approveSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  comment: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const letterId = parseInt(id);
    
    const body = await request.json();
    const validation = approveSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const { status, comment } = validation.data;

    // بررسی اینکه کاربر مسئول این نامه است
    const letter = await getLetterById(letterId);
    if (!letter || letter.manager_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // ایجاد approval record
    await createApproval({
      letter_id: letterId,
      approver_id: session.user.id,
      status,
      comment: comment || null,
      approved_at: new Date().toISOString(),
    });

    // بروزرسانی وضعیت نامه
    const newStatus = status === 'approved' ? 'sent' : 'rejected';
    await updateLetter(letterId, {
      status: newStatus,
      sent_at: status === 'approved' ? new Date().toISOString() : null,
    });

    return NextResponse.json(
      { message: `Letter ${status} successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update approval status', details: String(error) },
      { status: 500 }
    );
  }
}
