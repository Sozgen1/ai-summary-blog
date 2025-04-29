import { useRef, useEffect, useState } from "react";
import ReactQuill from "react-quill";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Write your blog content here..." 
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent',
    'script',
    'blockquote', 'code-block',
    'color', 'background',
    'align',
    'link', 'image'
  ];

  if (!mounted) {
    // Return a placeholder while React Quill is loading to prevent hydration issues
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-2">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-20 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-600 h-8 w-36 rounded"></div>
        </div>
        <div className="p-4 min-h-[300px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
          <div className="animate-pulse bg-gray-100 dark:bg-gray-700 h-5 w-full mb-2 rounded"></div>
          <div className="animate-pulse bg-gray-100 dark:bg-gray-700 h-5 w-5/6 mb-2 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
