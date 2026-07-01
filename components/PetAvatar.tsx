'use client';

type PetAvatarProps = {
  growthLevel?: number;
};

export function PetAvatar({ growthLevel = 1 }: PetAvatarProps) {
  const tier = growthLevel <= 1 ? 'egg' : growthLevel <= 3 ? 'young' : 'guardian';

  return (
    <div className="companion-bar-avatar" aria-hidden="true">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        {tier === 'egg' ? (
          <>
            <ellipse cx="18" cy="20" rx="12" ry="14" fill="url(#eggGrad)" />
            <circle cx="14" cy="17" r="2" fill="#1f5ef6" />
            <circle cx="24" cy="17" r="2" fill="#1f5ef6" />
            <path d="M15 24 Q18 28 21 24" stroke="#ffb800" strokeWidth="2" strokeLinecap="round" fill="none" />
            <defs>
              <linearGradient id="eggGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#ffd95a" />
                <stop offset="100%" stopColor="#ffb800" />
              </linearGradient>
            </defs>
          </>
        ) : (
          <>
            <circle cx="18" cy="18" r={tier === 'young' ? 14 : 16} fill="url(#youngGrad)" />
            <circle cx="12" cy="16" r={tier === 'young' ? 2.5 : 3} fill="#1f5ef6" />
            <circle cx="24" cy="16" r={tier === 'young' ? 2.5 : 3} fill="#1f5ef6" />
            <path d="M14 24 Q18 28 22 24" stroke="#ffb800" strokeWidth={tier === 'young' ? 2.5 : 3} strokeLinecap="round" fill="none" />
            <path d="M6 12 L2 8" stroke="#ffd95a" strokeWidth={tier === 'young' ? 2 : 3} strokeLinecap="round" />
            <path d="M30 12 L34 8" stroke="#ffd95a" strokeWidth={tier === 'young' ? 2 : 3} strokeLinecap="round" />
            {tier === 'guardian' && (
              <>
                <path d="M10 6 L8 2" stroke="#ffd95a" strokeWidth="2" strokeLinecap="round" />
                <path d="M26 6 L28 2" stroke="#ffd95a" strokeWidth="2" strokeLinecap="round" />
              </>
            )}
            <defs>
              <linearGradient id="youngGrad" x1="0" y1="0" x2="36" y2="36">
                <stop offset="0%" stopColor="#ffd95a" />
                <stop offset="100%" stopColor="#ffb800" />
              </linearGradient>
            </defs>
          </>
        )}
      </svg>
    </div>
  );
}
