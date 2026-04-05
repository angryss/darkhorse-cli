/**
 * @file types.ts
 * @description Type definitions for AI Assist Panel component
 */

import React from 'react';

/**
 * Message role
 */
export type AiAssistRole = 'system' | 'user' | 'assistant';

/**
 * AI Assist message
 */
export interface AiAssistMessage {
  id: string;
  role: AiAssistRole;
  content: string;
  createdAt: string; // ISO timestamp
  meta?: Record<string, unknown>;
}

/**
 * Suggestion type
 */
export type AiAssistSuggestion = string;

/**
 * Toolbar alignment
 */
export type AiAssistToolbarAlign = 'Left' | 'Right';

/**
 * Toolbar item
 */
export interface AiAssistToolbarItem {
  id: string;
  icon?: React.ReactNode | string;
  label?: string;
  align?: AiAssistToolbarAlign;
}

/**
 * Prompt request arguments
 */
export interface AiAssistPromptRequestArgs {
  prompt: string;
  history: AiAssistMessage[];
  requestId: string;
  complete: (response: {
    message: { content: string; meta?: Record<string, unknown> };
    suggestions?: AiAssistSuggestion[];
  }) => void;
}

/**
 * Toolbar click arguments
 */
export interface AiAssistToolbarClickArgs {
  item: AiAssistToolbarItem;
}

/**
 * AI Assist Panel component props
 */
export interface AiAssistPanelProps {
  id?: string;
  initialMessages?: AiAssistMessage[];
  promptSuggestions?: AiAssistSuggestion[];
  banner?: React.ReactNode;
  bannerTemplate?: string;
  toolbarItems?: AiAssistToolbarItem[];
  onToolbarItemClick?: (args: AiAssistToolbarClickArgs) => void;
  onPromptRequest: (args: AiAssistPromptRequestArgs) => void;
  inputPlaceholder?: string;
  inputEnabled?: boolean;
  showLoadingIndicator?: boolean;
  maxMessages?: number;
  onSuggestionClick?: (suggestion: AiAssistSuggestion) => void;
  onError?: (error: unknown) => void;
}

/**
 * AI Assist Panel imperative handle
 */
export interface AiAssistPanelHandle {
  addMessage: (message: AiAssistMessage) => void;
  setMessages: (messages: AiAssistMessage[]) => void;
  setSuggestions: (suggestions: AiAssistSuggestion[]) => void;
  reset: () => void;
  focusInput: () => void;
}

