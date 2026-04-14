/**
 * Rich Text Editor Component Types
 * @packageDocumentation
 */
import { CSSProperties, ReactNode } from 'react';
/**
 * HTML content value
 */
export type RichTextValue = string;
/**
 * Toolbar item types
 */
export type RteToolbarItemType = 'Button' | 'ToggleButton' | 'Separator' | 'Dropdown' | 'Input';
/**
 * Built-in editor commands
 */
export type RteBuiltinCommand = 'Undo' | 'Redo' | 'Bold' | 'Italic' | 'Underline' | 'StrikeThrough' | 'InlineCode' | 'Superscript' | 'Subscript' | 'FontColor' | 'BackgroundColor' | 'FontName' | 'FontSize' | 'Formats' | 'AlignLeft' | 'AlignCenter' | 'AlignRight' | 'AlignJustify' | 'OrderedList' | 'UnorderedList' | 'Checklist' | 'Outdent' | 'Indent' | 'Blockquote' | 'HorizontalLine' | 'CreateLink' | 'RemoveLink' | 'InsertImage' | 'InsertTable' | 'InsertVideo' | 'InsertAudio' | 'EmojiPicker' | 'FormatPainter' | 'ClearFormat' | 'Print' | 'FullScreen' | 'SourceCode' | 'ImportWord' | 'ExportWord' | 'ExportPdf';
/**
 * Toolbar item configuration
 */
export interface RteToolbarItem {
    /** Unique identifier */
    id: string;
    /** Item type */
    type: RteToolbarItemType;
    /** Built-in command to execute */
    command?: RteBuiltinCommand;
    /** Custom icon */
    icon?: ReactNode;
    /** Button label */
    label?: string;
    /** Tooltip text */
    tooltip?: string;
    /** Custom renderer */
    template?: ReactNode;
}
/**
 * Quick toolbar targets
 */
export type RteQuickToolbarTarget = 'text' | 'image' | 'table' | 'media';
/**
 * Quick toolbar configuration
 */
export interface RteQuickToolbarSettings {
    /** Targets to show quick toolbar for */
    targets: RteQuickToolbarTarget[];
    /** Commands by target type */
    itemsByTarget: Partial<Record<RteQuickToolbarTarget, RteBuiltinCommand[]>>;
    /** Show on right-click */
    showOnRightClick?: boolean;
}
/**
 * Slash menu item
 */
export interface RteSlashMenuItem {
    /** Unique identifier */
    id: string;
    /** Display label */
    label: string;
    /** Description */
    description?: string;
    /** Icon */
    icon?: ReactNode;
    /** Command to execute */
    command?: RteBuiltinCommand;
}
/**
 * Slash menu configuration
 */
export interface RteSlashMenuSettings {
    /** Enable slash menu */
    enabled: boolean;
    /** Menu items */
    items: RteSlashMenuItem[];
}
/**
 * Mention item data
 */
export interface RteMentionItem {
    /** Unique identifier */
    id: string;
    /** Display name */
    name: string;
    /** Email address */
    email?: string;
    /** Avatar URL */
    avatarUrl?: string;
    /** Custom color */
    color?: string;
    /** Background color */
    backgroundColor?: string;
    /** Additional metadata */
    meta?: Record<string, unknown>;
}
/**
 * Mention configuration
 */
export interface RteMentionSettings {
    /** Enable mentions */
    enabled: boolean;
    /** Trigger character (default '@') */
    triggerChar?: string;
    /** Data source for mentions */
    dataSource: (query: string) => Promise<RteMentionItem[]> | RteMentionItem[];
    /** Item template renderer */
    itemTemplate?: (item: RteMentionItem) => ReactNode;
    /** Display template after insertion */
    displayTemplate?: (item: RteMentionItem) => ReactNode;
}
/**
 * File manager AJAX settings
 */
export interface RteFileManagerAjaxSettings {
    /** Primary endpoint */
    url: string;
    /** Get image URL endpoint */
    getImageUrl?: string;
    /** Upload endpoint */
    uploadUrl?: string;
    /** Download endpoint */
    downloadUrl?: string;
}
/**
 * File manager configuration
 */
export interface RteFileManagerSettings {
    /** Enable file manager */
    enabled: boolean;
    /** Root path */
    rootPath?: string;
    /** AJAX settings */
    ajaxSettings: RteFileManagerAjaxSettings;
}
/**
 * Image upload configuration
 */
