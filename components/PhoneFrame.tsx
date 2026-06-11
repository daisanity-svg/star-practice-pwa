import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="safe-screen mx-auto flex w-full max-w-[430px] min-w-0 flex-col overflow-x-hidden px-3 pb-28 pt-3 sm:px-4 sm:pt-5">
      <div className="flex min-h-[calc(100svh-8rem)] min-w-0 flex-col overflow-x-hidden">
        {children}
      </div>
    </main>
  );
}
