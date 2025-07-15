'use client';

import { useState } from 'react';
import { Button } from './button';

interface CompletionEvidenceViewerProps {
  imageUrl: string | null | undefined;
  serviceName: string;
  textColor?: string;
}

export function CompletionEvidenceViewer({ 
  imageUrl, 
  serviceName,
  textColor = "text-gray-200" // Default to the original color
}: CompletionEvidenceViewerProps) {
  const [showImage, setShowImage] = useState(false);

  if (!imageUrl) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h4 className={`font-medium ${textColor}`}>Completion Evidence</h4>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowImage(!showImage)}
          className="cursor-pointer"
        >
          {showImage ? 'Hide Evidence' : 'View Evidence'}
        </Button>
      </div>

      {/* Image is only shown when showImage is true */}
      {showImage && (
        <div className="relative w-full max-w-md">
          <img
            src={imageUrl}
            alt={`Completion evidence for ${serviceName}`}
            className="rounded-lg w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
