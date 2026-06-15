'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Route } from 'next';
import { completePracticeSession } from '@/lib/actions/practice';
import type { GeneratedQuestion, SubmittedPracticeAnswer } from '@/lib/types';
import { KidButton } from '@/components/KidButton';

type PracticeRunnerProps = {
  questions: GeneratedQuestion[];
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

function questionEmoji(question: GeneratedQuestion) {
  if (question.practice_mode === 'listening') return '👂';
  if (question.practice_mode === 'tracing') return '👋';
  if (question.practice_mode === 'intro') return '👋';
  if (question.learning_item?.type?.includes('english')) return '🔤';
  return 'ㄅ';
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

export function PracticeRunner({ questions }: PracticeRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SubmittedPracticeAnswer[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(Date.now());
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  const [practiceRecordId, setPracticeRecordId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const ctaRef = useRef<HTMLButtonElement | null>(null);

  const current = questions[currentIndex];
  const answeredCurrent = selectedAnswer !== null;
  const currentIsCorrect = current && selectedAnswer ? isAnswerCorrect(current, selectedAnswer) : false;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100) : 0;

  useEffect(() => {
    if (!answeredCurrent) return;
    ctaRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [answeredCurrent]);

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
    if (answeredCurrent || practiceRecordId) return;
    setSelectedAnswer(option);
  }

  function handleTracingDone() {
    if (answeredCurrent || practiceRecordId) return;
    setSelectedAnswer(current.correct_answer[0] ?? current.learning_item?.content ?? 'done');
  }

  function goNext() {
    if (!selectedAnswer) return;

    const answer = buildAnswer(selectedAnswer, isTracingQuestion(current) ? true : undefined);
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);

    if (currentIndex < questions.length - 1) {
      setSelectedAnswer(null);
      setCurrentIndex((value) => value + 1);
      setQuestionStartedAt(Date.now());
      return;
    }

    const correct = nextAnswers.filter((item) => item.is_correct).length;
    setCompletionStats({ total: nextAnswers.length, correct, wrong: nextAnswers.length - correct });

    startTransition(async () => {
      const result = await completePracticeSession(nextAnswers);
      setCompletionMessage(result.message);
      if (result.ok && result.practice_record_id) {
        setPracticeRecordId(result.practice_record_id);
      }
    });
  }

  if (!questions.length) {
    return (
      <section className="kid-card-strong flex min-h-[560px] flex-col items-center justify-center p-6 text-center">
        <div className="learning-orb flex h-32 w-32 items-center justify-center rounded-[42px] text-7xl shadow-sm">🌙</div>
        <p className="mt-6 rounded-full bg-[#e9f4ff] px-5 py-2 text-base font-black text-[#1766e6]">今天休息一下</p>
        <h1 className="mt-4 text-[34px] font-black leading-tight text-[#172033]">今天完成囉</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-[#5f6f89]">明天會有新的字母朋友。</p>
        <div className="mt-7 w-full space-y-3">
          <KidButton href="/collection" tone="sky">🎒 看收納包</KidButton>
          <KidButton href="/parent/dashboard" tone="white">家長後台</KidButton>
        </div>
      </section>
    );
  }

  if (practiceRecordId) {
    const rewardHref = `/reward?practice_record_id=${practiceRecordId}` as Route;

    return (
      <section className="kid-card-strong relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden p-6 text-center">
        <div className="pointer-events-none absolute left-8 top-10 text-3xl confetti-sparkle">✨</div>
        <div className="pointer-events-none absolute right-8 top-24 text-3xl confetti-sparkle">⭐</div>
        <div className="pointer-events-none absolute bottom-24 left-12 text-3xl confetti-sparkle">🎉</div>
        <div className="reward-pack-glow relative flex h-36 w-36 items-center justify-center rounded-[46px] text-7xl shadow-sm animate-bounce-soft">
          🎁
          <span className="absolute -right-3 bottom-7 text-3xl">⭐</span>
        </div>
        <p className="mt-7 rounded-full bg-[#e9f4ff] px-5 py-2 text-base font-black text-[#1766e6]">完成任務</p>
        <h1 className="mt-4 text-[34px] font-black leading-tight text-[#172033]">今天練習完成！</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-[#5f6f89]">
          答對 {completionStats?.correct ?? 0} / {completionStats?.total ?? questions.length} 題，準備打開驚喜卡包。
        </p>
        {completionMessage ? <p className="mt-4 rounded-[24px] bg-white px-5 py-4 text-base font-bold text-[#5f6f89] shadow-sm">{completionMessage}</p> : null}
        <div className="mt-8 w-full space-y-3">
          <KidButton href={rewardHref} tone="primary">🎁 去拿獎勵</KidButton>
          <KidButton href="/collection" tone="white">🎒 先看收納包</KidButton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-3">
      <div className="kid-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#2f8cff]">第 {currentIndex + 1} / {questions.length} 題</p>
            <h2 className="mt-1 text-xl font-black text-[#172033]">{shortModeLabel(current)}</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[22px] bg-[#fff0b8] text-2xl shadow-sm">⭐</div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-1.5">
          {Array.from({ length: questions.length }).map((_, index) => (
            <div
              key={index}
              className={`h-3 rounded-full transition ${index <= currentIndex ? 'bg-gradient-to-r from-[#2f8cff] to-[#ffd95a]' : 'bg-[#e6eef9]'}`}
            />
          ))}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6eef9]">
          <div className="h-full rounded-full bg-[#1766e6] transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="kid-card-strong relative overflow-hidden p-5 text-center">
        <div className="pointer-events-none absolute -right-10 top-5 h-28 w-28 rounded-full bg-[#cdb7ff]/20 blur-2xl" />
        <div className="learning-orb mx-auto flex h-[108px] w-[108px] items-center justify-center rounded-[36px] text-[48px] font-black text-[#1766e6] shadow-sm">
          {questionEmoji(current)}
        </div>
        <p className="mt-4 text-sm font-black text-[#2f8cff]">今天的字母朋友</p>
        <h1 className="mt-2 text-[34px] font-black leading-tight tracking-[-0.04em] text-[#172033]">{displayQuestionText(current)}</h1>
        <p className="mt-3 rounded-[24px] bg-[#f5f9ff] px-4 py-3 text-base font-bold leading-relaxed text-[#5f6f89]">
          {current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}
        </p>
        <button
          type="button"
          onClick={speakQuestion}
          className="mx-auto mt-4 flex min-h-[52px] touch-manipulation select-none items-center justify-center rounded-full bg-[#e9f4ff] px-6 text-base font-black text-[#1766e6] shadow-sm ring-1 ring-white/80 active:scale-[0.98]"
          aria-label="播放題目聲音"
        >
          🔊 重聽一次
        </button>
      </div>

      {isTracingQuestion(current) ? (
        <div className="rounded-[34px] border border-[#fff1b8] bg-[#fff8dd] p-4 text-center shadow-inner">
          <div className="rounded-[28px] bg-white/88 px-5 py-6 shadow-sm">
            <p className="rounded-full bg-[#e9f4ff] px-4 py-2 text-base font-black text-[#1766e6]">認識這個朋友</p>
            <div className="mt-4 text-[76px] font-black leading-none text-[#1766e6]">
              {current.learning_item?.content ?? current.correct_answer[0]}
            </div>
          </div>
          <button
            type="button"
            onTouchEnd={(event) => {
              event.preventDefault();
              handleTracingDone();
            }}
            onPointerUp={(event) => {
              event.preventDefault();
              handleTracingDone();
            }}
            onClick={handleTracingDone}
            className={`mt-4 h-16 w-full touch-manipulation select-none rounded-[26px] text-xl font-black shadow-sm active:scale-[0.98] ${answeredCurrent ? 'bg-[#dff8ef] text-emerald-900 answer-pop' : 'kid-blue-button'}`}
          >
            {answeredCurrent ? '完成了！' : '我認識了'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const correct = isAnswerCorrect(current, option);
            const showState = answeredCurrent && (isSelected || correct);

            return (
              <button
                key={option}
                type="button"
                onTouchEnd={(event) => {
                  event.preventDefault();
                  handleSelect(option);
                }}
                onPointerUp={(event) => {
                  event.preventDefault();
                  handleSelect(option);
                }}
                onClick={() => handleSelect(option)}
                className={`flex min-h-[96px] touch-manipulation select-none items-center justify-center rounded-[32px] border-2 text-[44px] font-black shadow-[0_12px_22px_rgba(30,64,175,0.09)] transition active:scale-[0.98] ${
                  showState && correct
                    ? 'answer-pop border-emerald-200 bg-[#dff8ef] text-emerald-900'
                    : showState && isSelected
                      ? 'answer-pop border-[#ffd95a] bg-[#fff2b7] text-[#193153]'
                      : 'border-[#cbe4ff] bg-white text-[#1766e6]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {answeredCurrent ? (
        <div className={`answer-pop rounded-[30px] border border-white/70 p-4 text-center shadow-sm ${isTracingQuestion(current) || currentIsCorrect ? 'bg-[#dff8ef]' : 'bg-[#fff2b7]'}`}>
          <p className="text-2xl font-black text-[#172033]">{isTracingQuestion(current) || currentIsCorrect ? '太棒了！找到朋友了 ⭐' : '差一點點，我們再記一次'}</p>
          <p className="mt-2 text-base font-bold leading-relaxed text-[#5f6f89]">
            {isTracingQuestion(current) || currentIsCorrect ? encouragement(current) : `${encouragement(current)}，下次一定更快！`}
          </p>
        </div>
      ) : null}

      {answeredCurrent ? (
        <div className="scroll-mb-[calc(env(safe-area-inset-bottom)+120px)] pb-[calc(env(safe-area-inset-bottom)+18px)] pt-1">
          <button
            ref={ctaRef}
            type="button"
            onClick={goNext}
            disabled={!selectedAnswer || isPending}
            className="min-h-[56px] w-full touch-manipulation select-none rounded-[28px] bg-gradient-to-r from-[#2f8cff] to-[#1766e6] text-xl font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition active:scale-[0.98] disabled:from-[#e5edf7] disabled:to-[#e5edf7] disabled:text-[#aab4c2] disabled:shadow-none"
          >
            {isPending ? '儲存中...' : currentIndex === questions.length - 1 ? '完成練習，去拿獎勵' : '下一題 →'}
          </button>
        </div>
      ) : null}
    </section>
  );
}
