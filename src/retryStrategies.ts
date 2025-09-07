/**
 * Exponential backoff strategy
 * delay = baseDelay * 2^attempt, capped at maxDelay
 */
export function exponentialBackoff(baseDelay: number = 5, maxDelay: number = 900) {
  return (attempt: number): number =>
    Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
}

/**
 * Linear backoff strategy
 * delay = step * attempt, capped at maxDelay
 */
export function linearBackoff(step: number = 5, maxDelay: number = 900) {
  return (attempt: number): number =>
    Math.min(step * attempt, maxDelay);
}

/**
 * Fixed delay strategy
 * delay = constant
 */
export function fixedDelay(delay: number = 10) {
  return (): number => delay;
}
