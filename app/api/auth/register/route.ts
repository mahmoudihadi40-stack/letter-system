import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { getUserByUsername, createUser, getAllUsers } from '@/lib/db';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string(),
  department_id: z.number(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { username, email, password, full_name, department_id } = validation.data;

    // بررسی وجود کاربر
    const existingUser = await getUserByUsername(username);

    if (existingUser) {
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
      department_id,
      is_manager: false,
      is_admin: false,
    });

    // حذف رمز از response
    const { password_hash, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: String(error) },
      { status: 500 }
    );
  }
}
