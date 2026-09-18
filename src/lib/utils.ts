import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Joins conditional class names and resolves conflicting Tailwind utilities, so
 * a component's own classes always win over the ones a caller passes in.
 *
 * @param inputs - Class names, arrays or condition maps.
 * @returns The merged class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
