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
  return question.practice_mode === 'tracing';
}

function isAnswerCorrect(question: GeneratedQuestion, selected: string) {
  return question.correct_answer.includes(selected);
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
  const answeredCurrent = selectedAnswer !== null;
  const currentIsCorrect = selectedAnswer ? isAnswerCorrect(current, selectedAnswer) : false;

  function speakQuestion() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(current.question_text);
    utterance.lang = current.learning_item?.type?.includes('english') ? 'en-US' : 'zh-TW';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function buildAnswer(selected: string, forcedCorrect?: boolean): SubmittedPracticeAnswer {
    const isCorrect = forcedCorrect ?? isAnswerCorrect(current, selected);

    return {
      child_id: current.child_id,
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
      <section className="kid-card flex min-h-[620px] flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl">🌙</div>
        <h1 className="mt-6 text-4xl font-black text-ink">今天還沒有題目</h1>
        <p className="mt-4 text-xl font-bold text-slate-500">請到家長後台新增學習項目與每日題目。</p>
        <div className="mt-8 w-full">
          <KidButton href="/parent/dashboard" tone="white">去家長後台</KidButton>
        </div>
      </section>
    );
  }

  if (practiceRecordId) {
    return (
      <section className="kid-card flex min-h-[620px] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-[42px] bg-butter text-7xl shadow-sm animate-bounce-soft">⭐</div>
        <p className="mt-8 text-base font-bold text-grape">Practice Complete</p>
        <h1 className="mt-2 text-4xl font-black leading-tight text-ink">今天練習完成！</h1>
        <p className="mt-4 text-xl font-bold leading-relaxed text-slate-500">
          答對 {completionStats?.correct ?? 0} 題，準備打開今天的驚喜卡包。
        </p>
        {completionMessage ? <p className="mt-4 rounded-3xl bg-white px-4 py-3 text-base font-bold text-slate-500 shadow-sm">{completionMessage}</p> : null}
        <div className="mt-10 w-full space-y-3">
          <KidButton href={`/reward?practice_record_id=${practiceRecordId}`} tone="butter">去拿獎勵</KidButton>
          <KidButton href="/collection" tone="white">先看收納包</KidButton>
        </div>
      </section>
    );
  }

  return (
    <section className="kid-card flex flex-1 flex-col p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-mint px-4 py-2 text-lg font-black text-emerald-900">
          {current.learning_item?.type?.includes('english') ? '英文' : '注音'}
        </span>
        <div className="rounded-full bg-white px-4 py-2 text-lg font-black text-grape shadow-sm">第 {progressText} 題</div>
      </div>

      <div className="mt-6 rounded-[32px] bg-white p-6 text-center shadow-sm">
        <button
          type="button"
          onClick={speakQuestion}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-skysoft text-3xl shadow-sm active:scale-[0.98]"
          aria-label="播放題目聲音"
        >
          🔊
        </button>
        <p className="text-3xl font-black leading-tight text-ink">{current.question_text}</p>
        <p className="mt-4 text-lg font-bold leading-relaxed text-slate-500">
          {current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}
        </p>
      </div>

      {isTracingQuestion(current) ? (
        <div className="mt-7 rounded-[32px] bg-cream p-5 text-center shadow-inner">
          <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border-4 border-dashed border-white bg-white/70 text-[132px] font-black text-slate-300">
            {current.learning_item?.content ?? current.correct_answer[0]}
          </div>
          <button
            type="button"
            onClick={handleTracingDone}
            className={`mt-5 h-20 w-full rounded-[30px] text-2xl font-black shadow-sm active:scale-[0.98] ${answeredCurrent ? 'bg-mint text-emerald-900' : 'bg-butter text-amber-900'}`}
          >
            {answeredCurrent ? '描好了！' : '我描好了'}
          </button>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4">
          {current.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const correct = isAnswerCorrect(current, option);
            const showState = answeredCurrent && (isSelected || correct);

            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(option)}
                className={`flex h-24 items-center justify-center rounded-[28px] text-5xl font-black shadow-sm active:scale-[0.98] ${
                  showState && correct
                    ? 'bg-mint text-emerald-900'
                    : showState && isSelected
                      ? 'bg-rose-100 text-rose-500'
                      : 'bg-white text-ink'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {answeredCurrent ? (
        <div className="mt-6 rounded-[30px] bg-white p-5 text-center shadow-sm">
          <p className="text-2xl font-black text-ink">
            {isTracingQuestion(current) || currentIsCorrect ? '太棒了！' : '差一點點，再記一次'}
          </p>
          <p className="mt-2 text-lg font-bold text-slate-500">
            {isTracingQuestion(current) || currentIsCorrect
              ? `你找到 ${current.memory_hook?.keyword ?? '這個朋友'} 的 ${current.learning_item?.content ?? current.correct_answer[0]}！`
              : `${current.memory_hook?.keyword ?? '這題'} 的答案是 ${current.correct_answer.join('、')}`}
          </p>
        </div>
      ) : null}

      <div className="mt-auto space-y-3 pt-8">
        <KidButton tone="white" onClick={speakQuestion}>重聽一次</KidButton>
        <button
          type="button"
          disabled={!answeredCurrent || isPending}
          onClick={goNext}
          className="block min-h-[64px] w-full rounded-[28px] bg-butter px-6 py-4 text-center text-xl font-black text-amber-900 shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '正在記錄...' : currentIndex === questions.length - 1 ? '完成今日練習' : '下一題'}
        </button>
        <Link href="/" className="block text-center text-base font-bold text-slate-400">先回首頁</Link>
      </div>
    </section>
  );
}
