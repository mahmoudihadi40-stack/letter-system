'use client';

import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Highlighter,
  Palette,
  List,
  ListOrdered,
  Heading1,
  Heading2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface EditorToolbarProps {
  editor: Editor;
  fontName: string;
  onFontNameChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
}

export function EditorToolbar({
  editor,
  fontName,
  onFontNameChange,
  fontSize,
  onFontSizeChange,
  lineHeight,
  onLineHeightChange,
}: EditorToolbarProps) {
  const fonts = ['Arial', 'Times New Roman', 'Georgia', 'Courier New', 'Tahoma', 'Verdana'];
  const sizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];
  const lineHeights = [1, 1.15, 1.5, 1.75, 2];

  return (
    <div className="bg-slate-100 border-b p-2 flex flex-wrap gap-2 items-center">
      {/* فونت */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium">فونت:</label>
        <Select value={fontName} onValueChange={onFontNameChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fonts.map((font) => (
              <SelectItem key={font} value={font}>
                <span style={{ fontFamily: font }}>{font}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* سایز */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium">سایز:</label>
        <Select value={fontSize.toString()} onValueChange={(v) => onFontSizeChange(parseInt(v))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* فاصله سطر */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium">فاصله:</label>
        <Select value={lineHeight.toString()} onValueChange={(v) => onLineHeightChange(parseFloat(v))}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {lineHeights.map((lh) => (
              <SelectItem key={lh} value={lh.toString()}>
                {lh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-r border-slate-300 h-6" />

      {/* تنسیق متن */}
      <Button
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="بولد"
      >
        <Bold className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="ایتالیک"
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive('underline') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="زیرخط"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="border-r border-slate-300 h-6" />

      {/* رنگ متن */}
      <div className="flex items-center gap-1">
        <Palette className="h-4 w-4 text-gray-600" />
        <Input
          type="color"
          value={editor.getAttributes('textStyle').color || '#000000'}
          onChange={(e) =>
            editor.chain().focus().setColor(e.target.value).run()
          }
          className="w-10 h-8 cursor-pointer"
          title="رنگ متن"
        />
      </div>

      {/* هایلایت */}
      <div className="flex items-center gap-1">
        <Highlighter className="h-4 w-4 text-gray-600" />
        <Input
          type="color"
          value={editor.getAttributes('highlight').color || '#FFFF00'}
          onChange={(e) =>
            editor.chain().focus().toggleHighlight({ color: e.target.value }).run()
          }
          className="w-10 h-8 cursor-pointer"
          title="هایلایت"
        />
      </div>

      <div className="border-r border-slate-300 h-6" />

      {/* تراز */}
      <Button
        size="sm"
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="تراز راست"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="تراز وسط"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="تراز چپ"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>

      <div className="border-r border-slate-300 h-6" />

      {/* عنوان‌ها */}
      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="عنوان 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="عنوان 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <div className="border-r border-slate-300 h-6" />

      {/* لیست‌ها */}
      <Button
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="لیست نقطه‌ای"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        variant={editor.isActive('orderedList') ? 'default' : 'outline'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="لیست شماره‌دار"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
}
