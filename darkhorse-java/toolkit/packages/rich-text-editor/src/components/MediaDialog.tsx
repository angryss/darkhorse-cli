/**
 * Media Dialog Component
 * Provides video and audio insertion
 */

import React, { useState } from 'react';
import styles from './MediaDialog.module.css';

export type MediaType = 'video' | 'audio';

export interface MediaDialogProps {
  /** Media type */
  type: MediaType;
  
  /** Callback when media inserted */
  onInsert: (url: string, type: MediaType) => void;
  
  /** Callback when dialog closed */
  onClose: () => void;
}

export const MediaDialog: React.FC<MediaDialogProps> = ({ type, onInsert, onClose }) => {
  const [url, setUrl] = useState('');

  const handleInsert = () => {
    if (url.trim()) {
      onInsert(url.trim(), type);
      onClose();
    }
  };

  const title = type === 'video' ? 'Insert Video' : 'Insert Audio';
  const placeholder =
    type === 'video' ? 'https://example.com/video.mp4' : 'https://example.com/audio.mp3';

  return (
    <div className={styles.mediaDialog} onClick={onClose}>
      <div className={styles.mediaDialog__content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.mediaDialog__header}>
          <h3 className={styles.mediaDialog__title}>{title}</h3>
        </div>

        <div className={styles.mediaDialog__body}>
          <div className={styles.mediaDialog__field}>
            <label className={styles.mediaDialog__label}>
              {type === 'video' ? 'Video' : 'Audio'} URL
            </label>
            <input
              type="url"
              className={styles.mediaDialog__input}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
            <div className={styles.mediaDialog__hint}>
              Enter a direct URL to a {type} file (MP4, WebM, OGG for video; MP3, WAV, OGG for
              audio)
            </div>
          </div>

          {/* Preview */}
          {url && (
            <div className={styles.mediaDialog__preview}>
              <div className={styles.mediaDialog__previewLabel}>Preview:</div>
              {type === 'video' ? (
                <video
                  src={url}
                  controls
                  className={styles.mediaDialog__previewMedia}
                  style={{ width: '100%', maxHeight: '200px' }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <audio src={url} controls className={styles.mediaDialog__previewMedia}>
                  Your browser does not support the audio tag.
                </audio>
              )}
            </div>
          )}
        </div>

        <div className={styles.mediaDialog__footer}>
          <button
            className={`${styles.mediaDialog__button} ${styles['mediaDialog__button--secondary']}`}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${styles.mediaDialog__button} ${styles['mediaDialog__button--primary']}`}
            onClick={handleInsert}
            type="button"
            disabled={!url.trim()}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaDialog;

