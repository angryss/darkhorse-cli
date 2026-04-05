/**
 * Simple classname utility for combining CSS classes
 * Similar to clsx/classnames but minimal
 */

type ClassValue = string | number | boolean | undefined | null;

export function cn(...classes: ClassValue[]): string {
  return classes
    .filter(Boolean)
    .map(c => String(c).trim())
    .filter(Boolean)
    .join(' ');
}

