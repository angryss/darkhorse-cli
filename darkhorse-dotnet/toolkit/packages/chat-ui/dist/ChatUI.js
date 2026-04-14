/**
 * @file ChatUI.tsx
 * @description Main Chat UI component
 */
import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import styles from './ChatUI.module.css';
/**
 * Get user initials for avatar fallback
 */
function getUserInitials(displayName) {
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
        return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
    }
    return (parts[0]?.[0] ?? '?').toUpperCase();
}
/**
 * Format timestamp
 */
function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24)
            return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7)
            return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
    catch {
        return '';
    }
}
/**
 * ChatUI component with forwardRef for imperative handle
 */
export const ChatUI = forwardRef((props, ref) => {
    const { currentUser, participants, messages: initialMessages, suggestions: initialSuggestions = [], toolbarItems = [], inputEnabled = true, inputPlaceholder = 'Type a message...', height = '100%', width = '100%', onMessageSend, onUserTyping, onToolbarItemClick, onSuggestionClick, onError, } = props;
    // State
    const [messages, setMessages] = useState(initialMessages);
    const [suggestions, setSuggestions] = useState(initialSuggestions);
    const [inputValue, setInputValue] = useState('');
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
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
            setTypingUsers(prev => prev.filter(t => {
                const diff = now - new Date(t.lastUpdated).getTime();
                return diff < 5000; // 5 second timeout
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    /**
     * Handle input change
     */
    const handleInputChange = useCallback((e) => {
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
        if (!content || !inputEnabled)
            return;
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
        }
        catch (error) {
            onError?.(error);
        }
    }, [inputValue, inputEnabled, currentUser, onMessageSend, onUserTyping, onError]);
    /**
     * Handle key press
     */
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);
    /**
     * Handle suggestion click
     */
    const handleSuggestionClick = useCallback((suggestion) => {
        setInputValue(suggestion);
        inputRef.current?.focus();
        onSuggestionClick?.(suggestion);
    }, [onSuggestionClick]);
    /**
     * Handle toolbar item click
     */
    const handleToolbarItemClick = useCallback((item) => {
        try {
            onToolbarItemClick?.({ item });
        }
        catch (error) {
            onError?.(error);
        }
    }, [onToolbarItemClick, onError]);
    /**
     * Imperative handle
     */
    useImperativeHandle(ref, () => ({
        addMessage: (message) => {
            setMessages(prev => [...prev, message]);
        },
        setMessages: (newMessages) => {
            setMessages(newMessages);
        },
        setSuggestions: (newSuggestions) => {
            setSuggestions(newSuggestions);
        },
        setTypingUsers: (typing) => {
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
    const renderAvatar = (user) => {
        if (user.avatarUrl) {
            return React.createElement("img", { src: user.avatarUrl, alt: user.displayName, className: styles.avatar });
        }
        return (React.createElement("div", { className: styles.avatar }, getUserInitials(user.displayName)));
    };
    /**
     * Render message
     */
    const renderMessage = (message) => {
        const isSelf = message.sender.id === currentUser.id;
        const isSystem = message.messageType === 'system' || message.messageType === 'event';
        const groupClass = `${styles.messageGroup} ${isSelf ? styles.self : ''} ${isSystem ? styles.system : ''}`;
        const bubbleClass = `${styles.messageBubble} ${message.meta?.pending ? styles.pending : ''}`;
        return (React.createElement("div", { key: message.id, className: groupClass, role: "listitem" },
            !isSelf && !isSystem && (React.createElement("div", { className: styles.messageAvatar }, message.sender.avatarUrl ? (React.createElement("img", { src: message.sender.avatarUrl, alt: message.sender.displayName })) : (getUserInitials(message.sender.displayName)))),
            React.createElement("div", { className: styles.messageContent },
                !isSelf && !isSystem && (React.createElement("div", { className: styles.messageSender }, message.sender.displayName)),
                React.createElement("div", { className: bubbleClass }, message.messageType === 'html' ? (React.createElement("div", { dangerouslySetInnerHTML: { __html: message.content } })) : (message.content)),
                React.createElement("div", { className: styles.messageTimestamp }, formatTimestamp(message.timestamp)))));
    };
    // Get conversation title
    const getConversationTitle = () => {
        if (participants.length === 0)
            return 'Chat';
        if (participants.length === 1)
            return participants[0]?.displayName ?? 'Chat';
        return `${participants.length} participants`;
    };
    return (React.createElement("div", { className: styles.chatUI, style: { height, width }, role: "region", "aria-label": "Chat interface" },
        React.createElement("div", { className: styles.header },
            React.createElement("div", { className: styles.headerInfo },
                participants.length === 1 && participants[0] && renderAvatar(participants[0]),
                React.createElement("div", { className: styles.headerTitle }, getConversationTitle())),
            toolbarItems.length > 0 && (React.createElement("div", { className: styles.toolbar, role: "toolbar" }, toolbarItems.map(item => (React.createElement("button", { key: item.id, className: styles.toolbarButton, onClick: () => handleToolbarItemClick(item), "aria-label": item.label || item.id }, item.template || item.icon || item.label)))))),
        React.createElement("div", { className: styles.messagesArea, role: "list", "aria-label": "Messages" },
            messages.length === 0 ? (React.createElement("div", { className: styles.emptyState },
                React.createElement("svg", { viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" })),
                React.createElement("p", null, "No messages yet. Start a conversation!"))) : (messages.map(renderMessage)),
            React.createElement("div", { ref: messagesEndRef })),
        typingUsers.length > 0 && (React.createElement("div", { className: styles.typingIndicator, role: "status", "aria-live": "polite" },
            React.createElement("span", null, typingUsers.length === 1
                ? `${typingUsers[0]?.user.displayName} is typing`
                : `${typingUsers.length} people are typing`),
            React.createElement("div", { className: styles.typingDots },
                React.createElement("div", { className: styles.typingDot }),
                React.createElement("div", { className: styles.typingDot }),
                React.createElement("div", { className: styles.typingDot })))),
        suggestions.length > 0 && (React.createElement("div", { className: styles.suggestionsArea },
            React.createElement("div", { className: styles.suggestionsList }, suggestions.map((suggestion, index) => (React.createElement("button", { key: index, className: styles.suggestionChip, onClick: () => handleSuggestionClick(suggestion), disabled: !inputEnabled }, suggestion)))))),
        React.createElement("div", { className: styles.inputArea },
            React.createElement("div", { className: styles.inputWrapper },
                React.createElement("textarea", { ref: inputRef, className: styles.input, placeholder: inputPlaceholder, value: inputValue, onChange: handleInputChange, onKeyPress: handleKeyPress, disabled: !inputEnabled, rows: 1, "aria-label": "Message input" })),
            React.createElement("button", { className: styles.sendButton, onClick: handleSend, disabled: !inputEnabled || !inputValue.trim(), "aria-label": "Send message" }, "Send"))));
});
ChatUI.displayName = 'ChatUI';
//# sourceMappingURL=ChatUI.js.map