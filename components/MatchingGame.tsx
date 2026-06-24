'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Route } from 'next';
import { KidButton } from '@/components/KidButton';

type Pair = {
  id: string;
  left: string;
  right: string;
};

type MatchingGameProps = {
  pairs: Pair[];
  onComplete?: () => void;
  instruction?: string;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export function MatchingGame({ pairs, onComplete, instruction }: MatchingGameProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState(false);

  const rightItems = useMemo(() => shuffle(pairs), [pairs]);
  const done = matched.size === pairs.length && pairs.length > 0;

  useEffect(() => {
    if (done) {
      onComplete?.();
    }
  }, [done, onComplete]);

  function handleLeftClick(leftValue: string) {
    if (done) return;
    if (matched.has(leftValue)) return;
    setSelectedLeft(leftValue);
    setWrongFlash(false);
  }

  function handleRightClick(rightValue: string) {
    if (done || !selectedLeft) return;
    const pair = pairs.find((p) => p.right === rightValue);
    if (!pair) return;

    if (pair.left === selectedLeft) {
      setMatched((prev) => new Set(prev).add(pair.id));
      setSelectedLeft(null);
    } else {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 600);
    }
  }

  const isMatchedLeft = (leftValue: string) => pairs.some((p) => p.left === leftValue && matched.has(p.id));
  const isSelectedLeft = (leftValue: string) => selectedLeft === leftValue;

  return (
    <section className="matching-game">
      <div className="matching-mission-card">
        <p className="matching-label">配對任務</p>
        <h2 className="matching-title">{instruction ?? '先點左邊符號，再點右邊朋友'}</h2>
        <div className="matching-progress-track">
          <div className="matching-progress-fill" style={{ width: `${(matched.size / Math.max(pairs.length, 1)) * 100}%` }} />
        </div>
        <div className="matching-progress-steps">
          {pairs.map((pair, index) => (
            <span key={pair.id} className={`matching-step ${matched.has(pair.id) ? 'is-done' : ''}`}>
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="matching-board">
        <div className="matching-column matching-left">
          {pairs.map((pair) => {
            const matchedThis = matched.has(pair.id);
            const selected = isSelectedLeft(pair.left);
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleLeftClick(pair.left)}
                disabled={done}
                className={`matching-chip matching-left-chip ${matchedThis ? 'is-matched' : ''} ${selected ? 'is-selected' : ''} ${wrongFlash ? 'is-wrong' : ''}`}
              >
                <span className="matching-chip-text">{pair.left}</span>
              </button>
            );
          })}
        </div>

        <div className="matching-column matching-right">
          {rightItems.map((pair) => {
            const matchedThis = matched.has(pair.id);
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleRightClick(pair.right)}
                disabled={done || matchedThis}
                className={`matching-chip matching-right-chip ${matchedThis ? 'is-matched' : ''} ${wrongFlash ? 'is-wrong' : ''}`}
              >
                <span className="matching-chip-text">{pair.right}</span>
              </button>
            );
          })}
        </div>
      </div>

      {done ? (
        <div className="matching-done-card">
          <p className="matching-done-title">太棒了！全部配對完成</p>
          <p className="matching-done-body">你找到了所有朋友</p>
          <KidButton href={"/adventure" as Route} tone="sky">
            回到地圖
          </KidButton>
        </div>
      ) : null}

      {wrongFlash ? (
        <div className="matching-feedback is-retry">
          <p>再試一次</p>
        </div>
      ) : null}
    </section>
  );
}
