import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const dbPath = path.join(dataDir, 'database.json');
    
    const dbExists = fs.existsSync(dbPath);
    
    let dbContent = null;
    if (dbExists) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      dbContent = JSON.parse(data);
    }
    
    return NextResponse.json({
      dataDir,
      dbPath,
      dbExists,
      dbContent,
      cwd: process.cwd(),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}