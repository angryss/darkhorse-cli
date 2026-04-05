import { describe, it, expect } from 'vitest';
import { KeyCode, hasModifier, isNavigationKey } from '../keyboard';

describe('keyboard utilities', () => {
  describe('KeyCode', () => {
    it('should have common key codes', () => {
      expect(KeyCode.Enter).toBe('Enter');
      expect(KeyCode.Escape).toBe('Escape');
      expect(KeyCode.Space).toBe(' ');
      expect(KeyCode.ArrowUp).toBe('ArrowUp');
      expect(KeyCode.Tab).toBe('Tab');
    });
  });

  describe('hasModifier', () => {
    it('should detect ctrl key', () => {
      const event = new KeyboardEvent('keydown', { ctrlKey: true });
      expect(hasModifier(event)).toBe(true);
    });

    it('should detect meta key', () => {
      const event = new KeyboardEvent('keydown', { metaKey: true });
      expect(hasModifier(event)).toBe(true);
    });

    it('should detect alt key', () => {
      const event = new KeyboardEvent('keydown', { altKey: true });
      expect(hasModifier(event)).toBe(true);
    });

    it('should detect shift key', () => {
      const event = new KeyboardEvent('keydown', { shiftKey: true });
      expect(hasModifier(event)).toBe(true);
    });

    it('should return false when no modifier', () => {
      const event = new KeyboardEvent('keydown');
      expect(hasModifier(event)).toBe(false);
    });
  });

  describe('isNavigationKey', () => {
    it('should detect arrow keys', () => {
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'ArrowUp' }))).toBe(true);
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'ArrowDown' }))).toBe(true);
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))).toBe(true);
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'ArrowRight' }))).toBe(true);
    });

    it('should detect Home and End', () => {
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'Home' }))).toBe(true);
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'End' }))).toBe(true);
    });

    it('should detect PageUp and PageDown', () => {
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'PageUp' }))).toBe(true);
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'PageDown' }))).toBe(true);
    });

    it('should return false for non-navigation keys', () => {
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'Enter' }))).toBe(false);
      expect(isNavigationKey(new KeyboardEvent('keydown', { key: 'a' }))).toBe(false);
    });
  });
});

