import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { getAllUsers, createUser } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  role: z.string(),
  department_id: z.number(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const users = await getAllUsers();
    // حذف رمز از response
    const safeUsers = users.map(({ password_hash, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (!session.user.is_admin && session.user.role !== 'IT')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password, full_name, role, department_id } = validation.data;

    // بررسی وجود کاربر
    const users = await getAllUsers();
    if (users.find(u => u.username === username)) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // رمزگذاری رمز
    const passwordHash = await bcryptjs.hash(password, 10);

    // ایجاد کاربر
    const newUser = await createUser({
      username,
      email,
      password_hash: passwordHash,
      full_name,
      role,
      department_id,
      is_manager: role === 'مدیر بخش' || role === 'مدیر کل',
      is_admin: role === 'مدیر کل',
    });

    const { password_hash, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: String(error) },
      { status: 500 }
    );
  }
}
