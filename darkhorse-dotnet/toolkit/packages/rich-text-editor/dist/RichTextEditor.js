import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Rich Text Editor Component
 * Foundation implementation with core WYSIWYG features
 */
import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import { sanitizeHtml, getCharacterCount } from './utils/sanitize';
import { executeCommand, queryCommandState, getCurrentFormat } from './utils/commands';
import styles from './RichTextEditor.module.css';
const DEFAULT_FORMATS = [
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
export const RichTextEditor = forwardRef(({ value, onChange, placeholder = 'Start typing...', showCharCount = false, readOnly = false, height = '400px', width = '100%', enableXhtml = true, onError, className, style, }, ref) => {
    const editorRef = useRef(null);
    const [isSourceView, setIsSourceView] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [linkDialog, setLinkDialog] = useState({
        isOpen: false,
        url: '',
        text: '',
    });
    const [imageDialog, setImageDialog] = useState({
        isOpen: false,
        url: '',
        alt: '',
    });
    const [currentFormat, setCurrentFormat] = useState('p');
    const [activeCommands, setActiveCommands] = useState(new Set());
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
        const active = new Set();
        const commands = [
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
        if (!editorRef.current)
            return;
        const html = editorRef.current.innerHTML;
        const sanitized = enableXhtml ? sanitizeHtml(html) : html;
        if (sanitized !== html) {
            editorRef.current.innerHTML = sanitized;
        }
        onChange(sanitized);
    }, [enableXhtml, onChange]);
    // Execute command
    const execCmd = useCallback((command, value) => {
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
        }
        catch (error) {
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
    const handleFormatChange = (e) => {
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
        setValue: (newValue) => {
            if (editorRef.current) {
                editorRef.current.innerHTML = newValue;
                onChange(newValue);
            }
        },
        toggleFullScreen: () => setIsFullscreen(prev => !prev),
        toggleSourceView: () => setIsSourceView(prev => !prev),
        execCommand: (command, options) => {
            const value = options?.value;
            execCmd(command, value);
        },
    }));
    const charCount = showCharCount ? getCharacterCount(value) : 0;
    return (_jsxs("div", { className: `${styles.rte} ${isFullscreen ? styles['rte--fullscreen'] : ''} ${readOnly ? styles['rte--readonly'] : ''} ${className || ''}`, style: { height, width, ...style }, children: [!readOnly && (_jsxs("div", { className: styles.rte__toolbar, children: [_jsxs("div", { className: styles.rte__toolbar__group, children: [_jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('Undo'), title: "Undo", type: "button", children: "\u21B6" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('Redo'), title: "Redo", type: "button", children: "\u21B7" })] }), _jsx("div", { className: styles.rte__toolbar__separator }), _jsx("div", { className: styles.rte__toolbar__group, children: _jsx("select", { className: styles.rte__toolbar__select, value: currentFormat, onChange: handleFormatChange, title: "Format", children: DEFAULT_FORMATS.map(fmt => (_jsx("option", { value: fmt.tag, children: fmt.label }, fmt.tag))) }) }), _jsx("div", { className: styles.rte__toolbar__separator }), _jsxs("div", { className: styles.rte__toolbar__group, children: [_jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('Bold') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('Bold'), title: "Bold (Ctrl+B)", type: "button", children: _jsx("strong", { children: "B" }) }), _jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('Italic') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('Italic'), title: "Italic (Ctrl+I)", type: "button", children: _jsx("em", { children: "I" }) }), _jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('Underline') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('Underline'), title: "Underline (Ctrl+U)", type: "button", children: _jsx("u", { children: "U" }) }), _jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('StrikeThrough') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('StrikeThrough'), title: "Strikethrough", type: "button", children: _jsx("s", { children: "S" }) }), _jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('InlineCode') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('InlineCode'), title: "Inline Code", type: "button", children: '</>' })] }), _jsx("div", { className: styles.rte__toolbar__separator }), _jsxs("div", { className: styles.rte__toolbar__group, children: [_jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('OrderedList') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('OrderedList'), title: "Ordered List", type: "button", children: "1." }), _jsx("button", { className: `${styles.rte__toolbar__button} ${activeCommands.has('UnorderedList') ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('UnorderedList'), title: "Unordered List", type: "button", children: "\u2022" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('Outdent'), title: "Outdent", type: "button", children: "\u21E4" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('Indent'), title: "Indent", type: "button", children: "\u21E5" })] }), _jsx("div", { className: styles.rte__toolbar__separator }), _jsxs("div", { className: styles.rte__toolbar__group, children: [_jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('AlignLeft'), title: "Align Left", type: "button", children: "\u2261" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('AlignCenter'), title: "Align Center", type: "button", children: "\u2263" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('AlignRight'), title: "Align Right", type: "button", children: "\u2261" })] }), _jsx("div", { className: styles.rte__toolbar__separator }), _jsxs("div", { className: styles.rte__toolbar__group, children: [_jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('CreateLink'), title: "Insert Link", type: "button", children: "\uD83D\uDD17" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('InsertImage'), title: "Insert Image", type: "button", children: "\uD83D\uDDBC\uFE0F" }), _jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('HorizontalLine'), title: "Horizontal Line", type: "button", children: "\u2014" })] }), _jsx("div", { className: styles.rte__toolbar__separator }), _jsxs("div", { className: styles.rte__toolbar__group, children: [_jsx("button", { className: styles.rte__toolbar__button, onClick: () => execCmd('ClearFormat'), title: "Clear Formatting", type: "button", children: "\u2715" }), _jsx("button", { className: `${styles.rte__toolbar__button} ${isSourceView ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('SourceCode'), title: "Source Code", type: "button", children: '<>' }), _jsx("button", { className: `${styles.rte__toolbar__button} ${isFullscreen ? styles['rte__toolbar__button--active'] : ''}`, onClick: () => execCmd('FullScreen'), title: "Fullscreen", type: "button", children: "\u26F6" })] })] })), _jsx("div", { className: styles.rte__content, children: isSourceView ? (_jsx("textarea", { className: styles.rte__source, value: value, onChange: (e) => onChange(e.target.value), readOnly: readOnly })) : (_jsx("div", { ref: editorRef, className: styles.rte__editor, contentEditable: !readOnly, onInput: handleInput, onMouseUp: updateToolbarState, onKeyUp: updateToolbarState, "data-placeholder": placeholder, role: "textbox", "aria-label": "Rich text editor", "aria-multiline": "true", suppressContentEditableWarning: true })) }), showCharCount && (_jsx("div", { className: styles.rte__footer, children: _jsxs("span", { children: [charCount, " characters"] }) })), linkDialog.isOpen && (_jsx("div", { className: styles.rte__dialog, onClick: () => setLinkDialog({ ...linkDialog, isOpen: false }), children: _jsxs("div", { className: styles.rte__dialog__content, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: styles.rte__dialog__header, children: _jsx("h3", { className: styles.rte__dialog__title, children: "Insert Link" }) }), _jsxs("div", { className: styles.rte__dialog__body, children: [_jsxs("div", { className: styles.rte__dialog__field, children: [_jsx("label", { className: styles.rte__dialog__label, children: "URL" }), _jsx("input", { type: "url", className: styles.rte__dialog__input, value: linkDialog.url, onChange: (e) => setLinkDialog({ ...linkDialog, url: e.target.value }), placeholder: "https://example.com", autoFocus: true })] }), _jsxs("div", { className: styles.rte__dialog__field, children: [_jsx("label", { className: styles.rte__dialog__label, children: "Text" }), _jsx("input", { type: "text", className: styles.rte__dialog__input, value: linkDialog.text, onChange: (e) => setLinkDialog({ ...linkDialog, text: e.target.value }), placeholder: "Link text" })] })] }), _jsxs("div", { className: styles.rte__dialog__footer, children: [_jsx("button", { className: `${styles.rte__dialog__button} ${styles['rte__dialog__button--secondary']}`, onClick: () => setLinkDialog({ ...linkDialog, isOpen: false }), type: "button", children: "Cancel" }), _jsx("button", { className: `${styles.rte__dialog__button} ${styles['rte__dialog__button--primary']}`, onClick: handleInsertLink, type: "button", children: "Insert" })] })] }) })), imageDialog.isOpen && (_jsx("div", { className: styles.rte__dialog, onClick: () => setImageDialog({ ...imageDialog, isOpen: false }), children: _jsxs("div", { className: styles.rte__dialog__content, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: styles.rte__dialog__header, children: _jsx("h3", { className: styles.rte__dialog__title, children: "Insert Image" }) }), _jsxs("div", { className: styles.rte__dialog__body, children: [_jsxs("div", { className: styles.rte__dialog__field, children: [_jsx("label", { className: styles.rte__dialog__label, children: "Image URL" }), _jsx("input", { type: "url", className: styles.rte__dialog__input, value: imageDialog.url, onChange: (e) => setImageDialog({ ...imageDialog, url: e.target.value }), placeholder: "https://example.com/image.jpg", autoFocus: true })] }), _jsxs("div", { className: styles.rte__dialog__field, children: [_jsx("label", { className: styles.rte__dialog__label, children: "Alt Text" }), _jsx("input", { type: "text", className: styles.rte__dialog__input, value: imageDialog.alt, onChange: (e) => setImageDialog({ ...imageDialog, alt: e.target.value }), placeholder: "Image description" })] })] }), _jsxs("div", { className: styles.rte__dialog__footer, children: [_jsx("button", { className: `${styles.rte__dialog__button} ${styles['rte__dialog__button--secondary']}`, onClick: () => setImageDialog({ ...imageDialog, isOpen: false }), type: "button", children: "Cancel" }), _jsx("button", { className: `${styles.rte__dialog__button} ${styles['rte__dialog__button--primary']}`, onClick: handleInsertImage, type: "button", children: "Insert" })] })] }) }))] }));
});
RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;
//# sourceMappingURL=RichTextEditor.js.map