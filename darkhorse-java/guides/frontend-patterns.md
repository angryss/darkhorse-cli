# Frontend Patterns Guide

**Architecture and implementation patterns for multi-platform frontend development.**

---

## 🎯 Platform Selection (Required)

Before starting any frontend work, you MUST determine the target platform and framework:

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
| **Other** | Discovered during design | Evaluate during proposal phase |

#### Desktop Frameworks

| Framework | Best For | Key Features |
|-----------|----------|--------------|
| **Electron** | Cross-platform, web tech | Chromium-based, Node.js access, large ecosystem |
| **Tauri** | Performance, small bundle | Rust backend, native webview, ~10x smaller |

> **Decision Criteria**: Use Electron if you need broad ecosystem/library support. Use Tauri for smaller bundles and better performance.

#### Mobile Frameworks

| Framework | Best For | Key Features |
|-----------|----------|--------------|
| **React Native** | React developers, shared web code | JavaScript, large ecosystem, Expo |
| **Flutter** | High performance UI, single codebase | Dart, custom rendering, hot reload |

> **Decision Criteria**: Use React Native if team knows React and wants code sharing. Use Flutter for pixel-perfect UI and better performance.

---

## 📋 Platform Decision Checklist

When creating a frontend proposal, answer these questions:

1. **What platform(s) are we targeting?**
   - [ ] Web only
   - [ ] Desktop only
   - [ ] Mobile only
   - [ ] Multiple platforms

2. **For Web, which framework?**
   - [ ] React + Vite (SPA)
   - [ ] Next.js (SSR/SSG)
   - [ ] Angular
   - [ ] Other (specify)

3. **For Desktop, which framework?**
   - [ ] Electron
   - [ ] Tauri

4. **For Mobile, which framework?**
   - [ ] React Native
   - [ ] Flutter

5. **Cross-platform considerations:**
   - [ ] Shared business logic?
   - [ ] Shared UI components?
   - [ ] Platform-specific features?

---

## Project Structure

### Web Application (React + Vite)

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
  label,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### Component Organization

```
components/
└── Button/
    ├── Button.tsx
    ├── Button.test.tsx
    ├── Button.module.css
    └── index.ts
```

---

## State Management

### Zustand Store

```typescript
import { create } from 'zustand';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await orderService.getAll();
      set({ orders, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addOrder: (order) => {
    set((state) => ({ orders: [...state.orders, order] }));
  }
}));
```

### Using the Store

```typescript
const OrderList: React.FC = () => {
  const { orders, loading, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) return <Spinner />;

  return (
    <ul>
      {orders.map(order => (
        <li key={order.id}>{order.name}</li>
      ))}
    </ul>
  );
};
```

---

## API Integration

### API Client

```typescript
const API_BASE = import.meta.env.VITE_API_URL;

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new ApiClient();
```

### Service Layer

```typescript
class OrderService {
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<{ data: Order[] }>('/orders');
    return response.data;
  }

  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<{ data: Order }>(`/orders/${id}`);
    return response.data;
  }

  async create(order: CreateOrderDto): Promise<Order> {
    const response = await apiClient.post<{ data: Order }>('/orders', order);
    return response.data;
  }
}

export const orderService = new OrderService();
```

---

## Custom Hooks

### Data Fetching Hook

```typescript
function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: unknown[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    setState(s => ({ ...s, loading: true }));
    asyncFn()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(error => setState({ data: null, loading: false, error }));
  }, deps);

  return state;
}
```

### Form Hook

```typescript
function useForm<T>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (name: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
  };

  return { values, errors, handleChange, setErrors, reset };
}
```

---

## Styling

### CSS Modules

```css
/* Button.module.css */
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
}

.primary {
  background: var(--color-primary);
  color: white;
}

.secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}
```

### Design Tokens Usage

```typescript
import { colors, spacing } from '@react-toolkit/design-tokens';

const styles = {
  container: {
    padding: spacing.md,
    backgroundColor: colors.neutral[100]
  }
};
```

---

## Routing

### React Router Setup

```typescript
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailPage /> }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}
```

---

## Testing

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## Platform-Specific Structures

### Web (React + Vite)

```
frontend/web-app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── main.tsx
├── public/
├── vite.config.ts
└── package.json
```

### Web (Next.js)

```
frontend/web-app/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/               # API routes
├── components/
├── lib/                   # Utilities
├── next.config.js
└── package.json
```

### Desktop (Electron)

```
frontend/desktop-app/
├── src/
│   ├── main/              # Main process
│   │   ├── main.ts
│   │   └── preload.ts
│   └── renderer/          # Renderer process (React)
│       ├── components/
│       ├── pages/
│       └── main.tsx
├── electron.config.ts
└── package.json
```

### Desktop (Tauri)

```
frontend/desktop-app/
├── src/                   # Frontend (React/Vue/etc)
│   ├── components/
│   ├── pages/
│   └── main.tsx
├── src-tauri/             # Rust backend
│   ├── src/
│   │   └── main.rs
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

### Mobile (React Native)

```
frontend/mobile-app/
├── src/
│   ├── components/
│   ├── screens/           # Screen components
│   ├── navigation/        # React Navigation
│   ├── services/
│   └── store/
├── ios/                   # iOS native code
├── android/               # Android native code
├── app.json
└── package.json
```

### Mobile (Flutter)

```
frontend/mobile-app/
├── lib/
│   ├── main.dart
│   ├── screens/
│   ├── widgets/
│   ├── services/
│   └── models/
├── ios/
├── android/
├── pubspec.yaml
└── analysis_options.yaml
```

---

## Cross-Platform Considerations

### Shared Code Strategy

```
frontend/
├── shared/                # Shared across platforms
│   ├── contracts/         # API types (from common-lib)
│   ├── utils/             # Platform-agnostic utilities
│   └── hooks/             # Shared React hooks (if React-based)
│
├── web-app/               # Web-specific code
├── desktop-app/           # Desktop-specific code
└── mobile-app/            # Mobile-specific code
```

### Platform-Specific Features

| Feature | Web | Electron | Tauri | React Native | Flutter |
|---------|-----|----------|-------|--------------|---------|
| File system access | Limited | ✅ Full | ✅ Full | ✅ Via libs | ✅ Via plugins |
| Push notifications | ✅ Web Push | ✅ Native | ✅ Native | ✅ Native | ✅ Native |
| Offline support | ✅ PWA | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| Deep linking | ✅ URLs | ✅ Protocol | ✅ Protocol | ✅ Native | ✅ Native |
| Camera/sensors | ✅ WebRTC | ✅ Via web | ✅ Via web | ✅ Native | ✅ Native |

---

*Guide Version: 2.0 — Multi-Platform Support*
