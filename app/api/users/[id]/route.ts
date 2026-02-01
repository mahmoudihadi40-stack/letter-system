import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { updateUser, deleteUser, getUserById } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  department_id: z.number().optional(),
  password: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    const updates: any = validation.data;

    // رمزگذاری رمز جدید اگر ارائه شد
    if (updates.password) {
      updates.password_hash = await bcryptjs.hash(updates.password, 10);
      delete updates.password;
    }

    // بروزرسانی نقش و تنظیمات مدیر
    if (updates.role) {
      updates.is_manager = updates.role === 'مدیر بخش' || updates.role === 'مدیر کل';
      updates.is_admin = updates.role === 'مدیر کل';
    }

    const updatedUser = await updateUser(userId, updates);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    const deletedUser = await deleteUser(userId);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: String(error) },
      { status: 500 }
    );
  }
}
