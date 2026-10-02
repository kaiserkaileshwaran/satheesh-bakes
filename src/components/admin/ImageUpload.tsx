import React, { useState } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { StorageService } from '../../services/storageService';

interface ImageUploadProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  folder?: string;
  isMultiple?: boolean;
  maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  isMultiple = false,
  maxFiles = 5
}) => {
  const { showToast } = useNotification();
  const [urlInput, setUrlInput] = useState('');

  const images = Array.isArray(value) ? value : (value ? [value] : []);

  const isValidImageUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const ext = parsed.pathname.split('.').pop()?.toLowerCase() || '';
      const validExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];
      if (ext && parsed.pathname.includes('.')) {
        if (!validExtensions.includes(ext)) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    
    if (!isValidImageUrl(trimmed)) {
      showToast('Invalid image URL or unsupported format.', undefined, 'error');
      return;
    }
    
    if (isMultiple && images.length >= maxFiles) {
      showToast(`You can only upload up to ${maxFiles} images.`, undefined, 'warning');
      return;
    }

    if (images.includes(trimmed)) {
      showToast('Image URL already added.', undefined, 'info');
      return;
    }

    if (isMultiple) {
      onChange([...images, trimmed]);
    } else {
      onChange(trimmed);
      const old = typeof value === 'string' ? value : '';
      if (old) {
        StorageService.addActivityLog('Admin', 'admin', 'URL Replaced', 'System', 'Replaced existing image URL.');
      }
    }
    
    if (isMultiple || (!isMultiple && !value)) {
        StorageService.addActivityLog('Admin', 'admin', 'URL Added', 'System', 'Added a new image via URL.');
    }

    showToast('Image URL added', undefined, 'success');
    setUrlInput('');
  };

  const removeImage = (index: number) => {
    if (isMultiple) {
      const newImages = [...images];
      newImages.splice(index, 1);
      onChange(newImages);
    } else {
      onChange('');
    }
    StorageService.addActivityLog('Admin', 'admin', 'URL Removed', 'System', `Removed image URL at index ${index}.`);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if (!isMultiple) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;

    const newImages = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    StorageService.addActivityLog('Admin', 'admin', 'URL Reordered', 'System', `Moved image URL ${direction} from index ${index}.`);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* URL Input Area */}
      {(!isMultiple && images.length === 0 || isMultiple && images.length < maxFiles) && (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-bakery-chocolate/60 dark:text-bakery-cream/60 mb-1">
                <LinkIcon className="w-4 h-4" />
                <span>Image URL</span>
            </div>
            <div className="flex items-center gap-2">
                <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold text-bakery-chocolate dark:text-bakery-cream"
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                    }
                }}
                />
                <button
                onClick={(e) => { e.preventDefault(); handleAddUrl(); }}
                className="px-4 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream text-xs font-bold hover:bg-bakery-brown-dark transition-colors"
                >
                Add
                </button>
            </div>
        </div>
      )}

      {/* Preview Area */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-bakery-beige dark:border-gray-700 bg-bakery-beige/30 flex items-center justify-center">
              <img 
                src={url} 
                alt={`Preview ${idx}`} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                    (e.target as HTMLImageElement).classList.add('opacity-50', 'p-4');
                }}
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                {isMultiple && (
                  <div className="flex flex-col gap-1 absolute left-2">
                    {idx > 0 && (
                      <button onClick={(e) => { e.preventDefault(); moveImage(idx, 'up'); }} className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors">
                        ↑
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button onClick={(e) => { e.preventDefault(); moveImage(idx, 'down'); }} className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors">
                        ↓
                      </button>
                    )}
                  </div>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); removeImage(idx); }}
                  className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-lg"
                  title="Remove Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isMultiple && idx === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-bakery-gold text-bakery-chocolate shadow-sm">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

