'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { KidButton } from '@/components/KidButton';
import { damageBoss } from '@/lib/actions/map';

const BOSS_TOTAL_HP = 100;
const QUESTION_TIME_LIMIT = 5;
const QUICK_BONUS_THRESHOLD = 3;

type Choice = {
  questionId: string;
  text: string;
  options: string[];
  correct: string;
};

const DEMO_BOSS_QUESTIONS: Choice[] = [
  {
    questionId: 'boss-1',
    text: '哪一個是 B？',
    options: ['A', 'B', 'C', 'D'],
    correct: 'B'
  },
  {
    questionId: 'boss-2',
    text: 'Apple 的 A 在哪一個？',
    options: ['A', 'B', 'C', 'D'],
    correct: 'A'
  },
  {
    questionId: 'boss-3',
    text: '車子的 ㄔ 是哪一個？',
    options: ['ㄅ', 'ㄆ', 'ㄇ', 'ㄔ'],
    correct: 'ㄔ'
  },
  {
    questionId: 'boss-4',
    text: '哪一個是 5？',
    options: ['3', '4', '5', '6'],
    correct: '5'
  }
];

type BossBattleProps = {
  nodeIndex?: number;
};

export function BossBattle({ nodeIndex = 2 }: BossBattleProps) {
  const [hp, setHp] = useState(BOSS_TOTAL_HP);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [victory, setVictory] = useState(false);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef<number | null>(null);
  const finishedRef = useRef(finished);

  useEffect(() => {
    finishedRef.current = finished;
  }, [finished]);

  const question = DEMO_BOSS_QUESTIONS[currentIndex];

  const handleTimeout = useCallback(() => {
    if (finishedRef.current) return;
    setSelected(null);
    setCurrentIndex((i) => {
      if (i < DEMO_BOSS_QUESTIONS.length - 1) {
        return i + 1;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setFinished(true);
      return i;
    });
    setTimeLeft(QUESTION_TIME_LIMIT);
  }, []);

  function handleSelect(option: string) {
    if (finished || victory || selected) return;
    const spent = (QUESTION_TIME_LIMIT - timeLeft) * 1000;
    setSelected(option);
    const correct = option === question.correct;
    if (correct) {
      const damage = 25 + (spent < QUICK_BONUS_THRESHOLD * 1000 ? 5 : 0);
      const nextHp = Math.max(0, hp - damage);
      setHp(nextHp);
      if (nextHp <= 0) {
        setVictory(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
    setTimeout(() => {
      handleTimeout();
    }, correct && spent < QUICK_BONUS_THRESHOLD * 1000 ? 800 : 600);
  }

  useEffect(() => {
    if (victory || finished) return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [victory, finished, handleTimeout]);

  useEffect(() => {
    if (victory) {
      damageBoss(nodeIndex, BOSS_TOTAL_HP);
    }
  }, [victory, nodeIndex]);

  const timerPercent = (timeLeft / QUESTION_TIME_LIMIT) * 100;

  return (
    <section className="boss-stage">
      <div className="boss-header">
        <Link href={"/adventure" as Route} className="boss-back">
          地圖
        </Link>
        <div className="boss-title-row">
          <h1 className="boss-title">Boss 挑戰</h1>
          <span className="boss-step">第 {currentIndex + 1} / {DEMO_BOSS_QUESTIONS.length} 題</span>
        </div>
      </div>

      <div className="boss-hp-card">
        <div className="boss-hp-header">
          <span className="boss-hp-label">Boss HP</span>
          <span className="boss-hp-value">{Math.max(0, hp)} / {BOSS_TOTAL_HP}</span>
        </div>
        <div className="boss-hp-track">
          <div className="boss-hp-fill" style={{ width: `${Math.max(0, (hp / BOSS_TOTAL_HP) * 100)}%` }} />
        </div>
      </div>

      <div className="boss-timer-card">
        <div className="boss-timer-header">
          <span className="boss-timer-label">剩餘時間</span>
          <span className="boss-timer-value">{Math.max(0, Math.ceil(timeLeft))} 秒</span>
        </div>
        <div className="boss-timer-track">
          <div className="boss-timer-fill" style={{ width: `${timerPercent}%` }} />
        </div>
      </div>

      {!finished && !victory ? (
        <div className={`boss-question-card ${selected ? (selected === question.correct ? 'is-correct' : 'is-wrong') : ''}`}>
          <p className="boss-question-tag">快速反應</p>
          <h2 className="boss-question-text">{question.text}</h2>
          <div className="boss-options-grid">
            {question.options.map((option) => {
              const isSelected = selected === option;
              const isCorrect = question.correct === option;
              const showState = selected ? (isSelected || isCorrect) : false;
              return (
                <button
                  key={option}
                  type="button"
                  disabled={!!selected}
                  onClick={() => handleSelect(option)}
                  className={`boss-option ${isSelected ? (isCorrect ? 'is-correct' : 'is-wrong') : ''} ${showState && !isSelected ? (isCorrect ? 'is-correct-dim' : '') : ''}`}
                >
                  <span className="boss-option-text">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {victory ? (
        <div className="boss-result-card is-win">
          <div className="boss-orb boss-orb-win" aria-hidden="true" />
          <h2 className="boss-result-title">Boss 被打敗了！</h2>
          <p className="boss-result-body">你贏得了戰鬥，回到地圖繼續冒險。</p>
          <KidButton href={"/adventure" as Route} tone="sky">
            回到地圖
          </KidButton>
        </div>
      ) : null}

      {finished && !victory ? (
        <div className="boss-result-card is-retry">
          <div className="boss-orb boss-orb-retry" aria-hidden="true" />
          <h2 className="boss-result-title">Boss 還在等你</h2>
          <p className="boss-result-body">再挑戰一次吧。</p>
          <KidButton href={"/adventure" as Route} tone="white">
            回到地圖
          </KidButton>
        </div>
      ) : null}
    </section>
  );
}
