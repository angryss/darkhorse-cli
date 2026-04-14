import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Media Dialog Component
 * Provides video and audio insertion
 */
import { useState } from 'react';
import styles from './MediaDialog.module.css';
export const MediaDialog = ({ type, onInsert, onClose }) => {
    const [url, setUrl] = useState('');
    const handleInsert = () => {
        if (url.trim()) {
            onInsert(url.trim(), type);
            onClose();
        }
    };
    const title = type === 'video' ? 'Insert Video' : 'Insert Audio';
    const placeholder = type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/audio.mp3';
    return (_jsx("div", { className: styles.mediaDialog, onClick: onClose, children: _jsxs("div", { className: styles.mediaDialog__content, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: styles.mediaDialog__header, children: _jsx("h3", { className: styles.mediaDialog__title, children: title }) }), _jsxs("div", { className: styles.mediaDialog__body, children: [_jsxs("div", { className: styles.mediaDialog__field, children: [_jsxs("label", { className: styles.mediaDialog__label, children: [type === 'video' ? 'Video' : 'Audio', " URL"] }), _jsx("input", { type: "url", className: styles.mediaDialog__input, value: url, onChange: (e) => setUrl(e.target.value), placeholder: placeholder, autoFocus: true }), _jsxs("div", { className: styles.mediaDialog__hint, children: ["Enter a direct URL to a ", type, " file (MP4, WebM, OGG for video; MP3, WAV, OGG for audio)"] })] }), url && (_jsxs("div", { className: styles.mediaDialog__preview, children: [_jsx("div", { className: styles.mediaDialog__previewLabel, children: "Preview:" }), type === 'video' ? (_jsx("video", { src: url, controls: true, className: styles.mediaDialog__previewMedia, style: { width: '100%', maxHeight: '200px' }, children: "Your browser does not support the video tag." })) : (_jsx("audio", { src: url, controls: true, className: styles.mediaDialog__previewMedia, children: "Your browser does not support the audio tag." }))] }))] }), _jsxs("div", { className: styles.mediaDialog__footer, children: [_jsx("button", { className: `${styles.mediaDialog__button} ${styles['mediaDialog__button--secondary']}`, onClick: onClose, type: "button", children: "Cancel" }), _jsx("button", { className: `${styles.mediaDialog__button} ${styles['mediaDialog__button--primary']}`, onClick: handleInsert, type: "button", disabled: !url.trim(), children: "Insert" })] })] }) }));
};
export default MediaDialog;
//# sourceMappingURL=MediaDialog.js.map