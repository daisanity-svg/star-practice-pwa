'use client';

import { ReactNode, useRef, useState, useTransition } from 'react';

type ActionResult = { ok?: boolean; message?: string } | void;

type Props = {
  action: (formData: FormData) => Promise<ActionResult>;
  children: ReactNode;
  successReset?: boolean;
  confirmMessage?: string;
  successMessage?: string;
  className?: string;
};

export function AdminActionForm({ action, children, successReset, confirmMessage, successMessage, className }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const result = await action(formData);
          const ok = Boolean(result?.ok);
          const message = result?.message || (ok ? successMessage || '操作完成' : '操作失敗，請稍後再試。');
          setState({ ok, message });
          if (ok && successReset) formRef.current?.reset();
        });
      }}
    >
      <fieldset disabled={isPending} className="contents">
        {children}
      </fieldset>
      {state ? (
        <p className={`mt-3 rounded-2xl px-4 py-3 text-sm font-black ${state.ok ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function AdminSubmitButton({ children, pendingLabel, className }: { children: ReactNode; pendingLabel?: string; className: string }) {
  return (
    <button className={className} data-pending-label={pendingLabel}>
      <span className="group-disabled:hidden">{children}</span>
      <span className="hidden group-disabled:inline">{pendingLabel || '處理中...'}</span>
    </button>
  );
}
