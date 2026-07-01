'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import { completePracticeSession } from '@/lib/actions/practice';
import type { GeneratedQuestion, SubmittedPracticeAnswer } from '@/lib/types';
import { KidButton } from '@/components/KidButton';
import {
  loadGameState,
  saveGameState,
  addStars,
  addEnergy,
  setPetMood,
  incrementPracticeCount,
  type GameState,
} from '@/lib/game/state';

type PracticeRunnerProps = {
  questions: GeneratedQuestion[];
  practiceMode?: 'test' | 'production';
};

type CompletionStats = {
  total: number;
  correct: number;
  wrong: number;
};

function isTracingQuestion(question: GeneratedQuestion) {
  return question.practice_mode === 'tracing' || question.practice_mode === 'intro';
}

function isAnswerCorrect(question: GeneratedQuestion, selected: string) {
  return question.correct_answer.includes(selected);
}

function questionTheme(question: GeneratedQuestion) {
  if (question.practice_mode === 'listening') return 'listening';
  if (question.practice_mode === 'tracing') return 'tracing';
  if (question.practice_mode === 'intro') return 'intro';
  return 'choice';
}

function shortModeLabel(question: GeneratedQuestion) {
  if (question.practice_mode === 'listening') return '聽聲音找朋友';
  if (question.practice_mode === 'tracing') return '認識新朋友';
  if (question.practice_mode === 'intro') return '認識新朋友';
  return '找出正確朋友';
}

function displayQuestionText(question: GeneratedQuestion) {
  if (!isTracingQuestion(question)) return question.question_text;
  const friend = question.memory_hook?.keyword ?? question.learning_item?.display_text ?? question.learning_item?.content ?? question.correct_answer[0] ?? '這個朋友';
  return `認識這個朋友：${friend}`;
}

function encouragement(question: GeneratedQuestion) {
  const keyword = question.memory_hook?.keyword ?? question.learning_item?.display_text ?? '這個字';
  const target = question.learning_item?.content ?? question.correct_answer[0] ?? '';
  return `${keyword} 的朋友是 ${target}`;
}

