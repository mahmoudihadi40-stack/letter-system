import { NextRequest, NextResponse } from 'next/server';
import {
  createLetter,
  updateLetter,
  getLettersByAuthor,
} from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const letterSchema = z.object({
  subject: z.string().min(1),
  content: z.string(),
  contentHtml: z.string(),
  toUser: z.number().optional(),
  toDepartment: z.number(),
  status: z.enum(['draft', 'pending_approval', 'approved', 'sent', 'rejected']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = letterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      subject,
      content,
      contentHtml,
      toUser,
      toDepartment,
      status = 'draft',
    } = validation.data;

    const letter = await createLetter({
      from_user_id: session.user.id,
      to_user_id: toUser || null,
      to_department_id: toDepartment,
      subject,
      content,
      content_html: contentHtml,
      status,
      manager_id: toUser || null,
    });

    return NextResponse.json(
      { id: letter.id, message: 'Letter created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Letter creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create letter', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let letters = await getLettersByAuthor(session.user.id);

    if (status) {
      letters = letters.filter((l) => l.status === status);
    }

    letters = letters.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ letters }, { status: 200 });
  } catch (error) {
    console.error('Letter fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch letters', details: String(error) },
      { status: 500 }
    );
  }
}
