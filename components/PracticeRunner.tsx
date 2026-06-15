'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { completePracticeSession } from '@/lib/actions/practice';
import type { GeneratedQuestion, SubmittedPracticeAnswer } from '@/lib/types';
import { KidButton } from '@/components/KidButton';

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

function questionEmoji(question: GeneratedQuestion) {
  if (question.practice_mode === 'listening') return '👂';
  if (question.practice_mode === 'tracing') return '✍️';
  if (question.practice_mode === 'intro') return '👋';
  if (question.learning_item?.type?.includes('english')) return '🔤';
  return 'ㄅ';
}

function shortModeLabel(question: GeneratedQuestion) {
  if (question.practice_mode === 'listening') return '聽聲音找朋友';
  if (question.practice_mode === 'tracing') return '用手指描一描';
  if (question.practice_mode === 'intro') return '認識新朋友';
  return '找出正確朋友';
}

function encouragement(question: GeneratedQuestion) {
  const keyword = question.memory_hook?.keyword ?? question.learning_item?.display_text ?? '這個字';
  const target = question.learning_item?.content ?? question.correct_answer[0] ?? '';
  return `${keyword} 的朋友是 ${target}`;
}

export function PracticeRunner({ questions, practiceMode = 'production' }: PracticeRunnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<SubmittedPracticeAnswer[]>([]);
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now());
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionStats, setCompletionStats] = useState<CompletionStats | null>(null);
  const [practiceRecordId, setPracticeRecordId] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const completionStartedRef = useRef(false);
  const redirectedRef = useRef(false);
  const ctaRef = useRef<HTMLButtonElement | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const current = questions[currentIndex];
  const answeredCurrent = selectedAnswer !== null;
  const currentIsCorrect = current && selectedAnswer ? isAnswerCorrect(current, selectedAnswer) : false;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100) : 0;

  useEffect(() => {
    if (!practiceRecordId || practiceMode !== 'production' || redirectedRef.current) return;
    redirectedRef.current = true;
    setIsRedirecting(true);
    const timer = window.setTimeout(() => {
      router.replace(`/reward?practice_record_id=${practiceRecordId}`);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [practiceMode, practiceRecordId, router]);

  useEffect(() => {
    if (!selectedAnswer) return;
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedAnswer]);

  function speakQuestion() {
    if (!current || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(current.question_text);
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
    if (answeredCurrent || practiceRecordId || isCompleting || isRedirecting) return;
    setSelectedAnswer(option);
  }

  function handleTracingDone() {
    if (answeredCurrent || practiceRecordId || isCompleting || isRedirecting) return;
    setSelectedAnswer(current.correct_answer[0] ?? current.learning_item?.content ?? 'done');
  }

  function goNext() {
    if (!selectedAnswer || isCompleting || isRedirecting || completionStartedRef.current) return;

    const answer = buildAnswer(selectedAnswer, isTracingQuestion(current) ? true : undefined);
    const nextAnswers = [...answers, answer];
    setAnswers(nextAnswers);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((value) => value + 1);
      setQuestionStartedAt(Date.now());
      return;
    }

    completionStartedRef.current = true;
    setIsCompleting(true);
    setCompletionError(null);
    const correct = nextAnswers.filter((item) => item.is_correct).length;
    setCompletionStats({ total: nextAnswers.length, correct, wrong: nextAnswers.length - correct });

    startTransition(async () => {
      const result = await completePracticeSession(nextAnswers);
      setCompletionMessage(result.message);
      if (result.ok && result.practice_record_id) {
        setPracticeRecordId(result.practice_record_id);
      } else {
        completionStartedRef.current = false;
        setCompletionError(result.message || '練習完成資料儲存失敗，請再試一次。');
        setIsCompleting(false);
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
          答對 {completionStats?.correct ?? 0} / {completionStats?.total ?? questions.length} 題，{practiceMode === 'production' ? '即將帶你去打開小禮物。' : '準備打開驚喜卡包。'}
        </p>
        {completionMessage ? <p className="mt-4 rounded-[24px] bg-white px-5 py-4 text-base font-bold text-[#5f6f89] shadow-sm">{completionMessage}</p> : null}
        <div className="mt-8 w-full space-y-3">
          {practiceMode === 'production' ? (
            <p className="rounded-[24px] bg-[#e9f4ff] px-5 py-4 text-base font-black text-[#1766e6]">{isRedirecting ? '正在前往今日獎勵…' : '準備前往今日獎勵…'}</p>
          ) : (
            <>
              <KidButton href={rewardHref} tone="primary">🎁 去拿獎勵</KidButton>
              <KidButton href="/collection" tone="white">🎒 先看收納包</KidButton>
            </>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-3">
      {practiceMode === 'test' ? (
        <div className="rounded-[24px] bg-purple-100 px-4 py-3 text-center text-sm font-black text-purple-700 ring-1 ring-purple-200">測試模式：題目與抽卡可重複測試</div>
      ) : null}
      <div className="kid-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#2f8cff]">第 {currentIndex + 1} / {questions.length} 題</p>
            <h2 className="mt-1 text-xl font-black text-[#172033]">{shortModeLabel(current)}</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#fff0b8] text-2xl">⭐</div>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
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

      <div className="kid-card-strong overflow-hidden p-4 text-center">
        <div className="learning-orb mx-auto flex h-[82px] w-[82px] items-center justify-center rounded-[28px] text-[38px] font-black text-[#1766e6] shadow-sm">
          {questionEmoji(current)}
        </div>
        <p className="mt-3 text-xs font-black text-[#2f8cff]">今天的字母朋友</p>
        <h1 className="mt-1 text-[26px] font-black leading-tight tracking-[-0.04em] text-[#172033]">{current.question_text}</h1>
        <p className="mt-2 line-clamp-2 rounded-[20px] bg-[#f5f9ff] px-3 py-2 text-sm font-bold leading-relaxed text-[#5f6f89]">
          {current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}
        </p>
        <button
          type="button"
          onClick={speakQuestion}
          className="mx-auto mt-3 flex min-h-[44px] touch-manipulation select-none items-center justify-center rounded-full bg-[#e9f4ff] px-6 text-base font-black text-[#1766e6] shadow-sm active:scale-[0.98]"
          aria-label="播放題目聲音"
        >
          🔊 重聽一次
        </button>
      </div>

      {isTracingQuestion(current) ? (
        <div className="rounded-[28px] bg-[#fff8dd] p-3 text-center shadow-inner">
          <div className="relative flex min-h-[150px] items-center justify-center overflow-hidden rounded-[28px] border-4 border-dashed border-[#b9dcff] bg-white/88 text-[84px] font-black text-blue-100">
            <span className="absolute left-4 top-4 rounded-full bg-[#e9f4ff] px-3 py-1.5 text-sm font-black text-[#1766e6]">用手指描</span>
            {current.learning_item?.content ?? current.correct_answer[0]}
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
            className={`mt-3 h-12 w-full touch-manipulation select-none rounded-[26px] text-xl font-black shadow-sm active:scale-[0.98] ${answeredCurrent ? 'bg-[#dff8ef] text-emerald-900 answer-pop' : 'kid-blue-button'}`}
          >
            {answeredCurrent ? '完成了！' : current.practice_mode === 'intro' ? '我認識了' : '我描好了'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
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
                className={`flex min-h-[74px] touch-manipulation select-none items-center justify-center rounded-[24px] border-2 text-[36px] font-black shadow-[0_10px_20px_rgba(30,64,175,0.08)] transition active:scale-[0.98] ${
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

      {completionError ? (
        <div className="answer-pop rounded-[28px] bg-red-50 p-4 text-center text-red-700 shadow-sm ring-1 ring-red-100">
          <p className="text-xl font-black">儲存失敗</p>
          <p className="mt-2 text-sm font-bold leading-relaxed">{completionError}</p>
        </div>
      ) : null}

      {answeredCurrent ? (
        <div className={`answer-pop rounded-[24px] p-3 text-center shadow-sm ${isTracingQuestion(current) || currentIsCorrect ? 'bg-[#dff8ef]' : 'bg-[#fff2b7]'}`}>
          <p className="text-xl font-black text-[#172033]">{isTracingQuestion(current) || currentIsCorrect ? '太棒了！找到朋友了 ⭐' : '差一點點，我們再記一次'}</p>
          <p className="mt-1 text-sm font-bold leading-relaxed text-[#5f6f89]">
            {isTracingQuestion(current) || currentIsCorrect ? encouragement(current) : `${encouragement(current)}，下次一定更快！`}
          </p>
        </div>
      ) : null}

      <button
        ref={ctaRef}
        type="button"
        onClick={goNext}
        disabled={!selectedAnswer || isPending || isCompleting || isRedirecting}
        className="sticky z-30 mt-2 min-h-[56px] touch-manipulation select-none rounded-[28px] bg-gradient-to-r from-[#2f8cff] to-[#1766e6] text-xl font-black text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition active:scale-[0.98] disabled:from-[#e5edf7] disabled:to-[#e5edf7] disabled:text-[#aab4c2] disabled:shadow-none bottom-[calc(env(safe-area-inset-bottom)+88px)]"
      >
        {isCompleting || isPending ? '練習完成，準備打開小禮物...' : currentIndex === questions.length - 1 ? '完成練習，去拿獎勵' : '下一題 →'}
      </button>
    </section>
  );
}
