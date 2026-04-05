# @react-toolkit/ai-assist

Provider-agnostic AI assistant panel component with prompt input, conversation history, and suggestions.

## Features

- **Conversation History**: Role-based message display (system/user/assistant)
- **Prompt Input**: Multi-line textarea with submit handling
- **Suggestions**: Clickable prompt suggestions that update dynamically
- **Loading States**: Visual indicators during AI processing
- **Toolbar Actions**: Customizable toolbar with left/right alignment
- **Banner Support**: Optional header with React nodes or HTML templates
- **Max Messages**: Automatic history trimming when limit reached
- **Imperative API**: Programmatic control via ref
- **Provider Agnostic**: No hard-coded AI service dependencies
- **Accessibility**: WCAG 2.1 AA compliant with full keyboard support

## Installation

```bash
npm install @react-toolkit/ai-assist
```

## Basic Usage

```tsx
import React, { useRef } from 'react';
import { AiAssistPanel, AiAssistPanelHandle } from '@react-toolkit/ai-assist';

function App() {
  const assistRef = useRef<AiAssistPanelHandle>(null);

  const handlePromptRequest = async ({ prompt, history, requestId, complete }) => {
    // Call your AI service
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: JSON.stringify({ prompt, history }),
    });
    
    const data = await response.json();
    
    // Complete the request
    complete({
      message: { content: data.response },
      suggestions: data.suggestions
    });
  };

  return (
    <div style={{ height: '600px' }}>
      <AiAssistPanel
        ref={assistRef}
        banner={<div><h3>AI Assistant</h3><p>How can I help you today?</p></div>}
        promptSuggestions={['Explain this', 'Suggest improvements', 'Generate code']}
        onPromptRequest={handlePromptRequest}
      />
    </div>
  );
}
```

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | Optional component ID |
| `initialMessages` | `AiAssistMessage[]` | `[]` | Initial conversation history |
| `promptSuggestions` | `string[]` | `[]` | Quick prompt suggestions |
| `banner` | `React.ReactNode` | - | Banner content (React node) |
| `bannerTemplate` | `string` | - | Banner content (HTML string) |
| `toolbarItems` | `AiAssistToolbarItem[]` | `[]` | Toolbar actions |
| `onToolbarItemClick` | `(args) => void` | - | Toolbar click handler |
| `onPromptRequest` | `(args) => void` | **Required** | Prompt submission handler |
| `inputPlaceholder` | `string` | `"Ask a question..."` | Input placeholder |
| `inputEnabled` | `boolean` | `true` | Enable/disable input |
| `showLoadingIndicator` | `boolean` | `true` | Show loading state |
| `maxMessages` | `number` | - | Max messages to keep |
| `onSuggestionClick` | `(suggestion) => void` | - | Suggestion click handler |
| `onError` | `(error) => void` | - | Error handler |

### Types

```typescript
type AiAssistRole = 'system' | 'user' | 'assistant';

interface AiAssistMessage {
  id: string;
  role: AiAssistRole;
  content: string;
  createdAt: string; // ISO timestamp
  meta?: Record<string, unknown>;
}

interface AiAssistPromptRequestArgs {
  prompt: string;
  history: AiAssistMessage[];
  requestId: string;
  complete: (response: {
    message: { content: string; meta?: Record<string, unknown> };
    suggestions?: string[];
  }) => void;
}
```

### Imperative Handle

```typescript
interface AiAssistPanelHandle {
  addMessage: (message: AiAssistMessage) => void;
  setMessages: (messages: AiAssistMessage[]) => void;
  setSuggestions: (suggestions: string[]) => void;
  reset: () => void;
  focusInput: () => void;
}
```

## Advanced Examples

### With OpenAI

```tsx
const handlePromptRequest = async ({ prompt, history, complete }) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: history.map(m => ({
        role: m.role,
        content: m.content
      })).concat({ role: 'user', content: prompt }),
    });

    complete({
      message: { content: response.choices[0]?.message?.content || '' },
      suggestions: ['Ask a follow-up', 'Explain more', 'Give example']
    });
  } catch (error) {
    console.error('AI request failed:', error);
  }
};
```

### With Azure OpenAI

```tsx
const handlePromptRequest = async ({ prompt, history, complete }) => {
  const response = await fetch(azureEndpoint, {
    method: 'POST',
    headers: {
      'api-key': azureApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [...history, { role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  complete({
    message: { content: data.choices[0].message.content },
  });
};
```

### With Streaming

```tsx
const handlePromptRequest = async ({ prompt, complete }) => {
  let fullResponse = '';
  
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    fullResponse += chunk.choices[0]?.delta?.content || '';
  }

  complete({
    message: { content: fullResponse },
  });
};
```

### Dynamic Suggestions

```tsx
const handlePromptRequest = async ({ prompt, complete }) => {
  const response = await aiService.chat(prompt);
  
  // Update suggestions based on context
  const contextSuggestions = getContextualSuggestions(response);
  
  complete({
    message: { content: response.text },
    suggestions: contextSuggestions
  });
};
```

### Max Messages Limit

```tsx
<AiAssistPanel
  maxMessages={10}
  // Automatically trims to last 10 messages
  onPromptRequest={handlePrompt}
/>
```

## Styling

```css
.ai-assist-wrapper {
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

## Accessibility

- **ARIA Regions**: Panel marked as region with label
- **Keyboard Support**: Enter to send, Shift+Enter for newlines
- **Live Regions**: Loading states announced via aria-live
- **Focus Management**: Proper focus after operations

## Performance

- Efficient re-renders with memoization
- Message history trimming with maxMessages
- Handles dozens of messages smoothly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT © React Toolkit

