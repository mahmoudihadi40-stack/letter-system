'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Trash2, Edit2 } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  parent_id: number | null;
  manager_id: number | null;
}

interface User {
  id: number;
  full_name: string;
  is_manager: boolean;
}

export default function DepartmentsManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    manager_id: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [depsRes, usersRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/users'),
      ]);

      if (depsRes.ok) setDepartments(await depsRes.json());
      if (usersRes.ok) {
        const allUsers = await usersRes.json();
        setUsers(allUsers.filter((u: any) => u.is_manager));
      }
    } catch (error) {
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('نام بخش الزامی است');
      return;
    }

    try {
      const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
          manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        }),
      });

      if (!response.ok) throw new Error('خطا در ذخیره');

      toast.success(editingId ? 'بخش بروزرسانی شد' : 'بخش اضافه شد');
      await loadData();
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error('خطا در ذخیره بخش');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error();
      toast.success('بخش حذف شد');
      await loadData();
    } catch (error) {
      toast.error('خطا در حذف بخش');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingId(dept.id);
    setFormData({
      name: dept.name,
      parent_id: dept.parent_id?.toString() || '',
      manager_id: dept.manager_id?.toString() || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      parent_id: '',
      manager_id: '',
    });
    setEditingId(null);
  };

  const getParentName = (parentId: number | null) => {
    if (!parentId) return '-';
    return departments.find((d) => d.id === parentId)?.name || '-';
  };

  const getManagerName = (managerId: number | null) => {
    if (!managerId) return '-';
    return users.find((u) => u.id === managerId)?.full_name || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">مدیریت بخش‌ها</h1>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
        >
          {showForm ? 'بستن' : 'اضافه کردن بخش'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="نام بخش"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Select
                value={formData.parent_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, parent_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="بخش مادر (اختیاری)" />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter((d) => d.id !== editingId)
                    .map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Select
                value={formData.manager_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, manager_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="مسئول بخش (اختیاری)" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              {editingId ? 'بروزرسانی' : 'اضافه کردن'}
            </Button>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام بخش</TableHead>
              <TableHead>بخش مادر</TableHead>
              <TableHead>مسئول</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-semibold">{dept.name}</TableCell>
                <TableCell>{getParentName(dept.parent_id)}</TableCell>
                <TableCell>{getManagerName(dept.manager_id)}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(dept)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(dept.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