export function PracticeRunner({ questions, practiceMode = 'production' }: PracticeRunnerProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SubmittedPracticeAnswer[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  const [practiceRecordId, setPracticeRecordId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const completionStartedRef = useRef(false);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = questions[currentIndex];
  const answeredCurrent = selectedAnswer !== null;
  const currentIsCorrect = current && selectedAnswer ? isAnswerCorrect(current, selectedAnswer) : false;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100) : 0;
  const modeClass = current ? `theme-${questionTheme(current)}` : '';

  useEffect(() => {
    if (!selectedAnswer) return;
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [selectedAnswer]);

  useEffect(() => {
    if (!isCompleting || !practiceRecordId) return;
    const timer = setTimeout(() => {
      router.push(`/reward?practice_record_id=${practiceRecordId}`);
    }, 1500);
    return () => clearTimeout(timer);
  }, [isCompleting, practiceRecordId, router]);

  function speakQuestion() {
    if (!current || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(displayQuestionText(current));
    utterance.lang = current.learning_item?.type?.includes('english') ? 'en-US' : 'zh-TW';
    utterance.rate = 0.78;
    utterance.pitch = 1.08;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function buildAnswer(selected: string, forcedCorrect?: boolean): SubmittedPracticeAnswer {
    const isCorrect = forcedCorrect ?? isAnswerCorrect(current, selected);

    return {
      child_id: current.child_id,
      daily_learning_plan_id: current.daily_learning_plan_id,
      generated_question_id: current.id,
      learning_item_id: current.learning_item_id ?? current.learning_item?.id ?? null,
      memory_hook_id: current.memory_hook_id ?? current.memory_hook?.id ?? null,
      practice_mode: current.practice_mode,
      selected_answer: selected,
      correct_answer: current.correct_answer,
      is_correct: isCorrect,
      score: isCorrect ? 100 : 0,
      time_spent_seconds: Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000)),
      mistake_type: isCorrect ? null : 'wrong_choice'
    };
  }

  function handleSelect(option: string) {
    if (answeredCurrent || practiceRecordId || isCompleting || completionStartedRef.current) return;
    setSelectedAnswer(option);
  }

  function handleTracingDone() {
    if (answeredCurrent || practiceRecordId || isCompleting || completionStartedRef.current) return;
    setSelectedAnswer(current.correct_answer[0] ?? current.learning_item?.content ?? 'done');
  }

  function goNext() {
    if (!selectedAnswer || isCompleting || completionStartedRef.current) return;

    const answer = buildAnswer(selectedAnswer, isTracingQuestion(current) ? true : undefined);
    const nextAnswers = [...answers, answer];

    // V5: 每完成一題 +1 能量
    try { addEnergy(1); } catch {}

    setAnswers(nextAnswers);

    if (currentIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setCurrentIndex((value) => value + 1);
      setQuestionStartedAt(Date.now());
      return;
    }

    completionStartedRef.current = true;
    setIsCompleting(true);
    setCompletionError(null);
    const correct = nextAnswers.filter((item) => item.is_correct).length;
    const wrong = nextAnswers.length - correct;
    setCompletionStats({ total: nextAnswers.length, correct, wrong });

    startTransition(async () => {
      const result = await completePracticeSession(nextAnswers);
      setCompletionMessage(result.message);
      if (result.ok && result.practice_record_id) {
        setPracticeRecordId(result.practice_record_id);
        try {
          // V5: 每完成一輪練習 +2 星星幣
          addStars(2);
          incrementPracticeCount();
          setPetMood('happy');
        } catch {
          // Game state is best-effort; ignore storage errors.
        }
      } else {
        completionStartedRef.current = false;
        setCompletionError(result.message || '練習完成資料儲存失敗，請再試一次。');
        setIsCompleting(false);
      }
    });
  }

  if (!questions.length) {
    return (
      <section className="practice-empty-card">
        <div className="practice-orb" aria-hidden="true" />
        <p className="practice-chip">今天休息一下</p>
        <h1 className="practice-title">今天完成囉</h1>
        <p className="practice-subtitle">明天會有新的字母朋友。</p>
        <div className="practice-actions">
          <KidButton href="/reward" tone="sky">看收納包</KidButton>
          <KidButton href="/parent/dashboard" tone="white">家長後台</KidButton>
        </div>
      </section>
    );
  }

  if (practiceRecordId) {
    const rewardHref = `/reward?practice_record_id=${practiceRecordId}` as Route;

    return (
      <section className="practice-empty-card practice-complete-card" style={{ paddingBottom: 'max(24px, calc(env(safe-area-inset-bottom) + 20px))' }}>
        <div className="practice-orb practice-orb-success" aria-hidden="true" />
        <p className="practice-chip practice-chip-success">完成任務</p>
        <h1 className="practice-title">小光獸覺得你超棒！</h1>
        <p className="practice-subtitle">
          你答對了 {completionStats?.correct ?? 0} / {completionStats?.total ?? questions.length} 題，得到了 2 星星幣和 {questions.length} 能量。
        </p>
        <p className="practice-subtitle" style={{ marginTop: 6 }}>
          小光獸想帶著這些能量，繼續前往下一個小徑冒險。
        </p>
        {completionMessage ? <p className="practice-note">{completionMessage}</p> : null}
        <div className="practice-complete-actions">
          <Link href={rewardHref} className="practice-complete-primary">
            領取今天獎勵
          </Link>
          <Link href="/" className="practice-complete-secondary">
            回首頁地圖
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`practice-stage ${modeClass}`}>
      {practiceMode === 'test' ? (
        <div className="practice-test-banner">測試模式：題目與抽卡可重複測試</div>
      ) : null}

      <div className="practice-mission-card">
        <div className="practice-mission-header">
          <div>
            <p className="practice-mission-label">找朋友任務</p>
            <h2 className="practice-mission-title">{shortModeLabel(current)}</h2>
          </div>
          <div className="practice-level-badge">第 {currentIndex + 1} 關</div>
        </div>
        <div className="practice-progress-track">
          <div className="practice-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="practice-progress-steps">
          {Array.from({ length: questions.length }).map((_, index) => (
            <span key={index} className={`practice-step ${index <= currentIndex ? 'is-reached' : ''}`}>
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="practice-question-card">
        <p className="practice-question-label">今天的字母朋友</p>
        <h1 className="practice-question-text">{current.question_text}</h1>
        <p className="practice-question-hint">{current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}</p>
        <button type="button" onClick={speakQuestion} className="practice-listen-btn" aria-label="播放題目聲音">
          再聽一次
        </button>
      </div>

      {isTracingQuestion(current) ? (
        <div className="practice-trace-card">
          <div className="practice-trace-area">
            <span className="practice-trace-tag">用手指描</span>
            <span className="practice-trace-text">{current.learning_item?.content ?? current.correct_answer[0]}</span>
          </div>
          <button
            type="button"
            onClick={handleTracingDone}
            className={`practice-trace-btn ${answeredCurrent ? 'is-done' : ''}`}
          >
            {answeredCurrent ? '完成了！' : '我認識了'}
          </button>
        </div>
      ) : (
        <div className="practice-options-grid">
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const correct = isAnswerCorrect(current, option);
            const showState = answeredCurrent && (isSelected || correct);
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`practice-option ${showState && correct ? 'is-correct' : ''} ${showState && isSelected && !correct ? 'is-wrong' : ''}`}
              >
                <span className="practice-option-text">{option}</span>
              </button>
            );
          })}
        </div>
      )}

      {completionError ? (
        <div className="practice-error-card">
          <p className="practice-error-title">儲存失敗</p>
          <p className="practice-error-body">{completionError}</p>
        </div>
      ) : null}

      {answeredCurrent ? (
        <div className={`practice-feedback ${isTracingQuestion(current) || currentIsCorrect ? 'is-ok' : 'is-retry'}`}>
          <p className="practice-feedback-title">{isTracingQuestion(current) || currentIsCorrect ? '太棒了！找到朋友了' : '差一點點，我們再記一次'}</p>
          <p className="practice-feedback-body">
            {isTracingQuestion(current) || currentIsCorrect ? encouragement(current) : `${encouragement(current)}，下次一定更快！`}
          </p>
        </div>
      ) : null}

      {answeredCurrent ? (
        <div className={`practice-next-wrap`}>
          <button
            ref={ctaRef}
            type="button"
            onClick={goNext}
            disabled={!selectedAnswer || isPending || isCompleting}
            className="practice-next-btn"
          >
            {isCompleting || isPending ? '練習完成，準備打開小禮物...' : currentIndex === questions.length - 1 ? '完成練習，去拿獎勵' : '下一題'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
