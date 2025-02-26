
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (file: File, metadata: ImageMetadata) => void;
}

interface ImageMetadata {
  name: string;
  title: string;
  keywords: string[];
}

export function ImageUpload({ onUpload }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload an image file.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const metadata: ImageMetadata = {
      name: formData.get('name') as string,
      title: formData.get('title') as string,
      keywords: (formData.get('keywords') as string).split(',').map(k => k.trim()),
    };
    const file = (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement).files?.[0];
    
    if (file && metadata.name && metadata.title) {
      onUpload(file, metadata);
      e.currentTarget.reset();
      setPreview(null);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`upload-zone ${dragActive ? 'dragging' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
          ) : (
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <span>Select Image</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                  </label>
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              required
              name="name"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
              placeholder="Image name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              required
              name="title"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
              placeholder="Image title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Keywords</label>
            <input
              required
              name="keywords"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2"
              placeholder="Comma separated keywords"
            />
          </div>
        </div>

        <Button type="submit" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </form>
    </div>
  );
}
