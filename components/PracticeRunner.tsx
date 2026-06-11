'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
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
  if (question.practice_mode === 'tracing') return '✍️';
  if (question.practice_mode === 'intro') return '👋';
  if (question.learning_item?.type?.includes('english')) return '🔤';
  return 'ㄅ';
}

function shortModeLabel(question: GeneratedQuestion) {
  if (question.practice_mode === 'listening') return '聽一聽';
  if (question.practice_mode === 'tracing') return '描一描';
  if (question.practice_mode === 'intro') return '認識它';
  return '找朋友';
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

  const current = questions[currentIndex];
  const progressText = `${Math.min(currentIndex + 1, questions.length)} / ${questions.length}`;
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100) : 0;
  const answeredCurrent = selectedAnswer !== null;
  const currentIsCorrect = selectedAnswer ? isAnswerCorrect(current, selectedAnswer) : false;

  function speakQuestion() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(current.question_text);
    utterance.lang = current.learning_item?.type?.includes('english') ? 'en-US' : 'zh-TW';
    utterance.rate = 0.82;
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
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
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
      <section className="kid-card flex min-h-[610px] flex-col items-center justify-center overflow-hidden p-6 text-center">
        <div className="relative flex h-36 w-36 items-center justify-center rounded-[46px] bg-gradient-to-br from-[#e9e5ff] to-[#fff1bd] text-7xl shadow-[0_18px_35px_rgba(109,93,252,0.16)]">
          🌙
          <span className="absolute -right-2 -top-2 text-4xl">✨</span>
        </div>
        <p className="mt-8 rounded-full bg-[#f4f0ff] px-5 py-2 text-base font-black text-[#5b4be8]">今天休息一下</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-ink">今天已經完成囉</h1>
        <p className="mt-4 text-xl font-bold leading-relaxed text-slate-500">明天會有新的字母朋友，也可以到後台新增更多練習內容。</p>
        <div className="mt-8 w-full space-y-3">
          <KidButton href="/collection" tone="butter">🎒 看我的收納包</KidButton>
          <KidButton href="/parent/dashboard" tone="white">家長後台</KidButton>
        </div>
      </section>
    );
  }

  if (practiceRecordId) {
    return (
      <section className="kid-card flex min-h-[610px] flex-col items-center justify-center overflow-hidden p-6 text-center">
        <div className="relative flex h-40 w-40 items-center justify-center rounded-[50px] bg-gradient-to-br from-[#fff0b8] to-[#d9fae8] text-8xl shadow-[0_20px_42px_rgba(245,158,11,0.18)] animate-bounce-soft">
          ⭐
          <span className="absolute -left-3 top-4 text-3xl">✨</span>
          <span className="absolute -right-3 bottom-5 text-3xl">🎉</span>
        </div>
        <p className="mt-8 rounded-full bg-[#f4f0ff] px-5 py-2 text-base font-black text-[#5b4be8]">完成任務</p>
        <h1 className="mt-4 text-4xl font-black leading-tight text-ink">今天練習完成！</h1>
        <p className="mt-4 text-xl font-bold leading-relaxed text-slate-500">
          答對 {completionStats?.correct ?? 0} 題，準備打開今天的驚喜卡包。
        </p>
        {completionMessage ? <p className="mt-4 rounded-[26px] bg-white px-5 py-4 text-base font-bold text-slate-500 shadow-sm">{completionMessage}</p> : null}
        <div className="mt-10 w-full space-y-3">
          <KidButton href={`/reward?practice_record_id=${practiceRecordId}`} tone="primary">🎁 去拿獎勵</KidButton>
          <KidButton href="/collection" tone="white">先看收納包</KidButton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col">
      <div className="rounded-[36px] bg-gradient-to-br from-[#6d5dfc] via-[#7f6cff] to-[#9b8cff] p-5 text-white shadow-[0_20px_46px_rgba(109,93,252,0.28)]">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-black text-white">
            {shortModeLabel(current)}
          </span>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#5b4be8]">第 {progressText} 題</span>
        </div>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-[#fff0b8] transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white/20 text-4xl font-black">
            {questionEmoji(current)}
          </div>
          <div>
            <p className="text-sm font-black text-white/70">今天的字母朋友</p>
            <p className="text-3xl font-black leading-none">{current.learning_item?.content ?? current.correct_answer[0]}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[38px] bg-white p-5 text-center shadow-[0_16px_36px_rgba(77,68,111,0.1)]">
        <button
          type="button"
          onClick={speakQuestion}
          className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-[34px] bg-[#dff0ff] text-5xl shadow-sm active:scale-[0.98]"
          aria-label="播放題目聲音"
        >
          🔊
        </button>
        <p className="text-[34px] font-black leading-tight text-ink">{current.question_text}</p>
        <p className="mt-4 rounded-[26px] bg-[#fff8ec] px-4 py-3 text-lg font-bold leading-relaxed text-slate-500">
          {current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}
        </p>
      </div>

      {isTracingQuestion(current) ? (
        <div className="mt-5 rounded-[38px] bg-[#fff6d7] p-5 text-center shadow-inner">
          <div className="relative flex min-h-[285px] items-center justify-center overflow-hidden rounded-[32px] border-4 border-dashed border-white bg-white/75 text-[150px] font-black text-slate-300">
            <span className="absolute left-4 top-4 rounded-full bg-[#f4f0ff] px-4 py-2 text-base font-black text-[#5b4be8]">用手指描</span>
            {current.learning_item?.content ?? current.correct_answer[0]}
          </div>
          <button
            type="button"
            onClick={handleTracingDone}
            className={`mt-5 h-20 w-full rounded-[30px] text-2xl font-black shadow-sm active:scale-[0.98] ${answeredCurrent ? 'bg-[#d9fae8] text-emerald-900' : 'bg-[#fff0b8] text-amber-900'}`}
          >
            {answeredCurrent ? '完成了！' : current.practice_mode === 'intro' ? '我認識了' : '我描好了'}
          </button>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4">
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const correct = isAnswerCorrect(current, option);
            const showState = answeredCurrent && (isSelected || correct);

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex h-32 items-center justify-center rounded-[34px] border-2 text-5xl font-black shadow-[0_12px_26px_rgba(77,68,111,0.1)] transition active:scale-[0.98] ${
                  showState && correct
                    ? 'border-emerald-200 bg-[#d9fae8] text-emerald-900'
                    : showState && isSelected
                      ? 'border-rose-200 bg-rose-100 text-rose-500'
                      : 'border-white bg-white text-ink'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {answeredCurrent ? (
        <div className={`mt-5 rounded-[32px] p-5 text-center shadow-sm ${isTracingQuestion(current) || currentIsCorrect ? 'bg-[#d9fae8]' : 'bg-[#fff1bd]'}`}>
          <p className="text-2xl font-black text-ink">
            {isTracingQuestion(current) || currentIsCorrect ? '太棒了！' : '差一點點，再記一次'}
          </p>
          <p className="mt-2 text-lg font-bold text-slate-600">
            {isTracingQuestion(current) || currentIsCorrect
              ? `你找到 ${current.memory_hook?.keyword ?? '這個朋友'} 的 ${current.learning_item?.content ?? current.correct_answer[0]}！`
              : `${current.memory_hook?.keyword ?? '這題'} 的答案是 ${current.correct_answer.join('、')}`}
          </p>
        </div>
      ) : null}

      <div className="mt-auto space-y-3 pt-6">
        <KidButton tone="white" onClick={speakQuestion}>🔊 重聽一次</KidButton>
        <button
          type="button"
          disabled={!answeredCurrent || isPending}
          onClick={goNext}
          className="block min-h-[72px] w-full rounded-[30px] bg-gradient-to-r from-[#fff0b8] to-[#ffe08a] px-6 py-4 text-center text-xl font-black text-amber-950 shadow-[0_12px_26px_rgba(245,158,11,0.16)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '儲存中...' : currentIndex < questions.length - 1 ? '下一題 →' : '完成今天練習'}
        </button>
        <Link href="/" className="block py-2 text-center text-base font-black text-slate-400">
          回首頁
        </Link>
      </div>
    </section>
  );
}
