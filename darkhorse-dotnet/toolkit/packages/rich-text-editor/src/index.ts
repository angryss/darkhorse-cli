/**
 * @packageDocumentation
 * Rich Text Editor Component - WYSIWYG editor with formatting and media support
 */

// Main component exports (extended version with all features)
export { RichTextEditorExtended as default, RichTextEditorExtended as RichTextEditor } from './RichTextEditorExtended';

// Legacy foundation component (for backward compatibility)
export { RichTextEditor as RichTextEditorFoundation } from './RichTextEditor';

// Type exports
export type {
  RichTextEditorProps,
  RichTextEditorHandle,
  RichTextValue,
  RteBuiltinCommand,
  RteToolbarItem,
  RteToolbarItemType,
  RteQuickToolbarSettings,
  RteQuickToolbarTarget,
  RteSlashMenuItem,
  RteSlashMenuSettings,
  RteMentionItem,
  RteMentionSettings,
  RteFileManagerSettings,
  RteFileManagerAjaxSettings,
  RteImageUploadSettings,
  RteImportWordSettings,
  RteExportWordSettings,
  RteExportPdfSettings,
  RteRequestType,
  RteActionBeginArgs,
  RteActionCompleteArgs,
  RteFormat,
} from './types';

// Utility exports
export { sanitizeHtml, stripHtml, getCharacterCount } from './utils/sanitize';
export { executeCommand, queryCommandState, insertHtml, getCurrentFormat } from './utils/commands';
export { createTable } from './utils/table';

// Component exports (for advanced customization)
export { default as SlashMenu } from './components/SlashMenu';
export { default as MentionMenu } from './components/MentionMenu';
export { default as QuickToolbar } from './components/QuickToolbar';
export { default as TableDialog } from './components/TableDialog';
export { default as EmojiPicker } from './components/EmojiPicker';
export { default as MediaDialog } from './components/MediaDialog';

