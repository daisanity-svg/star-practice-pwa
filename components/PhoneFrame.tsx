import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="safe-screen mx-auto flex w-full max-w-[430px] flex-col px-5 py-6">
      {children}
    </main>
  );
}
