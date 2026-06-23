'use client';

import { useEffect, useState } from 'react';
import { PhoneFrame } from '@/components/PhoneFrame';
import { KidBottomNav } from '@/components/KidBottomNav';
import { KidTopBar } from '@/components/KidTopBar';
import { DialogBox } from '@/components/DialogBox';
import { PET_INTERACTIONS, getPetInteractions } from '@/lib/story/data';
import type { StoryDialog } from '@/lib/story/types';

type PetMood = 'happy' | 'curious' | 'sleepy' | 'excited';

const MOOD_LABELS: Record<PetMood, string> = {
  happy: '開心',
  curious: '好奇',
  sleepy: '想睡覺',
  excited: '興奮',
};

export default function PetPage() {
  const [petName] = useState('小光獸');
  const [mood, setMood] = useState<PetMood>('happy');
  const [dialog, setDialog] = useState<StoryDialog | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const interactions = getPetInteractions();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDialog({
      id: 'pet-welcome',
      chapter: 'ch1',
      world: 'forest',
      speaker: 'pet',
      text: '你好！今天想跟我說什麼？點我一下看看吧！',
      choices: [],
    } as unknown as StoryDialog);
    setShowDialog(true);
  }, []);

  const handlePetTap = (trigger: string) => {
    const match = interactions.find((i) => i.trigger === trigger && i.mood === mood);
    const text = match?.text ?? '小光獸開心地閃了閃光芒！';
    setDialog({
      id: `pet-${trigger}-${Date.now()}`,
      chapter: 'ch1',
      world: 'forest',
      speaker: 'pet',
      text,
      choices: [],
    } as unknown as StoryDialog);
    setShowDialog(true);
  };

  const moods: PetMood[] = ['happy', 'curious', 'sleepy', 'excited'];

  return (
    <PhoneFrame>
      <KidTopBar title="小光獸夥伴" backHref="/" backLabel="首頁" />
      <div className="kid-game-content">
        <section className="kid-pet-card">
          <div className="kid-pet-avatar" aria-hidden="true" />
          <div className="kid-pet-name">{petName}</div>
          <div className="kid-pet-mood">心情：{MOOD_LABELS[mood]}</div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '14px', marginTop: '14px' }}>
          <div className="kid-map-header">
            <h2 className="kid-map-title">今天跟牠玩什麼？</h2>
            <p className="kid-map-sub">點一下小光獸的身體部位</p>
          </div>
          <div className="kid-pet-actions">
            <button type="button" className="kid-pet-btn" onClick={() => handlePetTap('tap_head')}>
              摸摸頭
            </button>
            <button type="button" className="kid-pet-btn" onClick={() => handlePetTap('tap_ear')}>
              碰耳朵
            </button>
            <button type="button" className="kid-pet-btn" onClick={() => handlePetTap('tap_belly')}>
              摸肚子
            </button>
            <button type="button" className="kid-pet-btn" onClick={() => handlePetTap('tap_wing')}>
              碰翅膀
            </button>
          </div>
        </section>

        <section className="kid-soft-panel" style={{ padding: '14px', marginTop: '14px' }}>
          <div className="kid-map-header">
            <h2 className="kid-map-title">今天的心情</h2>
            <p className="kid-map-sub">選一個心情看看不同反應</p>
          </div>
          <div className="kid-pet-actions">
            {moods.map((m) => (
              <button
                key={m}
                type="button"
                className={`kid-pet-btn ${mood === m ? 'kid-blue-button' : ''}`}
                onClick={() => setMood(m)}
              >
                {MOOD_LABELS[m]}
              </button>
            ))}
          </div>
        </section>

        {showDialog && dialog && (
          <div className="kid-pet-dialog">
            <div className="kid-pet-dialog-text">{dialog.text}</div>
          </div>
        )}
      </div>
      <KidBottomNav />
    </PhoneFrame>
  );
}
