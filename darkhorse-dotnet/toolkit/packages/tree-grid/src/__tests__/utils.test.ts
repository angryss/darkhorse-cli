/**
 * Utils Tests
 */

import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('should combine multiple class names', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  it('should filter out falsy values', () => {
    expect(cn('class1', false, 'class2', null, undefined, 'class3')).toBe(
      'class1 class2 class3'
    );
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });

  it('should handle all falsy values', () => {
    expect(cn(false, null, undefined)).toBe('');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;

    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });
});

