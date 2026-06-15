import type { ReactNode } from 'react';

export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className={`kid-shell safe-screen ${className}`.trim()}>
      <div className="kid-stack">{children}</div>
    </main>
  );
}
