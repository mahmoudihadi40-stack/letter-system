import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'database.json');

interface Database {
  users: any[];
  departments: any[];
  letters: any[];
  letter_recipients: any[];
  letter_approvals: any[];
}

const defaultDb: Database = {
  users: [],
  departments: [],
  letters: [],
  letter_recipients: [],
  letter_approvals: [],
};

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function readDb(): Database {
  ensureDir();
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database:', error);
  }
  return defaultDb;
}

function writeDb(data: Database) {
  ensureDir();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function initDb() {
  ensureDir();
  if (!fs.existsSync(dbPath)) {
    writeDb(defaultDb);
  }
  return readDb();
}

export async function getAllUsers() {
  const db = readDb();
  return db.users;
}

export async function getUserById(id: number) {
  const db = readDb();
  return db.users.find((u) => u.id === id);
}

export async function getUserByUsername(username: string) {
  const db = readDb();
  return db.users.find((u) => u.username.toUpperCase() === username.toUpperCase());
}

export async function createUser(user: any) {
  const db = readDb();
  const id =
    db.users.length > 0 ? Math.max(...db.users.map((u) => u.id)) + 1 : 1;
  const newUser = {
    ...user,
    id,
    created_at: new Date().toISOString(),
  };
  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export async function getAllDepartments() {
  const db = readDb();
  return db.departments;
}

export async function getDepartmentById(id: number) {
  const db = readDb();
  return db.departments.find((d) => d.id === id);
}

export async function createDepartment(dept: any) {
  const db = readDb();
  const id =
    db.departments.length > 0
      ? Math.max(...db.departments.map((d) => d.id)) + 1
      : 1;
  const newDept = {
    ...dept,
    id,
    created_at: new Date().toISOString(),
  };
  db.departments.push(newDept);
  writeDb(db);
  return newDept;
}

export async function getAllLetters() {
  const db = readDb();
  return db.letters;
}

export async function getLetterById(id: number) {
  const db = readDb();
  return db.letters.find((l) => l.id === id);
}

export async function createLetter(letter: any) {
  const db = readDb();
  const id = db.letters.length > 0 ? Math.max(...db.letters.map((l) => l.id)) + 1 : 1;
  const newLetter = {
    ...letter,
    id,
    created_at: new Date().toISOString(),
  };
  db.letters.push(newLetter);
  writeDb(db);
  return newLetter;
}

export async function updateLetter(id: number, updates: any) {
  const db = readDb();
  const letterIndex = db.letters.findIndex((l) => l.id === id);
  if (letterIndex !== -1) {
    db.letters[letterIndex] = { ...db.letters[letterIndex], ...updates };
    writeDb(db);
    return db.letters[letterIndex];
  }
  return null;
}

export async function getLettersByAuthor(authorId: number) {
  const db = readDb();
  return db.letters.filter((l) => l.author_id === authorId);
}

export async function getLettersByRecipient(recipientId: number) {
  const db = readDb();
  return db.letters.filter((l) => l.recipient_id === recipientId);
}

export async function getPendingLetters(managerId: number) {
  const db = readDb();
  return db.letters.filter(
    (l) => l.manager_id === managerId && l.status === 'pending_approval'
  );
}

export async function createApproval(approval: any) {
  const db = readDb();
  const id =
    db.letter_approvals.length > 0
      ? Math.max(...db.letter_approvals.map((a) => a.id)) + 1
      : 1;
  const newApproval = {
    ...approval,
    id,
    created_at: new Date().toISOString(),
  };
  db.letter_approvals.push(newApproval);
  writeDb(db);
  return newApproval;
}

export async function updateUser(id: number, updates: any) {
  const db = readDb();
  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex !== -1) {
    db.users[userIndex] = { ...db.users[userIndex], ...updates };
    writeDb(db);
    return db.users[userIndex];
  }
  return null;
}

export async function deleteUser(id: number) {
  const db = readDb();
  const userIndex = db.users.findIndex((u) => u.id === id);
  if (userIndex !== -1) {
    const deletedUser = db.users[userIndex];
    db.users.splice(userIndex, 1);
    writeDb(db);
    return deletedUser;
  }
  return null;
}

export async function getAllRoles() {
  const db = readDb();
  return db.roles || [];
}

export async function getRoleByName(name: string) {
  const db = readDb();
  return (db.roles || []).find((r) => r.name === name);
}

export async function updateDepartment(id: number, updates: any) {
  const db = readDb();
  const deptIndex = db.departments.findIndex((d) => d.id === id);
  if (deptIndex !== -1) {
    db.departments[deptIndex] = { ...db.departments[deptIndex], ...updates };
    writeDb(db);
    return db.departments[deptIndex];
  }
  return null;
}

export async function deleteDepartment(id: number) {
  const db = readDb();
  const deptIndex = db.departments.findIndex((d) => d.id === id);
  if (deptIndex !== -1) {
    const deletedDept = db.departments[deptIndex];
    db.departments.splice(deptIndex, 1);
    writeDb(db);
    return deletedDept;
  }
  return null;
}
