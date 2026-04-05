# Frontend Patterns Guide

**Architecture and implementation patterns for multi-platform frontend development.**

---

## Platform Selection (Required)

### Platform Types

| Platform | Description | When to Use |
|----------|-------------|-------------|
| **Web** | Browser-based application | Public-facing apps, SaaS, internal tools |
| **Desktop** | Native desktop application | Offline-first, system access, high performance |
| **Mobile** | iOS and/or Android app | Consumer apps, on-the-go access |

### Framework Options by Platform

#### Web Frameworks

| Framework | Best For | Key Features |
|-----------|----------|--------------|
| **React + Vite** | SPAs, dashboards | Fast HMR, simple setup, TypeScript |
| **Next.js** | SEO, SSR, full-stack | Server components, API routes, SSG |
| **Angular** | Enterprise apps | Full framework, RxJS, dependency injection |

#### Desktop Frameworks

| Framework | Best For |
|-----------|----------|
| **Electron** | Cross-platform, web tech |
| **Tauri** | Performance, small bundle |

#### Mobile Frameworks

| Framework | Best For |
|-----------|----------|
| **React Native** | React developers, shared web code |
| **Flutter** | High performance UI, single codebase |

---

## Project Structure (React + Vite)

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Buttons, inputs, modals
│   └── features/        # Feature-specific components
├── pages/               # Route-level components
├── hooks/               # Custom React hooks
├── services/            # API clients
├── store/               # State management
├── utils/               # Utility functions
├── types/               # TypeScript types
├── styles/              # Global styles
├── App.tsx
└── main.tsx
```

---

## Component Patterns

### Functional Components

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label, onClick, variant = 'primary', disabled = false
}) => (
  <button className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
    {label}
  </button>
);
```

---

## State Management (Zustand)

```typescript
import { create } from 'zustand';

interface OrderState {
  orders: Order[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  fetchOrders: async () => {
    set({ loading: true });
    const orders = await orderService.getAll();
    set({ orders, loading: false });
  },
}));
```

---

## API Integration

```typescript
const API_BASE = import.meta.env.VITE_API_URL;

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options
    });
    if (!response.ok) throw new ApiError(response.status, await response.json());
    return response.json();
  }

  get<T>(endpoint: string): Promise<T> { return this.request<T>(endpoint); }
  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) });
  }
}

export const apiClient = new ApiClient();
```

---

## Styling

### Design Tokens Usage

```typescript
import { colors, spacing } from '@react-toolkit/design-tokens';
```

---

## Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

*Guide Version: 2.0 — Multi-Platform Support*
