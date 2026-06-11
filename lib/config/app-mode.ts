/**
 * Application mode configuration
 * Controls test vs. production behavior
 */

export function isPracticeTestMode(): boolean {
  if (typeof window === 'undefined') {
    // Server-side: check environment variable
    return process.env.NEXT_PUBLIC_PRACTICE_TEST_MODE === 'true';
  }

  // Client-side: check environment variable
  return process.env.NEXT_PUBLIC_PRACTICE_TEST_MODE === 'true';
}
