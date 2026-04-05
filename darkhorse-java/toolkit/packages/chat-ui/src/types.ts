/**
 * @file types.ts
 * @description Type definitions for Chat UI component
 */

import React from 'react';

/**
 * User identity
 */
export interface ChatUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  meta?: Record<string, unknown>;
}

/**
 * Message types
 */
export type ChatMessageType = 'text' | 'html' | 'system' | 'ai' | 'event';

/**
 * Chat message
 */
export interface ChatMessage {
  id: string;
  sender: ChatUser;
  content: string;
  messageType: ChatMessageType;
  timestamp: string; // ISO
  meta?: {
    ephemeral?: boolean;
    pending?: boolean;
  };
}

/**
 * Typing user
 */
export interface ChatTypingUser {
  user: ChatUser;
  lastUpdated: string;
}

/**
 * Suggestion
 */
export type ChatSuggestion = string;

/**
 * Toolbar item
 */
export interface ChatToolbarItem {
  id: string;
  icon?: React.ReactNode | string;
  label?: string;
  align?: 'Left' | 'Right';
  template?: React.ReactNode;
}

/**
 * Message send arguments
 */
export interface ChatMessageSendArgs {
  content: string;
  sender: ChatUser;
  timestamp: string;
}

/**
 * User typing arguments
 */
export interface ChatUserTypingArgs {
  user: ChatUser;
  isTyping: boolean;
}

/**
 * Toolbar click arguments
 */
export interface ChatToolbarClickArgs {
  item: ChatToolbarItem;
}

/**
 * Chat UI component props
 */
export interface ChatUIProps {
  currentUser: ChatUser;
  participants: ChatUser[];
  messages: ChatMessage[];
  suggestions?: ChatSuggestion[];
  toolbarItems?: ChatToolbarItem[];
  inputEnabled?: boolean;
  inputPlaceholder?: string;
  height?: number | string;
  width?: number | string;
  onMessageSend: (args: ChatMessageSendArgs) => void;
  onUserTyping?: (args: ChatUserTypingArgs) => void;
  onToolbarItemClick?: (args: ChatToolbarClickArgs) => void;
  onSuggestionClick?: (suggestion: ChatSuggestion) => void;
  onError?: (error: unknown) => void;
}

/**
 * Chat UI imperative handle
 */
export interface ChatUIHandle {
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSuggestions: (suggestions: ChatSuggestion[]) => void;
  setTypingUsers: (typing: ChatTypingUser[]) => void;
  scrollToBottom: () => void;
  reset: () => void;
}

