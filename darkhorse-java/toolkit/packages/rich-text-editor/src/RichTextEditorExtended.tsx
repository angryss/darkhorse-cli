/**
 * Rich Text Editor Component - Extended Version
 * Full implementation with all advanced features
 */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { 
  RichTextEditorProps, 
  RichTextEditorHandle, 
  RteBuiltinCommand, 
  RteFormat,
  RteMentionItem,
  RteSlashMenuItem,
  RteQuickToolbarTarget 
} from './types';
import { sanitizeHtml, getCharacterCount } from './utils/sanitize';
import { executeCommand, queryCommandState, getCurrentFormat, insertHtml } from './utils/commands';
import { createTable } from './utils/table';
import SlashMenu from './components/SlashMenu';
import MentionMenu from './components/MentionMenu';
import QuickToolbar from './components/QuickToolbar';
import TableDialog from './components/TableDialog';
import EmojiPicker from './components/EmojiPicker';
import MediaDialog, { MediaType } from './components/MediaDialog';
import styles from './RichTextEditor.module.css';

const DEFAULT_FORMATS: RteFormat[] = [
  { tag: 'p', label: 'Paragraph' },
  { tag: 'h1', label: 'Heading 1' },
  { tag: 'h2', label: 'Heading 2' },
  { tag: 'h3', label: 'Heading 3' },
  { tag: 'h4', label: 'Heading 4' },
  { tag: 'h5', label: 'Heading 5' },
  { tag: 'h6', label: 'Heading 6' },
  { tag: 'blockquote', label: 'Quote' },
  { tag: 'pre', label: 'Code Block' },
];

// Default slash menu items
const DEFAULT_SLASH_ITEMS: RteSlashMenuItem[] = [
  { id: 'p', label: 'Paragraph', description: 'Regular text', command: 'Formats' },
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', command: 'Formats' },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', command: 'Formats' },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', command: 'Formats' },
  { id: 'quote', label: 'Quote', description: 'Blockquote', command: 'Blockquote' },
  { id: 'code', label: 'Code Block', description: 'Monospace text', command: 'Formats' },
  { id: 'ol', label: 'Ordered List', description: 'Numbered list', command: 'OrderedList' },
  { id: 'ul', label: 'Unordered List', description: 'Bullet list', command: 'UnorderedList' },
  { id: 'hr', label: 'Divider', description: 'Horizontal line', command: 'HorizontalLine' },
  { id: 'image', label: 'Image', description: 'Insert image', command: 'InsertImage' },
  { id: 'link', label: 'Link', description: 'Create hyperlink', command: 'CreateLink' },
  { id: 'table', label: 'Table', description: 'Insert table', command: 'InsertTable' },
];

