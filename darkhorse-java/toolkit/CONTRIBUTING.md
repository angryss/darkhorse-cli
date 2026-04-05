# Contributing to React-Toolkit

Thank you for your interest in contributing to React-Toolkit! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Component Development](#component-development)
- [Testing Guidelines](#testing-guidelines)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Git

### Clone and Install

```bash
git clone https://github.com/your-org/React-Toolkit.git
cd React-Toolkit
pnpm install
```

## Development Setup

### Project Structure

```
React-Toolkit/
├── packages/           # Component packages
│   ├── core/          # Core utilities
│   ├── design-tokens/ # Design system tokens
│   └── [component]/   # Individual component packages
├── examples/          # Example applications
├── docs/             # Documentation
└── templates/        # Component templates
```

### Available Scripts

```bash
# Development
pnpm dev                # Watch mode for all packages
pnpm build             # Build all packages
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage

# Quality Checks
pnpm lint              # Lint all packages
pnpm type-check        # TypeScript type checking

# Documentation
pnpm storybook         # Start Storybook dev server
pnpm build-storybook   # Build Storybook static site
```

## Component Development

### Creating a New Component

1. **Use the Component Template**

   Component templates are located in `templates/component/`. Each component should include:
   - Component implementation (.tsx)
   - Styles (.module.css)
   - Tests (.test.tsx)
   - Storybook stories (.stories.tsx)
   - README.md

2. **Component Structure**

   ```typescript
   import { forwardRef } from 'react';
   import { cn } from '@react-toolkit/core';
   import type { BaseComponentProps } from '@react-toolkit/core';
   
   export interface MyComponentProps extends BaseComponentProps {
     // Component-specific props
   }
   
   export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
     function MyComponent(props, ref) {
       // Implementation
     }
   );
   ```

3. **Design Principles**

   - **Fully Controlled**: Components should not manage internal state that affects the parent
   - **Type-Safe**: Use TypeScript with strict mode
   - **Accessible**: Follow WCAG 2.1 AA guidelines
   - **Themeable**: Use design tokens from `@react-toolkit/design-tokens`
   - **Tested**: Aim for 80%+ test coverage

### Component Checklist

- [ ] Component implementation with forwardRef
- [ ] TypeScript interfaces with JSDoc comments
- [ ] CSS Modules for styling
- [ ] Comprehensive unit tests (80%+ coverage)
- [ ] Storybook stories for all variants
- [ ] Accessibility tests (no violations)
- [ ] README with usage examples
- [ ] Keyboard navigation support
- [ ] Error boundary handling

## Testing Guidelines

### Unit Tests

Write tests using Vitest and React Testing Library:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render successfully', () => {
    render(<MyComponent data-testid="my-component" />);
    expect(screen.getByTestId('my-component')).toBeInTheDocument();
  });
});
```

### Test Coverage

- Minimum 80% coverage required
- Test all props and variants
- Test user interactions
- Test accessibility features
- Test error handling

### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` if type is truly unknown

### React

- Use functional components with hooks
- Use `forwardRef` for components that need ref access
- Prefer controlled components over uncontrolled
- Use meaningful prop names

### CSS

- Use CSS Modules (`.module.css`)
- Use design tokens for colors, spacing, typography
- Follow BEM-like naming within modules
- Mobile-first responsive design

### Naming Conventions

- **Components**: PascalCase (`MyComponent`)
- **Files**: PascalCase for components (`MyComponent.tsx`)
- **CSS Classes**: camelCase (`.myClass`)
- **Constants**: UPPER_SNAKE_CASE
- **Variables/Functions**: camelCase

## Pull Request Process

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/my-component
   ```

2. **Make Your Changes**

   - Follow the component checklist
   - Write tests
   - Update documentation
   - Run linting and type checking

3. **Verify Quality**

   ```bash
   pnpm lint
   pnpm type-check
   pnpm test:coverage
   pnpm build
   ```

4. **Commit Your Changes**

   Use conventional commit messages:
   
   ```
   feat(kanban): add drag and drop support
   fix(tree-grid): resolve selection bug
   docs(readme): update installation instructions
   test(gantt): add dependency tests
   ```

5. **Review and Finalize**

   - Ensure all quality checks pass
   - Verify build succeeds
   - Update documentation
   - Update progress tracker
   - Commit and push changes

## Component Requirements

Each component must meet these requirements before merging:

### Functionality
- [ ] All requirements from spec implemented
- [ ] Component is fully controlled
- [ ] Error handling implemented
- [ ] Edge cases handled

### Quality
- [ ] TypeScript strict mode passing
- [ ] 80%+ test coverage
- [ ] No console errors or warnings
- [ ] Performance benchmarks met

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Focus management correct
- [ ] ARIA attributes proper

### Documentation
- [ ] README with examples
- [ ] API documentation complete
- [ ] Storybook stories for all variants
- [ ] Migration guide (if applicable)

## Questions?

- Check the [Documentation](./docs/README.md)
- Review existing components for examples
- Ask in pull request discussions

Thank you for contributing! 🎉

