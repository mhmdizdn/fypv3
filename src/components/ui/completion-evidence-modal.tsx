'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CompletionEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (image: File) => Promise<void>;
  loading: boolean;
}

export function CompletionEvidenceModal({
  isOpen,
  onClose,
  onSubmit,
  loading
}: CompletionEvidenceModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedImage) {
      await onSubmit(selectedImage);
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#13151f] rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4 text-white">Upload Completion Evidence</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload Photo Evidence
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#7919e6] file:text-white hover:file:bg-[#621ac1]"
              required
            />
          </div>

          {previewUrl && (
            <div className="mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#7919e6] hover:bg-[#621ac1]"
              disabled={!selectedImage || loading}
            >
              {loading ? 'Uploading...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}