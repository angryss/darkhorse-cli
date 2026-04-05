/**
 * Rich Text Editor Component
 * Foundation implementation with core WYSIWYG features
 */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { RichTextEditorProps, RichTextEditorHandle, RteBuiltinCommand, RteFormat } from './types';
import { sanitizeHtml, getCharacterCount } from './utils/sanitize';
import { executeCommand, queryCommandState, getCurrentFormat } from './utils/commands';
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

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Start typing...',
      showCharCount = false,
      readOnly = false,
      height = '400px',
      width = '100%',
      enableXhtml = true,
      onError,
      className,
      style,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSourceView, setIsSourceView] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
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
    const [currentFormat, setCurrentFormat] = useState('p');
    const [activeCommands, setActiveCommands] = useState<Set<RteBuiltinCommand>>(new Set());

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

    // Execute command
    const execCmd = useCallback((command: RteBuiltinCommand, value?: string) => {
      try {
        if (command === 'CreateLink') {
          handleOpenLinkDialog();
          return;
        }

        if (command === 'InsertImage') {
          handleOpenImageDialog();
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
    }, [handleInput, updateToolbarState, onError]);

    // Link dialog
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

    // Image dialog
    const handleOpenImageDialog = () => {
      setImageDialog({ isOpen: true, url: '', alt: '' });
    };

    const handleInsertImage = () => {
      if (imageDialog.url) {
        const img = `<img src="${imageDialog.url}" alt="${imageDialog.alt || ''}" />`;
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          const temp = document.createElement('div');
          temp.innerHTML = img;
          const node = temp.firstChild;
          if (node) {
            range.insertNode(node);
          }
        }
        handleInput();
      }
      setImageDialog({ isOpen: false, url: '', alt: '' });
      editorRef.current?.focus();
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
      getValue: () => (editorRef.current?.innerHTML || ''),
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
              <button
                className={`${styles.rte__toolbar__button} ${
                  activeCommands.has('InlineCode') ? styles['rte__toolbar__button--active'] : ''
                }`}
                onClick={() => execCmd('InlineCode')}
                title="Inline Code"
                type="button"
              >
                {'</>'}
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
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('Outdent')}
                title="Outdent"
                type="button"
              >
                ⇤
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('Indent')}
                title="Indent"
                type="button"
              >
                ⇥
              </button>
            </div>

            <div className={styles.rte__toolbar__separator} />

            {/* Alignment */}
            <div className={styles.rte__toolbar__group}>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('AlignLeft')}
                title="Align Left"
                type="button"
              >
                ≡
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('AlignCenter')}
                title="Align Center"
                type="button"
              >
                ≣
              </button>
              <button
                className={styles.rte__toolbar__button}
                onClick={() => execCmd('AlignRight')}
                title="Align Right"
                type="button"
              >
                ≡
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
                onClick={() => execCmd('HorizontalLine')}
                title="Horizontal Line"
                type="button"
              >
                —
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
              onChange={(e) => onChange(e.target.value)}
              readOnly={readOnly}
            />
          ) : (
            <div
              ref={editorRef}
              className={styles.rte__editor}
              contentEditable={!readOnly}
              onInput={handleInput}
              onMouseUp={updateToolbarState}
              onKeyUp={updateToolbarState}
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

        {/* Link Dialog */}
        {linkDialog.isOpen && (
          <div className={styles.rte__dialog} onClick={() => setLinkDialog({ ...linkDialog, isOpen: false })}>
            <div className={styles.rte__dialog__content} onClick={(e) => e.stopPropagation()}>
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
                    onChange={(e) => setLinkDialog({ ...linkDialog, url: e.target.value })}
                    placeholder="https://example.com"
                    autoFocus
                  />
                </div>
                <div className={styles.rte__dialog__field}>
                  <label className={styles.rte__dialog__label}>Text</label>
                  <input
                    type="text"
                    className={styles.rte__dialog__input}
                    value={linkDialog.text}
                    onChange={(e) => setLinkDialog({ ...linkDialog, text: e.target.value })}
                    placeholder="Link text"
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
            <div className={styles.rte__dialog__content} onClick={(e) => e.stopPropagation()}>
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
                    onChange={(e) => setImageDialog({ ...imageDialog, url: e.target.value })}
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
                    onChange={(e) => setImageDialog({ ...imageDialog, alt: e.target.value })}
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
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;

