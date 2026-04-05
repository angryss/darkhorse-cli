/**
 * Command Execution Utilities
 * Handles execCommand and custom formatting operations
 */

import { RteBuiltinCommand } from '../types';

/**
 * Execute a document command
 */
export function executeCommand(command: RteBuiltinCommand, value?: string): boolean {
  try {
    switch (command) {
      // Basic formatting
      case 'Bold':
        return document.execCommand('bold', false);
      case 'Italic':
        return document.execCommand('italic', false);
      case 'Underline':
        return document.execCommand('underline', false);
      case 'StrikeThrough':
        return document.execCommand('strikeThrough', false);
      
      // Undo/Redo
      case 'Undo':
        return document.execCommand('undo', false);
      case 'Redo':
        return document.execCommand('redo', false);
      
      // Lists
      case 'OrderedList':
        return document.execCommand('insertOrderedList', false);
      case 'UnorderedList':
        return document.execCommand('insertUnorderedList', false);
      
      // Alignment
      case 'AlignLeft':
        return document.execCommand('justifyLeft', false);
      case 'AlignCenter':
        return document.execCommand('justifyCenter', false);
      case 'AlignRight':
        return document.execCommand('justifyRight', false);
      case 'AlignJustify':
        return document.execCommand('justifyFull', false);
      
      // Indent
      case 'Indent':
        return document.execCommand('indent', false);
      case 'Outdent':
        return document.execCommand('outdent', false);
      
      // Format block
      case 'Formats':
        return document.execCommand('formatBlock', false, value || 'p');
      
      // Links
      case 'CreateLink':
        return document.execCommand('createLink', false, value);
      case 'RemoveLink':
        return document.execCommand('unlink', false);
      
      // Special
      case 'InlineCode':
        return wrapSelection('code');
      case 'Superscript':
        return document.execCommand('superscript', false);
      case 'Subscript':
        return document.execCommand('subscript', false);
      case 'HorizontalLine':
        return document.execCommand('insertHorizontalRule', false);
      case 'ClearFormat':
        return document.execCommand('removeFormat', false);
      
      // Colors
      case 'FontColor':
        return document.execCommand('foreColor', false, value);
      case 'BackgroundColor':
        return document.execCommand('backColor', false, value);
      
      // Font
      case 'FontName':
        return document.execCommand('fontName', false, value);
      case 'FontSize':
        return document.execCommand('fontSize', false, value);
      
      default:
        console.warn(`Command not implemented: ${command}`);
        return false;
    }
  } catch (error) {
    console.error(`Error executing command ${command}:`, error);
    return false;
  }
}

/**
 * Wrap selection in a tag
 */
function wrapSelection(tag: string): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  const range = selection.getRangeAt(0);
  const wrapper = document.createElement(tag);
  
  try {
    range.surroundContents(wrapper);
    return true;
  } catch {
    // Fallback: extract contents and wrap
    const contents = range.extractContents();
    wrapper.appendChild(contents);
    range.insertNode(wrapper);
    return true;
  }
}

/**
 * Check if a command is active
 */
export function queryCommandState(command: RteBuiltinCommand): boolean {
  try {
    switch (command) {
      case 'Bold':
        return document.queryCommandState('bold');
      case 'Italic':
        return document.queryCommandState('italic');
      case 'Underline':
        return document.queryCommandState('underline');
      case 'StrikeThrough':
        return document.queryCommandState('strikeThrough');
      case 'OrderedList':
        return document.queryCommandState('insertOrderedList');
      case 'UnorderedList':
        return document.queryCommandState('insertUnorderedList');
      case 'Superscript':
        return document.queryCommandState('superscript');
      case 'Subscript':
        return document.queryCommandState('subscript');
      case 'InlineCode':
        return isSelectionWrappedIn('code');
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Check if selection is wrapped in a specific tag
 */
function isSelectionWrappedIn(tag: string): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;

  let node = selection.anchorNode;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.tagName.toLowerCase() === tag.toLowerCase()) {
        return true;
      }
    }
    node = node.parentNode;
  }
  return false;
}

/**
 * Insert HTML at cursor
 */
export function insertHtml(html: string): boolean {
  try {
    return document.execCommand('insertHTML', false, html);
  } catch (error) {
    console.error('Error inserting HTML:', error);
    return false;
  }
}

/**
 * Get current format block
 */
export function getCurrentFormat(): string {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return 'p';

  let node = selection.anchorNode;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tag = element.tagName.toLowerCase();
      if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'].includes(tag)) {
        return tag;
      }
    }
    node = node.parentNode;
  }
  return 'p';
}

