import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="safe-screen mx-auto flex w-full max-w-[430px] min-w-0 flex-col overflow-x-hidden px-4">
      <div className="flex min-h-[calc(100dvh-128px)] min-w-0 flex-col gap-4 overflow-x-hidden">
        {children}
      </div>
    </main>
  );
}
