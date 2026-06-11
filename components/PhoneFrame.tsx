import type { ReactNode } from 'react';

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <main className="kid-shell">
      <div className="kid-stack">{children}</div>
    </main>
  );
}
