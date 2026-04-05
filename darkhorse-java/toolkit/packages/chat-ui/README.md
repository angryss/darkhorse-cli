# @react-toolkit/chat-ui

A real-time conversational UI component with typing indicators, suggestions, and flexible message rendering.

## Features

### 💬 Core Messaging

- **Message Display**: Chronological message list with proper alignment
- **User Differentiation**: Visual distinction between current user and others
- **Message Types**: Text, HTML, System, AI, and Event messages
- **Avatars**: User avatars with automatic fallback to initials
- **Timestamps**: Relative time formatting (e.g., "5m ago")
- **Pending States**: Visual indication for optimistic updates

### ⌨️ Input & Interaction

- **Message Composer**: Multi-line textarea with auto-expanding
- **Send Button**: Submit messages with Enter or click
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for newline
- **Typing Indicators**: Real-time typing state with animation
- **Input Control**: Enable/disable input programmatically

### 💡 Suggestions

- **Quick Replies**: Clickable suggestion chips
- **Dynamic Updates**: Update suggestions via props or ref
- **Click Handlers**: React to suggestion selections

### 🛠️ Toolbar

- **Custom Actions**: Configurable toolbar items
- **Alignment**: Left/right alignment support
- **Icons & Templates**: Support for icons and custom templates

### ♿ Accessibility

- **ARIA Roles**: Proper semantic regions and list structure
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Live regions for typing indicators
- **Focus Management**: Logical tab order

## Installation

```bash
npm install @react-toolkit/chat-ui
```

## Basic Usage

```tsx
import React, { useRef, useState } from 'react';
import { ChatUI, ChatUIHandle, ChatMessage, ChatUser } from '@react-toolkit/chat-ui';

function App() {
  const chatRef = useRef<ChatUIHandle>(null);
  
  const currentUser: ChatUser = {
    id: 'user-1',
    displayName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleMessageSend = ({ content, sender, timestamp }) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      content,
      messageType: 'text',
      timestamp,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send to backend...
  };

  return (
    <div style={{ height: '600px' }}>
      <ChatUI
        ref={chatRef}
        currentUser={currentUser}
        participants={[]}
        messages={messages}
        onMessageSend={handleMessageSend}
      />
    </div>
  );
}
```

## API Reference

### Props

#### `ChatUIProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentUser` | `ChatUser` | **Required** | Current user identity |
| `participants` | `ChatUser[]` | **Required** | Other conversation participants |
| `messages` | `ChatMessage[]` | **Required** | Array of messages to display |
| `suggestions` | `ChatSuggestion[]` | `[]` | Quick reply suggestions |
| `toolbarItems` | `ChatToolbarItem[]` | `[]` | Custom toolbar actions |
| `inputEnabled` | `boolean` | `true` | Enable/disable message input |
| `inputPlaceholder` | `string` | `"Type a message..."` | Input placeholder text |
| `height` | `number \| string` | `"100%"` | Component height |
| `width` | `number \| string` | `"100%"` | Component width |
| `onMessageSend` | `(args) => void` | **Required** | Callback when message is sent |
| `onUserTyping` | `(args) => void` | - | Callback when user typing state changes |
| `onToolbarItemClick` | `(args) => void` | - | Callback when toolbar item clicked |
| `onSuggestionClick` | `(args) => void` | - | Callback when suggestion clicked |
| `onError` | `(error) => void` | - | Error callback |

### Types

#### `ChatUser`

```typescript
interface ChatUser {
  id: string;
  displayName: string;
  avatarUrl?: string;
  meta?: Record<string, unknown>;
}
```

#### `ChatMessage`

```typescript
type ChatMessageType = 'text' | 'html' | 'system' | 'ai' | 'event';

interface ChatMessage {
  id: string;
  sender: ChatUser;
  content: string;
  messageType: ChatMessageType;
  timestamp: string; // ISO format
  meta?: {
    ephemeral?: boolean;
    pending?: boolean;
  };
}
```

#### `ChatMessageSendArgs`

```typescript
interface ChatMessageSendArgs {
  content: string;
  sender: ChatUser;
  timestamp: string;
}
```

### Imperative Handle

Access component methods via ref:

```typescript
interface ChatUIHandle {
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setSuggestions: (suggestions: ChatSuggestion[]) => void;
  setTypingUsers: (typing: ChatTypingUser[]) => void;
  scrollToBottom: () => void;
  reset: () => void;
}
```

#### Example Usage

```tsx
const chatRef = useRef<ChatUIHandle>(null);

// Add a single message
chatRef.current?.addMessage(newMessage);

// Replace all messages
chatRef.current?.setMessages(allMessages);

// Update suggestions
chatRef.current?.setSuggestions(['Hello', 'How can I help?']);

// Set typing users
chatRef.current?.setTypingUsers([
  { user: otherUser, lastUpdated: new Date().toISOString() }
]);

// Scroll to bottom
chatRef.current?.scrollToBottom();

// Clear everything
chatRef.current?.reset();
```

## Advanced Usage

### 1:1 Chat

```tsx
<ChatUI
  currentUser={currentUser}
  participants={[otherUser]}
  messages={messages}
  onMessageSend={handleSend}
/>
```

### Group Chat

