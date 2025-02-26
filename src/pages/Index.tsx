
import { useState, useEffect } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageGrid } from '@/components/ImageGrid';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Image {
  id: string;
  url: string;
  name: string;
  title: string;
  keywords: string[];
}

export default function Index() {
  const [images, setImages] = useState<Image[]>([]);
  const { toast } = useToast();

  // Fetch images on component mount
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error fetching images",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (file: File, metadata: { name: string; title: string; keywords: string[] }) => {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      // Save image metadata to database
      const { data: imageData, error: dbError } = await supabase
        .from('images')
        .insert({
          url: publicUrl,
          name: metadata.name,
          title: metadata.title,
          keywords: metadata.keywords,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (imageData) {
        setImages(prev => [imageData, ...prev]);
        toast({
          title: "Image uploaded successfully",
          description: "Your image has been added to the gallery.",
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error uploading image",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Image Gallery</h1>
          <p className="text-lg text-gray-600">Upload and organize your images with ease</p>
        </header>

        <div className="grid gap-8 md:grid-cols-[350px,1fr] items-start">
          <div className="md:sticky md:top-8">
            <ImageUpload onUpload={handleUpload} />
          </div>
          
          <main>
            <ImageGrid images={images} />
          </main>
        </div>
      </div>
    </div>
  );
}
