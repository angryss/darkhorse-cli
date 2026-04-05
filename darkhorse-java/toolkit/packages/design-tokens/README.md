# @react-toolkit/design-tokens

Design tokens for React Toolkit components. Provides a consistent design system foundation including colors, typography, spacing, shadows, borders, and animation values.

## Installation

```bash
pnpm add @react-toolkit/design-tokens
```

## Usage

```typescript
import { colors, spacing, typography } from '@react-toolkit/design-tokens';

// Use in your styles
const buttonStyles = {
  backgroundColor: colors.primary[500],
  padding: `${spacing[3]} ${spacing[6]}`,
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.fontSize.base,
};
```

### Selective Imports

```typescript
// Import specific tokens
import { colors } from '@react-toolkit/design-tokens/colors';
import { spacing } from '@react-toolkit/design-tokens/spacing';
import { typography } from '@react-toolkit/design-tokens/typography';
```

## Token Categories

- **Colors**: Primary, secondary, semantic (error, warning, success, info), gray scale, backgrounds, text, borders
- **Spacing**: Consistent 4px-based spacing scale (0-96)
- **Typography**: Font families, sizes, weights, line heights, letter spacing
- **Shadows**: Elevation levels from sm to 2xl
- **Borders**: Border widths and radius values
- **Animation**: Duration and easing functions

## TypeScript Support

All tokens are fully typed for excellent IDE autocomplete and type safety.

```typescript
import type { ColorKey, SpacingKey, FontSizeKey } from '@react-toolkit/design-tokens';
```

## License

MIT