```tsx
<ChatUI
  currentUser={currentUser}
  participants={[user1, user2, user3]}
  messages={messages}
  onMessageSend={handleSend}
/>
```

### With Suggestions

```tsx
<ChatUI
  currentUser={currentUser}
  participants={participants}
  messages={messages}
  suggestions={['Hello!', 'How can I help?', 'Thanks!']}
  onMessageSend={handleSend}
  onSuggestionClick={(suggestion) => {
    console.log('Clicked suggestion:', suggestion);
  }}
/>
```

### With Toolbar

```tsx
const toolbarItems: ChatToolbarItem[] = [
  {
    id: 'refresh',
    label: 'Refresh',
    align: 'Right'
  },
  {
    id: 'settings',
    label: 'Settings',
    align: 'Right'
  }
];

<ChatUI
  currentUser={currentUser}
  participants={participants}
  messages={messages}
  toolbarItems={toolbarItems}
  onMessageSend={handleSend}
  onToolbarItemClick={({ item }) => {
    console.log('Toolbar item clicked:', item.id);
  }}
/>
```

### Typing Indicators

```tsx
const [typingUsers, setTypingUsers] = useState<ChatTypingUser[]>([]);

// When receiving typing event from other user
socket.on('typing', (user) => {
  setTypingUsers([{
    user,
    lastUpdated: new Date().toISOString()
  }]);
});

// Update chat UI
useEffect(() => {
  chatRef.current?.setTypingUsers(typingUsers);
}, [typingUsers]);

// Handle local user typing
const handleUserTyping = ({ user, isTyping }) => {
  // Emit to other participants
  socket.emit('typing', { user, isTyping });
};

<ChatUI
  ref={chatRef}
  currentUser={currentUser}
  participants={participants}
  messages={messages}
  onMessageSend={handleSend}
  onUserTyping={handleUserTyping}
/>
```

### Optimistic Updates

```tsx
const handleMessageSend = async ({ content, sender, timestamp }) => {
  // Optimistic update with pending flag
  const optimisticMessage: ChatMessage = {
    id: `temp-${Date.now()}`,
    sender,
    content,
    messageType: 'text',
    timestamp,
    meta: { pending: true }
  };

  setMessages(prev => [...prev, optimisticMessage]);

  try {
    // Send to backend
    const savedMessage = await api.sendMessage(content);
    
    // Replace optimistic message with confirmed one
    setMessages(prev => 
      prev.map(m => m.id === optimisticMessage.id ? savedMessage : m)
    );
  } catch (error) {
    // Handle error - remove optimistic message
    setMessages(prev => 
      prev.filter(m => m.id !== optimisticMessage.id)
    );
  }
};
```

### System Messages

```tsx
const systemMessage: ChatMessage = {
  id: 'sys-1',
  sender: {
    id: 'system',
    displayName: 'System'
  },
  content: 'User joined the conversation',
  messageType: 'system',
  timestamp: new Date().toISOString()
};

setMessages(prev => [...prev, systemMessage]);
```

### HTML Messages

```tsx
// IMPORTANT: Sanitize HTML on the host side!
import DOMPurify from 'dompurify';

const htmlMessage: ChatMessage = {
  id: 'html-1',
  sender: currentUser,
  content: DOMPurify.sanitize('<strong>Bold text</strong> and <em>italic</em>'),
  messageType: 'html',
  timestamp: new Date().toISOString()
};
```

## Styling

Override styles using CSS variables:

```css
.my-chat-wrapper {
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-border: #e0e0e0;
  --color-primary: #2196f3;
  --color-primary-light: #e3f2fd;
  --color-primary-dark: #1976d2;
  --color-text-primary: #212121;
  --color-text-secondary: #757575;
}
```

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line in message
- **Tab**: Navigate through toolbar and input
- **Escape**: Clear input (optional implementation)

## Accessibility Features

- **ARIA Regions**: Chat interface marked as region
- **List Semantics**: Messages exposed as list items
- **Live Regions**: Typing indicators announce via aria-live
- **Focus Management**: Proper focus after sending
- **Keyboard Navigation**: Full keyboard accessibility

## Performance Notes

- Handles 200-500 messages smoothly
- Auto-scroll only when user is near bottom
- Typing indicator expires after 5 seconds
- Efficient re-renders with proper memoization

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## Transport Agnostic

This component is **transport-agnostic** - it doesn't handle real-time communication. Integrate with your preferred solution:

- WebSockets
- Server-Sent Events (SSE)
- Long polling
- Third-party services (Pusher, Socket.io, etc.)

## Example with WebSocket

```tsx
const socket = io('https://api.example.com');

useEffect(() => {
  socket.on('message', (message) => {
    chatRef.current?.addMessage(message);
  });

  socket.on('typing', ({ user }) => {
    chatRef.current?.setTypingUsers([{
      user,
      lastUpdated: new Date().toISOString()
    }]);
  });

  return () => {
    socket.off('message');
    socket.off('typing');
  };
}, []);

const handleMessageSend = ({ content }) => {
  socket.emit('send_message', { content });
};
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © React Toolkit

## Related Packages

- `@react-toolkit/ai-assist` - AI assistant panel
- `@react-toolkit/core` - Core utilities
- `@react-toolkit/design-tokens` - Design tokens

