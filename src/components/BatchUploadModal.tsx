import React, { useState } from 'react';
import { Upload, X, CheckCircle2, Sparkles } from 'lucide-react';
import { EmotionMoodId, EMOTION_CATEGORIES, PortfolioPhoto } from '../utils/portfolioLogic';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomPhotos: (newPhotos: PortfolioPhoto[]) => void;
  existingCount: number;
}

export const BatchUploadModal: React.FC<BatchUploadModalProps> = ({
  isOpen,
  onClose,
  onAddCustomPhotos,
  existingCount,
}) => {
  const [selectedMood, setSelectedMood] = useState<Exclude<EmotionMoodId, 'all'>>('euphoria');
  const [customLocation, setCustomLocation] = useState('Hyderabad Commission');
  const [uploadedPreviews, setUploadedPreviews] = useState<Array<{ name: string; dataUrl: string }>>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files).slice(0, 50);
    const promises = fileArray.map(
      (file) =>
        new Promise<{ name: string; dataUrl: string }>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              dataUrl: String(reader.result || ''),
            });
          };
          reader.readAsDataURL(file);
        })
    );

    Promise.all(promises).then((results) => {
      setUploadedPreviews((prev) => [...prev, ...results].slice(0, 50));
      setStatusMessage(`${results.length} photo(s) staged for emotion categorization.`);
    });
  };

  const handleCommitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedPreviews.length === 0) {
      setStatusMessage('Please select at least one image file from your device first.');
      return;
    }

    const cat = EMOTION_CATEGORIES.find((c) => c.id === selectedMood)!;
    const created: PortfolioPhoto[] = uploadedPreviews.map((item, idx) => {
      const num = existingCount + idx + 1;
      return {
        id: `srinath-custom-${Date.now()}-${idx}`,
        index: num,
        title: item.name || `Custom Frame #${num}`,
        caption: cat.photographySpec,
        exifSpec: 'Leica SL2-S · 50mm f/1.4 · ISO 200 · 1/1000s',
        moodId: selectedMood,
        photographySpec: cat.photographySpec,
        palette: ['#18181b', cat.accentHex, '#fafafa'],
        aspect: 'landscape',
        aspectRatio: '16:9',
        ratioFolder: 'ratio-16-9',
        imageUrl: item.dataUrl,
        filterStyle: 'contrast(1.04) saturate(1.08)',
        objectPosition: '50% 50%',
        focalY: 50,
        customDataUrl: item.dataUrl,
        widthRatio: 16,
        heightRatio: 9,
        tileW: 1.52,
        tileH: 0.92,
      };
    });

    onAddCustomPhotos(created);
    setUploadedPreviews([]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-upload-title"
    >
      <div className="w-full max-w-xl rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 id="batch-upload-title" className="text-lg font-bold text-white">
              Batch Upload &amp; Emotion Categorizer (Up to 50 Photos)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-white"
            aria-label="Close upload modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCommitUpload} className="mt-5 space-y-4">
          <div>
            <label htmlFor="emotion-select" className="block text-xs font-medium text-zinc-300">
              Assign Target Emotion / Shoot Specification
            </label>
            <select
              id="emotion-select"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value as Exclude<EmotionMoodId, 'all'>)}
              className="mt-1.5 w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              {EMOTION_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.moodTitle} — ({cat.photographySpec})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="shoot-location" className="block text-xs font-medium text-zinc-300">
              Shoot Location / Venue Credit
            </label>
            <input
              id="shoot-location"
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="e.g. Taj Falaknuma Palace, Hyderabad"
              className="mt-1.5 w-full min-h-[44px] rounded-xl bg-zinc-950 border border-zinc-700 px-3.5 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="photo-files-input"
              className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed border-zinc-700 hover:border-amber-500 bg-zinc-950/60 cursor-pointer transition-colors p-4 text-center"
            >
              <Upload className="w-6 h-6 text-amber-400 mb-2" />
              <span className="text-sm font-medium text-white">
                Select or Drop up to 50 Photographs
              </span>
              <span className="text-xs text-zinc-400 mt-1">
                Instantly indexed into the 3D Orb Globe, Recent-Tabs Stack &amp; Offline Cache
              </span>
              <input
                id="photo-files-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {statusMessage && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-zinc-950 px-3.5 py-2.5 rounded-xl border border-zinc-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {uploadedPreviews.length > 0 && (
            <div className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800">
              {uploadedPreviews.map((item, idx) => (
                <img
                  key={idx}
                  src={item.dataUrl}
                  alt={item.name}
                  className="w-full h-12 object-cover rounded-lg border border-zinc-700"
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-zinc-800 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-500 text-sm font-semibold text-black hover:bg-amber-400"
            >
              Add to 3D Portfolio ({uploadedPreviews.length})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
