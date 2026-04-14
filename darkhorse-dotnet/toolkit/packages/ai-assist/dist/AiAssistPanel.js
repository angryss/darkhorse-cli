/**
 * @file AiAssistPanel.tsx
 * @description Main AI Assist Panel component
 */
import React, { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import styles from './AiAssistPanel.module.css';
/**
 * Generate unique request ID
 */
function generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Format timestamp
 */
function formatTime(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    catch {
        return '';
    }
}
/**
 * AiAssistPanel component with forwardRef for imperative handle
 */
export const AiAssistPanel = forwardRef((props, ref) => {
    const { id, initialMessages = [], promptSuggestions = [], banner, bannerTemplate, toolbarItems = [], onToolbarItemClick, onPromptRequest, inputPlaceholder = 'Ask a question...', inputEnabled = true, showLoadingIndicator = true, maxMessages, onSuggestionClick, onError, } = props;
    // State
    const [messages, setMessages] = useState(initialMessages);
    const [suggestions, setSuggestions] = useState(promptSuggestions);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Refs
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const currentRequestIdRef = useRef(null);
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
    const applyMaxMessages = useCallback((msgs) => {
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
        if (!prompt || !inputEnabled || isLoading)
            return;
        try {
            // Create user message
            const userMessage = {
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
            const complete = (response) => {
                // Only process if this is still the current request
                if (currentRequestIdRef.current !== requestId)
                    return;
                try {
                    // Create assistant message
                    const assistantMessage = {
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
                }
                catch (error) {
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
        }
        catch (error) {
            onError?.(error);
            setIsLoading(false);
        }
    }, [inputValue, inputEnabled, isLoading, messages, onPromptRequest, onError, applyMaxMessages]);
    /**
     * Handle key press
     */
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }, [handleSubmit]);
    /**
     * Handle suggestion click
     */
    const handleSuggestionClick = useCallback((suggestion) => {
        setInputValue(suggestion);
        inputRef.current?.focus();
        onSuggestionClick?.(suggestion);
    }, [onSuggestionClick]);
    /**
     * Handle toolbar click
     */
    const handleToolbarClick = useCallback((item) => {
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
            setMessages(prev => applyMaxMessages([...prev, message]));
        },
        setMessages: (newMessages) => {
            setMessages(applyMaxMessages(newMessages));
        },
        setSuggestions: (newSuggestions) => {
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
    const renderMessage = (message) => {
        const messageClass = `${styles.message} ${styles[message.role]}`;
        return (React.createElement("div", { key: message.id, className: messageClass },
            React.createElement("div", { className: styles.messageRole }, message.role),
            React.createElement("div", { className: styles.messageContent }, message.content),
            React.createElement("div", { className: styles.messageTime }, formatTime(message.createdAt))));
    };
    return (React.createElement("div", { className: styles.panel, id: id, role: "region", "aria-label": "AI Assistant" },
        (banner || bannerTemplate) && (React.createElement("div", { className: styles.banner },
            React.createElement("div", { className: styles.bannerContent }, banner || (bannerTemplate && React.createElement("div", { dangerouslySetInnerHTML: { __html: bannerTemplate } }))),
            toolbarItems.length > 0 && (React.createElement("div", { className: styles.toolbar, role: "toolbar" }, toolbarItems.map(item => (React.createElement("button", { key: item.id, className: styles.toolbarButton, onClick: () => handleToolbarClick(item), "aria-label": item.label || item.id }, item.icon || item.label))))))),
        React.createElement("div", { className: styles.messagesArea, role: "log", "aria-label": "Conversation history" },
            messages.length === 0 ? (React.createElement("div", { className: styles.emptyState },
                React.createElement("svg", { viewBox: "0 0 24 24", fill: "currentColor" },
                    React.createElement("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" })),
                React.createElement("p", null, "Ask me anything to get started!"))) : (messages.map(renderMessage)),
            isLoading && showLoadingIndicator && (React.createElement("div", { className: styles.loading, role: "status", "aria-live": "polite" },
                React.createElement("span", null, "Thinking"),
                React.createElement("div", { className: styles.loadingDots },
                    React.createElement("div", { className: styles.loadingDot }),
                    React.createElement("div", { className: styles.loadingDot }),
                    React.createElement("div", { className: styles.loadingDot })))),
            React.createElement("div", { ref: messagesEndRef })),
        suggestions.length > 0 && (React.createElement("div", { className: styles.suggestionsArea },
            React.createElement("div", { className: styles.suggestionsList }, suggestions.map((suggestion, index) => (React.createElement("button", { key: index, className: styles.suggestionChip, onClick: () => handleSuggestionClick(suggestion), disabled: !inputEnabled || isLoading }, suggestion)))))),
        React.createElement("div", { className: styles.inputArea },
            React.createElement("textarea", { ref: inputRef, className: styles.input, placeholder: inputPlaceholder, value: inputValue, onChange: (e) => setInputValue(e.target.value), onKeyPress: handleKeyPress, disabled: !inputEnabled || isLoading, rows: 1, "aria-label": "Prompt input" }),
            React.createElement("button", { className: styles.sendButton, onClick: handleSubmit, disabled: !inputEnabled || !inputValue.trim() || isLoading, "aria-label": "Send prompt" }, isLoading ? 'Sending...' : 'Send'))));
});
AiAssistPanel.displayName = 'AiAssistPanel';
//# sourceMappingURL=AiAssistPanel.js.map