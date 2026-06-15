import type { ReactNode } from 'react';

type PhoneFrameProps = {
  children: ReactNode;
  variant?: 'kid' | 'admin';
};

export function PhoneFrame({ children, variant = 'kid' }: PhoneFrameProps) {
  if (variant === 'admin') {
    return (
      <main className="admin-shell safe-screen">
        <div className="flex min-h-[calc(100dvh-88px)] min-w-0 flex-col gap-5 overflow-x-hidden">{children}</div>
      </main>
    );
  }

  return (
    <main className="kid-shell safe-screen">
      <div className="pointer-events-none fixed left-3 top-20 -z-10 text-5xl opacity-30 blur-[0.2px] animate-float-card sm:left-[calc(50%_-_232px)]">☁️</div>
      <div className="pointer-events-none fixed right-4 top-36 -z-10 text-4xl opacity-40 confetti-sparkle sm:right-[calc(50%_-_232px)]">⭐</div>
      <div className="kid-stack">{children}</div>
    </main>
  );
}
