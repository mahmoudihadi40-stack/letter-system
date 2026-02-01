'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, Home, Mail, CheckSquare, Settings } from 'lucide-react';

interface DashboardNavProps {
  user: User;
}

export function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'داشبورد', icon: Home },
    { href: '/dashboard/letter-writing', label: 'نامه‌نگاری', icon: Mail },
    { href: '/dashboard/inbox', label: 'کارتابل', icon: CheckSquare },
  ];

  if (user.is_admin) {
    navItems.push({ href: '/dashboard/admin', label: 'مدیریت', icon: Settings });
  }

  return (
    <nav className="w-64 bg-slate-900 text-white p-4 hidden md:flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">نامه‌نگاری</h1>
        <p className="text-xs text-slate-400">سیستم اداری</p>
      </div>

      <ul className="space-y-2 flex-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 rounded hover:bg-slate-700 transition"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-700 pt-4">
        <div className="text-sm mb-4">
          <p className="font-medium">{user.full_name}</p>
          <p className="text-xs text-slate-400">{user.email}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-transparent"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              خروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
