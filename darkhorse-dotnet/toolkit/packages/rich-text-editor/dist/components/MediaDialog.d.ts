/**
 * Media Dialog Component
 * Provides video and audio insertion
 */
import React from 'react';
export type MediaType = 'video' | 'audio';
export interface MediaDialogProps {
    /** Media type */
    type: MediaType;
    /** Callback when media inserted */
    onInsert: (url: string, type: MediaType) => void;
    /** Callback when dialog closed */
    onClose: () => void;
}
export declare const MediaDialog: React.FC<MediaDialogProps>;
export default MediaDialog;
//# sourceMappingURL=MediaDialog.d.ts.map