export const RichTextEditorExtended = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (props, ref) => {
    const {
      value,
      onChange,
      placeholder = 'Start typing...',
      showCharCount = false,
      readOnly = false,
      height = '400px',
      width = '100%',
      enableXhtml = true,
      slashMenuSettings,
      mentionSettings,
      quickToolbarSettings,
      onError,
      className,
      style,
    } = props;

    const editorRef = useRef<HTMLDivElement>(null);
    const [isSourceView, setIsSourceView] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentFormat, setCurrentFormat] = useState('p');
    const [activeCommands, setActiveCommands] = useState<Set<RteBuiltinCommand>>(new Set());

    // Dialog states
    const [linkDialog, setLinkDialog] = useState<{ isOpen: boolean; url: string; text: string }>({
      isOpen: false,
      url: '',
      text: '',
    });
    const [imageDialog, setImageDialog] = useState<{ isOpen: boolean; url: string; alt: string }>({
      isOpen: false,
      url: '',
      alt: '',
    });
    const [tableDialog, setTableDialog] = useState(false);
    const [emojiPicker, setEmojiPicker] = useState(false);
    const [mediaDialog, setMediaDialog] = useState<{ isOpen: boolean; type: MediaType | null }>({
      isOpen: false,
      type: null,
    });

    // Extension states
    const [slashMenu, setSlashMenu] = useState<{
      isOpen: boolean;
      position: { top: number; left: number };
      query: string;
    }>({ isOpen: false, position: { top: 0, left: 0 }, query: '' });

    const [mentionMenu, setMentionMenu] = useState<{
      isOpen: boolean;
      position: { top: number; left: number };
      query: string;
      items: RteMentionItem[];
      isLoading: boolean;
    }>({ isOpen: false, position: { top: 0, left: 0 }, query: '', items: [], isLoading: false });

    const [quickToolbar, setQuickToolbar] = useState<{
      isOpen: boolean;
      target: RteQuickToolbarTarget;
      position: { top: number; left: number };
    }>({ isOpen: false, target: 'text', position: { top: 0, left: 0 } });

    // Sync editor content with prop value
    useEffect(() => {
      if (editorRef.current && !isSourceView) {
        const currentHtml = editorRef.current.innerHTML;
        if (currentHtml !== value) {
          editorRef.current.innerHTML = value;
        }
      }
    }, [value, isSourceView]);

    // Update active commands on selection change
    const updateToolbarState = useCallback(() => {
      const active = new Set<RteBuiltinCommand>();
      const commands: RteBuiltinCommand[] = [
        'Bold',
        'Italic',
        'Underline',
        'StrikeThrough',
        'OrderedList',
        'UnorderedList',
        'Superscript',
        'Subscript',
        'InlineCode',
      ];

      commands.forEach(cmd => {
        if (queryCommandState(cmd)) {
          active.add(cmd);
        }
      });

      setActiveCommands(active);
      setCurrentFormat(getCurrentFormat());
    }, []);

    // Handle content change
    const handleInput = useCallback(() => {
      if (!editorRef.current) return;

      const html = editorRef.current.innerHTML;
      const sanitized = enableXhtml ? sanitizeHtml(html) : html;

      if (sanitized !== html) {
        editorRef.current.innerHTML = sanitized;
      }

      onChange(sanitized);
    }, [enableXhtml, onChange]);

    // Handle key down (for slash menu and mentions)
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const selection = window.getSelection();
        if (!selection || !editorRef.current) return;

        // Check for slash menu trigger
        if (e.key === '/' && slashMenuSettings?.enabled) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();

          setSlashMenu({
            isOpen: true,
            position: {
              top: rect.bottom - editorRect.top + 5,
              left: rect.left - editorRect.left,
            },
            query: '',
          });
          return;
        }

        // Check for mention trigger
        if (e.key === (mentionSettings?.triggerChar || '@') && mentionSettings?.enabled) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();

          setMentionMenu({
            isOpen: true,
            position: {
              top: rect.bottom - editorRect.top + 5,
              left: rect.left - editorRect.left,
            },
            query: '',
            items: [],
            isLoading: true,
          });

          // Fetch mention data
          (async () => {
            try {
              const result = await mentionSettings.dataSource('');
              const items = Array.isArray(result) ? result : await result;
              setMentionMenu(prev => ({ ...prev, items, isLoading: false }));
            } catch (error) {
              console.error('Error fetching mentions:', error);
              setMentionMenu(prev => ({ ...prev, isLoading: false }));
            }
          })();
          return;
        }

        // Update slash menu query
        if (slashMenu.isOpen) {
          if (e.key === 'Escape') {
            setSlashMenu(prev => ({ ...prev, isOpen: false }));
          } else if (e.key.length === 1) {
            setSlashMenu(prev => ({ ...prev, query: prev.query + e.key }));
          } else if (e.key === 'Backspace') {
            setSlashMenu(prev => ({ ...prev, query: prev.query.slice(0, -1) }));
          }
        }

        // Update mention menu query
        if (mentionMenu.isOpen) {
          if (e.key === 'Escape') {
            setMentionMenu(prev => ({ ...prev, isOpen: false }));
          } else if (e.key.length === 1) {
            const newQuery = mentionMenu.query + e.key;
            setMentionMenu(prev => ({ ...prev, query: newQuery, isLoading: true }));

            // Fetch filtered mentions
            (async () => {
              try {
                const result = await mentionSettings!.dataSource(newQuery);
                const items = Array.isArray(result) ? result : await result;
                setMentionMenu(prev => ({ ...prev, items, isLoading: false }));
              } catch (error) {
                console.error('Error fetching mentions:', error);
                setMentionMenu(prev => ({ ...prev, isLoading: false }));
              }
            })();
          } else if (e.key === 'Backspace') {
            const newQuery = mentionMenu.query.slice(0, -1);
            setMentionMenu(prev => ({ ...prev, query: newQuery }));
          }
        }
      },
      [slashMenu, mentionMenu, slashMenuSettings, mentionSettings]
    );

    // Handle text selection for quick toolbar
    const handleMouseUp = useCallback(() => {
      updateToolbarState();

      if (!quickToolbarSettings || !editorRef.current) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setQuickToolbar(prev => ({ ...prev, isOpen: false }));
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) return;

      // Show quick toolbar for text
      if (quickToolbarSettings.targets.includes('text')) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const editorRect = editorRef.current.getBoundingClientRect();

        setQuickToolbar({
          isOpen: true,
          target: 'text',
          position: {
            top: rect.top - editorRect.top - 45,
            left: rect.left - editorRect.left + rect.width / 2 - 100,
          },
        });
      }
    }, [quickToolbarSettings, updateToolbarState]);

    // Execute command
    const execCmd = useCallback(
      (command: RteBuiltinCommand, value?: string) => {
        try {
          if (command === 'CreateLink') {
            handleOpenLinkDialog();
            return;
          }

          if (command === 'InsertImage') {
            handleOpenImageDialog();
            return;
          }

          if (command === 'InsertTable') {
            setTableDialog(true);
            return;
          }

          if (command === 'InsertVideo') {
            setMediaDialog({ isOpen: true, type: 'video' });
            return;
          }

          if (command === 'InsertAudio') {
            setMediaDialog({ isOpen: true, type: 'audio' });
            return;
          }

          if (command === 'EmojiPicker') {
            setEmojiPicker(true);
            return;
          }

          if (command === 'SourceCode') {
            setIsSourceView(prev => !prev);
            return;
          }

          if (command === 'FullScreen') {
            setIsFullscreen(prev => !prev);
            return;
          }

          executeCommand(command, value);
          editorRef.current?.focus();
          handleInput();
          updateToolbarState();
        } catch (error) {
          if (onError) {
            onError(error);
          }
        }
      },
      [handleInput, updateToolbarState, onError]
    );

    // Link dialog handlers
    const handleOpenLinkDialog = () => {
      const selection = window.getSelection();
      const text = selection?.toString() || '';
      setLinkDialog({ isOpen: true, url: '', text });
    };

    const handleInsertLink = () => {
      if (linkDialog.url) {
        executeCommand('CreateLink', linkDialog.url);
        handleInput();
      }
      setLinkDialog({ isOpen: false, url: '', text: '' });
      editorRef.current?.focus();
    };

    // Image dialog handlers
    const handleOpenImageDialog = () => {
      setImageDialog({ isOpen: true, url: '', alt: '' });
    };

    const handleInsertImage = () => {
      if (imageDialog.url) {
        const img = `<img src="${imageDialog.url}" alt="${imageDialog.alt || ''}" />`;
        insertHtml(img);
        handleInput();
      }
      setImageDialog({ isOpen: false, url: '', alt: '' });
      editorRef.current?.focus();
    };

    // Table dialog handler
    const handleInsertTable = (rows: number, cols: number) => {
      const tableHtml = createTable(rows, cols);
      insertHtml(tableHtml);
      handleInput();
      setTableDialog(false);
      editorRef.current?.focus();
    };

    // Emoji picker handler
    const handleInsertEmoji = (emoji: string) => {
      insertHtml(emoji);
      handleInput();
      editorRef.current?.focus();
    };

    // Media dialog handler
    const handleInsertMedia = (url: string, type: MediaType) => {
      const mediaHtml =
        type === 'video'
          ? `<video src="${url}" controls style="max-width: 100%;">Your browser does not support video.</video>`
          : `<audio src="${url}" controls>Your browser does not support audio.</audio>`;
      insertHtml(mediaHtml);
      handleInput();
      editorRef.current?.focus();
    };

    // Slash menu handlers
    const handleSlashMenuSelect = (item: RteSlashMenuItem) => {
      // Remove the '/' character
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
        range.deleteContents();
      }

      if (item.command) {
        if (item.command === 'Formats') {
          execCmd('Formats', item.id);
        } else {
          execCmd(item.command);
        }
      }
      setSlashMenu(prev => ({ ...prev, isOpen: false }));
      editorRef.current?.focus();
    };

    // Mention menu handlers
    const handleMentionSelect = (item: RteMentionItem) => {
      const mentionHtml = mentionSettings?.displayTemplate
        ? `<span data-mention-id="${item.id}">${mentionSettings.displayTemplate(item)}</span>`
        : `<span data-mention-id="${item.id}" style="color: ${item.color || '#3b82f6'}; background-color: ${
            item.backgroundColor || '#dbeafe'
          }; padding: 2px 6px; border-radius: 4px;">@${item.name}</span>`;

      // Remove the '@' character and query
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.setStart(range.startContainer, Math.max(0, range.startOffset - mentionMenu.query.length - 1));
        range.deleteContents();
      }

      insertHtml(mentionHtml + '&nbsp;');
      handleInput();
      setMentionMenu(prev => ({ ...prev, isOpen: false }));
      editorRef.current?.focus();
    };

    // Quick toolbar handler
    const handleQuickToolbarCommand = (command: RteBuiltinCommand) => {
      execCmd(command);
      setQuickToolbar(prev => ({ ...prev, isOpen: false }));
    };

    // Format change
    const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tag = e.target.value;
      executeCommand('Formats', tag);
      setCurrentFormat(tag);
      editorRef.current?.focus();
      handleInput();
    };

    // Imperative handle
    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
      getValue: () => editorRef.current?.innerHTML || '',
      setValue: (newValue: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = newValue;
          onChange(newValue);
        }
      },
      toggleFullScreen: () => setIsFullscreen(prev => !prev),
      toggleSourceView: () => setIsSourceView(prev => !prev),
      execCommand: (command: RteBuiltinCommand, options?: Record<string, unknown>) => {
        const value = options?.value as string | undefined;
        execCmd(command, value);
      },
    }));

    const charCount = showCharCount ? getCharacterCount(value) : 0;
    const slashItems = slashMenuSettings?.items || DEFAULT_SLASH_ITEMS;
    const quickToolbarCommands = quickToolbarSettings?.itemsByTarget?.[quickToolbar.target] || [
      'Bold',
      'Italic',
      'Underline',
      'CreateLink',
    ];

    return (
      <div
        className={`${styles.rte} ${isFullscreen ? styles['rte--fullscreen'] : ''} ${
          readOnly ? styles['rte--readonly'] : ''
        } ${className || ''}`}
        style={{ height, width, ...style }}
      >
        {/* Toolbar */}
        {!readOnly && (
          <div className={styles.rte__toolbar}>
            {/* Undo/Redo */}
            <div className={styles.rte__toolbar__group}>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('Undo')}
                title="Undo"
                type="button"
              >
                ↶
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('Redo')}
                title="Redo"
                type="button"
              >
                ↷
              </button>
            </div>

            <div className={styles.rte__toolbar__separator} />

            {/* Formats */}
            <div className={styles.rte__toolbar__group}>
              <select
                className={styles.rte__toolbar__select}
                value={currentFormat}
                onChange={handleFormatChange}
                title="Format"
              >
                {DEFAULT_FORMATS.map(fmt => (
                  <option key={fmt.tag} value={fmt.tag}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.rte__toolbar__separator} />

            {/* Text Formatting */}
            <div className={styles.rte__toolbar__group}>
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('Bold') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('Bold')}
                title="Bold (Ctrl+B)"
                type="button"
              >
                <strong>B</strong>
              </button>
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('Italic') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('Italic')}
                title="Italic (Ctrl+I)"
                type="button"
              >
                <em>I</em>
              </button>
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('Underline') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('Underline')}
                title="Underline (Ctrl+U)"
                type="button"
              >
                <u>U</u>
              </button>
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('StrikeThrough') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('StrikeThrough')}
                title="Strikethrough"
                type="button"
              >
                <s>S</s>
              </button>
            </div>

            <div className={styles.rte__toolbar__separator} />

            {/* Lists */}
            <div className={styles.rte__toolbar__group}>
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('OrderedList') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('OrderedList')}
                title="Ordered List"
                type="button"
              >
                1.
              </button>
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('UnorderedList') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('UnorderedList')}
                title="Unordered List"
                type="button"
              >
                •
              </button>
            </div>

            <div className={styles.rte__toolbar__separator} />

            {/* Insert */}
            <div className={styles.rte__toolbar__group}>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('CreateLink')}
                title="Insert Link"
                type="button"
              >
                🔗
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('InsertImage')}
                title="Insert Image"
                type="button"
              >
                🖼️
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('InsertTable')}
                title="Insert Table"
                type="button"
              >
                ⊞
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('EmojiPicker')}
                title="Insert Emoji"
                type="button"
              >
                😊
              </button>
            </div>

            <div className={styles.rte__toolbar__separator} />

            {/* Utility */}
            <div className={styles.rte__toolbar__group}>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('ClearFormat')}
                title="Clear Formatting"
                type="button"
              >
                ✕
              </button>
              <button
                className={`${styles.rte__toolbar__button} ${
                  isSourceView ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('SourceCode')}
                title="Source Code"
                type="button"
              >
                {'<>'}
              </button>
              <button
                className={`${styles.rte__toolbar__button} ${
                  isFullscreen ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('FullScreen')}
                title="Fullscreen"
                type="button"
              >
                ⛶
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={styles.rte__content}>
          {isSourceView ? (
            <textarea
              className={styles.rte__source}
              value={value}
              onChange={e => onChange(e.target.value)}
              readOnly={readOnly}
            />
          ) : (
            <div
              ref={editorRef}
              className={styles.rte__editor}
              contentEditable={!readOnly}
              onInput={handleInput}
              onMouseUp={handleMouseUp}
              onKeyUp={updateToolbarState}
              onKeyDown={handleKeyDown}
              data-placeholder={placeholder}
              role="textbox"
              aria-label="Rich text editor"
              aria-multiline="true"
              suppressContentEditableWarning
            />
          )}
        </div>

        {/* Footer */}
        {showCharCount && (
          <div className={styles.rte__footer}>
            <span>{charCount} characters</span>
          </div>
        )}

        {/* Slash Menu */}
        {slashMenu.isOpen && (
          <SlashMenu
            items={slashItems}
            position={slashMenu.position}
            query={slashMenu.query}
            onSelect={handleSlashMenuSelect}
            onClose={() => setSlashMenu(prev => ({ ...prev, isOpen: false }))}
          />
        )}

        {/* Mention Menu */}
        {mentionMenu.isOpen && (
          <MentionMenu
            items={mentionMenu.items}
            position={mentionMenu.position}
            query={mentionMenu.query}
            isLoading={mentionMenu.isLoading}
            itemTemplate={mentionSettings?.itemTemplate}
            onSelect={handleMentionSelect}
            onClose={() => setMentionMenu(prev => ({ ...prev, isOpen: false }))}
          />
        )}

        {/* Quick Toolbar */}
        {quickToolbar.isOpen && (
          <QuickToolbar
            target={quickToolbar.target}
            position={quickToolbar.position}
            commands={quickToolbarCommands}
            activeCommands={activeCommands}
            onCommand={handleQuickToolbarCommand}
            onClose={() => setQuickToolbar(prev => ({ ...prev, isOpen: false }))}
          />
        )}

        {/* Link Dialog */}
        {linkDialog.isOpen && (
          <div className={styles.rte__dialog} onClick={() => setLinkDialog({ ...linkDialog, isOpen: false })}>
            <div className={styles.rte__dialog__content} onClick={e => e.stopPropagation()}>
              <div className={styles.rte__dialog__header}>
                <h3 className={styles.rte__dialog__title}>Insert Link</h3>
              </div>
              <div className={styles.rte__dialog__body}>
                <div className={styles.rte__dialog__field}>
                  <label className={styles.rte__dialog__label}>URL</label>
                  <input
                    type="url"
                    className={styles.rte__dialog__input}
                    value={linkDialog.url}
                    onChange={e => setLinkDialog({ ...linkDialog, url: e.target.value })}
                    placeholder="https://example.com"
                    autoFocus
                  />
                </div>
              </div>
              <div className={styles.rte__dialog__footer}>
                <button
                  className={`${styles.rte__dialog__button} ${styles['rte__dialog__button--secondary']}`}
                  onClick={() => setLinkDialog({ ...linkDialog, isOpen: false })}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={`${styles.rte__dialog__button} ${styles['rte__dialog__button--primary']}`}
                  onClick={handleInsertLink}
                  type="button"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Dialog */}
        {imageDialog.isOpen && (
          <div className={styles.rte__dialog} onClick={() => setImageDialog({ ...imageDialog, isOpen: false })}>
            <div className={styles.rte__dialog__content} onClick={e => e.stopPropagation()}>
              <div className={styles.rte__dialog__header}>
                <h3 className={styles.rte__dialog__title}>Insert Image</h3>
              </div>
              <div className={styles.rte__dialog__body}>
                <div className={styles.rte__dialog__field}>
                  <label className={styles.rte__dialog__label}>Image URL</label>
                  <input
                    type="url"
                    className={styles.rte__dialog__input}
                    value={imageDialog.url}
                    onChange={e => setImageDialog({ ...imageDialog, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    autoFocus
                  />
                </div>
                <div className={styles.rte__dialog__field}>
                  <label className={styles.rte__dialog__label}>Alt Text</label>
                  <input
                    type="text"
                    className={styles.rte__dialog__input}
                    value={imageDialog.alt}
                    onChange={e => setImageDialog({ ...imageDialog, alt: e.target.value })}
                    placeholder="Image description"
                  />
                </div>
              </div>
              <div className={styles.rte__dialog__footer}>
                <button
                  className={`${styles.rte__dialog__button} ${styles['rte__dialog__button--secondary']}`}
                  onClick={() => setImageDialog({ ...imageDialog, isOpen: false })}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className={`${styles.rte__dialog__button} ${styles['rte__dialog__button--primary']}`}
                  onClick={handleInsertImage}
                  type="button"
                >
                  Insert
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table Dialog */}
        {tableDialog && <TableDialog onInsert={handleInsertTable} onClose={() => setTableDialog(false)} />}

        {/* Emoji Picker */}
        {emojiPicker && <EmojiPicker onSelect={handleInsertEmoji} onClose={() => setEmojiPicker(false)} />}

        {/* Media Dialog */}
        {mediaDialog.isOpen && mediaDialog.type && (
          <MediaDialog type={mediaDialog.type} onInsert={handleInsertMedia} onClose={() => setMediaDialog({ isOpen: false, type: null })} />
        )}
      </div>
    );
  }
);

RichTextEditorExtended.displayName = 'RichTextEditorExtended';

export default RichTextEditorExtended;

