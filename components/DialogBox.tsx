'use client';

import { useEffect, useState } from 'react';
import type { StoryDialog } from '@/lib/story/types';
import { saveProgress, loadProgress, type StoryProgress } from '@/lib/story/local-storage';

type DialogBoxProps = {
  dialog: StoryDialog;
  onComplete?: () => void;
  onChoice?: (nextId: string) => void;
};

function SpeakerIcon({ speaker }: { speaker: string }) {
  if (speaker === 'lumi') {
    return (
      <span className="dlg-icon dlg-icon-lumi" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="url(#lg1)" />
          <circle cx="9" cy="10" r="1.5" fill="#1a5df8" />
          <circle cx="15" cy="10" r="1.5" fill="#1a5df8" />
          <path d="M9 15c1.5 1.5 4.5 1.5 6 0" stroke="#1a5df8" strokeWidth="1.8" strokeLinecap="round" />
          <defs>
            <radialGradient id="lg1" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="#ffd95a" />
              <stop offset="100%" stopColor="#ffb800" />
            </radialGradient>
          </defs>
        </svg>
      </span>
    );
  }
  if (speaker === 'pet') {
    return (
      <span className="dlg-icon dlg-icon-pet" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="13" rx="7" ry="6" fill="url(#pg1)" />
          <circle cx="9" cy="11" r="1.2" fill="#1a5df8" />
          <circle cx="15" cy="11" r="1.2" fill="#1a5df8" />
          <path d="M10.5 14c.8.8 2.2.8 3 0" stroke="#1a5df8" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="7" cy="8" rx="2.5" ry="3" fill="url(#pg1)" />
          <ellipse cx="17" cy="8" rx="2.5" ry="3" fill="url(#pg1)" />
          <defs>
            <radialGradient id="pg1" cx="0.35" cy="0.35" r="0.75">
              <stop offset="0%" stopColor="#ffd95a" />
              <stop offset="100%" stopColor="#ffb800" />
            </radialGradient>
          </defs>
        </svg>
      </span>
    );
  }
  if (speaker === 'boss') {
    return (
      <span className="dlg-icon dlg-icon-boss" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 12h3v6h6v-4h2v4h6v-6h3L12 2z" fill="url(#bg1)" />
          <defs>
            <linearGradient id="bg1" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0%" stopColor="#6b7f98" />
              <stop offset="100%" stopColor="#3b4f63" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    );
  }
  return (
    <span className="dlg-icon dlg-icon-narrator" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="url(#ng1)" />
        <path d="M12 7v10M9 10l3-3 3 3M9 14l3 3 3-3" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <radialGradient id="ng1" cx="0.3" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#4aa3ff" />
            <stop offset="100%" stopColor="#1a5df8" />
          </radialGradient>
        </defs>
      </svg>
    </span>
  );
}

export function DialogBox({ dialog, onComplete, onChoice }: DialogBoxProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState<StoryProgress | null>(() => loadProgress());

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    if (!progress) return;
    const next: StoryProgress = {
      ...progress,
      viewedDialogIds: progress.viewedDialogIds.includes(dialog.id)
        ? progress.viewedDialogIds
        : [...progress.viewedDialogIds, dialog.id],
      currentDialogId: dialog.next ?? null,
    };
    saveProgress(next);
  }, [dialog.id, dialog.next, progress]);

  const handleNext = () => {
    setVisible(false);
    if (dialog.choices && dialog.choices.length > 0) {
      onChoice?.(dialog.choices[0].next);
    } else if (dialog.next) {
      onChoice?.(dialog.next);
    } else {
      onComplete?.();
    }
  };

  const handleChoice = (nextId: string) => {
    setVisible(false);
    onChoice?.(nextId);
  };

  return (
    <div className={`dlg-shell ${visible ? 'dlg-enter' : 'dlg-exit'}`} role="dialog" aria-modal="true">
      <div className="dlg-card">
        <div className="dlg-header">
          <SpeakerIcon speaker={dialog.speaker} />
          <span className="dlg-speaker">
            {dialog.speaker === 'narrator' ? '說書人' : dialog.speaker === 'lumi' ? '露米' : dialog.speaker === 'pet' ? '小光獸' : dialog.speaker}
          </span>
        </div>
        <p className="dlg-text">{dialog.text}</p>
        <div className="dlg-actions">
          {dialog.choices && dialog.choices.length > 0 ? (
            dialog.choices.map((c) => (
              <button key={c.next} type="button" className="dlg-choice" onClick={() => handleChoice(c.next)}>
                {c.text}
              </button>
            ))
          ) : (
            <button type="button" className="dlg-next" onClick={handleNext}>
              繼續
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
