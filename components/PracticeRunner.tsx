'use client';

import { useState, useTransition } from 'react';
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
  if (question.learning_item?.type?.includes('english')) return 'A';
  return question.learning_item?.content ?? 'ㄅ';
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
      <section className="kid-card flex min-h-[520px] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-[36px] bg-gradient-to-br from-[#dbeafe] to-[#fff1b8] text-6xl shadow-sm">🌙</div>
        <p className="mt-6 rounded-full bg-[#e9f4ff] px-5 py-2 text-base font-black text-[#1766e6]">今天休息一下</p>
        <h1 className="mt-4 text-3xl font-black leading-tight text-[#172033]">今天已經完成囉</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-[#5f6f89]">明天會有新的字母朋友。</p>
        <div className="mt-7 w-full space-y-3">
          <KidButton href="/collection" tone="sky">🎒 看收納包</KidButton>
          <KidButton href="/parent/dashboard" tone="white">家長後台</KidButton>
        </div>
      </section>
    );
  }

  if (practiceRecordId) {
    return (
      <section className="kid-card flex min-h-[520px] flex-col items-center justify-center p-6 text-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-[42px] bg-gradient-to-br from-[#dbeafe] to-[#fff1b8] text-7xl shadow-sm animate-bounce-soft">
          ⭐
          <span className="absolute -right-3 bottom-5 text-3xl">🎉</span>
        </div>
        <p className="mt-7 rounded-full bg-[#e9f4ff] px-5 py-2 text-base font-black text-[#1766e6]">完成任務</p>
        <h1 className="mt-4 text-3xl font-black leading-tight text-[#172033]">今天練習完成！</h1>
        <p className="mt-3 text-lg font-bold leading-relaxed text-[#5f6f89]">答對 {completionStats?.correct ?? 0} 題，準備打開驚喜卡包。</p>
        {completionMessage ? <p className="mt-4 rounded-[24px] bg-white px-5 py-4 text-base font-bold text-[#5f6f89] shadow-sm">{completionMessage}</p> : null}
        <div className="mt-8 w-full space-y-3">
          <KidButton href={`/reward?practice_record_id=${practiceRecordId}`} tone="primary">🎁 去拿獎勵</KidButton>
          <KidButton href="/collection" tone="white">先看收納包</KidButton>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[calc(100dvh-170px)] flex-col gap-3">
      <div className="kid-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#2f8cff]">第 {progressText} 題</p>
            <h2 className="mt-1 text-xl font-black text-[#172033]">{shortModeLabel(current)}</h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#fff0b8] text-2xl">⭐</div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e6eef9]">
          <div className="h-full rounded-full bg-gradient-to-r from-[#2f8cff] to-[#ffd95a] transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="kid-card overflow-hidden p-4 text-center">
        <div className="mx-auto flex h-[88px] w-[88px] items-center justify-center rounded-[30px] bg-gradient-to-br from-[#eaf5ff] to-[#fff8dd] text-[44px] font-black text-[#1766e6] shadow-sm">
          {questionEmoji(current)}
        </div>
        <p className="mt-4 text-sm font-black text-[#2f8cff]">今天的字母朋友</p>
        <h1 className="mt-2 text-[31px] font-black leading-tight tracking-[-0.04em] text-[#172033]">{current.question_text}</h1>
        <p className="mt-3 rounded-[22px] bg-[#f5f9ff] px-4 py-3 text-[15px] font-bold leading-relaxed text-[#5f6f89]">
          {current.memory_hook?.sentence ?? '聽一聽，再找出正確的朋友'}
        </p>
        <button
          type="button"
          onClick={speakQuestion}
          className="mx-auto mt-4 flex min-h-[48px] touch-manipulation select-none items-center justify-center rounded-full bg-[#e9f4ff] px-5 text-base font-black text-[#1766e6] shadow-sm active:scale-[0.98]"
          aria-label="播放題目聲音"
        >
          🔊 重聽一次
        </button>
      </div>

      {isTracingQuestion(current) ? (
        <div className="rounded-[30px] bg-[#fff8dd] p-4 text-center shadow-inner">
          <div className="relative flex min-h-[210px] items-center justify-center overflow-hidden rounded-[26px] border-4 border-dashed border-[#dbeafe] bg-white/80 text-[112px] font-black text-blue-100">
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
            className={`mt-4 h-16 w-full touch-manipulation select-none rounded-[26px] text-xl font-black shadow-sm active:scale-[0.98] ${answeredCurrent ? 'bg-[#dff8ef] text-emerald-900' : 'kid-blue-button'}`}
          >
            {answeredCurrent ? '完成了！' : current.practice_mode === 'intro' ? '我認識了' : '我描好了'}
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
                className={`flex h-[86px] touch-manipulation select-none items-center justify-center rounded-[26px] border-2 text-[40px] font-black shadow-[0_10px_20px_rgba(30,64,175,0.08)] transition active:scale-[0.98] ${
                  showState && correct
                    ? 'border-emerald-200 bg-[#dff8ef] text-emerald-900'
                    : showState && isSelected
                      ? 'border-rose-200 bg-rose-100 text-rose-500'
                      : 'border-[#d7e8ff] bg-white text-[#1766e6]'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {answeredCurrent ? (
        <div className={`rounded-[26px] p-4 text-center shadow-sm ${isTracingQuestion(current) || currentIsCorrect ? 'bg-[#dff8ef]' : 'bg-[#fff2b7]'}`}>
          <p className="text-xl font-black text-[#172033]">{isTracingQuestion(current) || currentIsCorrect ? '太棒了！' : '差一點點，再記一次'}</p>
          <p className="mt-1 text-base font-bold text-[#5f6f89]">
            {isTracingQuestion(current) || currentIsCorrect
              ? `你找到 ${current.memory_hook?.keyword ?? '這個朋友'} 的 ${current.learning_item?.content ?? current.correct_answer[0]}！`
              : `${current.memory_hook?.keyword ?? '這題'} 的答案是 ${current.correct_answer.join('、')}`}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!answeredCurrent || isPending}
        onClick={goNext}
        className="mt-auto block min-h-[62px] w-full touch-manipulation select-none rounded-[28px] bg-gradient-to-r from-[#2f8cff] to-[#1766e6] px-5 text-xl font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)] transition active:scale-[0.99] disabled:bg-none disabled:bg-[#e8eef6] disabled:text-[#aab4c2] disabled:shadow-none"
      >
        {isPending ? '記錄中...' : currentIndex === questions.length - 1 ? '完成練習' : '下一題 →'}
      </button>
    </section>
  );
}
