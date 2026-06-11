/**
 * Application mode configuration.
 *
 * During the current family testing stage, practice is repeatable by default.
 * Set NEXT_PUBLIC_PRACTICE_TEST_MODE=false when strict once-per-day behavior should be restored.
 */
export function isPracticeTestMode(): boolean {
  const rawValue = process.env.NEXT_PUBLIC_PRACTICE_TEST_MODE ?? process.env.PRACTICE_TEST_MODE;
  return rawValue !== 'false';
}
