/**
 * Quick Toolbar Component
 * Provides contextual toolbar for selected content
 */

import React from 'react';
import { RteBuiltinCommand, RteQuickToolbarTarget } from '../types';
import styles from './QuickToolbar.module.css';

export interface QuickToolbarProps {
  /** Target type */
  target: RteQuickToolbarTarget;
  
  /** Toolbar position */
  position: { top: number; left: number };
  
  /** Available commands */
  commands: RteBuiltinCommand[];
  
  /** Active commands */
  activeCommands?: Set<RteBuiltinCommand>;
  
  /** Callback when command executed */
  onCommand: (command: RteBuiltinCommand) => void;
  
  /** Callback when toolbar should close */
  onClose: () => void;
}

// Command icon mapping
const COMMAND_ICONS: Record<RteBuiltinCommand, string> = {
  Bold: 'B',
  Italic: 'I',
  Underline: 'U',
  StrikeThrough: 'S',
  InlineCode: '</>',
  CreateLink: '🔗',
  RemoveLink: '🔗✕',
  AlignLeft: '≡',
  AlignCenter: '≣',
  AlignRight: '≡',
  AlignJustify: '≡',
  FontColor: '🎨',
  BackgroundColor: '🖍️',
  ClearFormat: '✕',
  Undo: '↶',
  Redo: '↷',
  OrderedList: '1.',
  UnorderedList: '•',
  Checklist: '☑',
  Indent: '⇥',
  Outdent: '⇤',
  Blockquote: '"',
  HorizontalLine: '—',
  InsertImage: '🖼️',
  InsertTable: '⊞',
  InsertVideo: '▶',
  InsertAudio: '🔊',
  EmojiPicker: '😊',
  FormatPainter: '🖌️',
  Print: '🖨️',
  FullScreen: '⛶',
  SourceCode: '<>',
  ImportWord: '📄',
  ExportWord: '📄',
  ExportPdf: '📄',
  Superscript: 'x²',
  Subscript: 'x₂',
  FontName: 'Aa',
  FontSize: '14',
  Formats: 'H',
};

// Command labels
const COMMAND_LABELS: Record<RteBuiltinCommand, string> = {
  Bold: 'Bold',
  Italic: 'Italic',
  Underline: 'Underline',
  StrikeThrough: 'Strikethrough',
  InlineCode: 'Code',
  CreateLink: 'Link',
  RemoveLink: 'Remove Link',
  AlignLeft: 'Align Left',
  AlignCenter: 'Align Center',
  AlignRight: 'Align Right',
  AlignJustify: 'Justify',
  FontColor: 'Text Color',
  BackgroundColor: 'Background',
  ClearFormat: 'Clear Format',
  Undo: 'Undo',
  Redo: 'Redo',
  OrderedList: 'Ordered List',
  UnorderedList: 'Unordered List',
  Checklist: 'Checklist',
  Indent: 'Indent',
  Outdent: 'Outdent',
  Blockquote: 'Quote',
  HorizontalLine: 'Horizontal Line',
  InsertImage: 'Image',
  InsertTable: 'Table',
  InsertVideo: 'Video',
  InsertAudio: 'Audio',
  EmojiPicker: 'Emoji',
  FormatPainter: 'Format Painter',
  Print: 'Print',
  FullScreen: 'Fullscreen',
  SourceCode: 'Source Code',
  ImportWord: 'Import Word',
  ExportWord: 'Export Word',
  ExportPdf: 'Export PDF',
  Superscript: 'Superscript',
  Subscript: 'Subscript',
  FontName: 'Font',
  FontSize: 'Size',
  Formats: 'Format',
};

export const QuickToolbar: React.FC<QuickToolbarProps> = ({
  target,
  position,
  commands,
  activeCommands = new Set(),
  onCommand,
}) => {
  return (
    <div
      className={styles.quickToolbar}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      role="toolbar"
      aria-label={`${target} quick toolbar`}
    >
      {commands.map((command, index) => (
        <button
          key={command}
          className={`${styles.quickToolbar__button} ${
            activeCommands.has(command) ? styles['quickToolbar__button--active'] : ''
          }`}
          onClick={(e) => {
            e.preventDefault();
            onCommand(command);
          }}
          title={COMMAND_LABELS[command]}
          type="button"
          tabIndex={index === 0 ? 0 : -1}
        >
          {COMMAND_ICONS[command] || command}
        </button>
      ))}
    </div>
  );
};

export default QuickToolbar;

