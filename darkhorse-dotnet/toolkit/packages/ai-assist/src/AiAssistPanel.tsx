/**
 * @file AiAssistPanel.tsx
 * @description Main AI Assist Panel component
 */

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  AiAssistPanelProps,
  AiAssistPanelHandle,
  AiAssistMessage,
  AiAssistSuggestion,
} from './types';
import styles from './AiAssistPanel.module.css';

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format timestamp
 */
function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * AiAssistPanel component with forwardRef for imperative handle
 */
export const AiAssistPanel = forwardRef<AiAssistPanelHandle, AiAssistPanelProps>((props, ref) => {
  const {
    id,
    initialMessages = [],
    promptSuggestions = [],
    banner,
    bannerTemplate,
    toolbarItems = [],
    onToolbarItemClick,
    onPromptRequest,
    inputPlaceholder = 'Ask a question...',
    inputEnabled = true,
    showLoadingIndicator = true,
    maxMessages,
    onSuggestionClick,
    onError,
  } = props;

  // State
  const [messages, setMessages] = useState<AiAssistMessage[]>(initialMessages);
  const [suggestions, setSuggestions] = useState<AiAssistSuggestion[]>(promptSuggestions);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentRequestIdRef = useRef<string | null>(null);

  // Sync from props
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setSuggestions(promptSuggestions);
  }, [promptSuggestions]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Apply max messages limit
   */
  const applyMaxMessages = useCallback((msgs: AiAssistMessage[]) => {
    if (maxMessages && msgs.length > maxMessages) {
      return msgs.slice(-maxMessages);
    }
    return msgs;
  }, [maxMessages]);

  /**
   * Handle prompt submission
   */
  const handleSubmit = useCallback(() => {
    const prompt = inputValue.trim();
    if (!prompt || !inputEnabled || isLoading) return;

    try {
      // Create user message
      const userMessage: AiAssistMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: prompt,
        createdAt: new Date().toISOString(),
      };

      // Add to messages
      const updatedMessages = applyMaxMessages([...messages, userMessage]);
      setMessages(updatedMessages);

      // Clear input
      setInputValue('');
      setIsLoading(true);

      // Generate request ID
      const requestId = generateRequestId();
      currentRequestIdRef.current = requestId;

      // Complete callback
      const complete = (response: {
        message: { content: string; meta?: Record<string, unknown> };
        suggestions?: AiAssistSuggestion[];
      }) => {
        // Only process if this is still the current request
        if (currentRequestIdRef.current !== requestId) return;

        try {
          // Create assistant message
          const assistantMessage: AiAssistMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: response.message.content,
            createdAt: new Date().toISOString(),
            meta: response.message.meta,
          };

          // Update messages
          setMessages(prev => applyMaxMessages([...prev, assistantMessage]));

          // Update suggestions if provided
          if (response.suggestions) {
            setSuggestions(response.suggestions);
          }

          setIsLoading(false);
          currentRequestIdRef.current = null;
        } catch (error) {
          onError?.(error);
          setIsLoading(false);
        }
      };

      // Call onPromptRequest with history and complete callback
      onPromptRequest({
        prompt,
        history: updatedMessages,
        requestId,
        complete,
      });
    } catch (error) {
      onError?.(error);
      setIsLoading(false);
    }
  }, [inputValue, inputEnabled, isLoading, messages, onPromptRequest, onError, applyMaxMessages]);

  /**
   * Handle key press
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: AiAssistSuggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
    onSuggestionClick?.(suggestion);
  }, [onSuggestionClick]);

  /**
   * Handle toolbar click
   */
  const handleToolbarClick = useCallback((item: any) => {
    try {
      onToolbarItemClick?.({ item });
    } catch (error) {
      onError?.(error);
    }
  }, [onToolbarItemClick, onError]);

  /**
   * Imperative handle
   */
  useImperativeHandle(ref, () => ({
    addMessage: (message: AiAssistMessage) => {
      setMessages(prev => applyMaxMessages([...prev, message]));
    },
    setMessages: (newMessages: AiAssistMessage[]) => {
      setMessages(applyMaxMessages(newMessages));
    },
    setSuggestions: (newSuggestions: AiAssistSuggestion[]) => {
      setSuggestions(newSuggestions);
    },
    reset: () => {
      setMessages([]);
      setSuggestions(promptSuggestions);
      setInputValue('');
      setIsLoading(false);
      currentRequestIdRef.current = null;
    },
    focusInput: () => {
      inputRef.current?.focus();
    },
  }));

  /**
   * Render message
   */
  const renderMessage = (message: AiAssistMessage) => {
    const messageClass = `${styles.message} ${styles[message.role]}`;

    return (
      <div key={message.id} className={messageClass}>
        <div className={styles.messageRole}>{message.role}</div>
        <div className={styles.messageContent}>{message.content}</div>
        <div className={styles.messageTime}>{formatTime(message.createdAt)}</div>
      </div>
    );
  };

  return (
    <div 
      className={styles.panel}
      id={id}
      role="region"
      aria-label="AI Assistant"
    >
      {/* Banner */}
      {(banner || bannerTemplate) && (
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            {banner || (bannerTemplate && <div dangerouslySetInnerHTML={{ __html: bannerTemplate }} />)}
          </div>
          
          {toolbarItems.length > 0 && (
            <div className={styles.toolbar} role="toolbar">
              {toolbarItems.map(item => (
                <button
                  key={item.id}
                  className={styles.toolbarButton}
                  onClick={() => handleToolbarClick(item)}
                  aria-label={item.label || item.id}
                >
                  {item.icon || item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className={styles.messagesArea} role="log" aria-label="Conversation history">
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>Ask me anything to get started!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isLoading && showLoadingIndicator && (
          <div className={styles.loading} role="status" aria-live="polite">
            <span>Thinking</span>
            <div className={styles.loadingDots}>
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
              <div className={styles.loadingDot} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className={styles.suggestionsArea}>
          <div className={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={styles.suggestionChip}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={!inputEnabled || isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder={inputPlaceholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!inputEnabled || isLoading}
          rows={1}
          aria-label="Prompt input"
        />
        
        <button
          className={styles.sendButton}
          onClick={handleSubmit}
          disabled={!inputEnabled || !inputValue.trim() || isLoading}
          aria-label="Send prompt"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
});

AiAssistPanel.displayName = 'AiAssistPanel';

