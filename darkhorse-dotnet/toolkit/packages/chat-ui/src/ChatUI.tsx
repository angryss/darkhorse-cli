/**
 * @file ChatUI.tsx
 * @description Main Chat UI component
 */

import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import {
  ChatUIProps,
  ChatUIHandle,
  ChatMessage,
  ChatUser,
  ChatSuggestion,
  ChatTypingUser,
} from './types';
import styles from './ChatUI.module.css';

/**
 * Get user initials for avatar fallback
 */
function getUserInitials(displayName: string): string {
  const parts = displayName.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  } catch {
    return '';
  }
}

/**
 * ChatUI component with forwardRef for imperative handle
 */
export const ChatUI = forwardRef<ChatUIHandle, ChatUIProps>((props, ref) => {
  const {
    currentUser,
    participants,
    messages: initialMessages,
    suggestions: initialSuggestions = [],
    toolbarItems = [],
    inputEnabled = true,
    inputPlaceholder = 'Type a message...',
    height = '100%',
    width = '100%',
    onMessageSend,
    onUserTyping,
    onToolbarItemClick,
    onSuggestionClick,
    onError,
  } = props;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [suggestions, setSuggestions] = useState<ChatSuggestion[]>(initialSuggestions);
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<ChatTypingUser[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync messages from props
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Sync suggestions from props
  useEffect(() => {
    setSuggestions(initialSuggestions);
  }, [initialSuggestions]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clean up expired typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => 
        prev.filter(t => {
          const diff = now - new Date(t.lastUpdated).getTime();
          return diff < 5000; // 5 second timeout
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Typing indicator logic
    const nowTyping = value.trim().length > 0;
    if (nowTyping !== isTyping) {
      setIsTyping(nowTyping);
      onUserTyping?.({ user: currentUser, isTyping: nowTyping });
    }

    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to clear typing state
    if (nowTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onUserTyping?.({ user: currentUser, isTyping: false });
      }, 3000);
    }
  }, [currentUser, isTyping, onUserTyping]);

  /**
   * Handle send message
   */
  const handleSend = useCallback(() => {
    const content = inputValue.trim();
    if (!content || !inputEnabled) return;

    try {
      const timestamp = new Date().toISOString();
      
      // Clear input
      setInputValue('');
      setIsTyping(false);
      onUserTyping?.({ user: currentUser, isTyping: false });

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send message
      onMessageSend({
        content,
        sender: currentUser,
        timestamp,
      });

      // Focus input
      inputRef.current?.focus();
    } catch (error) {
      onError?.(error);
    }
  }, [inputValue, inputEnabled, currentUser, onMessageSend, onUserTyping, onError]);

  /**
   * Handle key press
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /**
   * Handle suggestion click
   */
  const handleSuggestionClick = useCallback((suggestion: ChatSuggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
    onSuggestionClick?.(suggestion);
  }, [onSuggestionClick]);

  /**
   * Handle toolbar item click
   */
  const handleToolbarItemClick = useCallback((item: any) => {
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
    addMessage: (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    },
    setMessages: (newMessages: ChatMessage[]) => {
      setMessages(newMessages);
    },
    setSuggestions: (newSuggestions: ChatSuggestion[]) => {
      setSuggestions(newSuggestions);
    },
    setTypingUsers: (typing: ChatTypingUser[]) => {
      setTypingUsers(typing);
    },
    scrollToBottom,
    reset: () => {
      setMessages([]);
      setSuggestions(initialSuggestions);
      setInputValue('');
      setTypingUsers([]);
      setIsTyping(false);
    },
  }));

  /**
   * Render message avatar
   */
  const renderAvatar = (user: ChatUser) => {
    if (user.avatarUrl) {
      return <img src={user.avatarUrl} alt={user.displayName} className={styles.avatar} />;
    }
    return (
      <div className={styles.avatar}>
        {getUserInitials(user.displayName)}
      </div>
    );
  };

  /**
   * Render message
   */
  const renderMessage = (message: ChatMessage) => {
    const isSelf = message.sender.id === currentUser.id;
    const isSystem = message.messageType === 'system' || message.messageType === 'event';

    const groupClass = `${styles.messageGroup} ${isSelf ? styles.self : ''} ${isSystem ? styles.system : ''}`;
    const bubbleClass = `${styles.messageBubble} ${message.meta?.pending ? styles.pending : ''}`;

    return (
      <div key={message.id} className={groupClass} role="listitem">
        {!isSelf && !isSystem && (
          <div className={styles.messageAvatar}>
            {message.sender.avatarUrl ? (
              <img src={message.sender.avatarUrl} alt={message.sender.displayName} />
            ) : (
              getUserInitials(message.sender.displayName)
            )}
          </div>
        )}
        
        <div className={styles.messageContent}>
          {!isSelf && !isSystem && (
            <div className={styles.messageSender}>{message.sender.displayName}</div>
          )}
          
          <div className={bubbleClass}>
            {message.messageType === 'html' ? (
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            ) : (
              message.content
            )}
          </div>
          
          <div className={styles.messageTimestamp}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };

  // Get conversation title
  const getConversationTitle = () => {
    if (participants.length === 0) return 'Chat';
    if (participants.length === 1) return participants[0]?.displayName ?? 'Chat';
    return `${participants.length} participants`;
  };

  return (
    <div 
      className={styles.chatUI} 
      style={{ height, width }}
      role="region"
      aria-label="Chat interface"
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          {participants.length === 1 && participants[0] && renderAvatar(participants[0])}
          <div className={styles.headerTitle}>{getConversationTitle()}</div>
        </div>
        
        {toolbarItems.length > 0 && (
          <div className={styles.toolbar} role="toolbar">
            {toolbarItems.map(item => (
              <button
                key={item.id}
                className={styles.toolbarButton}
                onClick={() => handleToolbarItemClick(item)}
                aria-label={item.label || item.id}
              >
                {item.template || item.icon || item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className={styles.messagesArea} role="list" aria-label="Messages">
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
            </svg>
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className={styles.typingIndicator} role="status" aria-live="polite">
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0]?.user.displayName} is typing`
              : `${typingUsers.length} people are typing`}
          </span>
          <div className={styles.typingDots}>
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
            <div className={styles.typingDot} />
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className={styles.suggestionsArea}>
          <div className={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className={styles.suggestionChip}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={!inputEnabled}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={!inputEnabled}
            rows={1}
            aria-label="Message input"
          />
        </div>
        
        <button
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!inputEnabled || !inputValue.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
});

ChatUI.displayName = 'ChatUI';