export interface RteImageUploadSettings {
    /** Enable image upload */
    enabled: boolean;
    /** Upload endpoint */
    uploadUrl: string;
    /** Delete endpoint */
    deleteUrl?: string;
    /** Asset base path */
    assetBasePath?: string;
}
/**
 * Word import configuration
 */
export interface RteImportWordSettings {
    /** Enable Word import */
    enabled: boolean;
    /** Conversion service URL */
    serviceUrl: string;
}
/**
 * Word export configuration
 */
export interface RteExportWordSettings {
    /** Enable Word export */
    enabled: boolean;
    /** Conversion service URL */
    serviceUrl: string;
    /** Output filename */
    fileName?: string;
    /** Custom stylesheet */
    stylesheet?: string;
}
/**
 * PDF export configuration
 */
export interface RteExportPdfSettings {
    /** Enable PDF export */
    enabled: boolean;
    /** Conversion service URL */
    serviceUrl: string;
    /** Output filename */
    fileName?: string;
    /** Custom stylesheet */
    stylesheet?: string;
}
/**
 * Request types for actions
 */
export type RteRequestType = 'Format' | 'Undo' | 'Redo' | 'InsertImage' | 'InsertLink' | 'InsertTable' | 'InsertMedia' | 'Paste' | 'ImportWord' | 'ExportWord' | 'ExportPdf' | 'Maximize' | 'Minimize' | 'SourceCodeToggle' | 'EnterKey' | 'Custom';
/**
 * Action begin event arguments
 */
export interface RteActionBeginArgs {
    /** Request type */
    requestType: RteRequestType;
    /** Current value */
    value?: RichTextValue;
    /** Cancel action */
    cancel?: boolean;
    /** Additional context */
    context?: Record<string, unknown>;
}
/**
 * Action complete event arguments
 */
export interface RteActionCompleteArgs {
    /** Request type */
    requestType: RteRequestType;
    /** Updated value */
    value?: RichTextValue;
    /** Additional context */
    context?: Record<string, unknown>;
}
/**
 * Main Rich Text Editor component props
 */
export interface RichTextEditorProps {
    /** Component ID */
    id?: string;
    /** HTML content value */
    value: RichTextValue;
    /** Change handler */
    onChange: (value: RichTextValue) => void;
    /** Placeholder text */
    placeholder?: string;
    /** Show character count */
    showCharCount?: boolean;
    /** Read-only mode */
    readOnly?: boolean;
    /** Toolbar items configuration */
    toolbarItems?: RteToolbarItem[];
    /** Quick toolbar settings */
    quickToolbarSettings?: RteQuickToolbarSettings;
    /** Slash menu settings */
    slashMenuSettings?: RteSlashMenuSettings;
    /** File manager settings */
    fileManagerSettings?: RteFileManagerSettings;
    /** Image upload settings */
    imageUploadSettings?: RteImageUploadSettings;
    /** Word import settings */
    importWordSettings?: RteImportWordSettings;
    /** Word export settings */
    exportWordSettings?: RteExportWordSettings;
    /** PDF export settings */
    exportPdfSettings?: RteExportPdfSettings;
    /** Mention settings */
    mentionSettings?: RteMentionSettings;
    /** Enable XHTML mode */
    enableXhtml?: boolean;
    /** Enable Tab key for indent */
    enableTabKeyForIndent?: boolean;
    /** Editor height */
    height?: number | string;
    /** Editor width */
    width?: number | string;
    /** Action begin callback */
    onActionBegin?: (args: RteActionBeginArgs) => void;
    /** Action complete callback */
    onActionComplete?: (args: RteActionCompleteArgs) => void;
    /** Error handler */
    onError?: (error: unknown) => void;
    /** Additional CSS class */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
}
/**
 * Imperative handle for ref access
 */
export interface RichTextEditorHandle {
    /** Focus the editor */
    focus: () => void;
    /** Get current value */
    getValue: () => RichTextValue;
    /** Set value */
    setValue: (value: RichTextValue) => void;
    /** Toggle fullscreen mode */
    toggleFullScreen: () => void;
    /** Toggle source view */
    toggleSourceView: () => void;
    /** Execute command */
    execCommand: (command: RteBuiltinCommand, options?: Record<string, unknown>) => void;
}
/**
 * Format type for dropdown
 */
export interface RteFormat {
    /** Format tag */
    tag: string;
    /** Display label */
    label: string;
    /** CSS class */
    className?: string;
}
//# sourceMappingURL=types.d.ts.map