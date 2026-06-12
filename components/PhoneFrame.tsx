import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="kid-shell safe-screen">
      <div className="kid-stack">{children}</div>
    </main>
  );
}
