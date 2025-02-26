import { useState, useEffect } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface Image {
  id: string;
  url: string;
  name: string;
  title: string;
  keywords: string[];
}

interface ImageGridProps {
  images: Image[];
  onDelete: (id: string) => void;
}

export function ImageGrid({ images, onDelete }: ImageGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredImages, setFilteredImages] = useState(images);

  useEffect(() => {
    const filtered = images.filter(image => 
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.keywords.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredImages(filtered);
  }, [searchTerm, images]);

  return (
    <div className="space-y-6">
      <div className="sticky top-4 z-10 glass-card p-4 rounded-full shadow-lg animate-fade-in">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search images..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-transparent focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredImages.map((image) => (
          <div 
            key={image.id}
            className="animate-fade-in relative group"
          >
            <div className="glass-card rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
              <div className="relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => onDelete(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg">{image.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{image.name}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {image.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
