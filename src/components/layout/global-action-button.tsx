import { useState, useCallback, useEffect, useRef } from 'react';
import { Plus, Megaphone, Heart } from 'lucide-react';

interface GlobalActionButtonProps {
  /** Called when user taps "Report an Issue" */
  onOpenReport: () => void;
  /** Called when user taps "Post Updates" */
  onOpenPost: () => void;
}

export const GlobalActionButton = ({ onOpenReport, onOpenPost }: GlobalActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);

  const handleReport = () => { onOpenReport(); close(); };
  const handlePost = () => { onOpenPost(); close(); };

  // Close on scroll
  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => close();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen, close]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen, close]);

  return (
    <div ref={menuRef} className="relative flex flex-col items-center">
      {/* Options — positioned above the button */}
      <div
        className={`absolute bottom-full left-1/2 z-50 mb-4 flex -translate-x-1/2 flex-col items-center gap-3 transition-all duration-300 ease-out ${
          isOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-2 opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={handleReport}
          className="flex items-center gap-2.5 whitespace-nowrap rounded-xl bg-red-50 px-4 py-2.5 shadow-lg ring-1 ring-red-200/50 backdrop-blur-sm transition-all duration-200 hover:bg-red-100 hover:scale-105 active:scale-95"
        >
          <Megaphone className="h-4 w-4 text-red-600" />
          <span className="text-sm font-semibold text-red-700">Report an Issue</span>
        </button>

        <button
          onClick={handlePost}
          className="flex items-center gap-2.5 whitespace-nowrap rounded-xl bg-emerald-50 px-4 py-2.5 shadow-lg ring-1 ring-emerald-200/50 backdrop-blur-sm transition-all duration-200 hover:bg-emerald-100 hover:scale-105 active:scale-95"
        >
          <Heart className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Post Updates</span>
        </button>
      </div>

      {/* Main toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 ease-out active:scale-95 ${
          isOpen
            ? 'rotate-45 bg-red-500 text-white shadow-red-500/30'
            : 'gradient-green text-white shadow-emerald-500/30 hover:scale-105'
        }`}
      >
        <Plus className="h-6 w-6 transition-transform duration-300" />
      </button>
    </div>
  );
};
