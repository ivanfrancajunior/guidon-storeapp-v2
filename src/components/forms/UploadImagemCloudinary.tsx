import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';

interface UploadImagemCloudinaryProps {
  sku?: string;
  onUpload: (urls: string[]) => void;
}

export function UploadImagemCloudinary({ sku, onUpload }: UploadImagemCloudinaryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setErro('');
    setEnviando(true);

    try {
      const urls = await Promise.all(files.map(async (file) => {
        const fileReader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(String(fileReader.result));
          fileReader.onerror = () => reject(new Error('Não foi possível ler a imagem'));
          fileReader.readAsDataURL(file);
        });

        const response = await fetch('/api/imagens/cloudinary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, fileName: file.name, sku }),
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Falha ao enviar ${file.name}`);
        }

        return data.url as string;
      }));

      onUpload(urls);
    } catch (uploadError) {
      setErro(uploadError instanceof Error ? uploadError.message : 'Falha ao enviar imagem');
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleFiles(Array.from(event.target.files || []))}
      />
      <button
        type="button"
        disabled={enviando}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:border-yellow-400 disabled:opacity-50"
      >
        {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
        {enviando ? 'Enviando...' : 'Enviar imagens JPG/PNG'}
      </button>
      {erro && <span className="text-xs text-red-600">{erro}</span>}
    </div>
  );
}
