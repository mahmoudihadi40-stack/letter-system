// کاربران
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  department_id: number;
  is_manager: boolean;
  is_admin: boolean;
  created_at: string;
}

// بخش‌ها
export interface Department {
  id: number;
  name: string;
  parent_id: number | null;
  manager_id: number | null;
  created_at: string;
}

// نامه‌ها
export interface Letter {
  id: number;
  from_user_id: number;
  to_department_id: number;
  to_user_id: number | null;
  subject: string;
  content: string;
  content_html: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'sent' | 'rejected';
  created_at: string;
  updated_at: string;
  sent_at: string | null;
}

// کارتابل
export interface InboxItem {
  id: number;
  letter_id: number;
  user_id: number;
  status: 'pending' | 'read' | 'forwarded';
  read_at: string | null;
  created_at: string;
}

// تایید
export interface Approval {
  id: number;
  letter_id: number;
  approver_id: number;
  status: 'pending' | 'approved' | 'rejected';
  comment: string | null;
  approved_at: string | null;
  created_at: string;
}

// فرمت‌دهی
export interface LetterFormatting {
  id: number;
  letter_id: number;
  font_name: string;
  font_size: number;
  line_height: number;
  paragraph_spacing: number;
  text_align: 'right' | 'left' | 'center' | 'justify';
  created_at: string;
}

// نوع session
export interface Session {
  user: User;
  expires: string;
}
