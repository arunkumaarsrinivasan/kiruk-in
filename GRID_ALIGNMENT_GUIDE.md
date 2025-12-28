# Grid Alignment Guide

All components in the portfolio should align to a 20px × 20px grid system. This ensures visual consistency and a pixelated aesthetic.

## Grid Size
- **Base Grid Size**: 20px
- **Grid Multiplier**: All positioning, sizing, and spacing should be multiples of 20px

## Utilities Available

### 1. CSS Classes (in `globals.css`)
Use these Tailwind-like classes for grid-aligned spacing:

```tsx
// Padding
<div className="grid-p-1">   {/* 20px padding */}
<div className="grid-px-2">  {/* 40px horizontal padding */}
<div className="grid-py-3">  {/* 60px vertical padding */}

// Margin
<div className="grid-m-1">   {/* 20px margin */}
<div className="grid-mx-2">  {/* 40px horizontal margin */}
<div className="grid-my-3">  {/* 60px vertical margin */}

// Width/Height
<div className="grid-w-5">   {/* 100px width */}
<div className="grid-h-4">   {/* 80px height */}

// Positioning
<div className="absolute grid-left-2 grid-top-3">  {/* left: 40px, top: 60px */}
<div className="fixed grid-right-1 grid-bottom-2"> {/* right: 20px, bottom: 40px */}
```

### 2. JavaScript Utilities (in `lib/utils.ts`)

```tsx
import { 
  GRID_SIZE,           // 20
  alignToGrid,         // Align position values
  alignSizeToGrid,     // Align size values (rounds up)
  alignSpacingToGrid,  // Align spacing values
  gridValue,           // Generate grid value string
  gridSpacing          // Predefined spacing values
} from '@/lib/utils';

// Examples:
const left = alignToGrid(23);        // Returns 20
const width = alignSizeToGrid(95);   // Returns 100 (rounds up)
const padding = alignSpacingToGrid(15); // Returns 20
const spacing = gridValue(3);        // Returns "60px"
```

### 3. React Hook (in `hooks/useGridAlignment.ts`)

```tsx
import { useGridAlignment } from '@/hooks/useGridAlignment';

function MyComponent() {
  const styles = useGridAlignment({
    left: 23,      // Will be aligned to 20
    top: 45,       // Will be aligned to 40
    width: 95,     // Will be aligned to 100
    padding: 15,   // Will be aligned to 20
  });
  
  return <div style={styles}>...</div>;
}
```

### 4. GridAligned Component (in `components/ui/GridAligned.tsx`)

```tsx
import { GridAligned } from '@/components/ui/GridAligned';

// Using grid multipliers
<GridAligned 
  x={2}        // left: 40px (2 * 20px)
  y={3}        // top: 60px (3 * 20px)
  w={5}        // width: 100px (5 * 20px)
  h={4}        // height: 80px (4 * 20px)
  p={1}        // padding: 20px
  position="absolute"
>
  Content
</GridAligned>
```

## Best Practices

### 1. Positioning
Always use multiples of 20px for `left`, `top`, `right`, `bottom`:

```tsx
// ❌ Bad
<div style={{ left: '16px', top: '24px' }}>

// ✅ Good
<div className="grid-left-1 grid-top-1">  {/* 20px, 20px */}
<div style={{ left: '20px', top: '40px' }}>
```

### 2. Sizing
Width and height should be multiples of 20px:

```tsx
// ❌ Bad
<div style={{ width: '200px', height: '150px' }}>

// ✅ Good
<div className="grid-w-10 grid-h-8">  {/* 200px, 160px */}
<div style={{ width: '200px', height: '160px' }}>
```

### 3. Spacing
Padding and margin should be multiples of 20px:

```tsx
// ❌ Bad
<div style={{ padding: '16px', margin: '24px' }}>

// ✅ Good
<div className="grid-p-1 grid-m-2">  {/* 20px padding, 40px margin */}
<div style={{ padding: '20px', margin: '40px' }}>
```

### 4. Dynamic Values
For dynamic values, use the alignment utilities:

```tsx
import { alignToGrid, alignSizeToGrid } from '@/lib/utils';

function DynamicComponent({ userWidth, userLeft }) {
  return (
    <div style={{
      width: `${alignSizeToGrid(userWidth)}px`,
      left: `${alignToGrid(userLeft)}px`,
    }}>
      Content
    </div>
  );
}
```

## Common Grid Multipliers

| Multiplier | Pixels | Common Use |
|------------|--------|------------|
| 1 | 20px | Small spacing, padding |
| 2 | 40px | Medium spacing |
| 3 | 60px | Header height, large spacing |
| 4 | 80px | Section spacing |
| 5 | 100px | Card width, large padding |
| 6 | 120px | Container spacing |
| 8 | 160px | Wide containers |
| 10 | 200px | Card widths |
| 12 | 240px | Medium containers |
| 16 | 320px | Large containers |
| 20 | 400px | Extra large containers |

## Migration Checklist

When updating components:

- [ ] Replace hardcoded pixel values with grid-aligned values
- [ ] Use CSS classes (`grid-p-*`, `grid-m-*`, etc.) where possible
- [ ] Use `alignToGrid()` for dynamic positioning
- [ ] Use `alignSizeToGrid()` for dynamic sizing
- [ ] Use `alignSpacingToGrid()` for dynamic spacing
- [ ] Test that components align properly to the grid background
- [ ] Ensure left-top alignment (components start at grid intersections)

## Examples

### Before (Not Grid-Aligned)
```tsx
<div 
  className="absolute"
  style={{
    left: '16px',
    top: '24px',
    width: '200px',
    height: '150px',
    padding: '12px',
    margin: '8px',
  }}
>
```

### After (Grid-Aligned)
```tsx
<div 
  className="absolute grid-left-1 grid-top-2 grid-w-10 grid-h-8 grid-p-1 grid-m-1"
  // Or using style:
  style={{
    left: '20px',    // 1 * 20px
    top: '40px',    // 2 * 20px
    width: '200px', // 10 * 20px
    height: '160px', // 8 * 20px
    padding: '20px', // 1 * 20px
    margin: '20px', // 1 * 20px
  }}
>
```
