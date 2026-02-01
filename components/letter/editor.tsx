'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { EditorToolbar } from './toolbar';
import { useEffect, useState } from 'react';

interface LetterEditorProps {
  content?: string;
  onContentChange?: (content: string, html: string) => void;
  defaultFontSize?: number;
  defaultFontName?: string;
  readOnly?: boolean;
}

export function LetterEditor({
  content = '',
  onContentChange,
  defaultFontSize = 12,
  defaultFontName = 'Arial',
  readOnly = false,
}: LetterEditorProps) {
  const [fontName, setFontName] = useState(defaultFontName);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [lineHeight, setLineHeight] = useState(1.5);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: content || '<p>شروع نوشتن نامه...</p>',
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none p-4 min-h-96 text-right`,
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor }) => {
      if (onContentChange) {
        onContentChange(editor.getText(), editor.getHTML());
      }
    },
    editable: !readOnly,
  });

  // تطبیق فونت
  useEffect(() => {
    if (editor) {
      editor.view.dom.style.fontFamily = fontName;
      editor.view.dom.style.fontSize = `${fontSize}px`;
      editor.view.dom.style.lineHeight = lineHeight;
    }
  }, [editor, fontName, fontSize, lineHeight]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {!readOnly && (
        <EditorToolbar
          editor={editor}
          fontName={fontName}
          onFontNameChange={setFontName}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          lineHeight={lineHeight}
          onLineHeightChange={setLineHeight}
        />
      )}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
