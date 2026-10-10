import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import HotelImage from '@/components/hotel-image';

// The backend stores photos as plain URL strings (there is no upload endpoint),
// so photos are added by pasting image URLs.
const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const PhotoUrlInput = ({ value = [], onChange }) => {
  const [draft, setDraft] = React.useState('');
  const [error, setError] = React.useState('');

  const addPhoto = () => {
    const url = draft.trim();
    if (!isValidUrl(url)) {
      setError('Enter a valid http(s) image URL');
      return;
    }
    if (value.includes(url)) {
      setError('This image was already added');
      return;
    }
    onChange([...value, url]);
    setDraft('');
    setError('');
  };

  return (
    <div className="space-y-3 p-4 border rounded-md">
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder="https://example.com/photo.jpg"
          aria-label="Image URL"
          onChange={(e) => {
            setDraft(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addPhoto();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={addPhoto}>
          Add image
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-6">
        {value.map((photo) => (
          <HotelImage
            key={photo}
            photo={photo}
            onRemove={() => onChange(value.filter((p) => p !== photo))}
          />
        ))}
        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">No images added yet.</p>
        )}
      </div>
    </div>
  );
};

export default PhotoUrlInput;
