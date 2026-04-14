import { describe, it, expect } from 'vitest';
import { cn } from '../cn';
describe('cn utility', () => {
    it('should combine multiple class names', () => {
        expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
    });
    it('should filter out falsy values', () => {
        expect(cn('class1', false, 'class2', null, undefined, 'class3')).toBe('class1 class2 class3');
    });
    it('should handle conditional classes', () => {
        const isActive = true;
        const isDisabled = false;
        expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
    });
    it('should trim whitespace', () => {
        expect(cn('  class1  ', '  class2  ')).toBe('class1 class2');
    });
    it('should handle empty input', () => {
        expect(cn()).toBe('');
    });
    it('should handle numbers', () => {
        expect(cn('class', 42)).toBe('class 42');
    });
});
//# sourceMappingURL=cn.test.js.map