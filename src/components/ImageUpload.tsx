import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onImageSelect: (base64: string | null) => void;
  id: string;
}

export default function ImageUpload({ label, onImageSelect, id }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelect(base64String.split(',')[1]); // Send only the base64 data
      };
      reader.readAsDataURL(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2" id={id}>
      <label className="text-xs font-mono uppercase tracking-wider text-zinc-500">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative aspect-square rounded-lg border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 overflow-hidden
          ${isDragging ? 'border-zinc-100 bg-zinc-800' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'}
          ${preview ? 'border-none' : ''}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <button
              onClick={(e) => { e.stopPropagation(); clearImage(); }}
              className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="p-3 rounded-full bg-zinc-800 text-zinc-400">
              <Upload size={20} />
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">Click or drag to upload</span>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
