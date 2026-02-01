import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import bcryptjs from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'database.json');

interface Database {
  users: any[];
  departments: any[];
  letters: any[];
  letter_recipients: any[];
  letter_approvals: any[];
}

export async function POST(request: NextRequest) {
  try {
    // اطمینان از وجود دایرکتوری
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // بررسی وجود دیتابیس
    if (fs.existsSync(dbPath)) {
      return NextResponse.json(
        { message: 'Database already initialized', initialized: true },
        { status: 200 }
      );
    }

    // ایجاد دیتابیس اولیه
    const db: Database = {
      users: [],
      departments: [],
      letters: [],
      letter_recipients: [],
      letter_approvals: [],
    };

    // ایجاد بخش‌های نمونه
    const dept1: any = {
      id: 1,
      name: 'مدیریت عمومی',
      parent_id: null,
      manager_id: null,
      created_at: new Date().toISOString(),
    };

    const dept2: any = {
      id: 2,
      name: 'منابع انسانی',
      parent_id: 1,
      manager_id: null,
      created_at: new Date().toISOString(),
    };

    const dept3: any = {
      id: 3,
      name: 'مالی',
      parent_id: 1,
      manager_id: null,
      created_at: new Date().toISOString(),
    };

    db.departments.push(dept1, dept2, dept3);

    // ایجاد کاربرهای نمونه
    const adminPassword = bcryptjs.hashSync('admin123', 10);
    const userPassword = bcryptjs.hashSync('user123', 10);

    const admin: any = {
      id: 1,
      username: 'admin',
      email: 'admin@company.com',
      password_hash: adminPassword,
      full_name: 'مدیر سیستم',
      department_id: 1,
      is_manager: true,
      is_admin: true,
      created_at: new Date().toISOString(),
    };

    const manager: any = {
      id: 2,
      username: 'manager',
      email: 'manager@company.com',
      password_hash: userPassword,
      full_name: 'مدیر HR',
      department_id: 2,
      is_manager: true,
      is_admin: false,
      created_at: new Date().toISOString(),
    };

    const user: any = {
      id: 3,
      username: 'user',
      email: 'user@company.com',
      password_hash: userPassword,
      full_name: 'کارمند',
      department_id: 3,
      is_manager: false,
      is_admin: false,
      created_at: new Date().toISOString(),
    };

    db.users.push(admin, manager, user);

    // تحديث manager_id برای بخش‌ها
    db.departments[1].manager_id = 2; // manager is manager of HR
    db.departments[2].manager_id = 3; // user is manager of Finance

    // ذخیره دیتابیس
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return NextResponse.json(
      { message: 'Database initialized successfully', initialized: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { error: 'Initialization failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json(
        { initialized: false, message: 'Database not initialized' },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { initialized: true, message: 'Database is ready' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
