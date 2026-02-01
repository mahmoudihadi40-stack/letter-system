import { NextRequest, NextResponse } from 'next/server';
import { getAllDepartments, createDepartment } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const departments = await getAllDepartments();
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    console.error('Departments fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user.is_admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, parent_id, manager_id } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Department name is required' },
        { status: 400 }
      );
    }

    const newDept = await createDepartment({
      name,
      parent_id: parent_id || null,
      manager_id: manager_id || null,
    });

    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department', details: String(error) },
      { status: 500 }
    );
  }
}
